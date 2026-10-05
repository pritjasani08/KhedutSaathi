# KhedutSaathi Project Documentation

This document provides an overview of all source files in the project.

## Root

| File | Summary / Extracted Info |
|---|---|
| generate_docs.py | Functions: get_summary_from_content, generate_docs. |
| IDENTITY_ARCHITECTURE.md | Source code file. |
| README.md | 📸 Banner |

## ai_models\crop_disease

| File | Summary / Extracted Info |
|---|---|
| check_json.py | Source code file. |

## ai_models\crop_disease\src

| File | Summary / Extracted Info |
|---|---|
| config.py | Source code file. |
| dataset_loader.py | Functions: get_transforms, load_datasets. |
| gemini_service.py | Functions: get_gemini_client, get_treatment_info. |
| inference.py | Classes: DiseasePredictor. |
| main.py | Functions: load_model, read_root. |
| merge_datasets.py | Functions: merge_datasets. |
| model_builder.py | Functions: build_model. |
| predict.py | Functions: main. |
| revert_json.py | Functions: main. |
| train.py | Functions: main. |
| trainer.py | Classes: ModelTrainer. |
| translator_utils.py | Functions: translate_to_language, translate_dict. |
| treatment_formatter.py | Functions: clean_and_format_response. |
| update_disease_info.py | Functions: main. |
| utils.py | Functions: save_classes, load_classes, get_device, get_disease_details. |
| __init__.py | Source code file. |

## ai_models\crop_recommendation

| File | Summary / Extracted Info |
|---|---|
| resolve_crop_conflicts.py | Functions: main. |

## ai_models\crop_recommendation\src

| File | Summary / Extracted Info |
|---|---|
| app.py | Functions: get_crop_duration. |
| check_data.py | Functions: inspect_dataset. |
| clean_dataset.py | Functions: clean_data. |
| predict.py | Classes: CropRecommender. |
| test_model.py | Source code file. |
| train.py | Functions: main. |

## ai_models\yield_predictor

| File | Summary / Extracted Info |
|---|---|
| app.py | Classes: PredictionRequest. Functions: find_match, home, predict. |
| check_data.py | Source code file. |
| check_missing.py | Source code file. |
| check_yield.py | Source code file. |
| clean_dataset.py | Source code file. |
| predict.py | Classes: CustomUnpickler. Functions: custom_pickle_load, find_match. |
| show_crops.py | Source code file. |
| show_districts.py | Source code file. |
| show_values.py | Source code file. |
| train.py | Source code file. |

## backend

| File | Summary / Extracted Info |
|---|---|
| apply_schema.js | Functions: apply, run. |
| generateToken.js | Source code file. |
| index.js | Source code file. |
| printRoutes.js | Source code file. |
| test_api.js | Functions: run. |
| test_audit.js | Functions: run. |
| test_crop_plan.js | Functions: testCropPlan. |
| test_e2e.js | Functions: run. |
| test_profile.js | Functions: run. |
| test_rag.js | Functions: testRAG. |
| test_runtime.js | Functions: run. |
| test_schema.js | Functions: run. |
| test_timeline.js | Functions: run. |

## backend\.pytest_cache

| File | Summary / Extracted Info |
|---|---|
| README.md | pytest cache directory |

## backend\ai_engine

| File | Summary / Extracted Info |
|---|---|
| cache_service.py | Classes: CacheService. |
| decision_engine.py | Classes: DecisionEngine. |
| exceptions.py | Classes: AIEngineError, ContextError, ValidationError. |
| groq_service.py | Classes: GroqService. |
| logger.py | Classes: JSONFormatter. Functions: get_logger. |
| main.py | Source code file. |
| notification_prompt_builder.py | Classes: NotificationPromptBuilder. |
| notification_routes.py | Source code file. |
| notification_validators.py | Classes: NotificationValidator. |
| output_formatter.py | Classes: OutputFormatter. |
| planner_prompt_builder.py | Classes: PlannerPromptBuilder. |
| planner_validators.py | Classes: PlannerResponseValidator. |
| prompt_builder.py | Classes: PromptBuilder. |
| rag_service.py | Classes: RAGService. |
| routes.py | Source code file. |
| schemas.py | Classes: SourceMetadata, CandidateDecision, AIRequest. |
| timeline_prompt_builder.py | Functions: build_timeline_prompt. |
| timeline_routes.py | Source code file. |
| timeline_validators.py | Functions: validate_timeline_response. |
| utils.py | Functions: get_current_utc_time, calculate_freshness. |
| validators.py | Classes: ResponseValidator. |
| __init__.py | Source code file. |

