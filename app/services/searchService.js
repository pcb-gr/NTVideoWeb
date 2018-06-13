var Q = require('q');
var cacheUtil = require('../../app/util/CacheUtil');
var queryUtil = require('../../app/util/QueryUtil');
var FilterService = require('../../app/services/filterService');
var MovieService = require('../../app/services/movieService');
var searchService = {
    sequelize: {},
    init: function () {
        var self = this;
        var cacheKey = 'searchService.getListsearchsWithCache';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.getListSearchs().then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    searchByKeyWord: function (keyWord, pagingInfo) {
        var self = this;
        var movies = [];
        return self.findByKeyWordWithCache(keyWord, pagingInfo).then(function (data) {
            if (data.length > 0) {
                movies = data;
            }
            if (data.length < pagingInfo.totalOnPage && pagingInfo.currentPage == 1) {
                return self.findMoviesBySimilarNameCheckFieldWithCache(keyWord, pagingInfo).then(function (data) {
                    movies.mergeArrayDistinct(data, "movieId");
                    return movies;
                });
            } else {
                return movies;
            }
        });
    },
    searchMoreByKeyWord: function(keyWord) {
        var self = this;
        var rsSearch = {}
        filterService = new FilterService(self.sequelize);
        return Q.fcall(function () {
            return filterService.filterActorsByKeyWordWithCache(keyWord).then(function (data) {
                rsSearch.actors = data;
            });
        }).then(function () {
            return filterService.filterDirectorsByKeyWordWithCache(keyWord).then(function (data) {
                rsSearch.directors = data;
            });
        }).then(function () {
            return rsSearch;
        });
    },
    findMoviesBySimilarNameCheckFieldWithCache : function (keyWordString, pagingInfo) {
        var self = this;
        var cacheKey = 'FilterService.findMoviesBySimilarNameCheckFieldWithCache.' + ((typeof pagingInfo === "undefined" || pagingInfo == null)
                ? 'All'
                : pagingInfo.currentPage + '.' + pagingInfo.totalOnPage);
        cacheKey += '.' + keyWordString;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findMoviesBySimilarNameCheckField(keyWordString, pagingInfo).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMoviesBySimilarNameCheckField: function (keyWordString, pagingInfo) {
        var self = this;
        var keys = keyWordString.split('-');
        var replacements = [];

        var categoryObjectQuery = self.buildSimilarCategoryAliasQuery(keys);
        replacements.mergeArray(categoryObjectQuery.replacements);

        var countryObjectQuery = self.buildSimilarCountryAliasQuery(keys);
        replacements.mergeArray(countryObjectQuery.replacements);

        var movieObjectQuery = self.buildSimilarMovieAliasQuery(keys);
        replacements.mergeArray(movieObjectQuery.replacements);

        var pagingQuery = queryUtil.buildPaging(pagingInfo);
        var groupQuery = ' GROUP BY movie.movieId ' + pagingQuery;
        var query = categoryObjectQuery.query
            + ((categoryObjectQuery.replacements.length > 0 && countryObjectQuery.replacements.length > 0) ? ' UNION ' : '') + countryObjectQuery.query
            + ((categoryObjectQuery.replacements.length > 0 || countryObjectQuery.replacements.length > 0) ? ' UNION ' : '') + movieObjectQuery.query
            + groupQuery;

        return self.sequelize.query(query,
            {replacements: replacements, model: self.sequelize.models.movie}
        ).then(function (movies) {
            movieService = new MovieService(self.sequelize);
            return movieService.populateReferenceToMovie(movies).then(function (movies) {
                return movies;
            });
        }).catch(function (ex) {
            return Array();
        });
    },
    buildSimilarCountryAliasQuery: function(keys) {
        var keyWords = [];
        var replacements = [];
        var query = '';
        for (var i = 0; i < keys.length - 1; i ++) {
            var key = keys.clone().reverse().splice(i).reverse().join('-').trim();
            if (key == "") continue;
            keyWords.mergeArray([key]);
        }
        for (var i = 1; i < keys.length - 1; i ++) {
            var key = keys.clone().splice(i).join('-').trim();
            if (key == "") continue;
            keyWords.mergeArray([key]);
        }
        var queryJoinCountry = "SELECT movie.* FROM movie " +
            "INNER JOIN victim ON movie.movieId = victim.movieId  AND victim.isTrailer = 0 AND movie.isPublic = 1 " +
            "INNER JOIN movie_country on movie.movieId = movie_country.movieId " +
            "INNER JOIN country on country.countryId = movie_country.countryId " +
            "WHERE country.alias LIKE ?";

        keyWords.forEach(function (keyWord) {
            if (global.dbConstants.subCountriesAliasArr.indexOf(keyWord) != -1) {
                query = query + queryJoinCountry + ' UNION ';
                replacements.mergeArray([keyWord]);
            }
        })
        return {query: (replacements.length > 0) ? query.substr(0, query.lastIndexOf('UNION')) : query, replacements: replacements};
    },
    buildSimilarCategoryAliasQuery: function(keys) {
        var keyWords = [];
        var replacements = [];
        var query = '';
        for (var i = 0; i < keys.length - 1; i ++) {
            var key = keys.clone().reverse().splice(i).reverse().join('-').trim();
            if (key == "") continue;
            keyWords.mergeArray([key]);
        }
        for (var i = 1; i < keys.length - 1; i ++) {
            var key = keys.clone().splice(i).join('-').trim();
            if (key == "") continue;
            keyWords.mergeArray([key]);
        }
        var queryJoinCategory = "SELECT movie.* FROM movie " +
            "INNER JOIN victim ON movie.movieId = victim.movieId  AND victim.isTrailer = 0 AND movie.isPublic = 1 " +
            "INNER JOIN movie_category on movie.movieId = movie_category.movieId " +
            "INNER JOIN category on category.categoryId = movie_category.categoryId " +
            "WHERE category.alias LIKE ?";

        keyWords.forEach(function (keyWord) {
            if (global.dbConstants.subCategoriesAliasArr.indexOf(keyWord) != -1) {
                query = query + queryJoinCategory + ' UNION ';
                replacements.mergeArray([keyWord]);
            }
        })
        return {query: (replacements.length > 0) ? query.substr(0, query.lastIndexOf('UNION')) : query, replacements: replacements};
    },
    buildSimilarMovieAliasQuery: function(keys) {
        var keyWords = [];
        var replacements = [];
        var query = '';

        for (var i = 0; i < keys.length - 1; i ++) {
            var key = keys.clone().reverse().splice(i).reverse().join('-').trim();
            if (key == "") continue;
            keyWords.mergeArray(['%-' + key + "-%"]);
        }
        for (var i = 0; i < keys.length; i ++) {
            var key = keys.clone()[i].trim();
            if (key == "") continue;
            keyWords.mergeArray(['%-' + key + "-%"]);
        }
        for (var i = 1; i < keys.length - 1; i ++) {
            var key = keys.clone().splice(i).join('-').trim();
            if (key == "") continue;
            keyWords.mergeArray(['%-' + key + "-%"]);
        }

        var queryJoinVictim ="SELECT movie.* FROM movie " +
            "INNER JOIN victim ON movie.movieId = victim.movieId  AND victim.isTrailer = 0 AND movie.isPublic = 1 " +
            "WHERE movie.name1CheckField LIKE ? OR movie.name2CheckField LIKE ?";
        keyWords.forEach(function (keyWord) {
            var publishYearCondition = '';
            var realKey = keyWord.replace(/%/g, '').trim();
            if (!isNaN(realKey)) {
                publishYearCondition = ' OR publishYear = ?';
            }
            query = query + queryJoinVictim + publishYearCondition + ' UNION ';
            replacements.mergeArray((publishYearCondition != '') ? [keyWord, keyWord, realKey] : [keyWord, keyWord]);
        })
        return {query: (replacements.length > 0) ? query.substr(0, query.lastIndexOf('UNION')) : query, replacements: replacements};
    },
    findByKeyWordWithCache: function (keyWord, pagingInfo) {
        var self = this;
        var cacheKey = 'searchService.findByKeyWordWithCache.' + ((typeof pagingInfo === "undefined" || pagingInfo == null)
                ? 'All'
                : pagingInfo.currentPage + '.' + pagingInfo.totalOnPage);
        cacheKey += '.' + keyWord;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findByKeyWord(keyWord, pagingInfo).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findByKeyWord: function (keyWord, pagingInfo) {
        var self = this;
        var pagingQuery = queryUtil.buildPaging(pagingInfo);
        return self.sequelize.query("SELECT movie.* FROM movie " +
            "INNER JOIN keyword ON movie.movieId = keyword.movieId " +
            "WHERE keyword.keyWords LIKE ? AND movie.isPublic = 1 ORDER BY POSITION(? IN (keyword.keyWords)) " + pagingQuery,
            {replacements: ['%' + keyWord + '%', keyWord], model: self.sequelize.models.movie}
        ).then(function (movies) {
            movieService = new MovieService(self.sequelize);
            return movieService.populateReferenceToMovie(movies).then(function (movies) {
                return movies;
            });
        }).catch(function (ex) {
            return Array();
        });
    }
};


module.exports = function (sequelize) {
    searchService.sequelize = sequelize;
    return searchService;
};
