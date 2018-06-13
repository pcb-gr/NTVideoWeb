var menusBean = require('../../app/beans/modules/menus');
var Q = require('q');
var cacheUtil = require('../../app/util/CacheUtil');
var constants = require('../../config/constant');

var commonService = {
    sequelize: {},
    findMenusWithCache: function () {
        var self = this;
        var cacheKey = 'CommonService.findMenusWithCache';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findMenus().then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMenus: function () {
        var self = this;
        return Q.fcall(function () {
            return self.sequelize.daos.categoryDao.findAll().then(function (categories) {
                    menusBean.categories = categories;
            })
        }).then(function () {
            return self.sequelize.daos.countryDao.findAll().then(function (countries) {
                menusBean.countries = countries;
            })
        }).then(function () {
            return self.findSubMenusForOneEpisode().then(function (oneEpisodes) {
                menusBean.oneEpisodes = oneEpisodes;
            })
        }).then(function () {
            return self.findSubMenusForMultiEpisode().then(function (multiEpisodes) {
                menusBean.multiEpisodes = multiEpisodes;
            })
        }).then(function () {
            return self.findSubMenusForNewEpisode().then(function (newEpisodes) {
                menusBean.newEpisodes = newEpisodes;
            })
        }).then(function () {
            return self.findSubMenusForTVShow().then(function (tvShowEpisodes) {
                menusBean.tvShowEpisodes = tvShowEpisodes;
            })
        }).then(function () {
            return menusBean;
        });
    },
    findSubMenusForOneEpisode: function () {
        var self = this;
        var rs = {countries: [], publishYears: [], captions: [], categories:[]};
        return Q.fcall(function () {
            return self.sequelize.query('SELECT country.* FROM country ' +
                'INNER JOIN movie_country ON country.countryId = movie_country.countryId ' +
                'INNER JOIN movie ON movie.movieId = movie_country.movieId ' +
                'WHERE movie.isMultiEpisode = 0 GROUP BY (country.countryId) ORDER BY country.alias',
                {model: self.sequelize.models.country}
            ).then(function (countries) {
                    rs.countries = countries;
                })
        }).then(function () {
            return self.sequelize.query('SELECT category.* FROM category ' +
                'INNER JOIN movie_category ON category.categoryId = movie_category.categoryId ' +
                'INNER JOIN movie ON movie.movieId = movie_category.movieId ' +
                'WHERE movie.isMultiEpisode = 0 GROUP BY (category.categoryId) ORDER BY category.alias'
            ).spread(function (categories) {
                    rs.categories = categories;
                })
        }).then(function () {
            return self.sequelize.query('SELECT movie.publishYear FROM movie ' +
                'WHERE movie.isMultiEpisode = 0 AND movie.publishYear > 0 GROUP BY (movie.publishYear) ORDER BY movie.publishYear DESC LIMIT 10'
            ).spread(function (publishYears) {
                    rs.publishYears = publishYears;
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.isMultiEpisode = 0 AND victim.hasSub = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({name: global.dbConstants.hasSubName, alias: global.dbConstants.hasSubAlias});
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.isMultiEpisode = 0 AND victim.hasDubbing = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({
                            name: global.dbConstants.hasDubbingName,
                            alias: global.dbConstants.hasDubbingAlias
                        });
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.isMultiEpisode = 0 AND victim.hasTrans = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({
                            name: global.dbConstants.hasTransName,
                            alias: global.dbConstants.hasTransAlias
                        });
                })
        }).then(function () {
            return rs;
        });
    },
    findSubMenusForMultiEpisode: function () {
        var self = this;
        var rs = {countries: [], publishYears: [], captions: [], categories:[]};
        return Q.fcall(function () {
            return self.sequelize.query('SELECT country.* FROM country ' +
                'INNER JOIN movie_country ON country.countryId = movie_country.countryId ' +
                'INNER JOIN movie ON movie.movieId = movie_country.movieId ' +
                'WHERE movie.isMultiEpisode = 1 GROUP BY (country.countryId) ORDER BY country.alias',
                {model: self.sequelize.models.country}
            ).then(function (countries) {
                    rs.countries = countries;
                })
        }).then(function () {
            return self.sequelize.query('SELECT category.* FROM category ' +
                'INNER JOIN movie_category ON category.categoryId = movie_category.categoryId ' +
                'INNER JOIN movie ON movie.movieId = movie_category.movieId ' +
                'WHERE movie.isMultiEpisode = 1 GROUP BY (category.categoryId) ORDER BY category.alias'
            ).spread(function (categories) {
                    rs.categories = categories;
                })
        }).then(function () {
            return self.sequelize.query('SELECT movie.publishYear FROM movie ' +
                'WHERE movie.isMultiEpisode = 1 AND movie.publishYear > 0 GROUP BY (movie.publishYear) ORDER BY movie.publishYear DESC LIMIT 10'
            ).spread(function (publishYears) {
                    rs.publishYears = publishYears;
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.isMultiEpisode = 1 AND victim.hasSub = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({name: global.dbConstants.hasSubName, alias: global.dbConstants.hasSubAlias});
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.isMultiEpisode = 1 AND victim.hasDubbing = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({
                            name: global.dbConstants.hasDubbingName,
                            alias: global.dbConstants.hasDubbingAlias
                        });
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.isMultiEpisode = 1 AND victim.hasTrans = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({
                            name: global.dbConstants.hasTransName,
                            alias: global.dbConstants.hasTransAlias
                        });
                })
        }).then(function () {
            return rs;
        });
    },
    findSubMenusForNewEpisode: function () {
        var self = this;
        var rs = {countries: [], captions: [], categories:[]};
        return Q.fcall(function () {
            return self.sequelize.query('SELECT country.* FROM country ' +
                'INNER JOIN movie_country ON country.countryId = movie_country.countryId ' +
                'INNER JOIN movie ON movie.movieId = movie_country.movieId ' +
                'WHERE movie.publishYear = ' + constants.currentYear + ' GROUP BY (country.countryId) ORDER BY country.alias',
                {model: self.sequelize.models.country}
            ).then(function (countries) {
                    rs.countries = countries;
                })
        }).then(function () {
            return self.sequelize.query('SELECT category.* FROM category ' +
                'INNER JOIN movie_category ON category.categoryId = movie_category.categoryId ' +
                'INNER JOIN movie ON movie.movieId = movie_category.movieId ' +
                'WHERE movie.publishYear = ' + constants.currentYear + ' GROUP BY (category.categoryId) ORDER BY category.alias'
            ).spread(function (categories) {
                    rs.categories = categories;
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.publishYear = ' + constants.currentYear + ' AND victim.hasSub = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({name: global.dbConstants.hasSubName, alias: global.dbConstants.hasSubAlias});
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.publishYear = ' + constants.currentYear + ' AND victim.hasDubbing = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({
                            name: global.dbConstants.hasDubbingName,
                            alias: global.dbConstants.hasDubbingAlias
                        });
                })
        }).then(function () {
            return self.sequelize.query('SELECT victim.* FROM movie ' +
                'INNER JOIN victim  ON movie.movieId = victim.movieId ' +
                'WHERE movie.publishYear = ' + constants.currentYear + ' AND victim.hasTrans = 1 LIMIT 1',
                {model: self.sequelize.models.victim}
            ).then(function (victims) {
                    if (victims.length > 0)
                        rs.captions.push({
                            name: global.dbConstants.hasTransName,
                            alias: global.dbConstants.hasTransAlias
                        });
                })
        }).then(function () {
            return rs;
        });
    },
    findSubMenusForTVShow: function () {
        var self = this;
        var rs = {countries: []};
        return Q.fcall(function () {
            return self.sequelize.query('SELECT country.* FROM movie ' +
                'INNER JOIN movie_category ON movie.movieId = movie_category.movieId ' +
                'INNER JOIN category ON category.categoryId = movie_category.categoryId ' +
                'INNER JOIN movie_country ON movie.movieId = movie_country.movieId ' +
                'INNER JOIN country ON country.countryId = movie_country.countryId ' +
                "WHERE category.alias = '" + global.dbConstants.tvShowAlias + "' GROUP BY (country.countryId)",
                {model: self.sequelize.models.country}
            ).then(function (countries) {
                rs.countries = countries;
            })
        }).then(function () {
            return rs;
        });
    }
}

module.exports = function (sequelize) {
    commonService.sequelize = sequelize;
    return commonService;
};