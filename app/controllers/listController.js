var logeUtil = require('../../app/util/LogUtil');
var httpUtil = require('../../app/util/HttpUtil');
var urlUtil = require('../../app/util/UrlUtil');
var breadcrumbHelper = require('../../app/util/BreadCrumbHelper');
var listBean = require('../../app/beans/listBean');
var MovieService = require('../../app/services/movieService');
var CommonService = require('../../app/services/commonService');
var FilterService = require('../../app/services/filterService');
var constants = require('../../config/constant');
var Q = require('q');
var listController = {
    init: function (req, res, next) {
        logeUtil.append(req, req.originalUrl);
        if (global.dbConstants) {
            listController.findAndRender(req, res, next);
        } else {
            require('../../config/DBConstant')(req.sequelize).findAllAlias().then(function (constants) {
                global.dbConstants = constants;
                listController.findAndRender(req, res, next);
            });
        }
    },
    findAndRender: function (req, res, next) {
        var self = this;
        var subAlias = req.params.subAlias;
        if (subAlias != 'le') {
            if (subAlias != "undefined" && isNaN(subAlias) && global.dbConstants.subCategoriesAliasArr.indexOf(subAlias) != -1) {
                self.listMovieByCategoryAlias(req, res, next);
            } else if (subAlias != "undefined" && isNaN(subAlias) && global.dbConstants.subCountriesAliasArr.indexOf(subAlias) != -1) {
                self.listMovieByCountryAlias(req, res, next);
            } else if (subAlias != "undefined" && isNaN(subAlias) && global.dbConstants.subActorsAliasArr.indexOf(subAlias) != -1) {
                self.listMovieByActorAlias(req, res, next);
            } else if (subAlias != "undefined" && isNaN(subAlias) && global.dbConstants.subDirectorsAliasArr.indexOf(subAlias) != -1) {
                self.listMovieByDirectorAlias(req, res, next);
            } else if (subAlias != "undefined" && isNaN(subAlias) && global.dbConstants.trailerAlias.indexOf(subAlias) != -1) {
                self.listTrailerMovies(req, res, next);
            } else {
                if (!httpUtil.isAjaxRequest(req))
                    res.redirect(constants.pageNotFoundUrl);
                else res.end();
            }
        } else {
            res.end();
        }

    },
    getFilterJoinInfo: function (req, res) {
        var filterJoinInfo = {in: {}};
        var subAlias = req.params.subAlias;
        if (subAlias == "undefined" || subAlias == null || subAlias == '') {
            return {in: req.query};
        } else {
            subAlias = subAlias.replace(/\'/g, "");
            if (subAlias != "undefined" && isNaN(subAlias) && global.dbConstants.subAliasArr.indexOf(subAlias) == -1 && !httpUtil.isAjaxRequest(req)) {
                res.redirect(constants.pageNotFoundUrl);
                res.end();
            }

            if (typeof req.query.qcata !== 'undefined')  filterJoinInfo.in.qcata = [req.query.qcata];
            if (global.dbConstants.subCategoriesAliasArr.indexOf(subAlias) != -1) {
                (typeof filterJoinInfo.in.qcata !== 'undefined' && filterJoinInfo.in.qcata.length > 0) ? filterJoinInfo.in.qcata.push(req.query.qcata) : filterJoinInfo.in.qcata = [subAlias];
            }
            if (typeof req.query.qaa !== 'undefined')  filterJoinInfo.in.qaa = [req.query.qaa];
            if (global.dbConstants.subActorsAliasArr.indexOf(subAlias) != -1) {
                (typeof filterJoinInfo.in.qaa !== 'undefined' && filterJoinInfo.in.qaa.length > 0) ? filterJoinInfo.in.qaa.push(req.query.qaa) : filterJoinInfo.in.qaa = [subAlias];
            }
            if (typeof req.query.qda !== 'undefined')  filterJoinInfo.in.qda = [req.query.qda];
            if (global.dbConstants.subDirectorsAliasArr.indexOf(subAlias) != -1) {
                (typeof filterJoinInfo.in.qda !== 'undefined' && filterJoinInfo.in.qda.length > 0) ? filterJoinInfo.in.qda.push(req.query.qda) : filterJoinInfo.in.qda = [subAlias];
            }
            if (typeof req.query.qca !== 'undefined')  filterJoinInfo.in.qca = [req.query.qca];
            if (global.dbConstants.subCountriesAliasArr.indexOf(subAlias) != -1) {
                (typeof filterJoinInfo.in.qca !== 'undefined' && filterJoinInfo.in.qca.length > 0) ? filterJoinInfo.in.qca.push(req.query.qca) : filterJoinInfo.in.qca = [subAlias];
            }
            if (typeof req.query.py !== 'undefined')  filterJoinInfo.in.py = [req.query.py];
            if (subAlias.isNumber()) {
                (typeof filterJoinInfo.in.py !== 'undefined' && filterJoinInfo.in.py.length > 0) ? filterJoinInfo.in.py.push(req.query.py) : filterJoinInfo.in.py = [subAlias];
            }
            if (typeof req.query.qkm !== 'undefined')  filterJoinInfo.in.qkm = [req.query.qkm];
            if (global.dbConstants.subKinksAliasArr.indexOf(subAlias) != -1) {
                (typeof filterJoinInfo.in.qkm !== 'undefined' && filterJoinInfo.in.qkm.length > 0) ? filterJoinInfo.in.qkm.push(req.query.qkm) : filterJoinInfo.in.qkm = [subAlias];
            }
            if (typeof req.query.qcv !== 'undefined')  filterJoinInfo.in.qcv = [req.query.qcv];
            if (global.dbConstants.subCaptionsAliasArr.indexOf(subAlias) != -1) {
                (typeof filterJoinInfo.in.qcv !== 'undefined' && filterJoinInfo.in.qcv.length > 0) ? filterJoinInfo.in.qcv.push(req.query.qcv) : filterJoinInfo.in.qcv = [subAlias];
            }

            return filterJoinInfo;
        }
    },
    requestHelper: function (req, res) {
        var self = this;
        var movieService = new MovieService(req.sequelize);
        var pageIndex = (typeof req.query.trang === 'undefined') ? 1 : req.query.trang;
        var pagingInfo = {currentPage: pageIndex, totalOnPage: constants.totalOnPage};
        var filterJoinInfo =  self.getFilterJoinInfo(req, res);
        return {movieService:movieService, pagingInfo: pagingInfo, filterOrderInfo: req.query.qfo, filterJoinInfo: filterJoinInfo};
    },
    listOneEpisodeMovie: function (req, res, next) {
        var reqH = listController.requestHelper(req, res);
        Q.fcall(function () {
            return reqH.movieService.findOneEpisodeMoviesWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
            next();
        });
    },
    listMultiEpisodeMovie: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findMultiEpisodeMoviesWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMultiEpisodeCompletedMovie: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findMultiEpisodeCompletedMoviesWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listHasTransMovie: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findHasTrainMoviesWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listHasDubbingMovie: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findHasDubbingMoviesWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listHasSubMovie: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findHasSubMoviesWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listTvShow: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findTVShows(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listTrailerMovies: function (req, res, next) {
        var reqH = listController.requestHelper(req, res);
        Q.fcall(function () {
            return reqH.movieService.findTrailerMoviesWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMovieByPublishYear: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findMoviesCommonWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMovieByLastYear: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        var publishYear = constants.currentYear;
        Q.fcall(function () {
            return reqH.movieService.findMoviesByPublishYearWithCache(publishYear, reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMovieByCategoryAlias: function (req, res, next) {

        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findMoviesCommonWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMovieByCountryAlias: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findMoviesCommonWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMovieByActorAlias: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findMoviesCommonWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMovieByDirectorAlias: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findMoviesCommonWithCache(reqH.pagingInfo, reqH.filterOrderInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMostRatingMovies: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findHighRatingMoviesWithCache(reqH.pagingInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    listMostViewedMovies: function (req, res, next) {
        var reqH = listController.requestHelper(req);
        Q.fcall(function () {
            return reqH.movieService.findMostViewedMovies(reqH.pagingInfo, reqH.filterJoinInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return listController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(listController.getView(req), listBean);
        });
    },
    getDataCommon: function (req) {
        var self = this;
        var commonService = new CommonService(req.sequelize);
        var filterService = new FilterService(req.sequelize);
        return Q.fcall(function () {
            if (httpUtil.isAjaxRequest(req)) return listBean;
            else
                return commonService.findMenusWithCache().then(function (menusBean) {
                    return listBean.menus = menusBean;
                });
        }).then(function () {
            if (httpUtil.isAjaxRequest(req)) return listBean;
            else
                return filterService.getListFiltersWithCache().then(function (listFilters) {
                    return listBean.listFilters = listFilters;
                });
        }).then(function () {
            if (httpUtil.isAjaxRequest(req)) return listBean;
            else{
                listBean.breadcrumb = breadcrumbHelper.buildBreadcrumb(req);
                listBean.title = self.buildTitle(listBean.breadcrumb, req.query);
                listBean.description = self.buildDescription(listBean.title, listBean.listMovies);
                listBean.filterOrder = self.buildFilterOrder(req);
                listBean.filterByParams = self.buildFilterByParams(req);
            }
            return listBean;
        });
    },
    getView: function(req) {
        var view = 'list';
        if (httpUtil.isAjaxRequest(req)) view = view + '-no-layout';
        return view;
    },
    buildFilterOrder: function (req) {
        var qfo = req.query.qfo;
        var activeText = "Mới nhất";
        switch (qfo)
        {
            case "top-xem-nhieu":  activeText = "Xem nhiều"; break;
            case "top-danh-gia":  activeText = "Đánh giá"; break;
        }
        var rs = (req.baseUrl.indexOf('top-phim') == -1)
            ?
        "<div class='filter-order'>" +
            "<span class='tn-arr tn-arr-1'></span>" +
            "<span class='tn-arr tn-arr-2'></span>" +
            "<label class='active-text'>" + activeText + "</label>" +
            "<div class='drop-list-holder'>" +
                "<a " + ((typeof qfo === 'undefined' || qfo == 'moi-nhat') ? 'class="active"' : '') + " href='" + (urlUtil.changeValueUrlParams(req, [{name:'qfo', value: 'moi-nhat'}])) + "'>Mới nhất</a>" +
                "<a " + ((qfo == 'top-xem-nhieu') ? 'class="active"' : '') + " href='" + (urlUtil.changeValueUrlParams(req, [{name:'qfo', value: 'top-xem-nhieu'}])) + "'>Top Xem nhiều</a>" +
                "<a " + ((qfo == 'top-danh-gia') ? 'class="active"' : '') + " href='" + (urlUtil.changeValueUrlParams(req, [{name:'qfo', value: 'top-danh-gia'}])) + "'>Top Đánh giá</a>" +
            "</div>" +
        "</div>"
            /*: "<div class='filter-order'>" +
             "<label>Sắp xếp theo:</label>" +
             "<a " + ((typeof qfo === 'undefined') ? 'class="active"' : '') + " href='?'>Ngày</a>" +
             "<a " + ((qfo == 'top-thang') ? 'class="active"' : '') + " href='?qtfo=thang'>Tháng</a>" +
             "<a " + ((qfo == 'top-nam') ? 'class="active"' : '') + " href='?qtfo=nam'>Năm</a>" +
             "</div>"*/
            : '';
        return rs;
    },
    buildFilterByParams: function (req) {
        var self = this;
        var rs = {countries:'', categories:'', captions:'', kinds:''};
        var subAlias = req.params.subAlias;
        if (global.dbConstants.subCategoriesAliasArr.indexOf(subAlias) == -1) {
            rs.categories = self.buildFilterByCategoryParam(req);
        }
        if (global.dbConstants.subCountriesAliasArr.indexOf(subAlias) == -1) {
            rs.countries = self.buildFilterByCountryParam(req);
        }
        if (req.baseUrl.indexOf(("-" && "/") + "phu-de") == -1
            && req.baseUrl.indexOf(("-" && "/") + "thuyet-minh") == -1
            && req.baseUrl.indexOf(("-" && "/") + "long-tieng") == -1) {
            rs.captions = self.buildFilterByCaptionParam(req);
        }
        if (req.baseUrl.indexOf("/phim-le") == -1
            && req.baseUrl.indexOf("/phim-bo") == -1) {
            rs.kinds = self.buildFilterByKindParam(req);
        }
        return rs;
    },
    buildFilterByCountryParam: function(req){
        var activeText = (typeof req.query.qca === 'undefined') ? 'quốc gia' : global.dbConstants.getCountryNameByAlias(req.query.qca);
        var rs =
            "<div class='filter-order'>" +
            "<span class='tn-arr tn-arr-1'></span>" +
            "<span class='tn-arr tn-arr-2'></span>" +
            "<label class='active-text'>" + activeText + "</label>" +
            "<div class='drop-list-holder'>";

        for (var key in global.dbConstants.subCountriesAliasMap) {
            if (global.dbConstants.subCountriesAliasMap.hasOwnProperty(key) && key.indexOf('phim') == -1) {
                var href = urlUtil.changeValueUrlParams(req, [{name:'qca', value: key}])
                rs += "<a " + ((key == req.query.qca) ? 'class="active"' : '') + " href='" + href + "'>"
                    + global.dbConstants.subCountriesAliasMap[key] + "</a>";
            }
        }
        rs +=
            "</div>" +
            "</div>";
        return rs;
    },
    buildFilterByCategoryParam: function(req){
        var activeText = (typeof req.query.qcata === 'undefined') ? 'thể loại' : global.dbConstants.getCategoryNameByAlias(req.query.qcata);
        var rs =
            "<div class='filter-order'>" +
            "<span class='tn-arr tn-arr-1'></span>" +
            "<span class='tn-arr tn-arr-2'></span>" +
            "<label class='active-text'>" + activeText + "</label>" +
            "<div class='drop-list-holder'>";

        for (var key in global.dbConstants.subCategoriesAliasMap) {
            if (global.dbConstants.subCategoriesAliasMap.hasOwnProperty(key) && key.indexOf('phim') == -1) {
                var href = urlUtil.changeValueUrlParams(req, [{name:'qcata', value: key}])
                rs += "<a " + ((key == req.query.qcata) ? 'class="active"' : '') + " href='" + href + "'>"
                    + global.dbConstants.subCategoriesAliasMap[key] + "</a>";
            }
        }
        rs +=
            "</div>" +
            "</div>";
        return rs;
    },
    buildFilterByKindParam: function(req){
        var activeText = (typeof req.query.qkm === 'undefined') ? 'loại phim' : global.dbConstants.getMoreNameByAlias(req.query.qkm);
        var rs =
            "<div class='filter-order'>" +
            "<span class='tn-arr tn-arr-1'></span>" +
            "<span class='tn-arr tn-arr-2'></span>" +
            "<label class='active-text'>" + activeText + "</label>" +
            "<div class='drop-list-holder'>" +
            "<a " + ((req.query.qkm == 'phim-le') ? 'class="active"' : '') + " href='" + (urlUtil.changeValueUrlParams(req, [{name:'qkm', value: 'phim-le'}])) + "'> phim lẻ</a>" +
            "<a " + ((req.query.qkm == 'phim-bo') ? 'class="active"' : '') + " href='" + (urlUtil.changeValueUrlParams(req, [{name:'qkm', value: 'phim-bo'}])) + "'> phim bộ</a>" +
            "</div>" +
            "</div>";
        return rs;
    },
    buildFilterByCaptionParam: function(req){
        var activeText = (typeof req.query.qcv === 'undefined') ? 'âm thanh' : global.dbConstants.getMoreNameByAlias(req.query.qcv);
        var rs =
            "<div class='filter-order'>" +
            "<span class='tn-arr tn-arr-1'></span>" +
            "<span class='tn-arr tn-arr-2'></span>" +
            "<label class='active-text'>" + activeText + "</label>" +
            "<div class='drop-list-holder'>" +
            "<a " + ((req.query.qcv == 'phu-de') ? 'class="active"' : '') + " href='" + (urlUtil.changeValueUrlParams(req, [{name:'qcv', value: 'phu-de'}])) + "'> phụ đề</a>" +
            "<a " + ((req.query.qcv == 'thuyet-minh') ? 'class="active"' : '') + " href='" + (urlUtil.changeValueUrlParams(req, [{name:'qcv', value: 'thuyet-minh'}])) + "'> thuyết minh</a>" +
            "<a " + ((req.query.qcv == 'long-tieng') ? 'class="active"' : '') + " href='" + (urlUtil.changeValueUrlParams(req, [{name:'qcv', value: 'long-tieng'}])) + "'> lồng tiếng</a>" +
            "</div>" +
            "</div>";
        return rs;
    },
    buildTitle: function(breadcrumb, queryParams) {
        var rs = '', titleByAlias = '';
        for (var key in queryParams) {
            if (queryParams.hasOwnProperty(key)) {
                var title = global.dbConstants.subAliasMap[queryParams[key]];
                if (typeof title === 'undefined') continue;
                titleByAlias += title + ', ';
            }
        }
        for (var i = 0; i < breadcrumb.length; i ++) {
            var breadcrumbItem = breadcrumb[i];
            rs += breadcrumbItem.title + ' ';
        }
        if (titleByAlias != '') {
            titleByAlias = ' - ' + titleByAlias.substr(0, titleByAlias.lastIndexOf(','));
        }
        return 'Xem ' + rs.trim() +  titleByAlias  + '. ' + rs.trim() + ' mới nhất, hay nhất, hot năm ' + (new Date().getFullYear()) + '';
    },
    buildDescription: function(title, listMovies) {
        var rs = 'Danh Sách ' + title.replace('Xem', '') + '. Hơn 5000 phim mới nhất, hot nhất đang chờ bạn khám phá trên Phimcuaban.com. ';
        for (var i = 0; i < listMovies.length; i ++) {
            var movie = listMovies[i];
            rs += movie.name1 + ', ';
        }
        return rs.substr(0, rs.lastIndexOf(',')) + '.';
    }
};

module.exports = function () {
    return listController;
}