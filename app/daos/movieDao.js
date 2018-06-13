/**
 * Created by Jeff on 9/24/2016.
 */
var cacheUtil = require('../../app/util/CacheUtil');
var movieDao = {
    baseDao: {},
    model: {},
    findAll: function () {
        var self = this;
        return self.baseDao.find("SELECT movie.* FROM movie ORDER BY name",
            {model: self.model}
        ).then(function (data) {
            return data;
        })
    },
    findByAliasWithCache: function (alias) {
        var self = this;
        var cacheKey = 'movieDao.findByAliasWithCache';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findByAlias(alias).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findByAlias: function (alias) {
        var self = this;
        return self.baseDao.find("SELECT movie.* FROM movie where movie.alias = ?",
            {replacements: [alias], model: self.model}
        ).then(function (data) {
            return data;
        })
    }
}

module.exports = function(sequelize) {
    movieDao.model = sequelize.models.movie;
    movieDao.baseDao = sequelize.daos.baseDao;
    sequelize.daos.movieDao = movieDao;
    return movieDao;
}