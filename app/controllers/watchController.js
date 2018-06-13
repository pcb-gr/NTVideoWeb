var constants = require('../../config/constant');
var logeUtil = require('../../app/util/LogUtil');
var httpUtil = require('../../app/util/HttpUtil');
var fileUtil = require('../../app/util/FileUtil');
var cryptoUtil = require('../../app/util/CryptoUtil');
var breadcrumbHelper = require('../../app/util/BreadCrumbHelper');
var WatchService = require('../../app/services/watchService');
var watchBean = require('../../app/beans/watchBean');
var CommonService = require('../../app/services/commonService');
var openloadService = require('../../app/services/openloadService');
var Q = require('q');
var watchController = {
    init: function (req, res, next) {
        logeUtil.append(req, req.originalUrl);
        if (global.dbConstants) {
            watchController.findAndRender(req, res, next);
        } else {
            require('../../config/DBConstant')(req.sequelize).findAllAlias().then(function (constants) {
                global.dbConstants = constants;
                watchController.findAndRender(req, res, next);
            });
        }
    },
    findAndRender: function (req, res, next) {
        var watchService = new WatchService(req.sequelize);
        var movieAlias = req.params.movieAlias;
        return watchService.findMovieByMovieAliasWithCache(movieAlias).then(function (movie) {
            if (movie.length == 0) {
                var keyWords = movieAlias.replace('xem-phim', '').split('-').reverse();
                keyWords = keyWords[3] + "-" + keyWords[2] + "-" + keyWords[1] + '.html';
                var searchLink = "/tim-kiem/" + keyWords;
                res.redirect(searchLink);
                //res.redirect(constants.pageNotFoundUrl);
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
        var watchService = new WatchService(req.sequelize);
        var movieAlias = req.params.movieAlias;
        var episodeIndex = req.query.e;
        var groupIndex = req.query.g;
        watchService.findInfoPlayerByMovieAliasAndEpisodeIndex(movieAlias,
            (typeof groupIndex !== 'undefined' ? groupIndex : 0),
            (typeof episodeIndex !== 'undefined' ? episodeIndex : 0)).then(function(playerInfo) {
               console.log("getInfoPlayer");
            if (playerInfo.status == '404') res.redirect(constants.pageNotFoundUrl);
            res.send(playerInfo);
            res.end();
        });
    },
    reGetInfoPlayer: function(req, res, next) {
        logeUtil.append(req, req.originalUrl);
        var watchService = new WatchService(req.sequelize);
        var victimId = req.params.victimId;
        var episodeIndex = req.params.episodeIndex;
        var serverIndex = req.params.serverIndex;
        var step = req.params.step;
        if (step == "1") {
            watchService.checkExistEpisodeNeedUpadateToLiveByVictimIdAndServerIndexAndEpisodeIndex(victimId, serverIndex, episodeIndex).then(function(rs) {
                console.log("reGetInfoPlayer");
                if (rs.length == 0) {
                    return watchService.insertEpisodeNeedUpadateToLiveByVictimIdAndServerIndexAndEpisodeIndex(victimId, serverIndex, episodeIndex).then(function(rs) {
                        return "2";
                    });
                } else if (rs[0].status == "1") {
                    return watchService.getInfoEpisodeNeedUpadateToLiveByVictimIdAndServerIndexAndEpisodeIndex(victimId, serverIndex, episodeIndex).then(function(rs) {
                        return rs;
                    })
                } else if (rs[0].status == "0") {
                   return "2";
                }
            }).then(function(rs) {
                res.send(rs);
                res.end();
            });
        } else  if (step == "2") {
            return watchService.checkExistEpisodeNeedUpadateToLiveByVictimIdAndServerIndexAndEpisodeIndex(victimId, serverIndex, episodeIndex).then(function(rs) {
                if (rs[0].status == "1") {
                    return watchService.getInfoEpisodeNeedUpadateToLiveByVictimIdAndServerIndexAndEpisodeIndex(victimId, serverIndex, episodeIndex).then(function(rs) {
                        return rs;
                    })
                }else if (rs[0].status == "0") {
                    return "2";
                }
            }).then(function(rs) {
                res.send(rs);
                res.end();
            });
        }

    },
    getQualitiesFromGoogleDrive: function(req, res, next) {
        logeUtil.append(req, req.originalUrl);
        var watchService = new WatchService(req.sequelize);
        watchService.findQualitiesFromGoogleDrive( req.params.driveDocId).then(function(playerInfo) {
            res.send(playerInfo);
            res.end();
        });
    },
    getLinkOpenLoad: function(req, res, next) {
        logeUtil.append(req, req.originalUrl);
        openloadService.getFileInfo(req.params.embedId).then(function(fileInfo) {
            if (fileInfo[req.params.embedId].status == 200) {
                openloadService.getDownloadLink(req.params.embedId).then(function(link) {
                    res.send('/flush-stream/?file=' + cryptoUtil.base64Encode(link));
                    res.end();
                });
            } else {
                res.send('404');
                res.end();
            }
        });

    },
    flushStream: function (req, res, next) {
        var file = cryptoUtil.base64Decode(req.query.file);
        fileUtil.flushStream(file, req, res);
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