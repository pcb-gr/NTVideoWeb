

var logUtil = require('../../app/util/LogUtil');
var homeBean = require('../../app/beans/homeBean');
var MovieService = require('../../app/services/movieService');
var CommonService = require('../../app/services/commonService');
var FilterService = require('../../app/services/filterService');
var HomePageService = require('../../app/services/homePageService');
var Q = require('q');
var homeController = {
    init: function (req, res, next) {
        logUtil.append(req, 'Home page');
        if (global.dbConstants) {
            homeController.findAndRender(req, res, next);
        } else {
            require('../../config/DBConstant')(req.sequelize).findAllAlias().then(function (constants) {
                global.dbConstants = constants;
                homeController.findAndRender(req, res, next);
            });
        }
    },
    findAndRender: function (req, res, next) {
        var self = this;
        var movieService = new MovieService(req.sequelize);
        var homePageService = new HomePageService(req.sequelize);
        Q.fcall(function () {
            return homeController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            // Propose position
            return homePageService.findProposeMovies().then(function (movies) {
                homeBean.proposeMovies = movies;
            })
        }).then(function () {
            // Cinema position
            return homePageService.findCinemaMovies().then(function (movies) {
                homeBean.cinemaMovies = movies;
                return movieService.findCinemaMovies({currentPage:1, totalOnPage:18}, 'last-updated', {in: {}}).then(function (movies) {
                    return homeBean.cinemaMovies = self.mergeDistinctMovies(homeBean.cinemaMovies, movies);
                })
            })
        }).then(function () {
            return homePageService.findWeekOneEpisodeMovies().then(function (movies) {
                return homeBean.weekOneEpisodeHostMovies = movies;
            });
        }).then(function () {
            return homePageService.findWeekMultiEpisodeMovies().then(function (movies) {
                return homeBean.weekMultiEpisodeHostMovies = movies;
            });
        }).then(function () {
            return homePageService.findOneEpisodeLastestUpdatedMovies().then(function (movies) {
                homeBean.oneEpisodeLastestUpdatedMovies = movies;
                return movieService.findOneEpisodeMoviesWithCache({currentPage:1, totalOnPage:8}, 'last-updated', {in:{}}).then(function (movies) {
                    return homeBean.oneEpisodeLastestUpdatedMovies = self.mergeDistinctMovies(homeBean.oneEpisodeLastestUpdatedMovies, movies);
                });
            })
        }).then(function () {
            return homePageService.findMultiEpisodeLastestUpdatedMovies().then(function (movies) {
                homeBean.multiEpisodeLastestUpdatedMovies = movies;
                return movieService.findMultiEpisodeMoviesWithCache({currentPage:1, totalOnPage:8}, 'last-updated', {in:{}, nin: {qcata: ['hoat-hinh', 'anime']}}).then(function (movies) {
                    return homeBean.multiEpisodeLastestUpdatedMovies = self.mergeDistinctMovies(homeBean.multiEpisodeLastestUpdatedMovies, movies);
                });
            })

        }).then(function () {
            return movieService.findOneEpisodeHostMovies({currentPage:1, totalOnPage:40}).then(function (movies) {
                return homeBean.oneEpisodeHostMovies = movies;
            });
        }).then(function () {
            return movieService.findMultiEpisodeHostMovies({currentPage:1, totalOnPage:40}).then(function (movies) {
                return homeBean.multiEpisodeHostMovies = movies;
            });
        }).then(function () {
            return homePageService.findCartoonMovies().then(function (movies) {
                homeBean.cartoonMovies = movies;
            })
        }).then(function () {
            return movieService.findHighRatingMoviesWithCache({currentPage:1, totalOnPage:5}, {in: {}}).then(function (movies) {
                return homeBean.mostRatingMovies = movies;
            });
        }).then(function () {
            return movieService.findMostViewedMoviesWithCache({currentPage:1, totalOnPage:10}, {in: {}}).then(function (movies) {
                return homeBean.mostViewedMovies = movies;
            })
        }).then(function () {
            res.render('home', homeBean);
        });
       /* .then(function () {
            return movieService.findTVShows({currentPage:1, totalOnPage:18}, 'last-updated', {in: {}}).then(function (movies) {
                return homeBean.tvShows = movies;
            });
        }).then(function () {
        return movieService.findTrailerMoviesWithCache({currentPage:1, totalOnPage:40}, 'newest-random').then(function (movies) {
        return homeBean.trailerMovies = movies;
        });
        })*/
    },
    getDataCommon: function (req) {
        var self = this;
        var commonService = new CommonService(req.sequelize);
        var filterService = new FilterService(req.sequelize);
        return Q.fcall(function () {
            return commonService.findMenusWithCache().then(function (menusBean) {
                return homeBean.menus = menusBean;
            });
        }).then(function () {
            return filterService.getListFiltersWithCache().then(function (listFilters) {
                return homeBean.listFilters = listFilters;
            });
        }).then(function () {
            homeBean.title = self.buildTitle();
            homeBean.description = self.buildDescription();
            return homeBean;
        });
    },
    mergeDistinctMovies: function(arr1, arr2) {
        (arr1.length == 0) ? arr1 = arr2 : arr1.mergeArrayDistinct(arr2, 'movieId');
        return arr1;
    },
    buildTitle: function() {
        return 'Phim ' + (new Date().getFullYear()) + ', Phim Hay, Phim hd, Xem Online, Xem Phim Nhanh, Song Ngữ';
    },
    buildDescription: function() {
        return 'Xem phim HD miễn phí không quảng cáo. Hơn 5000 phim đủ thể loại, 2000 phim thuyết minh. Tổng hợp phim từ 1982 đến ' + (new Date().getFullYear()) + ', vtv2 trên youtube.com, xem hoạt hình ...';
    }
}

module.exports = function() {
    return homeController;
}