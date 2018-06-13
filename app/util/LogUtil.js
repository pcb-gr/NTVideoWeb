/**
 * Created by Jeff on 6/7/2016.
 */

module.exports = {
    http: require('http'),
    fs: require('fs'),
    clientRequestLogFile: "./logs/clientRequest.log",
    robotRequestLogFile: "./logs/robotRequest.log",
    append: function(req, logMessage) {
        var self = this;
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (!self.checkIgnoreIp(ip)) {
            var logFile = (global.isCrawlerRequest) ? self.robotRequestLogFile : self.clientRequestLogFile;
            self.parseLogFile(logFile).then(function(logJson) {
                var logDate = self.getLogDate();
                var logBean = { logDate: logDate, source: req.useragent.source, message: logMessage };
                if (typeof logJson[ip] !== 'undefined'){
                    logJson[ip].push(logBean);
                } else {
                    logJson[ip] = [logBean];
                }

                self.clean(logFile).then(function () {
                    self.fs.appendFile(logFile, JSON.stringify(logJson), function (err) {
                        if (err != null) {
                            console.log("client log error: " + err.message);
                        }
                    });
                });
            });

        }
    },
    getLogDate: function() {
        // time zone
        var currentDate = new Date();
        return currentDate.getDate() + "/"
            + (currentDate.getMonth()+1)  + "/"
            + currentDate.getFullYear() + " @ "
            + currentDate.getHours() + ":"
            + currentDate.getMinutes() + ":"
            + currentDate.getSeconds();
    },
    parseLogFile: function(logFile) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.read(logFile).then(function(content) {
                var logJson;
                if (content == '') content = '{}';
                try {
                    logJson = JSON.parse(content);
                } catch (e) {
                    logJson = JSON.parse('{}');
                }
                return resolve(logJson);
            });
        });
    },
    checkIgnoreIp: function(ip) {
        var ignoreIps = Array('127.10.68.129');
        return (ignoreIps.indexOf(ip) != -1) ? true : false;
    },
    read: function(file) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.fs.readFile(file, {encoding: 'utf-8'}, function(err, data){
                resolve(data);
            });
        });
    },
    clean: function(file, callback) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.fs.truncate(file, 0, function(){
                resolve('');
            });
        });
    },
    backupLog: function(callback) {
        var self = this;
        self.fs.stat(self.clientRequestLogFile, function(err, stats){
            if (err == null) {
                var currentDate = new Date().getDate();
                var mtime = stats.mtime;
                if (currentDate != mtime.getDate()) {
                    var bkFile = self.clientRequestLogFile.replace('.log', '-') + mtime.getFullYear() + '-' + mtime.getDate() + '.log';
                    self.fs.rename(self.clientRequestLogFile, bkFile, function(err) {
                        if ( err ) console.log('ERROR: ' + err);
                        callback();
                    });
                } else {
                    callback();
                }
            } else {
                callback();
            }
        });
    }
}
