/**
 * Created by Jeff on 9/24/2016.
 */
var cacheUtil = require('../../app/util/CacheUtil');
var categoryDao = {
    baseDao: {},
    model: {},
    findAllWithCache : function () {
        var self = this;
        var cacheKey = 'categoryDao.findAllWithCache';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findAll().then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findAll: function () {
        var self = this;
        return self.baseDao.find("SELECT category.* FROM category ORDER BY name",
            {model: self.model}
        ).then(function (data) {
            return data;
        })
    },
    findByAliasWithCache : function (alias) {
        var self = this;
        var cacheKey = 'categoryDao.findByAliasWithCache';
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
        return self.baseDao.find("SELECT category.* FROM category where alias = ? ORDER BY name",
            {replacements: [alias], model: self.model}
        ).then(function (data) {
            return data;
        })
    }
}


module.exports = function(sequelize) {
    categoryDao.model = sequelize.models.category;
    categoryDao.baseDao = sequelize.daos.baseDao;
    sequelize.daos.categoryDao = categoryDao;
    return categoryDao;
}