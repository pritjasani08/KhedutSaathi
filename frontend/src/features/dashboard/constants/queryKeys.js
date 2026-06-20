export const dashboardKeys = {
  all: ['dashboard'],
  overview: () => [...dashboardKeys.all, 'overview'],
  weather: (state, district) => [...dashboardKeys.all, 'weather', state, district],
  market: (state, district, commodity) => [...dashboardKeys.all, 'market', state, district, commodity],
  schemes: (profileArgs) => [...dashboardKeys.all, 'schemes', profileArgs],
  news: (language, region, crop) => [...dashboardKeys.all, 'news', language, region, crop],
};
