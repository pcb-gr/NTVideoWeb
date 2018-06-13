var Q = require('q');
var cacheUtil = require('../../app/util/CacheUtil');
var queryUtil = require('../../app/util/QueryUtil');
var movieService = {
    sequelize: {},
    populateReferenceToMovie: function (movies) {
        var self = this;
        return Q.fcall(function () {
            return self.populateActorsToMovie(movies).then(function (actorsArray) {
                actorsArray.forEach(function (actors, index) {
                    movies[index].actors = actors;
                    movies[index].setDataValue("actors", actors);
                });
                return movies;
            })
        }).then(function (movies) {
            return self.populateVictimsToMovie(movies).then(function (victimsArray) {
                victimsArray.forEach(function (victims, index) {
                    movies[index].victims = victims;
                    movies[index].setDataValue("victims", victims);
                });
                return movies;
            })
        }).then(function (movies) {
            return self.populateDirectorsToMovie(movies).then(function (directorsArray) {
                directorsArray.forEach(function (directors, index) {
                    movies[index].directors = directors;
                    movies[index].setDataValue("directors", directors);
                });
                return movies;
            })
        }).then(function (movies) {
            return self.populateCountriesToMovie(movies).then(function (countriesArray) {
                countriesArray.forEach(function (countries, index) {
                    movies[index].countries = countries;
                    movies[index].setDataValue("countries", countries);
                });
                return movies;
            })
        }).then(function (movies) {
            return self.populateCategoriesToMovie(movies).then(function (categoriesArray) {
                categoriesArray.forEach(function (categories, index) {
                    movies[index].categories = categories;
                    movies[index].setDataValue("categories", categories);
                });
                return movies;
            })
        })
    },
    populateVictimsToMovie: function (movies) {
        var self = this;
        var result = [];
        for (var i = 0; i < movies.length; i++) (function (i) {
            result.push(self.findVictimsByMovieIdWithCache(movies[i].movieId));
        })(i);
        return Q.all(result);
    },
    findVictimsByMovieIdWithCache: function (movieId) {
        var self = this;
        var cacheKey = 'movieService.findVictimsByMovieIdWithCache.' + movieId;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findVictimsByMovieId(movieId).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findVictimsByMovieId: function (movieId) {
        var self = this;
        var query = 'SELECT victim.* FROM victim' +
            ' WHERE victim.movieId = ? ORDER BY victim.victimTypeNo ASC';
        return self.sequelize.query(
            query,
            {replacements: [movieId], model: self.sequelize.models.victim}
        ).then(function (victims) {
                return victims;
            }).catch(function (ex) {
                return Array();
            });
    },
    populateActorsToMovie: function (movies) {
        var self = this;
        var result = [];
        for (var i = 0; i < movies.length; i++) (function (i) {
            result.push(self.findActorsByMovieIdWithCache(movies[i].movieId));
        })(i);
        return Q.all(result);
    },
    findActorsByMovieIdWithCache: function (movieId) {
        var self = this;
        var cacheKey = 'movieService.findActorsByMovieIdWithCache.' + movieId;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findActorsByMovieId(movieId).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findActorsByMovieId: function (movieId) {
        var self = this;
        var query = 'SELECT actor.* FROM actor' +
            ' INNER JOIN movie_actor ON actor.actorId = movie_actor.actorId' +
            ' WHERE movie_actor.movieId = ?';
        return self.sequelize.query(
            query,
            {replacements: [movieId], model: self.sequelize.models.actor}
        ).then(function (actors) {
                return actors;
            }).catch(function (ex) {
                return Array();
            });
    },
    populateDirectorsToMovie: function (movies) {
        var self = this;
        var result = [];
        for (var i = 0; i < movies.length; i++) (function (i) {
            result.push(self.findDirectorsByMovieIdWithCache(movies[i].movieId));
        })(i);
        return Q.all(result);
    },
    findDirectorsByMovieIdWithCache: function (movieId) {
        var self = this;
        var cacheKey = 'movieService.findDirectorsByMovieIdWithCache.' + movieId;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findDirectorsByMovieId(movieId).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findDirectorsByMovieId: function (movieId) {
        var self = this;
        var query = 'SELECT director.* FROM director' +
            ' INNER JOIN movie_director ON director.directorId = movie_director.directorId' +
            ' WHERE movie_director.movieId = ?';
        return self.sequelize.query(
            query,
            {replacements: [movieId], model: self.sequelize.models.director}
        ).then(function (directors) {
                return directors;
            }).catch(function (ex) {
                return Array();
            });
    },
    populateCountriesToMovie: function (movies) {
        var self = this;
        var result = [];
        for (var i = 0; i < movies.length; i++) (function (i) {
            result.push(self.findCountriesByMovieIdWithCache(movies[i].movieId));
        })(i);
        return Q.all(result);
    },
    findCountriesByMovieIdWithCache: function (movieId) {
        var self = this;
        var cacheKey = 'movieService.findCountriesByMovieIdWithCache.' + movieId;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findCountriesByMovieId(movieId).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findCountriesByMovieId: function (movieId) {
        var self = this;
        var query = 'SELECT country.* FROM country' +
            ' INNER JOIN movie_country ON country.countryId = movie_country.countryId' +
            ' WHERE movie_country.movieId = ?';
        return self.sequelize.query(
            query,
            {replacements: [movieId], model: self.sequelize.models.country}
        ).then(function (countries) {
                return countries;
            }).catch(function (ex) {
                return Array();
            });
    },
    populateCategoriesToMovie: function (movies) {
        var self = this;
        var result = [];
        for (var i = 0; i < movies.length; i++) (function (i) {
            result.push(self.findCategoriesByMovieIdWithCache(movies[i].movieId));
        })(i);
        return Q.all(result);
    },
    findCategoriesByMovieIdWithCache: function (movieId) {
        var self = this;
        var cacheKey = 'movieService.findCategoriesByMovieIdWithCache.' + movieId;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findCategoriesByMovieId(movieId).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findCategoriesByMovieId: function (movieId) {
        var self = this;
        var query = 'SELECT category.* FROM category' +
            ' INNER JOIN movie_category ON category.categoryId = movie_category.categoryId' +
            ' WHERE movie_category.movieId = ?';
        return self.sequelize.query(
            query,
            {replacements: [movieId], model: self.sequelize.models.category}
        ).then(function (categories) {
                return categories;
            }).catch(function (ex) {
                return Array();
            });
    },
    findHighRatingMoviesWithCache: function (pagingInfo, filterJoinInfo) {
        var self = this;
        return self.findMoviesCommonWithCache(pagingInfo, 'high-rating', filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findHighRatingMovies: function (pagingInfo, filterJoinInfo) {
        var self = this;
        return self.findMoviesCommon(pagingInfo, 'high-rating', filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMostViewedMoviesWithCache: function (pagingInfo, filterJoinInfo) {
        var self = this;
        return self.findMoviesCommonWithCache(pagingInfo, 'most-viewed', filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMostViewedMovies: function (pagingInfo, filterJoinInfo) {
        var self = this;
        return self.findMoviesCommon(pagingInfo, 'most-viewed', filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findOneEpisodeHostMovies: function (pagingInfo) {
        var self = this;
        return self.findOneEpisodeMovies(pagingInfo, 'most-viewed-in-month', {in: {}, nin: {py:['2017']}}).then(function (data) {
            return data;
        });
    },
    findMultiEpisodeHostMovies: function (pagingInfo) {
        var self = this;
        var rs = [];
        return Q.fcall(function () {
            return self.findMultiEpisodeMovies(pagingInfo, 'most-viewed-in-month', {in: { py:['2017'], qca: ['my', 'han-quoc', 'trung-quoc', 'thai-lan'] }}).then(function (data) {
                rs.mergeArray(data);
                return data;
            });
        }).then(function (rs) {
            return self.findMultiEpisodeMovies(pagingInfo, 'most-viewed', {in: { py:['2016'], qca: ['my', 'han-quoc', 'trung-quoc', 'thai-lan'] }}).then(function (data) {
                rs.mergeArray(data);
                return rs;
            });
        })
    },
    findTrailerMoviesWithCache: function (pagingInfo, filterOrderInfo) {
        var self = this;
        var filterJoinInfo = {in: {isTrailer: 1}};
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findTrailerMovies: function (pagingInfo, filterOrderInfo) {
        var self = this;
        var filterJoinInfo = {in: {isTrailer: 1}};
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findOneEpisodeMoviesWithCache: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qkm = 'phim-le';
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findOneEpisodeMovies: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qkm = 'phim-le';
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMultiEpisodeMoviesWithCache: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qkm = 'phim-bo';
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMultiEpisodeMovies: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qkm = 'phim-bo';
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMultiEpisodeUpdatedMoviesWithCache: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qkm = 'phim-bo';
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMultiEpisodeUpdatedMovies: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qkm = 'phim-bo';
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMultiEpisodeCompletedMoviesWithCache: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qkm = 'phim-bo';
        filterJoinInfo.in.isContinue = 0;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMultiEpisodeCompletedMovies: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qkm = 'phim-bo';
        filterJoinInfo.in.isContinue = 0;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByPublishYearWithCache: function (publishYear, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.py = publishYear;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByPublishYear: function (publishYear, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.py = publishYear;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByCategoryAliasWithCache: function (categoryAlias, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qcata = categoryAlias;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByCategoryAlias: function (categoryAlias, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qcata = categoryAlias;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByCountryAliasWithCache: function (countryAlias, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qca = countryAlias;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByCountryAlias: function (countryAlias, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qca = countryAlias;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByActorAliasWithCache: function (actorAlias, pagingInfo, filterOrderInfo, filterJoinInfo) {A
        var self = this;
        filterJoinInfo.in.qaa = actorAlias;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByActorAlias: function (actorAlias, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qaa = actorAlias;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByDirectorAliasWithCache: function (directorAlias, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qda = directorAlias;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesByDirectorAlias: function (directorAlias, pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qda = directorAlias;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findTVShows: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        return self.findMoviesByCategoryAliasWithCache(global.dbConstants.tvShowAlias, pagingInfo, filterOrderInfo, filterJoinInfo).then(function (movies) {
            return movies;
        });
    },
    findCinemaMovies: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        return self.findMoviesByCategoryAlias(global.dbConstants.cinemaAlias, pagingInfo, filterOrderInfo, filterJoinInfo).then(function (movies) {
            return movies;
        });
    },
    findHasTrainMoviesWithCache: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qcv = dbConstants.hasTransAlias;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findHasTrainMovies: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qcv = dbConstants.hasTransAlias;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findHasDubbingMoviesWithCache: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qcv = dbConstants.hasDubbingAlias;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findHasDubbingMovies: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qcv = dbConstants.hasDubbingAlias;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findHasSubMoviesWithCache: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qcv = dbConstants.hasSubAlias;
        return self.findMoviesCommonWithCache(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findHasSubMovies: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        filterJoinInfo.in.qcv = dbConstants.hasSubAlias;
        return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
            return data;
        });
    },
    findMoviesCommonWithCache: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        var cacheKey = 'movieService.findMoviesCommonWithCache.' + ((typeof pagingInfo === "undefined" || pagingInfo == null)
                ? 'All'
                : pagingInfo.currentPage + '.' + pagingInfo.totalOnPage);
        if (typeof filterOrderInfo !== "undefined") {
            cacheKey += '.' + filterOrderInfo;
        }
        if (typeof filterJoinInfo !== "undefined") {
            cacheKey += '.' + JSON.stringify(filterJoinInfo);
        }

        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findMoviesCommon(pagingInfo, filterOrderInfo, filterJoinInfo).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMoviesCommon: function (pagingInfo, filterOrderInfo, filterJoinInfo) {
        var self = this;
        return Q.fcall(function () {
            var pagingQuery = queryUtil.buildPaging(pagingInfo);
            var filterJoinByParamsQuery = queryUtil.buildJoinQueryByParams(filterJoinInfo);
            var orderQuery = queryUtil.buildOrderQuery(filterOrderInfo);
            var query = 'SELECT movie.* FROM movie' +
                queryUtil.movieJoinWith.victim +
                filterJoinByParamsQuery.query +
                queryUtil.whereMovie.published +
                ((filterJoinByParamsQuery.whereCondition != '') ? (' AND ' + filterJoinByParamsQuery.whereCondition) : '') +
                ' GROUP BY movie.movieId ' +
                orderQuery + pagingQuery;
            return self.sequelize.query(
                query,
                {replacements: filterJoinByParamsQuery.replacements, model: self.sequelize.models.movie}
            ).then(function (movies) {
                return self.populateReferenceToMovie(movies).then(function (movies) {
                    return movies;
                });
            }).catch(function (ex) {
                return Array();
            });
        })
    }
};

module.exports = function (sequelize) {
    movieService.sequelize = sequelize;
    return movieService;
};
