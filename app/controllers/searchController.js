var logeUtil = require('../../app/util/LogUtil');
var httpUtil = require('../../app/util/HttpUtil');
var listBean = require('../../app/beans/listBean');
var CommonService = require('../../app/services/commonService');
var SearchService = require('../../app/services/searchService');
var FilterService = require('../../app/services/filterService');
var Q = require('q');
var searchController = {
    init: function (req, res, next) {
        if (global.dbConstants) {
            searchController.findAndRender(req, res, next);
        } else {
            require('../../config/DBConstant')(req.sequelize).findAllAlias().then(function (constants) {
                global.dbConstants = constants;
                searchController.findAndRender(req, res, next);
            });
        }
    },
    search: function (req, res, next) {
        logeUtil.append(req, req.originalUrl);
        var keyWord = req.params.keyWord;
        var searchService = new SearchService(req.sequelize);
        var pageIndex = (typeof req.query.trang === 'undefined') ? 1 : req.query.trang;
        searchService.searchByKeyWord(keyWord, {currentPage: pageIndex, totalOnPage: searchController.getView(req) == 'search-ajax' ? 10 : 50}).then(function (movies) {
            listBean.listMovies = movies;
            if (searchController.getView(req) == 'search-ajax') {
                return searchService.searchMoreByKeyWord(keyWord).then(function (dataMore) {
                    listBean.actors = dataMore.actors;
                    listBean.directors = dataMore.directors;
                    return listBean;
                });
            } else if (searchController.getView(req) == 'search') {
                return searchController.getDataCommon(req, res, next).then(function (listBean) {
                    return listBean;
                });
            }
        }).then(function () {
            res.render(searchController.getView(req), listBean);
        });
    },
    getDataCommon: function (req) {
        var commonService = new CommonService(req.sequelize);
        //var filterService = new FilterService(req.sequelize);
        return Q.fcall(function () {
            return commonService.findMenusWithCache().then(function (menusBean) {
                return listBean.menus = menusBean;
            });
        })
        /*.then(function () {
            return filterService.getListFiltersWithCache().then(function (listFilters) {
                return listBean.listFilters = listFilters;
            });
        })*/
        .then(function () {
            return listBean;
        });
    },
    getView: function (req) {
        var view = 'search';
        var isAjaxRequest = httpUtil.isAjaxRequest(req);
        if (isAjaxRequest) {
            view = (typeof req.query.trang === 'undefined') ? 'search-ajax' : 'search-no-layout';
        }
        return view;
    }
};

module.exports = function () {
    return searchController;
}