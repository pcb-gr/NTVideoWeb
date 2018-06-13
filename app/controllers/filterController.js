var logeUtil = require('../../app/util/LogUtil');
var cacheUtil = require('../../app/util/CacheUtil');
var httpUtil = require('../../app/util/HttpUtil');
var breadcrumbHelper = require('../../app/util/BreadCrumbHelper');
var listBean = require('../../app/beans/listBean');
var CommonService = require('../../app/services/commonService');
var FilterService = require('../../app/services/filterService');
var constants = require('../../config/constant');
var Q = require('q');
var filterController = {
    init: function (req, res, next) {
        logeUtil.append(req, req.originalUrl);
        if (global.dbConstants) {
            filterController.findAndRender(req, res, next);
        } else {
            require('../../config/DBConstant')(req.sequelize).findAllAlias().then(function (constants) {
                global.dbConstants = constants;
                filterController.findAndRender(req, res, next);
            });
        }
    },
    findAndRender: function (req, res, next) {

        if (global.dbConstants.allCategoriesAliasNotExist(req.query.qcata)
            || global.dbConstants.allCountriesAliasNotExist(req.query.qca)
            || global.dbConstants.allActorsAliasNotExist(req.query.qaa)
            || global.dbConstants.allDirectorsAliasNotExist(req.query.qda)
            || global.dbConstants.allMoresAliasNotExist(req.query.qkm)
            || global.dbConstants.allMoresAliasNotExist(req.query.qcv)) {
            res.redirect(constants.pageNotFoundUrl);
        };

        var filterService = new FilterService(req.sequelize);
        var pageIndex = (typeof req.query.trang === 'undefined') ? 1 : req.query.trang;
        var pagingInfo = {currentPage: pageIndex, totalOnPage: constants.totalOnPage};
        Q.fcall(function () {
            return filterService.filterMoviesByParamsWithCache(req.query, pagingInfo).then(function (movies) {
                return listBean.listMovies = movies;
            });
        }).then(function () {
            return filterController.getDataCommon(req, res, next).then(function (listBean) {
                return listBean;
            });
        }).then(function () {
            res.render(filterController.getView(req), listBean);
        });
    },
    filterActors: function (req, res, next) {
        logeUtil.append(req, req.originalUrl);
        var keyWord = req.params.keyWord;
        var filterService = new FilterService(req.sequelize);
        filterService.filterActorsByKeyWordWithCache(keyWord).then(function (data) {
            res.send(data);
        });
    },
    filterDirectors: function (req, res, next) {
        logeUtil.append(req, req.originalUrl);
        var keyWord = req.params.keyWord;
        var filterService = new FilterService(req.sequelize);
        filterService.filterDirectorsByKeyWordWithCache(keyWord).then(function (data) {
            res.send(data);
        });
    },
    getDataCommon: function (req) {
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
            else {
                var arrAlias = [];
                if (typeof req.query.qcata !== 'undefined')
                    arrAlias.mergeArray(req.query.qcata.split(','));
                if (typeof req.query.qca !== 'undefined')
                    arrAlias.mergeArray(req.query.qca.split(','));
                if (typeof req.query.qaa !== 'undefined')
                    arrAlias.mergeArray(req.query.qaa.split(','));
                if (typeof req.query.qda !== 'undefined')
                    arrAlias.mergeArray(req.query.qda.split(','));
                if (typeof req.query.qkm !== 'undefined')
                    arrAlias.mergeArray(req.query.qkm.split(','));
                if (typeof req.query.qcv !== 'undefined')
                    arrAlias.mergeArray(req.query.qcv.split(','));
                listBean.breadcrumb = breadcrumbHelper.getAliasTitleMap(arrAlias);
            }

            return listBean;
        });
    },
    getView: function(req) {
        var view = 'filter';
        if (httpUtil.isAjaxRequest(req)) view = view + '-no-layout';
        return view;
    }
};

module.exports = function () {
    return filterController;
}