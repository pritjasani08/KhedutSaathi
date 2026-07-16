const axios = require('axios');
const crypto = require('crypto');
const supabase = require('../config/supabaseClient');
const logger = require('../utils/logger');
const farmerMemoryService = require('../services/farmerMemoryService');
const { resolveFarmerProfile, FarmerProfileNotFoundError } = require('../services/profileResolver');

const PYTHON_AI_URL = 'http://localhost:8000/api/ai/generate';

exports.generateBriefing = async (req, res) => {
  const startTime = performance.now();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const userId = req.user.id;

  const logMeta = { requestId, farmerId: userId };

  try {
    // 1. Fetch Profile using central resolver
    let profile;
    try {
        const resolution = await resolveFarmerProfile(userId);
        profile = resolution.profile;
    } catch (err) {
        if (err instanceof FarmerProfileNotFoundError) {
             return res.status(404).json({ error: 'Farmer profile not found' });
        }
        throw err;
    }
    
    // Fetch deterministic memory
    // Strict contract: Controllers ALWAYS pass users.id
    const { memory, recentDecisions } = await farmerMemoryService.getFarmerMemory(userId);

    // 2. Fetch Disease History
    const { data: diseaseHistory, error: diseaseError } = await supabase
      .from('disease_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
      
    const safeDiseaseHistory = diseaseHistory || [];

    // 3. Fetch Market Data
    let marketContext = null;
    try {
      const marketRes = await require('../services/marketPriceService').fetchMarketPrices({
        state: profile?.state || "Gujarat",
        district: profile?.district || "Ahmedabad",
        commodity: profile?.primary_crop || "Wheat"
      });
      if (marketRes.status !== 'unavailable' && marketRes.records && marketRes.records.length > 0) {
        const latest = marketRes.records[0];
        marketContext = {
          mandi: latest.market,
          trends: [
            { commodity: latest.commodity, modal_price: latest.modal_price, average_price: latest.modal_price, trend: 0.0 }
          ]
        };
      }
    } catch (e) {
      logger.warn('Market API Warning in Briefing', { ...logMeta, error: e.message });
    }

    // 4. Assemble FarmContext
    const farmContext = {
      requestId: requestId,
      debugMode: process.env.NODE_ENV === 'development',
      farmer_id: userId,
      profile: profile || {},
      memory: memory,
      recent_decisions: recentDecisions,
      weather: {
        forecast: [
          { day: "Tomorrow", condition: "Rain", chance: 85 }
        ]
      },
      market: marketContext,
      yield_predictions: [],
      disease_history: safeDiseaseHistory,
      crop_recommendations: [],
      dataFreshness: {
        weather: "Live",
        market: marketContext ? "Live" : "Unavailable",
        profile: "Live"
      }
    };

    const aggregationTime = performance.now() - startTime;
    logger.info('Node Aggregation Complete', { ...logMeta, aggregationTimeMs: Math.round(aggregationTime) });

    // 4. Send to Python AI Engine
    try {
      const aiResponse = await axios.post(PYTHON_AI_URL, farmContext, {
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        },
        timeout: 10000
      });
      
      const totalTime = performance.now() - startTime;
      
      res.setHeader('X-Request-ID', requestId);
      res.setHeader('X-Response-Time', `${Math.round(totalTime)}ms`);
      
      logger.info('Briefing generated successfully', { 
        ...logMeta, 
        totalTimeMs: Math.round(totalTime),
        fallback: false 
      });

      // Do NOT expose metrics in production response (handled by Python side based on debugMode, but just in case)
      if (process.env.NODE_ENV !== 'development' && aiResponse.data.metrics) {
         delete aiResponse.data.metrics;
      }

      // 5. Store AI Decisions in History (fire and forget / gracefully handle missing table)
      try {
        const decisionsToInsert = [];
        if (aiResponse.data.topDecision) {
          decisionsToInsert.push({
            user_id: userId,
            title: aiResponse.data.topDecision.title,
            decision_type: aiResponse.data.topDecision.type,
            priority: aiResponse.data.topDecision.priority,
            confidence: aiResponse.data.topDecision.confidence,
            expected_impact: aiResponse.data.topDecision.expectedImpact,
            reason: aiResponse.data.topDecision.reason,
            follow_up: aiResponse.data.topDecision.followUp,
            raw_facts: aiResponse.data.topDecision.rawFacts || {},
            sources: aiResponse.data.topDecision.sources || [],
            context_snapshot: { weather: farmContext.weather, market: farmContext.market }
          });
        }
        if (aiResponse.data.decisions && aiResponse.data.decisions.length > 0) {
          aiResponse.data.decisions.forEach(d => {
            decisionsToInsert.push({
              user_id: userId,
              title: d.title,
              decision_type: d.type,
              priority: d.priority,
              confidence: d.confidence,
              expected_impact: d.expectedImpact,
              reason: d.reason,
              follow_up: d.followUp,
              raw_facts: d.rawFacts || {},
              sources: d.sources || [],
              context_snapshot: { weather: farmContext.weather, market: farmContext.market }
            });
          });
        }
        
        if (decisionsToInsert.length > 0) {
          supabase.from('ai_decisions').insert(decisionsToInsert).then(({ error }) => {
            if (error) {
               logger.warn('Failed to insert AI decisions into history (table might not exist)', { error: error.message });
            }
          });
        }
      } catch (dbErr) {
        logger.warn('Error queuing AI decisions', { error: dbErr.message });
      }

      return res.status(200).json(aiResponse.data);
      
    } catch (aiError) {
      const fallbackReason = aiError.code === 'ECONNABORTED' ? 'PYTHON_TIMEOUT' : 'PYTHON_OFFLINE';
      const totalTime = performance.now() - startTime;
      
      logger.error('Python AI Engine Error', { 
        ...logMeta, 
        fallbackReason, 
        error: aiError.message,
        totalTimeMs: Math.round(totalTime)
      });
      
      // 6. Graceful Fallback
      const fallbackResponse = {
        status: "success",
        requestId: requestId,
        generatedAt: new Date().toISOString(),
        dataFreshness: farmContext.dataFreshness,
        summary: "Welcome back! Please check the weather and market tabs for today's updates.",
        topDecision: null,
        decisions: [],
        error: "AI Engine temporarily unavailable"
      };
      
      res.setHeader('X-Request-ID', requestId);
      res.setHeader('X-Response-Time', `${Math.round(totalTime)}ms`);
      return res.status(200).json(fallbackResponse);
    }
    
  } catch (err) {
    logger.error('aiBriefingController outer error', { ...logMeta, error: err.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { decisionId, feedback } = req.body;
    const userId = req.user.id;

    if (!['UP', 'DOWN', 'NONE'].includes(feedback)) {
      return res.status(400).json({ status: 'error', message: 'Invalid feedback value' });
    }
    // Strict Contract: Controllers ALWAYS pass users.id down
    await farmerMemoryService.processFeedback(userId, decisionId, feedback);
    
    return res.status(200).json({ status: 'success', message: 'Feedback processed' });
  } catch (error) {
    logger.error('Feedback error:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