## backend\ai_engine\.pytest_cache

| File | Summary / Extracted Info |
|---|---|
| README.md | pytest cache directory |

## backend\ai_engine\tests

| File | Summary / Extracted Info |
|---|---|
| test_decision_engine.py | Functions: test_engine. |
| test_formatter.py | Functions: test_clean_json_blocks, test_clean_text_blocks, test_raw_json, test_invalid_json. |
| test_prompt_builder.py | Functions: test_prompt_builder. |
| test_scenarios.py | Functions: test_scenario_leaf_blight, test_scenario_heavy_rain, test_scenario_market_spike, test_scenario_no_weather. |
| test_validators.py | Functions: test_valid_response, test_immutable_field_changed. |
| __init__.py | Source code file. |

## backend\config

| File | Summary / Extracted Info |
|---|---|
| apiConfig.js |  Configuration constants for external APIs. |
| cropPlannerConstants.js |  Deterministic agricultural configuration for the Crop Planner.   Acts as the single source of truth for crop planning rules and lifecycle data. |
| db.js | Source code file. |
| irrigationConstants.js | Source code file. |
| supabaseClient.js | Source code file. |

## backend\constants

| File | Summary / Extracted Info |
|---|---|
| events.js | Functions: buildEventPayload. |
| notificationTemplates.js | Functions: getNotificationTemplates. |
| timelineTemplates.js | Functions: getTimelineTemplates. |

## backend\controllers

| File | Summary / Extracted Info |
|---|---|
| aiBriefingController.js | Source code file. |
| aiController.js | Source code file. |
| aiPlannerController.js | Functions: calculateRiskLevel. |
| authController.js | Source code file. |
| automationAdminController.js | Source code file. |
| chatHistoryController.js | Source code file. |
| cropPlannerController.js | Functions: getCropPlan. |
| dashboardController.js | Source code file. |
| diagnosisController.js | Source code file. |
| irrigationController.js | Functions: getAdvice. |
| irrigationPlannerController.js | Functions: getIrrigationPlan. |
| mandiController.js | Functions: getStates, getDistricts, getMandis. |
| marketplaceController.js | Source code file. |
| marketPriceController.js | Source code file. |
| notificationController.js | Source code file. |
| profileController.js | Components/Consts: calculateCompletion. |
| resourcesController.js | Functions: determineCategory, extractImage, hashString. |
| schemesController.js | Source code file. |
| timelineController.js | Source code file. |
| yieldPredictorController.js | Functions: getYieldPrediction. |

## backend\docs

| File | Summary / Extracted Info |
|---|---|
| EVENT_CATALOG.md | KhedutSaathi Event Catalog |

## backend\jobs

| File | Summary / Extracted Info |
|---|---|
| lifecycleScheduler.js | Components/Consts: lifecycleScheduler. |
| notificationScheduler.js | Source code file. |
| schemeScheduler.js | Components/Consts: schemeScheduler. |
| scrapeSchemes.js | Source code file. |
| seedAgri.js | Source code file. |
| seedSchemes.js | Components/Consts: fetchJson, extractArray. |
| seedVerifiedSchemes.js | Source code file. |
| syncSchemes.js | Components/Consts: logInfo, logError. Functions: syncSchemes. |
| test_pup.js | Source code file. |
| test_pup_next.js | Source code file. |
| test_search_url.js | Source code file. |
| test_urls.js | Source code file. |
| timelineScheduler.js | Source code file. |
| verify_evidence.js | Functions: provideEvidence. |
| weatherScheduler.js | Components/Consts: weatherScheduler. |

## backend\middleware

| File | Summary / Extracted Info |
|---|---|
| authMiddleware.js | Components/Consts: requireAuth, optionalAuth, requireFarmer. |

## backend\modules\knowledge\controllers

| File | Summary / Extracted Info |
|---|---|
| knowledgeController.js | Source code file. |

## backend\modules\knowledge\routes

