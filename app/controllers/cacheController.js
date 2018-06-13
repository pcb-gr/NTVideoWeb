var cacheUtil = require('../../app/util/CacheUtil');
var Q = require('q');
var cacheController = {
    init: function (req, res, next) {
        var alias = req.params.alias;
        switch (alias) {
            case 'i': cacheUtil.deleteIgnoreKeys(['watchService.findMovieByMovieAliasWithCache.']).then(function() {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end('Clear cache successfully'); // Send the data to the browser.
                next();
            }); break;
            case '*': cacheUtil.deleteAll().then(function() {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end('Clear all cache successfully'); // Send the data to the browser.
                next();
            }); break;
        }
    }
};

module.exports = function() {
    return cacheController;
}