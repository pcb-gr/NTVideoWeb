var Q = require('q');
var siteMapService = {
    sequelize: {},
    generateSiteMap: function () {
        var self = this;
        return Q.fcall(function () {
            var query = "SELECT movie.alias FROM movie ORDER BY movie.publishYear DESC";
            return self.sequelize.query(
                query
            ).spread(function (data) {
                return self.joinUrl(data, '', 'http://www.phimcuaban.com/xem-phim-');
            }).catch(function (ex) {
                return Array();
            });
        }).then(function(urlset) {
            var query = "SELECT alias FROM actor " +
                        "UNION " +
                        "SELECT alias FROM director ";
            return self.sequelize.query(
                query
            ).spread(function (data) {
                return self.joinUrl(data, urlset, 'http://www.phimcuaban.com/phim-');
            }).catch(function (ex) {
                return Array();
            });
        }).then(function(urlset) {
            var query =
                "SELECT alias FROM category ";
            return self.sequelize.query(
                query
            ).spread(function (data) {
                urlset = self.joinUrl(data, urlset, 'http://www.phimcuaban.com/phim-');
                urlset = self.joinUrl(data, urlset, 'http://www.phimcuaban.com/phim-le-');
                return self.joinUrl(data, urlset, 'http://www.phimcuaban.com/phim-bo-');
            }).catch(function (ex) {
                return Array();
            });
        }).then(function(urlset) {
            var query = "SELECT alias FROM country";
            return self.sequelize.query(
                query
            ).spread(function (data) {
                urlset = self.joinUrl(data, urlset, 'http://www.phimcuaban.com/phim-');
                urlset = self.joinUrl(data, urlset, 'http://www.phimcuaban.com/phim-le-');
                return self.joinUrl(data, urlset, 'http://www.phimcuaban.com/phim-bo-');
            }).catch(function (ex) {
                return Array();
            });
        }).then(function(urlset) {
            var urlSetMore = [
                {alias: ''},
                {alias: '/phim-thuyet-minh'},
                {alias: '/phim-long-tieng'},
                {alias: '/phim-phu-de'},
                {alias: '/top-phim-danh-gia'},
                {alias: '/top-phim-xem-nhieu'},
                {alias: '/tv-show-my'},
                {alias: '/tv-show-trung-quoc'},
                {alias: '/tv-show-han-quoc'},
                {alias: '/tv-show-dai-loan'},
            ];
            return self.joinUrl(urlSetMore, urlset, 'http://www.phimcuaban.com');
        }).then(function (urlset) {
            return self.putUrlSet(urlset);
        });
    },
    putUrlSet: function(urlset) {
        var siteMap = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>' +
            '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' +
                urlset +
            '</urlset>';
        return siteMap ;
    },
    joinUrl: function(urlList, urlset, prefix) {

        for (var i = 0; i < urlList.length; i ++) {
            var extension = (urlList[i].alias != '' ? '.html': '');
            var priority = (urlList[i].alias != '' ? '0.8': '1');
            var urlItem =
                '<url>' +
                    '<loc>' +
                        '<![CDATA[' + prefix + urlList[i].alias + extension + ']]>' +
                    '</loc>' +
                    '<priority>' +
                        priority +
                    '</priority>' +
                    '<changefreq>' +
                        'Daily' +
                    '</changefreq>' +
                '</url>';
            urlset += urlItem;
        }
        return urlset;
    },

};

module.exports = function (sequelize) {
    siteMapService.sequelize = sequelize;
    return siteMapService;
};