| File | Summary / Extracted Info |
|---|---|
| knowledgeRoutes.js | Source code file. |

## backend\modules\knowledge\services

| File | Summary / Extracted Info |
|---|---|
| knowledgeRetrievalService.js | Source code file. |

## backend\routes

| File | Summary / Extracted Info |
|---|---|
| adminRoutes.js | Components/Consts: isAdmin. |
| aiRoutes.js | Source code file. |
| auth.js | Source code file. |
| chatHistoryRoutes.js | Source code file. |
| cropPlannerRoutes.js | Source code file. |
| dashboardRoutes.js | Source code file. |
| diagnosisRoutes.js | Source code file. |
| eventsRoutes.js | Source code file. |
| irrigationRoutes.js | Source code file. |
| mandi.js | Source code file. |
| marketplaceRoutes.js | Source code file. |
| marketPriceRoutes.js | Source code file. |
| notificationRoutes.js | Source code file. |
| profileRoutes.bak.js | Source code file. |
| profileRoutes.js | Source code file. |
| resourcesRoutes.js | Source code file. |
| schemesRoutes.js | Source code file. |
| timelineRoutes.js | Source code file. |
| yieldPredictorRoutes.js | Source code file. |

## backend\scripts

| File | Summary / Extracted Info |
|---|---|
| backfillAutomationEvents.js | Functions: runBackfill. |

## backend\services

| File | Summary / Extracted Info |
|---|---|
| aiExplanationService.js | Functions: generateExplanation. |
| automationOrchestrator.js | Source code file. |
| cropPlannerService.js | Functions: generateCropPlan. |
| farmerMemoryService.js | Source code file. |
| irrigationPlannerService.js | Functions: generateIrrigationPlan. |
| irrigationService.js | Functions: getIrrigationAdvice. |
| knowledgeIntegrationService.js | Functions: enrichWithKnowledge. |
| maintenanceScheduler.js | Source code file. |
| mandiService.js | Functions: getCached, setCached, normalizeRecord. |
| marketPriceService.js | Components/Consts: getApiKey, getResourceId. Functions: normalizeDistrict. |
| mySchemeService.js | Components/Consts: delay, logInfo, logError. Functions: with. |
| notificationService.js | Functions: generateSignature. |
| profileResolver.js | Functions: to. |
| promptBuilder.js |  Builds structured prompts for the AI Explanation Layer.   Ensures the LLM acts purely as an explanation layer and never invents facts. |
| recommendationService.js | Source code file. |
| timelineService.js | Functions: generateSignature, coreGenerateLogic. |
| weatherService.js | Components/Consts: geoPromise, weatherPromise. Functions: getWeatherData. |
| yieldPredictionService.js | Functions: getPredictedYield. |

## backend\tests

| File | Summary / Extracted Info |
|---|---|
| aiBriefingController.test.js | Source code file. |
| automationFlow.test.js |  Note: In a real project, this would be run via Jest or Mocha:   `npx jest automationFlow.test.js`      This file verifies the major event-driven automation flows. |
| execute_runtime_validation.js | Functions: delay, runValidation. |
| verify_automation.js | Functions: runValidation. |

## backend\utils

| File | Summary / Extracted Info |
|---|---|
| apiResponse.js |  Utility for formatting consistent API responses. |
| automationLogger.js | Source code file. |
| automationMetrics.js | Source code file. |
| districtNeighbors.js | Source code file. |
| emailService.js | Components/Consts: generateOTP. |
| eventBroker.js | Source code file. |
| eventBus.js | Source code file. |
| logger.js |  Lightweight structured JSON logger.   Writes to stdout/stderr in a format easily parsable by log aggregators. |
| schemeTransformer.js |  Transformer for normalizing MyScheme API responses to Supabase structure |
| sseBroker.js | Source code file. |
| translator.js | Functions: translateArray, translateObjects. |

## docs

| File | Summary / Extracted Info |
|---|---|
| COMPONENT_INVENTORY.md | KhedutSaathi Component Inventory |
| DESIGN_DNA.md | KhedutSaathi Design DNA |
| DESIGN_SYSTEM.md | KhedutSaathi Design System Audit |
| EXECUTION_STRATEGY.md | KhedutSaathi Frontend V2 Execution Strategy |
| FRONTEND_ARCHITECTURE.md | KhedutSaathi Frontend Architecture Audit |
| FRONTEND_ROADMAP.md | KhedutSaathi Frontend Roadmap — Version 2 |
| PRODUCT_AUDIT.md | KhedutSaathi Product Audit |
| UX_PRINCIPLES.md | KhedutSaathi UX Principles |

