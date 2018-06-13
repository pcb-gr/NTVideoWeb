module.exports = {
  error : require('./errorController')(),
  home     : require('./homeController')(),
  list : require('./listController')(),
  watch : require('./watchController')(),
  service : require('./serviceController')(),
  filter : require('./filterController')(),
  search : require('./searchController')(),
  siteMap : require('./siteMapController')(),
  cache : require('./cacheController')(),
  log : require('./logController')(),
  db : require('./dbController')()
};
