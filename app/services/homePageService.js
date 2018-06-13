var Q = require('q');
var cacheUtil = require('../../app/util/CacheUtil');
var MovieService = require('./movieService');
var homePageService = {
    sequelize: {},
    findProposeMovies: function () {
        var self = this;
        return self.findMoviesByPositionTypeWithCache(0, 30).then(function (data) {
            return data;
        });
    },
    findWeekOneEpisodeMovies: function () {
        var self = this;
        return self.findMoviesByPositionTypeWithCache(1, 40).then(function (data) {
            return data;
        });
    },
    findWeekMultiEpisodeMovies: function () {
        var self = this;
        return self.findMoviesByPositionTypeWithCache(2, 40).then(function (data) {
            return data;
        });
    },
    findCinemaMovies: function () {
        var self = this;
        return self.findMoviesByPositionTypeWithCache(3, 40).then(function (data) {
            return data;
        });
    },
    findOneEpisodeLastestUpdatedMovies: function () {
        var self = this;
        return self.findMoviesByPositionTypeWithCache(4, 40).then(function (data) {
            return data;
        });
    },
    findMultiEpisodeLastestUpdatedMovies: function () {
        var self = this;
        return self.findMoviesByPositionTypeWithCache(5, 40).then(function (data) {
            return data;
        });
    },
    findCartoonMovies: function () {
        var self = this;
        return self.findMoviesByPositionTypeWithCache(6, 40).then(function (data) {
            return data;
        });
    },
    findMoviesByPositionTypeWithCache: function (positionType, limit) {
        var self = this;
        var cacheKey = 'filterService.findMoviesByPositionTypeWithCache_' + positionType;
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return self.findMoviesByPositionType(positionType, limit).then(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    findMoviesByPositionType: function (positionType, limit) {
        var self = this;
        var query = 'SELECT movie.* FROM movie'
            + ' INNER JOIN `home_page_position` ON movie.movieId = home_page_position.movieId AND movie.isPublic = 1 '
            + ' WHERE home_page_position.positionType= ' + positionType + ' ORDER BY home_page_position.`dateUpdate` DESC LIMIT ' + limit;
        return self.sequelize.query(query,
            {model: self.sequelize.models.movie}
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
    homePageService.sequelize = sequelize;
    return homePageService;
};
