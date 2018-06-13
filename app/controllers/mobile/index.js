module.exports = {
    home: require('./homeController')(),
    error: require('./errorController')(),
    list: require('./listController')(),
    watch: require('./watchController')(),
    search : require('./searchController')(),
};
