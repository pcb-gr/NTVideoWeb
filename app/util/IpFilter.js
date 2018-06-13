/**
 * Created by Jeff on 6/7/2016.
 */

module.exports = {
    checkIgnoreIp: function(ip) {
        var ignoreIps = Array('127.10.68.129', '198.147.26.10');
        return (ignoreIps.indexOf(ip) != -1) ? true : false;
    }
}
