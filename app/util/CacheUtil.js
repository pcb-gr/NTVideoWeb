/**
 * Created by Jeff on 9/21/2016.
 */
var client = null;
var redis = require('promise-redis')();

module.exports = {
    initRedisCache: function () {
        var redisPort = '6379' , redisHost = 'localhost' , reditPassword = '';
        if (process.env.NODE_ENV == 'production') {
            redisPort = '60706';
            redisHost = '58104c8e2d52713395000012-bilu.rhcloud.com';
            reditPassword = 'ZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5';
        } 
        client = redis.createClient(redisPort, redisHost);
        client.auth(reditPassword);
        client.on('connect', function () {
            console.log('initRedisCache successful!');
        });
        client.on('error', function (er) {
            console.trace('======================= REDIS Error =====================');
            console.error(er.stack);
            console.trace('======================= =========== =====================');
        });
    },
    putToCache: function (key, value) {

        if (!global.isCrawlerRequest) {
            console.log("===> putToCache: " + key);
            var rs = Array();
            var valueToJsonString = JSON.stringify(value);
            return client.set(key, valueToJsonString).then(function() {
                return value;
            }).catch(function (ex) {
                return rs;
            });
        } else {
            return value;
        };

    },
    getCacheByKey: function (key) {
        return client.get(key).then(function(data) {
            return data != null ? JSON.parse(data) : "";
        }).catch(function (ex) {
            return "";
        });
    },
    isExistCache: function (key, callback) {
        var rs = true;
        client.exists('key', function (err, reply) {
            if (err || reply != 1) {
                rs = false;
            }
            callback(rs);
        });
    },
    deleteCacheByKey: function (key) {
        client.del(key);
    },
    deleteIgnoreKeys: function (ignoreKeys) {
        var self = this;
        var canDel = true
        return client.keys('*').then(function (keys) {
            for (var i = 0; i < keys.length; i++) {
                canDel = true;
                for (var j = 0; j < ignoreKeys.length; j++) {
                    if (keys[i].indexOf(ignoreKeys[j]) != -1) { // ignore the cache name
                        canDel = false;
                        break;
                    }
                }
                if (canDel) { // ignore the cache name
                    self.deleteCacheByKey(keys[i]);
                }
            }
        });
    },
    deleteAll: function () {
        return new Promise(function (resolve, reject) {
            client.flushdb( function (err, succeeded) {
                resolve (succeeded)
            })
        })
    },
    deleteByKeyLike: function (key) {
        var self = this;
        return client.keys('*').then(function (keys) {
            for (var i = 0, len = keys.length; i < len; i++) {
                if (keys[i].indexOf(key) != -1) {
                    self.deleteCacheByKey(keys[i]);
                }
            }
        });
    }
}