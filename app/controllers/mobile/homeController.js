var logeUtil = require('../../../app/util/LogUtil');
var homeBean = require('../../../app/beans/homeBean');
var MovieService = require('../../../app/services/movieService');
var Q = require('q');
var homeController = {
    init: function (req, res, next) {
        logeUtil.append(req, 'Home page');
        if (global.dbConstants) {
            homeController.findAndRender(req, res, next);
        } else {
            require('../../../config/DBConstant')(req.sequelize).findAllAlias().then(function (constants) {
                global.dbConstants = constants;
                homeController.findAndRender(req, res, next);
            });
        }
    },
    findAndRender: function (req, res, next) {
        var movieService = new MovieService(req.sequelize);
        Q.fcall(function () {
            return homeController.getDataCommon().then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            return movieService.findOneEpisodeMoviesWithCache({currentPage:1, totalOnPage:2}, 'undefined', 'moi-cap-nhat', {vtn: 2}).then(function (movies) {
                return homeBean.sliderMovies.mergeArrayDistinct(movies, 'movieId');
            }).then(function () {
                return movieService.findMultiEpisodeMoviesWithCache({currentPage:1, totalOnPage:2}, 'undefined', 'moi-cap-nhat', {vtn: 2}).then(function (movies) {
                    return homeBean.sliderMovies.mergeArrayDistinct(movies, 'movieId');
                });
            })
        }).then(function () {
            return movieService.findCinemaMovies({currentPage:1, totalOnPage:4}, 'undefined', 'random', {vtn: 2}).then(function (movies) {
                return homeBean.cinemaMovies = movies;
            })
        }).then(function () {
            return movieService.findOneEpisodeHostMovies({currentPage:1, totalOnPage:2}).then(function (movies) {
                return homeBean.oneEpisodeHostMovies = movies;
            });
        }).then(function () {
            return movieService.findMultiEpisodeHostMovies({currentPage:1, totalOnPage:2}).then(function (movies) {
                return homeBean.multiEpisodeHostMovies = movies;
            });
        }).then(function () {
            return movieService.findTVShows({currentPage:1, totalOnPage:4}, 'undefined', 'random', {vtn: 2}).then(function (movies) {
                return homeBean.tvShows = movies;
            });
        }).then(function () {
            return movieService.findCartoonMovies({currentPage:1, totalOnPage:0}, 0, 4).then(function (movies) {
                return homeBean.cartoonMovies = movies;
            });
        }).then(function () {
            res.render('home', homeBean);
        });
    },
    getDataCommon: function () {
        var self = this;
        return new Promise(
            function (resolve, reject) {
                homeBean.title = self.buildTitle();
                homeBean.description = self.buildDescription();
                resolve(homeBean);
            }
        );
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