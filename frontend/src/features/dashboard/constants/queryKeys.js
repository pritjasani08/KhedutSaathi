export const dashboardKeys = {
  all: ['dashboard'],
  overview: () => [...dashboardKeys.all, 'overview'],
  weather: (region) => [...dashboardKeys.all, 'weather', region],
  market: (state, district, commodity) => [...dashboardKeys.all, 'market', state, district, commodity],
  schemes: (profileArgs) => [...dashboardKeys.all, 'schemes', profileArgs],
  news: (language, region, crop) => [...dashboardKeys.all, 'news', language, region, crop],
};
