var constants = require('../../../config/constant');
var logeUtil = require('../../../app/util/LogUtil');
var httpUtil = require('../../../app/util/HttpUtil');
var breadcrumbHelper = require('../../../app/util/BreadCrumbHelper');
var WatchService = require('../../../app/services/watchService');
var watchBean = require('../../../app/beans/watchBean');
var CommonService = require('../../../app/services/commonService');
var Q = require('q');
var watchController = {
    init: function (req, res, next) {
        logeUtil.append(req, req.originalUrl);
        if (global.dbConstants) {
            watchController.findAndRender(req, res, next);
        } else {
            require('../../../config/DBConstant')(req.sequelize).findAllAlias().then(function (constants) {
                global.dbConstants = constants;
                watchController.findAndRender(req, res, next);
            });
        }
    },
    findAndRender: function (req, res, next) {
        watchService = new WatchService(req.sequelize);
        var movieAlias = req.params.movieAlias;
        return watchService.findMovieByMovieAliasWithCache(movieAlias).then(function (movie) {
            if (movie.length == 0) {
                res.redirect(constants.pageNotFoundUrl);
            }
            else {
                Q.fcall(function () {
                    watchBean.movie = movie;
                    return watchService.findRelatedMovie(movie).then(function (movies) {
                        movies.byActor.remove({key:'movieId', value:movie.movieId});
                        movies.byDirector.remove({key:'movieId', value:movie.movieId});
                        movies.byCategory.remove({key:'movieId', value:movie.movieId});
                        movies.bySimilarName.remove({key:'movieId', value:movie.movieId});
                        return watchBean.relatedMovies = movies;
                    });
                }).then(function () {
                    return watchController.getDataCommon(req).then(function (watchBean) {
                        return watchBean;
                    });
                }).then(function () {
                    res.render(watchController.getView(req), watchBean);
                });
            }
        })

    },
    getInfoPlayer: function(req, res, next) {
        logeUtil.append(req, req.originalUrl);
        watchService = new WatchService(req.sequelize);
        var movieAlias = req.params.movieAlias;
        var episodeIndex = req.query.e;
        var groupIndex = req.query.g;
        watchService.findInfoPlayerByMovieAliasAndEpisodeIndex(movieAlias,
            (typeof groupIndex !== 'undefined' ? groupIndex : 0),
            (typeof episodeIndex !== 'undefined' ? episodeIndex : 0)).then(function(playerInfo) {
            if (playerInfo.status == '404') res.redirect(constants.pageNotFoundUrl);
            res.send(playerInfo);
            res.end();
        });
    },
    getDataCommon: function (req) {
        var self = this;
        var commonService = new CommonService(req.sequelize);
        return Q.fcall(function () {
            return commonService.findMenusWithCache().then(function (menusBean) {
                return watchBean.menus = menusBean;
            });
        }).then(function () {
            watchBean.breadcrumb = breadcrumbHelper.buildBreadcrumbByMovieInfo(watchBean.movie);
            watchBean.title = self.buildTitle();
            watchBean.description = self.buildDescription();
            return watchBean;
        });
    },
    buildTitle: function() {
        return watchBean.movie.name1 + "-" + watchBean.movie.name2 + ' - phimcuaban.com';
    },
    buildDescription: function() {
        return watchBean.movie.victims[0].description.removeHtml();
    },
    getView: function(req) {
        var view = 'watch';
        if (httpUtil.isAjaxRequest(req)) view = view + '-no-layout';
        return view;
    }
};

module.exports = function() {
    return watchController;
}