## docs\migrations

| File | Summary / Extracted Info |
|---|---|
| API_CLIENT_CONSOLIDATION.md | API Client Consolidation: Migration Summary |

## frontend

| File | Summary / Extracted Info |
|---|---|
| eslint.config.js | Source code file. |
| index.html | Source code file. |
| postcss.config.js | Source code file. |
| README.md | React + Vite |
| tailwind.config.js | @type {import('tailwindcss').Config} |
| vite.config.js | Source code file. |

## frontend\src

| File | Summary / Extracted Info |
|---|---|
| App.jsx | Source code file. |
| i18n.js | Source code file. |
| index.css | Source code file. |
| main.jsx | Source code file. |

## frontend\src\components

| File | Summary / Extracted Info |
|---|---|
| BackToTop.jsx | Components/Consts: toggleVisibility, scrollToTop. Functions: BackToTop. |
| ChatbotWidget.jsx | Components/Consts: scrollToBottom, handleClickOutside. Functions: ChatbotWidget. |
| ErrorBoundary.jsx | Source code file. |
| Footer.jsx | Functions: Footer. |
| Navbar.jsx | Components/Consts: handleScroll, handleClickOutside. Functions: Navbar. |
| ProtectedRoute.jsx | Functions: ProtectedRoute. |

## frontend\src\components\dashboard

| File | Summary / Extracted Info |
|---|---|
| RecommendedSchemesWidget.jsx | Functions: RecommendedSchemesWidget. |

## frontend\src\components\market-prices

| File | Summary / Extracted Info |
|---|---|
| LoadingSkeleton.jsx | Functions: LoadingSkeleton. |
| MarketPriceCard.jsx | Functions: MarketPriceCard. |
| MarketPriceFilters.jsx | Functions: MarketPriceFilters. |
| MarketPricePagination.jsx | Components/Consts: handlePrev, handleNext, getPageNumbers. Functions: MarketPricePagination. |
| MarketPriceTable.jsx | Functions: MarketPriceTable. |

## frontend\src\components\Marketplace

| File | Summary / Extracted Info |
|---|---|
| FilterSidebar.jsx | Functions: FilterSidebar. |
| MarketplaceHeroSection.jsx | Functions: MarketplaceHeroSection. |
| ProductCard.jsx | Functions: ProductCard. |
| ProductDetailsModal.jsx | Components/Consts: handlePrev, handleNext, handleKeyDown. Functions: ProductDetailsModal. |
| ProductGrid.jsx | Functions: ProductGrid. |
| ShoppingCartDrawer.jsx | Functions: ShoppingCartDrawer. |

## frontend\src\components\shared

| File | Summary / Extracted Info |
|---|---|
| EmptyState.jsx | Functions: EmptyState. |
| ErrorDisplay.jsx | Functions: ErrorDisplay. |
| FeatureCard.jsx | Functions: FeatureCard. |
| LoadingButton.jsx | Functions: LoadingButton. |
| NewsCard.jsx | Components/Consts: getFallbackImage, handleError. Functions: hashString, NewsCard. |
| PageHero.jsx | Functions: PageHero. |
| PageLayout.jsx | Functions: PageLayout, PageHeader, PageContent. |
| PageLoader.jsx | Functions: PageLoader. |
| SchemeCard.jsx | Components/Consts: toggleBookmark. Functions: SchemeCard. |
| SectionHeader.jsx | Functions: SectionHeader. |
| SectionLoader.jsx | Functions: SectionLoader. |
| SkeletonCard.jsx | Functions: SkeletonCard. |
| StatCard.jsx | Functions: AnimatedCounter, StatCard. |

## frontend\src\components\shared\Toast

| File | Summary / Extracted Info |
|---|---|
| Toast.jsx | Functions: Toast. |
| ToastContainer.jsx | Functions: ToastContainer. |

## frontend\src\constants

| File | Summary / Extracted Info |
|---|---|
| languages.js | Source code file. |

## frontend\src\context

