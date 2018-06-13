var Q = require('q');
const openload = require('node-openload');
const ol = openload({
    api_login: '30b1cacd159f8253',
    api_key: 'uENzSgdH',
});
module.exports = {
    accountInfo: function() {
        ol.getAccountInfo().then(function(info) {
             console.log(info)  // Prints account info
        });
    },
    getFileInfo: function(fileId) {
        return ol.getFileInfo(fileId).then(function(info) {
            console.log("getFileInfo:\n") ;
            console.log(info) ;
            return info;
        });
    },
    getDownloadTicket: function(fileId) {
        return ol.getDownloadTicket(fileId).then(function(info) {
            console.log("getDownloadTicket:\n") ;
            console.log(info) ;
            return info;
        });
    },
    getDownloadLink: function(fileId) {
        var self = this;
        return self.getDownloadTicket(fileId).then(function(info) {
            info.file = fileId;
            return ol.getDownloadLink(info).then(function(info) {
                console.log(info) ;
                return info.url; // + '?mime=true';
            });

        });
    }
}
