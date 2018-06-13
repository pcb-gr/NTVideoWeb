/**
 * Created by nguyennt-pc on 9/25/2016.
 */

module.exports = {
    buildBreadcrumb : function (req) {
        var baseUrlParts = req.baseUrl.split('/');
        var breadcrumbItem = [];
        var ignoreAlias = ["", "undefined", "phim-xuat-ban-nam"];
        for (var i = 0; i < baseUrlParts.length; i++) {
            var alias = baseUrlParts[i].trim();
            if (ignoreAlias.indexOf(alias) != -1) continue;
            var title = (!isNaN(alias)) ? "Xuất Bản Năm " + alias : global.dbConstants.subAliasMap[alias];
            if (req.baseUrl.indexOf('phim-xuat-ban-nam') != -1) {
                title = "Phim " + title;
            }
            var href = baseUrlParts.clone().splice(1, i).join('-');
            breadcrumbItem.push({href: href + '.html', title: title});
        }
        return breadcrumbItem;
    },
    buildBreadcrumbByMovieInfo : function (movie) {
        var breadcrumbItem = [];
        var alias = ((movie.isMultiEpisode) ? 'phim-bo' : 'phim-le');
        breadcrumbItem.push({href: '/' + alias + '.html', title: global.dbConstants.subKinksAliasMap[alias]});
        breadcrumbItem.push({href: '/xem-phim-' + movie.alias + '.html', title: movie.name1 + ' - ' + movie.name2});
        return breadcrumbItem;
    },
    getAliasTitleMap: function (arrAlias) {
        var aliasTitleMap = [];
        for (var i = 0; i < arrAlias.length; i++) {
            var alias = arrAlias[i].trim().toLowerCase();
            var title = global.dbConstants.subAliasMap[alias];
            if (typeof title !== 'undefined') {
                aliasTitleMap.push({alias: alias, title: title});
            }
        }
        return aliasTitleMap;
    }
}
