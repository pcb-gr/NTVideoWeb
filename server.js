var webSocket = require('./app/common/WebSocket');
var path = require('path');
var express = require('express');
var vhost = require('vhost');
var useragent = require('express-useragent');
var settings = require('./config/settings');
var httpUtil = require('./app/util/HttpUtil');
var models   = require('./app/models/');
var daos   = require('./app/daos/');
var cacheUtil = require('./app/util/CacheUtil');
var ipFilter = require('./app/util/IpFilter');
var connection = require('./app/models/connection')();

module.exports.start = function (done) {
	global.ws = new webSocket();
	//process.env.NODE_ENV = 'production';
    var app = express();
    app.use(useragent.express());
    // cache engine setup
    cacheUtil.initRedisCache();
    global.isCrawlerRequest = false;
    app.use(function (req, res, next) {
        if(ipFilter.checkIgnoreIp(req)) {
            res.send({ error: 'No data :((' });
            res.end();
        } else {
            global.isCrawlerRequest = httpUtil.isCrawlerRequest(req.useragent.source);
            models(connection, function (err, db) {
                daos(connection, function(err, db) {
                    req.sequelize = connection;
                });
            });
            return next();
        };
    });
    app.use(vhost(settings.siteName, require('./config/environment')()));
    //app.use(vhost('www.' + settings.siteName, require('./config/environment')()));
    //app.use(vhost(settings.mobileSub + '.' + settings.siteName, require('./config/mobile/environment')()));
    //app.use((require('./config/mobile/environment')()));
    require('./app/util/OverrideUtil')();
    require('./config/DBConstant')(connection).findAllAlias().then(function (constants) {
        global.dbConstants =  constants;
    });

    app.listen(settings.port, function () {
        console.log("Listening on port: " + settings.port);
    }).on('error', function (e) {
        console.log(e.code);
    });

    // error handlers
    app.use(function (req, res, next) {
        if(ipFilter.checkIgnoreIp(req)) {
            res.send({ error: 'No data :((' });
            res.end();
        } else {
            if (req.url.indexOf('/images/') == -1 && !httpUtil.isAjaxRequest(req)) {
                res.status(404);
                // respond with html page
                if (req.accepts('html')) {
                    res.redirect('/error/404');
                    return;
                }
                // respond with json
                if (req.accepts('json')) {
                    res.send({ error: 'Not found' });
                    return;
                }
                // default to plain-text. send()
                res.type('txt').send('Not found');
            }
            next();
        };

    });

}

// If someone ran: "node server.js" then automatically start the server
if (path.basename(process.argv[1], '.js') == path.basename(__filename, '.js')) {
    module.exports.start()
}
