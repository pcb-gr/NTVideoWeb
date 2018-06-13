/**
 * Created by Jeff on 9/24/2016.
 */
var cacheUtil = require('../../app/util/CacheUtil');
var countryDao = {
    baseDao: {},
    model: {},
    findAll: function () {
        var self = this;
        return self.baseDao.find("SELECT country.* FROM country ORDER BY name",
            {model: self.model}
        ).then(function (data) {
                return data;
            })
    },
	findAllWithCache: function () {
        var self = this;
        var cacheKey = 'countryDao.findAllWithCache';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findAll(alias).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findByAliasWithCache: function (alias) {
        var self = this;
        var cacheKey = 'countryDao.findByAliasWithCache';
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
        return self.baseDao.find("SELECT country.* FROM country where alias = ? ORDER BY name",
            {replacements: [alias], model: self.model}
        ).then(function (data) {
                return data;
            })
    }
}

module.exports = function (sequelize) {
    countryDao.model = sequelize.models.country;
    countryDao.baseDao = sequelize.daos.baseDao;
    sequelize.daos.countryDao = countryDao;
    return countryDao;
}