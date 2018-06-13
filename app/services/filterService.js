var Q = require('q');
var cacheUtil = require('../../app/util/CacheUtil');
var queryUtil = require('../../app/util/QueryUtil');
var MovieService = require('./movieService');
var filterService =  {
    sequelize: {},
    getListFiltersWithCache : function () {
        var self = this;
        var cacheKey = 'filterService.getListFiltersWithCache';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.getListFilters().then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    getListFilters : function () {
        var self = this;
        var listFilters = {categories: [], countries: [], actors: [], directors: []};
        return Q.fcall(function () {
            return self.sequelize.daos.categoryDao.findAll().then(function (categories) {
                listFilters.categories = categories;
            })
        }).then(function () {
            return self.sequelize.daos.countryDao.findAll().then(function (countries) {
                listFilters.countries = countries;
            })
        }).then(function () {
            return self.sequelize.daos.actorDao.findAll().then(function (actors) {
                listFilters.actors = actors;
            })
        }).then(function () {
            return self.sequelize.daos.directorDao.findAll().then(function (directors) {
                listFilters.directors = directors;
            })
        }).then(function () {
            return listFilters;
        });
    },
    filterActorsByKeyWordWithCache : function (keyWord) {
        var self = this;
        var cacheKey = 'filterService.filterActorsByKeyWordWithCache' + '.' + keyWord;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.filterActorsByKeyWord(keyWord).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    filterActorsByKeyWord: function (keyWord) {
        var self = this;
        keyWord = keyWord + "%";
        return self.sequelize.query("SELECT actor.* FROM actor WHERE alias LIKE ? ORDER BY name LIMIT 1000",
            {replacements: [keyWord], model: self.sequelize.models.actor}
        ).then(function (data) {
            return data;
        }).catch(function (ex) {
            return Array();
        });
    },
    filterDirectorsByKeyWordWithCache : function (keyWord) {
        var self = this;
        var cacheKey = 'filterService.filterDirectorsByKeyWordWithCache' + '.' + keyWord;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.filterDirectorsByKeyWord(keyWord).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    filterDirectorsByKeyWord: function (keyWord) {
        var self = this;
        keyWord = keyWord + "%";
        return self.sequelize.query("SELECT director.* FROM director WHERE alias LIKE ? ORDER BY name",
            {replacements: [keyWord], model: self.sequelize.models.director}
        ).then(function (data) {
                return data;
        }).catch(function (ex) {
            return Array();
        });
    },
    filterMoviesByParamsWithCache: function (params, pagingInfo) {
        var self = this;
        var cacheKey = 'filterService.filterMoviesByParamsWithCache.' + ((typeof pagingInfo === "undefined" || pagingInfo == null)
                ? 'All'
                : pagingInfo.currentPage + '.' + pagingInfo.totalOnPage);

        for (var prop in params) {
            // skip loop if the property is from prototype
            if(!params.hasOwnProperty(prop)) continue;
            cacheKey += '.' + params[prop];
        }
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.filterMoviesByParams(params, pagingInfo).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    filterMoviesByParams : function (params, pagingInfo) {
        var self = this;
        var pagingQuery = queryUtil.buildPaging(pagingInfo);
        var query = 'SELECT movie.* FROM movie' +
            ' INNER JOIN victim ON movie.movieId = victim.movieId AND victim.isDefault = 1 AND movie.isPublic = 1 ';
        var queryByParamsInfo = queryUtil.buildJoinQueryByParams(params);
        query = query + queryByParamsInfo.query +  ' WHERE ' + queryByParamsInfo.whereCondition + pagingQuery;
        return self.sequelize.query(query,
            {replacements: queryByParamsInfo.replacements, model: self.sequelize.models.movie}
        ).then(function (movies) {
            movieService = new MovieService(self.sequelize);
            return movieService.populateReferenceToMovie(movies).then(function (movies) {
                return movies;
            });
        }).catch(function (ex) {
            return Array();
        })
    }
};


module.exports = function (sequelize) {
    filterService.sequelize = sequelize;
    return filterService;
};
