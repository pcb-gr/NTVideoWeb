var Q = require('q');
var cacheUtil = require('../../app/util/CacheUtil');
var queryUtil = require('../../app/util/QueryUtil');
var MovieService = require('../../app/services/movieService');
var SearchService = require('../../app/services/searchService');
var resourceUtil= require('../../app/util/ResourceUtil');
var urlUtil= require('../../app/util/UrlUtil');
var watchService = {
    sequelize: {},
    findInfoPlayerByMovieAliasAndEpisodeName: function (movieAlias, episodeAlias) { // use it if episodes were stored to db
        var self = this;
        var playerInfo = {firstName: '', secondName: '', alias:'', groups:[], isMultiEpisode:false, totalEpisode:1};
        return self.findMovieByMovieAlias(movieAlias).then(function (data) {
            playerInfo.firstName = data.name1;
            playerInfo.secondName = data.name2;
            playerInfo.alias = data.alias;
            playerInfo.isMultiEpisode = data.isMultiEpisode;
            return data.victims[0].victimId;
        }).then(function (victimId) {
            return self.sequelize.daos.episodeDao.findByAliasAndVictimId(episodeAlias, victimId).then(function (groups) {
                playerInfo.groups = groups[1];
                return playerInfo.groups;
            })
        }).then(function (groups) {
            var result = [];
            for (var i = 0; i < groups.length; i++) (function (i) {
                result.push(resourceUtil.getPlayerSettingPBH(groups[i].episodeHref));
            })(i);
            return Q.all(result);
        }).then(function (groups) {
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].qualities != 'error') {
                    playerInfo.groups[i].episodeHref = '';
                    playerInfo.groups[i].qualities =  groups[i].qualities;
                    playerInfo.key = groups[i].key;
                } else {
                    playerInfo.groups.remove(0);
                }
            }
            return playerInfo;
        });
    },
    findInfoPlayerByMovieAliasAndEpisodeIndex: function (movieAlias, groupIndex, episodeIndex) {
        //console.log("findInfoPlayerByMovieAliasAndEpisodeIndex");
        var self = this;
        var playerInfo = {firstName: '', secondName: '', alias:'', groups:[], episodes:[], isMultiEpisode:false, totalEpisode:1};
        var groupsHref = [], episodesHref = [];
        var victimName = '';
        var movieName = '';
        return self.findMovieByMovieAliasWithCache(movieAlias).then(function (data) {
            //console.log("findInfoPlayerByMovieAliasAndEpisodeIndex_1");
            if (data.length == 0) return data;
            playerInfo.firstName = data.name1;
            playerInfo.secondName = data.name2;
            playerInfo.alias = data.alias;
            playerInfo.isMultiEpisode = data.isMultiEpisode;
            playerInfo.sourceKey = data.victims[0].victimTypeNo;
            playerInfo.victimId = data.victims[0].victimId;
            switch (playerInfo.sourceKey) {
                case 0 : victimName = 'PhimBatHu'; break;
                case 1 : victimName = 'BiLuTv'; break;
                case 2 : victimName = 'PhimMoi'; break;
                case 3 : victimName = 'TvHay'; break;
            }
            return data;
        }).then(function (movie) {
            //console.log("findInfoPlayerByMovieAliasAndEpisodeIndex_2:" + data);
            return resourceUtil['getGroups' + victimName](movie.victims[0].playListHtml).then(function (groups) {
                //if (groupIndex >= groups.length) return '404';
                playerInfo.groups = groups.groupsName;
                groupsHref = groups.groupsHref;
                return movie;
            })
        }).then(function (movie) {
            return resourceUtil['getEpisodes' + victimName](movie.victims[0].playListHtml, groupIndex).then(function (episodes) {
                playerInfo.episodes = episodes.episodesName;
                episodesHref = episodes.episodesHref;
                return movie;
            })
        }).then(function (movie) {
            /*return resourceUtil['getPlayerSetting' + victimName](data, groupIndex, episodeIndex).then(function (playerSetting) {
                playerInfo.playerSetting = playerSetting;
                return playerInfo;
            });*/
        	
        	return resourceUtil.getPlayerPlayerSettingBySocket(movie.victims[0].movieHref).then(function (playerSetting) {
                playerInfo.playerSetting = playerSetting;
                return playerInfo;
            });
        })
    },
    findQualitiesFromGoogleDrive: function (driveDocId) {
        return resourceUtil.getQualitiesFromGoogleDrive(driveDocId).then(function (data) {
            return data;
        })
    },
    findMovieByMovieAliasWithCache: function (movieAlias) {
        //console.log("findInfoPlayerByMovieAliasAndEpisodeIndex:" + movieAlias);
        var self = this;
        var cacheKey = 'watchService.findMovieByMovieAliasWithCache.' + movieAlias;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            //console.log(data);
            if (data == "") {
                return self.findMovieByMovieAlias(movieAlias).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMovieByMovieAlias: function (movieAlias) {
        //console.log("findMovieByMovieAlias:" + movieAlias);
        var self = this;
        return self.sequelize.daos.movieDao.findByAlias(movieAlias).then(function (movies) {
            //console.log("self.sequelize.daos.movieDao.findByAlias:" + movies);
            return movies;
        }).then(function (movies) {
            if (movies.length == 0) return Array();
            movieService = new MovieService(self.sequelize);
            if (movies.length == 0) return Array();
            return movieService.populateReferenceToMovie(movies).then(function (movies) {
                return movies[0];
            });
        })
    },
    findRelatedMovie: function (movie) {
        var self = this;
        var relatedMovies = {byActor: {}, byDirector: {}, byCategory: {}};
        var relatedIds = {actorIds: [], directorIds: [], categoryIds: []};
        return Q.fcall(function () {
            movie.actors.forEach(function (actor) {
                if (actor.alias != 'dang-cap-nhat') {
                    relatedIds.actorIds.push(actor.actorId);
                }
            });
            movie.directors.forEach(function (director) {
                if (director.alias != 'dang-cap-nhat') {
                    relatedIds.directorIds.push(director.directorId);
                }
            });
            movie.categories.forEach(function (category) {
                if (category.alias != 'dang-cap-nhat') {
                    relatedIds.categoryIds.push(category.categoryId);
                }
            });
            return relatedIds;
        }).then(function (relatedIds) {
            if (relatedIds.actorIds.length == 0) return relatedMovies.byActor = [];
            else
                return self.findMoviesByActorIdsWithCache(relatedIds.actorIds, {currentPage:1, totalOnPage:10}).then(function (relatedMoviesByActor) {
                    return relatedMovies.byActor = relatedMoviesByActor;
                });
        }).then(function () {
            if (relatedIds.directorIds.length == 0) return relatedMovies.byDirector = [];
            else
                return self.findMoviesByDirectorIdsWithCache(relatedIds.directorIds, {currentPage:1, totalOnPage:10}).then(function (relatedMoviesByDirector) {
                    return relatedMovies.byDirector = relatedMoviesByDirector;
                });
        }).then(function () {
            if (relatedIds.categoryIds.length == 0) return relatedMovies.byCategory = [];
            else
                return self.findMoviesByCategoryIdsWithCache(relatedIds.categoryIds, {currentPage:1, totalOnPage:10}).then(function (relatedMoviesByCategory) {
                    return relatedMovies.byCategory = relatedMoviesByCategory;
                });
        }).then(function () {
            searchService = new SearchService(self.sequelize);
            var keyWords = [];
            var words = movie.name1.split(" ");
            for (var i = 0; i < ((words.length > 2) ? 2 : words.length); i++) {
                keyWords.push(words[i])
            }
            var keyWord = urlUtil.convertToAlias(keyWords.join(" "));
            return searchService.findByKeyWordWithCache(keyWord, {currentPage:1, totalOnPage:10}).then(function (relatedMoviesBySimilarName) {
                return relatedMovies.bySimilarName = relatedMoviesBySimilarName;
            });
        }).then(function () {
            return relatedMovies;
        });
    },
    findMoviesByCountryIdWithCache: function (countryId, pagingInfo) {
        var self = this;
        return self.findMoviesByCountryIdsWithCache(countryId, pagingInfo).then(function (movies) {
            return movies;
        });
    },
    findMoviesByCountryIdsWithCache: function (countryIds, pagingInfo) {
        var self = this;
        var cacheKey = 'watchService.findMoviesByCountryIdsWithCache.' + countryIds.join('.')
            + ((typeof pagingInfo === "undefined" || pagingInfo == null)
                ? 'All'
                : pagingInfo.currentPage + '.' + pagingInfo.totalOnPage);
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findMoviesByCountryIds(countryIds, pagingInfo).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMoviesByCountryId: function (countryId, pagingInfo) {
        var self = this;
        return self.findMoviesByCountryIds(countryId, pagingInfo).then(function (movies) {
            return movies;
        });
    },
    findMoviesByCountryIds: function (countryIds, pagingInfo) {
        var self = this;
        var pagingQuery = queryUtil.buildPaging(pagingInfo);
        var query = 'SELECT movie.* FROM movie' +
            ' INNER JOIN victim ON movie.movieId = victim.movieId  AND victim.isTrailer = 0 AND movie.isPublic = 1' +
            ' INNER JOIN movie_country ON movie.movieId = movie_country.movieId' +
            ' WHERE movie_country.countryId IN (?)' +
            ' ORDER BY movie.publishYear DESC, victim.currentEpisode ASC, victim.viewed DESC ' + pagingQuery;
        return self.sequelize.query(
            query,
            {replacements: [countryIds], model: self.sequelize.models.movie}
        ).then(function (movies) {
                if (movies.length == 0) return Array();
                movieService = new MovieService(self.sequelize);
                return movieService.populateReferenceToMovie(movies).then(function (movies) {
                    return movies;
                });
            }).catch(function (ex) {
                return Array();
            });
    },
    findMoviesByActorIdWithCache: function (actorId, pagingInfo) {
        var self = this;
        return self.findMoviesByActorIdsWithCache(actorId, pagingInfo).then(function (movies) {
            return movies;
        });
    },
    findMoviesByActorIdsWithCache: function (actorIds, pagingInfo) {
        var self = this;
        var cacheKey = 'watchService.findMoviesByActorIdsWithCache.' + actorIds.join('.')
            + ((typeof pagingInfo === "undefined" || pagingInfo == null)
                ? 'All'
                : pagingInfo.currentPage + '.' + pagingInfo.totalOnPage);
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findMoviesByActorIds(actorIds, pagingInfo).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMoviesByActorId: function (actorId, pagingInfo) {
        var self = this;
        return self.findMoviesByActorIds(actorId, pagingInfo).then(function (movies) {
            return movies;
        });
    },
    findMoviesByActorIds: function (actorIds, pagingInfo) {
        var self = this;
        var pagingQuery = queryUtil.buildPaging(pagingInfo);
        var query = 'SELECT movie.* FROM movie' +
            ' INNER JOIN victim ON movie.movieId = victim.movieId  AND victim.isTrailer = 0 AND movie.isPublic = 1' +
            ' INNER JOIN movie_actor ON movie.movieId = movie_actor.movieId' +
            ' WHERE movie_actor.actorId IN (?)' +
            ' GROUP BY movie.alias' +
            ' ORDER BY movie.publishYear DESC, victim.viewed DESC ' + pagingQuery;
        return self.sequelize.query(
            query,
            {replacements: [actorIds], model: self.sequelize.models.movie}
        ).then(function (movies) {
                if (movies.length == 0) return Array();
                movieService = new MovieService(self.sequelize);
                return movieService.populateReferenceToMovie(movies).then(function (movies) {
                    return movies;
                });
            }).catch(function (ex) {
                return Array();
            });
    },
    findMoviesByDirectorIdWithCache: function (directorId, pagingInfo) {
        var self = this;
        return self.findMoviesByDirectorIdsWithCache(directorId, pagingInfo).then(function (movies) {
            return movies;
        });
    },
    findMoviesByDirectorIdsWithCache: function (directorIds, pagingInfo) {
        var self = this;
        var cacheKey = 'watchService.findMoviesByDirectorIdsWithCache.' + directorIds.join('.')
            + ((typeof pagingInfo === "undefined" || pagingInfo == null)
                ? 'All'
                : pagingInfo.currentPage + '.' + pagingInfo.totalOnPage);
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findMoviesByDirectorIds(directorIds, pagingInfo).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMoviesByDirectorId: function (directorId, pagingInfo) {
        var self = this;
        return self.findMoviesByDirectorIds(directorId, pagingInfo).then(function (movies) {
            return movies;
        });
    },
    findMoviesByDirectorIds: function (directorIds, pagingInfo) {
        var self = this;
        var pagingQuery = queryUtil.buildPaging(pagingInfo);
        var query = 'SELECT movie.* FROM movie' +
            ' INNER JOIN victim ON movie.movieId = victim.movieId  AND victim.isTrailer = 0 AND movie.isPublic = 1' +
            ' INNER JOIN movie_director ON movie.movieId = movie_director.movieId' +
            ' WHERE movie_director.directorId IN (?)' +
            ' GROUP BY movie.alias' +
            ' ORDER BY movie.publishYear DESC, victim.currentEpisode ASC, victim.viewed DESC ' + pagingQuery;
        return self.sequelize.query(
            query,
            {replacements: [directorIds], model: self.sequelize.models.movie}
        ).then(function (movies) {
                if (movies.length == 0) return Array();
                movieService = new MovieService(self.sequelize);
                return movieService.populateReferenceToMovie(movies).then(function (movies) {
                    return movies;
                });
            }).catch(function (ex) {
                return Array();
            });
    },
    findMoviesByCategoryIdWithCache: function (categoryId, pagingInfo) {
        var self = this;
        return self.findMoviesByCategoryIdsWithCache([categoryId], pagingInfo).then(function (movies) {
            return movies;
        });
    },
    findMoviesByCategoryIdsWithCache: function (categoryIds, pagingInfo) {
        var self = this;
        var cacheKey = 'watchService.findMoviesByCategoryIdsWithCache.' + categoryIds.join('.')
            + ((typeof pagingInfo === "undefined" || pagingInfo == null)
                ? 'All'
                : pagingInfo.currentPage + '.' + pagingInfo.totalOnPage);
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findMoviesByCategoryIds(categoryIds, pagingInfo).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMoviesByCategoryId: function (categoryId, pagingInfo) {
        var self = this;
        return self.findMoviesByCategoryIds([categoryId], pagingInfo).then(function (movies) {
            return movies;
        });
    },
    findMoviesByCategoryIds: function (categoryIds, pagingInfo) {
        var self = this;
        var pagingQuery = queryUtil.buildPaging(pagingInfo);
        var query = 'SELECT movie.* FROM movie' +
            ' INNER JOIN victim ON movie.movieId = victim.movieId  AND victim.isTrailer = 0 AND movie.isPublic = 1' +
            ' INNER JOIN movie_category ON movie.movieId = movie_category.movieId' +
            ' WHERE movie_category.categoryId IN (?)' +
            ' GROUP BY movie.alias' +
            ' ORDER BY movie.publishYear DESC, victim.currentEpisode ASC, victim.viewed DESC ' + pagingQuery;
        return self.sequelize.query(
            query,
            {replacements: [categoryIds], model: self.sequelize.models.movie}
        ).then(function (movies) {
                if (movies.length == 0) return Array();
                movieService = new MovieService(self.sequelize);
                return movieService.populateReferenceToMovie(movies).then(function (movies) {
                    return movies;
                });
            }).catch(function (ex) {
                return Array();
            });
    },
    checkExistEpisodeNeedUpadateToLiveByVictimIdAndServerIndexAndEpisodeIndex: function (victimId, serverIndex, episodeIndex) {
        var self = this;
        var query = 'SELECT status FROM episode_need_update_to_live' +
            " WHERE victimId = ? AND serverIndex = ? AND episodeIndex = ? AND dateCreate LIKE CONCAT(DATE_FORMAT(CURRENT_TIMESTAMP(), '%Y-%m-%d'), '%')" ;
        return self.sequelize.query(
            query,
            {replacements: [victimId, serverIndex, episodeIndex]}
        ).spread(function (data) {
               return data;
        }).catch(function (ex) {
            return "";
        });
    },
    insertEpisodeNeedUpadateToLiveByVictimIdAndServerIndexAndEpisodeIndex: function (victimId, serverIndex, episodeIndex) {
        var self = this;
        var query = 'INSERT INTO episode_need_update_to_live(victimId, serverIndex, episodeIndex) VALUES(?, ?, ?)';
        return self.sequelize.query(
            query,
            {replacements: [victimId, serverIndex, episodeIndex]}
        ).spread(function (data) {
            return data;
        }).catch(function (ex) {
            return 0;
        });
    },
    getInfoEpisodeNeedUpadateToLiveByVictimIdAndServerIndexAndEpisodeIndex: function (victimId, serverIndex, episodeIndex) {
        var self = this;
        var query = 'SELECT playListHtml FROM victim'+
            ' WHERE victimId = ?';
        return self.sequelize.query(
            query,
            {replacements: [victimId]}
        ).spread(function (data) {
            return resourceUtil.getPlayerSettingPhimBatHu(data[0].playListHtml, serverIndex, episodeIndex).then(function (setting) {
                return setting;
            });
        }).catch(function (ex) {
            return 0;
        });
    }
};

module.exports = function (sequelize) {
    watchService.sequelize = sequelize;
    return watchService;
};
