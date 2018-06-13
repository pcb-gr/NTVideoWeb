var path     = require('path');
var express  = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mediaConstants = require('../config/mediaConstant');

module.exports = function () {
    var app = express();
    // view engine setup
    app.set('views', path.join(__dirname, '../app/views'));
    app.set('view engine', 'pug');
    // uncomment after placing your favicon in /public
    app.use(favicon(path.join('public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    var cacheDuration = 86400000 ;
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');// Website you wish to allow to connect
        res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        if (req.url.indexOf(".html") !== -1 || req.url.indexOf(".swf") !== -1) {
            res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.header('Expires', '-1');
            res.header('Pragma', 'no-cache');
        } else if (req.url.indexOf("/images/") !== -1
            || req.url.indexOf("/stylesheets/") !== -1
            || req.url.indexOf("/javascripts/") !== -1
            || req.url.indexOf("/player/") !== -1) {
            res.setHeader("Cache-Control", "public, max-age=2592000");
            res.setHeader("Expires", new Date(Date.now() + cacheDuration * 7).toUTCString());
            res.header('Pragma', 'cache');
        } else if (req.url.indexOf("/thong-tin-player/") !== -1) {
            /*res.setHeader("Cache-Control", "public, max-age=2592000");
            res.setHeader("Expires", new Date(Date.now() + cacheDuration / 2).toUTCString());
            res.header('Pragma', 'cache');*/
        }
        next();
    });
    app.use(express.static('public'));

    app.get('/*', function (req, res, next) {
        res.locals.mediaConstants = mediaConstants;
        if (req.url.indexOf("/images/") !== -1
            || req.url.indexOf("/stylesheets/") !== -1
            || req.url.indexOf("/javascripts/") !== -1
            || req.url.indexOf("/player/") !== -1) {
            res.setHeader("Cache-Control", "public, max-age=2592000");
            res.setHeader("Expires", new Date(Date.now() + cacheDuration).toUTCString());
            res.header('Pragma', 'cache');
        } else if (req.url.indexOf("/thong-tin-player/") !== -1) {
            /*res.setHeader("Cache-Control", "public, max-age=2592000");
            res.setHeader("Expires", new Date(Date.now() + cacheDuration / 2).toUTCString());
            res.header('Pragma', 'cache');*/
        }
        // Pass to next layer of middleware
        next();
    });
    require('./routes')(app);
    return app;
};
