var Q = require('q');
var connection = null;
var cacheUtil = require('../app/util/CacheUtil');
var constants = {
    cinemaAlias: "chieu-rap",
    tvShowAlias: "tv-show",
    trailerAlias: "sap-chieu",
    trailerAliasMap: {"phim-sap-chieu": "Phim Sắp Chiếu"},
    cartoonAlias: ["hoat-hinh", "anime"],
    multiEpisodeCompletedAlias: "da-hoan-thanh",
    multiEpisodeUpdatedAlias: "moi-cap-nhat",
    hasSubName: "Phụ Đề",
    hasTransName: "Thuyết Minh",
    hasDubbingName: "Lồng Tiếng",
    hasSubAlias: "phu-de",
    hasTransAlias: "thuyet-minh",
    hasDubbingAlias: "long-tieng",
    subCaptionsAliasArr: ["phu-de", "thuyet-minh", "long-tieng"],
    subCaptionsAliasMap: {"phu-de": "Phụ Đề", "thuyet-minh": "Thuyết Minh", "long-tieng": "Lồng Tiếng"},
    subKinksAliasArr: ["phim-le", "phim-bo"],
    subKinksAliasMap: {"phim-le": "Phim Lẻ", "phim-bo": "Phim Bộ"},
    subCountriesAliasArr: [],
    subCountriesAliasMap: {},
    subCategoriesAliasArr: [],
    subCategoriesAliasMap: {},
    subActorsAliasArr: [],
    subActorsAliasMap: {},
    subDirectorsAliasArr: [],
    subDirectorsAliasMap: {},
    subMoresAliasArr: ["chieu-rap", "phim-le-moi", "phim-bo-moi", "phim-le", "phim-bo", "phu-de", "thuyet-minh", "long-tieng", "phim-phu-de", "phim-thuyet-minh", "phim-long-tieng", "tv-show", "tim-kiem", "top-phim-danh-gia", "top-phim-xem-nhieu", "sap-chieu"],
    subMoresAliasMap: {
        "chieu-rap": "Phim Chiếu Rạp",
        "phim-le-moi": "Phim Lẻ Mới",
        "phim-bo-moi": "Phim Bộ Mới",
        "phim-le": "Phim Lẻ",
        "phim-bo": "Phim Bộ",
        "phu-de": "Phụ Đề",
        "thuyet-minh": "Thuyết Minh",
        "long-tieng": "Lồng Tiếng",
        "phim-phu-de": "Phim Phụ Đề",
        "phim-thuyet-minh": "Phim Thuyết Minh",
        "phim-long-tieng": "Phim Lồng Tiếng",
        "tv-show": "TV Show",
        "tim-kiem": "Tìm Kiếm",
        "phim-de-cu": "Phim Đề Cử",
        "top-phim-danh-gia": "Top Phim Đánh Giá",
        "top-phim-xem-nhieu": "Top Phim Xem Nhiều",
        "sap-chieu": "Phim Sắp Chiếu"
    },
    subAliasArr: ["chieu-rap", "phim-le-moi", "phim-bo-moi", "phim-le", "phim-bo", "phu-de", "thuyet-minh", "long-tieng", "phim-phu-de", "phim-thuyet-minh", "phim-long-tieng", "tv-show", "tim-kiem", "top-phim-danh-gia", "top-phim-xem-nhieu", "da-hoan-thanh", "moi-cap-nhat", "sap-chieu"],
    subAliasMap: {
        "chieu-rap": "Phim Chiếu Rạp",
        "phim-le-moi": "Phim Lẻ Mới",
        "phim-bo-moi": "Phim Bộ Mới",
        "phim-le": "Phim Lẻ",
        "phim-bo": "Phim Bộ",
        "phu-de": "Phụ Đề",
        "thuyet-minh": "Thuyết Minh",
        "long-tieng": "Lồng Tiếng",
        "phim-phu-de": "Phim Phụ Đề",
        "phim-thuyet-minh": "Phim Thuyết Minh",
        "phim-long-tieng": "Phim Lồng Tiếng",
        "tv-show": "TV Show",
        "tim-kiem": "Tìm Kiếm",
        "phim-de-cu": "Phim Đề Cử",
        "top-phim-danh-gia": "Top Phim Đánh Giá",
        "top-phim-xem-nhieu": "Top Phim Xem Nhiều",
        "da-hoan-thanh": "Đã Hoàn Thành",
        "moi-cap-nhat": "Mới Cập Nhật",
        "phim-sap-chieu": "Phim Sắp Chiếu"
    },
    allCategoriesAliasNotExist: function (aliasParams) {
        var rs = true;
        var self = this;
        if (typeof aliasParams !== 'undefined') {
            aliasParams = aliasParams.split(',');
            for (var i = 0; i < aliasParams.length; i ++){
                if (self.subCategoriesAliasArr.indexOf(aliasParams[i]) != -1) {
                    rs = false;
                    break;
                }
            }
            return rs;
        } else {
            return false;
        }
    },
    allCountriesAliasNotExist: function (aliasParams) {
        var rs = true;
        var self = this;
        if (typeof aliasParams !== 'undefined') {
            aliasParams = aliasParams.split(',');
            for (var i = 0; i < aliasParams.length; i ++){
                if (self.subCountriesAliasArr.indexOf(aliasParams[i]) != -1) {
                    rs = false;
                    break;
                }
            }
            return rs;
        } else {
            return false;
        }
    },
    allActorsAliasNotExist: function (aliasParams) {
        var rs = true;
        var self = this;
        if (typeof aliasParams !== 'undefined') {
            aliasParams = aliasParams.split(',');
            for (var i = 0; i < aliasParams.length; i ++){
                if (self.subActorsAliasArr.indexOf(aliasParams[i]) != -1) {
                    rs = false;
                    break;
                }
            }
            return rs;
        } else {
            return false;
        }
    },
    allDirectorsAliasNotExist: function (aliasParams) {
        var rs = true;
        var self = this;
        if (typeof aliasParams !== 'undefined') {
            aliasParams = aliasParams.split(',');
            for (var i = 0; i < aliasParams.length; i ++){
                if (self.subDirectorsAliasArr.indexOf(aliasParams[i]) != -1) {
                    rs = false;
                    break;
                }
            }
            return rs;
        } else {
            return false;
        }
    },
    allMoresAliasNotExist: function (aliasParams) {
        var rs = true;
        var self = this;
        if (typeof aliasParams !== 'undefined') {
            aliasParams = aliasParams.split(',');
            for (var i = 0; i < aliasParams.length; i ++){
                if (self.subMoresAliasArr.indexOf(aliasParams[i]) != -1) {
                    rs = false;
                    break;
                }
            }
            return rs;
        } else {
            return false;
        }
    },
    findAllAlias: function () {
        var self = this;
        var cacheKey = 'DBConstant.findAllAlias';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                return Q.fcall(function () {
                    return self.findCountriesAlias().then(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            var aliasMap = data[i];
                            constants.subCountriesAliasArr.push(aliasMap.alias);
                            constants.subCountriesAliasMap[aliasMap.alias] = aliasMap.name;
                            constants.subCountriesAliasArr.push("phim-" + aliasMap.alias);
                            constants.subCountriesAliasMap["phim-" + aliasMap.alias] = "Phim " + aliasMap.name;
                        }
                        constants.subAliasArr.mergeArray(constants.subCountriesAliasArr);
                        constants.subAliasMap.mergeObject(constants.subCountriesAliasMap);
                        return constants;
                    })
                }).then(function () {
                    return self.findCategoriesAlias().then(function (aliasMapArray) {
                        for (var i = 0; i < aliasMapArray.length; i++) {
                            var aliasMap = aliasMapArray[i];
                            constants.subCategoriesAliasArr.push(aliasMap.alias);
                            constants.subCategoriesAliasMap[aliasMap.alias] = aliasMap.name;
                            constants.subCategoriesAliasArr.push("phim-" + aliasMap.alias);
                            constants.subCategoriesAliasMap["phim-" + aliasMap.alias] = "Phim " + aliasMap.name;
                        }
                        constants.subAliasArr.mergeArray(constants.subCategoriesAliasArr);
                        constants.subAliasMap.mergeObject(constants.subCategoriesAliasMap);
                        return constants;
                    })
                }).then(function () {
                    return self.findActorsAlias().then(function (aliasMapArray) {
                        for (var i = 0; i < aliasMapArray.length; i++) {
                            var aliasMap = aliasMapArray[i];
                            constants.subActorsAliasArr.push(aliasMap.alias)
                            constants.subActorsAliasMap[aliasMap.alias] = aliasMap.name;
                            constants.subActorsAliasArr.push("phim-" + aliasMap.alias)
                            constants.subActorsAliasMap["phim-" + aliasMap.alias] = "Phim " + aliasMap.name;
                        }
                        constants.subAliasArr.mergeArray(constants.subActorsAliasArr);
                        constants.subAliasMap.mergeObject(constants.subActorsAliasMap);
                        return constants;
                    })
                }).then(function () {
                    return self.findDirectorsAlias().then(function (aliasMapArray) {
                        for (var i = 0; i < aliasMapArray.length; i++) {
                            var aliasMap = aliasMapArray[i];
                            constants.subDirectorsAliasArr.push(aliasMap.alias);
                            constants.subDirectorsAliasMap[aliasMap.alias] = aliasMap.name;
                            constants.subDirectorsAliasArr.push("phim-" + aliasMap.alias);
                            constants.subDirectorsAliasMap["phim-" + aliasMap.alias] = "Phim " + aliasMap.name;
                        }
                        constants.subAliasArr.mergeArray(constants.subDirectorsAliasArr);
                        constants.subAliasMap.mergeObject(constants.subDirectorsAliasMap);
                        return constants;
                    })
                }).then(function () {
                    constants.subAliasArr.mergeArray(constants.trailerAlias);
                    constants.subAliasMap.mergeObject(constants.trailerAliasMap);
                    return constants;
                })
            } else {
                return data;
            }
        });
    }, findCountriesAlias: function () {
        var cacheKey = 'DBConstant.findCountriesAlias';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                var query =
                    "SELECT name, alias FROM country";
                return connection.query(query).spread(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    }, findCategoriesAlias: function () {
        var cacheKey = 'DBConstant.findCategoriesAlias';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                var query =
                    "SELECT name, alias FROM category ";
                return connection.query(query).spread(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    }, findActorsAlias: function () {
        var cacheKey = 'DBConstant.findActorsAlias';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                var query =
                    "SELECT name, alias FROM actor ";
                return connection.query(query).spread(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    }, findDirectorsAlias: function () {
        var cacheKey = 'DBConstant.findDirectorsAlias';
        return cacheUtil.getCacheByKey(cacheKey).then(function (data) {
            if (data == "") {
                var query =
                    "SELECT name, alias FROM director";
                return connection.query(query).spread(function (data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function (data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    getCountryNameByAlias: function (alias) {
        var self = this;
        for (var key in self.subCountriesAliasMap) {
            if (self.subCountriesAliasMap.hasOwnProperty(key) && key == alias) {
                return self.subCountriesAliasMap[key];
            }
        }
    },
    getCategoryNameByAlias: function (alias) {
        var self = this;
        for (var key in self.subCategoriesAliasMap) {
            if (self.subCategoriesAliasMap.hasOwnProperty(key) && key == alias) {
                return self.subCategoriesAliasMap[key];
            }
        }
    },
    getMoreNameByAlias: function (alias) {
        var self = this;
        for (var key in self.subMoresAliasMap) {
            if (self.subMoresAliasMap.hasOwnProperty(key) && key == alias) {
                return self.subMoresAliasMap[key];
            }
        }
    }
};


module.exports = function (con) {
    connection = con;
    return constants;
}
