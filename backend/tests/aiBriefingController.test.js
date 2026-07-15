const { generateBriefing } = require('../controllers/aiBriefingController');
const axios = require('axios');
const supabase = require('../config/supabaseClient');

jest.mock('axios');
jest.mock('../config/supabaseClient', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
}));

describe('AI Briefing Controller Fallback Scenarios', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: { id: 'test-user-123' },
      headers: {
        'x-request-id': 'test-req-id'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should return graceful fallback if Python AI Engine is offline', async () => {
    supabase.single.mockResolvedValueOnce({ data: { id: 'test-user-123', district: 'Rajkot' }, error: null });
    
    // Simulate Supabase disease fetch
    const mockDiseaseChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null })
    };
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return supabase;
      if (table === 'disease_history') return mockDiseaseChain;
      return supabase;
    });

    // Simulate Python Engine Offline (Connection Refused)
    axios.post.mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:8000'));

    await generateBriefing(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success', // Fallbacks return a successful deterministic response
        topDecision: null, // Instructs frontend to use local rules
        error: 'AI Engine temporarily unavailable',
        requestId: 'test-req-id'
      })
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', 'test-req-id');
    expect(res.setHeader).toHaveBeenCalledWith('X-Response-Time', expect.any(String));
  });

  it('should return graceful fallback if Python AI Engine times out', async () => {
    supabase.single.mockResolvedValueOnce({ data: { id: 'test-user-123', district: 'Rajkot' }, error: null });
    
    const mockDiseaseChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null })
    };
    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') return supabase;
      if (table === 'disease_history') return mockDiseaseChain;
      return supabase;
    });

    // Simulate timeout
    const timeoutError = new Error('timeout of 10000ms exceeded');
    timeoutError.code = 'ECONNABORTED';
    axios.post.mockRejectedValue(timeoutError);

    await generateBriefing(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        topDecision: null,
        error: 'AI Engine temporarily unavailable',
        requestId: 'test-req-id'
      })
    );
  });
});