| File | Summary / Extracted Info |
|---|---|
| AuthContext.jsx | Components/Consts: useAuth, AuthProvider, login. |
| ChatContext.jsx | Components/Consts: ChatProvider. |
| CrossModuleContext.jsx | Components/Consts: publishModuleOutput, getModuleOutput, isModuleSynchronized. Functions: CrossModuleProvider. |
| FarmContext.jsx | Components/Consts: updateFarmContext, resetFarmContext. Functions: FarmProvider, useFarmContext. |
| ThemeContext.jsx | Components/Consts: toggleTheme, useTheme. Functions: ThemeProvider. |
| ToastContext.jsx | Components/Consts: useToast, ToastProvider, coreToast. |
| WishlistContext.jsx | Components/Consts: showToast. Functions: useWishlist, WishlistProvider. |

## frontend\src\data

| File | Summary / Extracted Info |
|---|---|
| generate_map.py | Source code file. |
| mockMarketplaceData.js | Source code file. |
| stateDistrictMap.js | Source code file. |

## frontend\src\features\dashboard

| File | Summary / Extracted Info |
|---|---|
| Dashboard.jsx | Components/Consts: Dashboard, handleAccept. |

## frontend\src\features\dashboard\components

| File | Summary / Extracted Info |
|---|---|
| AIDailyBriefing.jsx | Components/Consts: getRelativeTime, mapDecisionMetadata. |
| DashboardCards.jsx | Components/Consts: WelcomeHeader, FarmSummaryCard. |
| ErrorBoundary.jsx | Source code file. |
| MarketSnapshot.jsx | Functions: MarketSnapshot. |
| Sections.jsx | Components/Consts: NewsSection. |
| TimelineWorkspace.jsx | Functions: TimelineWorkspace. |

## frontend\src\features\dashboard\constants

| File | Summary / Extracted Info |
|---|---|
| dashboard.constants.js | Source code file. |
| queryKeys.js | Source code file. |

## frontend\src\features\dashboard\hooks

| File | Summary / Extracted Info |
|---|---|
| useAIBriefing.js | Functions: useAIBriefing. |
| useDashboardQueries.js | Components/Consts: useDashboardOverview, useWeather, useMarket. |
| useMarketIntelligence.js | Components/Consts: useMarketIntelligence. |

## frontend\src\features\dashboard\services

| File | Summary / Extracted Info |
|---|---|
| dashboardService.js | Components/Consts: getHeaders. |
| marketIntelligenceService.js | Source code file. |

## frontend\src\features\dashboard\skeletons

| File | Summary / Extracted Info |
|---|---|
| Skeletons.jsx | Components/Consts: FarmSummarySkeleton, ProfileCompletionSkeleton, SectionSkeleton. |

## frontend\src\features\dashboard\utils

