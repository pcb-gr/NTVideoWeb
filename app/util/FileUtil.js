/**
 * Created by Jeff on 9/21/2016.
 */
var request = require('request-promise').defaults({ encoding: null });
var rq = require('request');
var cacheUtil = require('../../app/util/CacheUtil');
var fileSystem = require('fs');
module.exports = {
    getImageAndEncodeWithCache: function (imageUrl) {
        var self = this;
        var cacheKey = 'FileUtil.getImageAndEncodeWithCache.' + imageUrl;
        return cacheUtil.getCacheByKey(cacheKey).then(function(data) {
            if(data == "") {
                return self.getImageAndEncode(imageUrl).then(function(data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function(data) {
                        return data;
                    });
                });
            } else {
                return data;
            }
        });
    },
    getImageAndEncode: function (imageUrl) {
        return request.get(imageUrl).then(function (body) {
            return "data:image/jpeg;base64," + new Buffer(body).toString('base64');
        }).catch(function (err) {
            return "";
        });
    },
    getBinaryImageWithCache: function (imageUrl) {
        var self = this;
        var cacheKey = 'FileUtil.getBinaryImageWithCache.' + imageUrl;
        return cacheUtil.getCacheByKey(cacheKey).then(function(data) {
            if(data == "") {
                return self.getBinaryImage(imageUrl).then(function(data) {
                    return cacheUtil.putToCache(cacheKey, data).then(function(data) {
                        return data;
                    });
                });
            } else {
                return new Buffer(data);
            }
        });
    },
    getBinaryImage: function (imageUrl) {
        return request.get(imageUrl).then(function (body) {
            return new Buffer(body);
        }).catch(function (err) {
            return "";
        });
    },
    downloadToLocal: function (file) {
        var fileName = file.substring((file.lastIndexOf('/') + 1), file.length);
        request(file).pipe(fs.createWriteStream(fileName))
    },
    sendLocalFileToBrowser: function (file, res) {
        var fileName = file.substring((file.lastIndexOf('/') + 1), file.length);

        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            "Content-Disposition": "attachment; filename=" + fileName
        });
        fileSystem.createReadStream(fileName).pipe(res);
    },
    sendRemoteFileToBrowser: function (file, res) {
        //var fileName = file.substring((file.lastIndexOf('/') + 1), file.length);
        //file = 'http://www.html5videoplayer.net/videos/toystory.mp4';
        //res.setHeader("content-disposition", "attachment; filename=file.mp4");
        rq(file).pipe(res);
    },
    flushStream: function (file, req, res) {
        var url = require("url");
        //var file = 'http://www.html5videoplayer.net/videos/toystory.mp4';
        //reqUrl = cryptoUtil.base64Decode('aHR0cHM6Ly9wZ2xpOG4ub2xvYWRjZG4ubmV0L2RsL2wvQ25TX1duQThhZXR4Q2FWWi85WnplX0k5akRxNC8xMzM0NV90YXBfMS5tcDQ/bWltZT10cnVl');
        //reqUrl = cryptoUtil.base64Decode(req.query.file);
        var urlInfo = url.parse(file);
        var options = {
            host: urlInfo.hostname,
            path: urlInfo.pathname,
            method: "GET",
            timeout: 10000,
            followRedirect: true,
            maxRedirects: 10
        }
        var data = '';
        var request = http.request(options, function (resFile) {
            var range = 'bytes=0-';
            var positions = range.replace(/bytes=/, "").split("-");
            var start = parseInt(positions[0], 10);
            var total = 10000; //resFile.headers['content-length'];
            var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
            var chunksize = (end - start) + 1;

            /*res.writeHead(206, {
             "Content-Range": "bytes " + start + "-" + end + "/" + total,
             "Accept-Ranges": "bytes",
             "Content-Length": chunksize,
             "Content-Type": "video/mp4"
             });*/
            resFile.on('data', function (chunk) {
                //data += chunk;
                chunk = chunk.toString('utf-8');
                res.send(chunk);
            });
            resFile.on('end', function () {
                //console.log('End get data with url[' + url + ']');
                resolve(data);
            });
        });
        request.on('error', function (e) {
            reject(e.message);
        });
        request.end();
    }
}