| File | Summary / Extracted Info |
|---|---|
| commodityMapper.js |  Utility to map and normalize farmer profile crop names to official market database commodity names. |
| marketTransformer.js |  Transforms raw API mandi records into the standard Dashboard UI contract.     Expected Output Contract:   {     currentPrice: number,     previousPrice: number,     bestPrice: number,     bestMark... |

## frontend\src\features\insurance

| File | Summary / Extracted Info |
|---|---|
| KhedutSurakshaIndex.jsx | Components/Consts: handleEligibilityComplete, handleDocumentsComplete. Functions: KhedutSuraksha. |

## frontend\src\features\insurance\components

| File | Summary / Extracted Info |
|---|---|
| EligibilityChecker.jsx | Functions: EligibilityChecker. |
| EvidencePackage.jsx | Components/Consts: getScoreColor, getScoreBg, handleDownload. Functions: EvidencePackage. |
| RequiredDocuments.jsx | Components/Consts: handleToggle, handleProceed. Functions: RequiredDocuments. |

## frontend\src\features\notifications

| File | Summary / Extracted Info |
|---|---|
| NotificationCenter.jsx | Components/Consts: NotificationCenter, getPriorityIcon. |

## frontend\src\hooks

| File | Summary / Extracted Info |
|---|---|
| useBookmarks.js | Components/Consts: useBookmarks, useAddBookmark, useRemoveBookmark. |
| useMarketInsights.js | Components/Consts: useMarketInsights. |
| useMarketPrices.js | Components/Consts: useMarketPrices, useMarketFeed, useMarketFilters. |
| useToast.js | Source code file. |

## frontend\src\lib

| File | Summary / Extracted Info |
|---|---|
| utils.js | Functions: cn. |

## frontend\src\pages\About

| File | Summary / Extracted Info |
|---|---|
| About.jsx | Functions: HeroSection. |

## frontend\src\pages\AgriMarketplace

| File | Summary / Extracted Info |
|---|---|
| AgriMarketplace.jsx | Functions: AgriMarketplace. |
| Wishlist.jsx | Components/Consts: handleAddToCart, handleUpdateQuantity, handleRemoveItem. Functions: Wishlist. |

## frontend\src\pages\Auth\ForgotPassword

| File | Summary / Extracted Info |
|---|---|
| ForgotPassword.jsx | Functions: ForgotPassword. |

## frontend\src\pages\Auth\Login

| File | Summary / Extracted Info |
|---|---|
| Login.jsx | Functions: Login. |

## frontend\src\pages\Auth\Register

| File | Summary / Extracted Info |
|---|---|
| Register.jsx | Functions: Register. |

## frontend\src\pages\CropDiagnosis

| File | Summary / Extracted Info |
|---|---|
| CropDiagnosis.jsx | Functions: CropDiagnosis. |

## frontend\src\pages\CropDiagnosis\components

| File | Summary / Extracted Info |
|---|---|
| AnalysisStep.jsx | Functions: AnalysisStep. |
| DiagnosisReport.jsx | Components/Consts: getSeverityColor. Functions: DiagnosisReport. |
| DiagnosisStepper.jsx | Functions: DiagnosisStepper. |
| PreviewStep.jsx | Functions: PreviewStep. |
| TreatmentPlan.jsx | Functions: TreatmentPlan. |
| UploadStep.jsx | Components/Consts: handleFileSelect, stopCamera, capturePhoto. Functions: UploadStep. |

## frontend\src\pages\CropMarket

| File | Summary / Extracted Info |
|---|---|
| CropMarket.jsx | Functions: CropMarket. |

## frontend\src\pages\Dashboard

| File | Summary / Extracted Info |
|---|---|
| Dashboard.jsx | Functions: Dashboard. |

## frontend\src\pages\Deals

| File | Summary / Extracted Info |
|---|---|
| Deals.jsx | Functions: Deals. |

## frontend\src\pages\ExpertPanel

| File | Summary / Extracted Info |
|---|---|
| ExpertPanel.jsx | Functions: ExpertPanel. |

## frontend\src\pages\ExpertPanel\AICropPlanner

| File | Summary / Extracted Info |
|---|---|
| AICropPlannerWorkspace.jsx | Functions: AICropPlannerWorkspace. |

## frontend\src\pages\ExpertPanel\YieldPredictor

| File | Summary / Extracted Info |
|---|---|
| YieldPredictor.jsx | Functions: YieldPredictor. |

## frontend\src\pages\Features

| File | Summary / Extracted Info |
|---|---|
| Features.jsx | Functions: Features. |

## frontend\src\pages\Home

| File | Summary / Extracted Info |
|---|---|
| AIEcosystemVisualization.jsx | Components/Consts: NodeCard. |
| AIFarmingWorkflowSection.jsx | Functions: AIFarmingWorkflowSection. |
| CropHealthSection.jsx | Components/Consts: handleScan, reset. Functions: InteractiveScanner. |
| CropPlanningSection.jsx | Functions: CropPlanningSection. |
| FarmerProblemsSection.jsx | Functions: FarmerProblemsSection. |
| FinalCTASection.jsx | Functions: FinalCTASection. |
| HeroSection.jsx | Components/Consts: handleMotionChange, checkMobile. Functions: HeroSection. |
| Home.jsx | Functions: Home. |
| MarketplaceShowcase.jsx | Functions: MarketplaceShowcase. |
| MarketPricesSection.jsx | Functions: MarketPricesSection. |
| NewsAndSchemesSection.jsx | Functions: NewsAndSchemesSection. |
| NewsSection.jsx | Functions: NewsSection. |
| SchemesSection.jsx | Functions: SchemesSection. |
| WhyFarmersNeedUsSection.jsx | Functions: WhyFarmersNeedUsSection. |
| YieldPredictionShowcase.jsx | Functions: YieldPredictionShowcase. |

## frontend\src\pages\KhedutAI

| File | Summary / Extracted Info |
|---|---|
| KhedutAI.jsx | Components/Consts: scrollToBottom, handleSend, handleKeyDown. Functions: KhedutAI. |

## frontend\src\pages\MarketHub

| File | Summary / Extracted Info |
|---|---|
| MarketHub.jsx | Functions: MarketHub. |

## frontend\src\pages\MarketHub\LivePrices

| File | Summary / Extracted Info |
|---|---|
| LivePrices.jsx | Components/Consts: handleExportCSV. Functions: LivePrices. |

## frontend\src\pages\MarketHub\LivePrices\components

| File | Summary / Extracted Info |
|---|---|
| AdvancedMarketTable.jsx | Components/Consts: handleSort. Functions: AdvancedMarketTable. |
| AIMarketInsights.jsx | Components/Consts: getIcon, getBgColor. Functions: AIMarketInsights. |
| BestSellingOpp.jsx | Functions: BestSellingOpp. |
| MarketOverviewKPIs.jsx | Functions: MarketOverviewKPIs. |
| PriceIntelligenceChart.jsx | Functions: PriceIntelligenceChart. |
| SellingDecisionHero.jsx | Functions: SellingDecisionHero. |

## frontend\src\pages\MarketHub\LivePrices\utils

| File | Summary / Extracted Info |
|---|---|
| sellingDecisionEngine.js |  Deterministic engine for generating selling recommendations based on real market data.   Designed to be modular so it can be replaced by ML models in the future. |

## frontend\src\pages\MarketHub\SellYield

| File | Summary / Extracted Info |
|---|---|
| SellYield.jsx | Components/Consts: handleChange, handleImageChange. Functions: SellYield. |

## frontend\src\pages\Placeholder

| File | Summary / Extracted Info |
|---|---|
| PlaceholderPage.jsx | Functions: PlaceholderPage. |

## frontend\src\pages\Profile

| File | Summary / Extracted Info |
|---|---|
| Profile.jsx | Functions: Profile. |
| Subscriptions.jsx | Source code file. |

## frontend\src\pages\Resources

| File | Summary / Extracted Info |
|---|---|
| NewsDetail.jsx | Functions: NewsDetail. |
| Resources.jsx | Components/Consts: CustomDropdown, handleClickOutside. |
| SchemeDetail.jsx | Functions: SchemeDetails. |
| SchemeEligibilityEngine.jsx | Components/Consts: handleChange. Functions: SchemeEligibilityEngine. |

## frontend\src\pages\SellerDashboard

| File | Summary / Extracted Info |
|---|---|
| SellerDashboard.jsx | Functions: SellerDashboard. |

## frontend\src\pages\SmartIrrigation

| File | Summary / Extracted Info |
|---|---|
| SmartIrrigation.jsx | Components/Consts: formatVolume. Functions: SmartIrrigation. |

## frontend\src\services

| File | Summary / Extracted Info |
|---|---|
| api.js | Source code file. |
| irrigationApi.js | Source code file. |
| irrigationPlannerApi.js | Functions: getIrrigationPlan. |
| khedutAIService.js |  Khedut AI Service   Architecture ready for future backend API integration. |
| marketApi.js | Source code file. |
| marketPriceService.js | Source code file. |
| mlApi.js | Source code file. |
| notificationService.js |  A lightweight, UI-agnostic Notification Service.   Publishes structured notification events to registered listeners.   Designed to act as the architectural boundary between the infrastructure (API... |
| ragApi.js | Functions: askRag. |
| translateService.js | Source code file. |

## frontend\src\services\supabase

| File | Summary / Extracted Info |
|---|---|
| client.js | Source code file. |
| marketplaceService.js | Source code file. |

## frontend\src\utils

| File | Summary / Extracted Info |
|---|---|
| errorUtils.js |  Generates a unique error ID for tracking and debugging purposes.   @returns {string} A unique alphanumeric string (e.g. "ERR-A1B2C3D4") |

## rag_system

| File | Summary / Extracted Info |
|---|---|
| README.md | KhedutSaathi Agricultural Knowledge Engine |

## rag_system\embeddings

| File | Summary / Extracted Info |
|---|---|
| run.py | Source code file. |

## rag_system\knowledge

| File | Summary / Extracted Info |
|---|---|
| acquisition_validation_report.md | Acquisition Engine Validation Report |
| repository_health_report.md | Agricultural Knowledge Repository Health & Coverage Report |
| retrieval_benchmark_report.md | Knowledge Engine Retrieval Benchmark Report |

## rag_system\scripts

| File | Summary / Extracted Info |
|---|---|
| approve_documents.py | Functions: approve_all. |
| evaluate_retrieval.py | Functions: evaluate. |
| evaluate_retrieval_benchmark.py | Improved retrieval benchmark with realistic queries against the TNAU agricultural documents. Run: .\.venv\Scripts\python.exe rag_system\scripts\evaluate_retrieval_benchmark.py |
| explorer.py | Functions: print_separator, main. |
| generate_benchmarks.py | Functions: generate_benchmarks. |
| ingest_knowledge.py | Incremental Knowledge Ingestion Script Usage:   python ingest_knowledge.py         (Incremental update)   python ingest_knowledge.py --full  (Full rebuild) |
| inspect_db.py | Quick diagnostic: prints ChromaDB collection stats and top 5 results for a sample query. Run: .\.venv\Scripts\python.exe rag_system\scripts\inspect_db.py |
| metadata_quality_report.py | Generates a metadata quality report for the ChromaDB index to verify Intelligent Metadata Extraction. Run: .\.venv\Scripts\python.exe rag_system\scripts\metadata_quality_report.py |
| test_real_queries.py | Functions: run_tests. |
| validate_acquisition.py | Functions: generate_report. |
| validate_hierarchy.py | Functions: validate_hierarchy. |
| validate_repository.py | Functions: generate_report. |

## rag_system\src

| File | Summary / Extracted Info |
|---|---|
| api.py | Functions: read_root, health_check, ask_question, knowledge_search. |
| api_utils.py | Functions: get_query_engine, process_query. |
| chroma_manager.py | Classes: ChromaDBManager. |
| chunker.py | Functions: chunk_documents. |
| config.py | Source code file. |
| embedder.py | Classes: CustomEmbedder. |
| gemini_client.py | Classes: GeminiClient. |
| gemini_manager.py | Classes: GeminiManager. |
| html_to_txt.py | Source code file. |
| ingest.py | Functions: run_ingestion. |
| ingest_knowledge.py | Functions: build_metadata_map, ingest_all. |
| pdf_loader.py | Functions: load_pdfs. |
| query_engine.py | Classes: QueryEngine. |
| response_formatter.py | Functions: clean_response. |
| retriever.py | Classes: Retriever. |
| schemas.py | Classes: AskRequest, AskResponse, KnowledgeSearchRequest. |
| web_loader.py | Functions: load_urls. |

## rag_system\src\acquisition

| File | Summary / Extracted Info |
|---|---|
| acquire.py | Functions: run_acquisition. |
| config.py | Classes: AcquisitionConfig. |
| downloader.py | Classes: DocumentDownloader. |
| manifest.py | Classes: AcquisitionManifest. |
| metadata.py | Classes: MetadataGenerator. |
| organizer.py | Classes: DocumentOrganizer. |
| validator.py | Classes: DocumentValidator. |

## rag_system\src\acquisition\connectors

| File | Summary / Extracted Info |
|---|---|
| base_connector.py | Classes: BaseConnector. |
| fao_connector.py | Classes: FAOConnector. |
| icar_connector.py | Classes: ICARConnector. |
| jau_connector.py | Classes: JAUConnector. |
| pau_connector.py | Classes: PAUConnector. |
| tnau_connector.py | Classes: TNAUConnector. |
| __init__.py | Source code file. |

## rag_system\src\knowledge_engine

| File | Summary / Extracted Info |
|---|---|
| chunker.py | Classes: HierarchicalChunker. |
| indexer.py | Classes: KnowledgeIndexer. |
| parser.py | Classes: DocumentParser. |
| reranker.py | Classes: KnowledgeReranker. |
| retriever.py | Classes: KnowledgeRetriever. |

## rag_system\tests

| File | Summary / Extracted Info |
|---|---|
| test_gpu.py | Functions: run_test. |

