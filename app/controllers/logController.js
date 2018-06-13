var logUtil= require('../../app/util/LogUtil');
var logController = {
    read: function (req, res, next) {
        logUtil.read(((req.params.readType == 'client') ? logUtil.clientRequestLogFile : logUtil.robotRequestLogFile)).then(function(data) {
            (data != '') ? res.render('log-no-layout', {logContent: JSON.parse(data)}) : res.send('no log');
            res.end();
        });
    },
    clean: function (req, res, next) {
        logUtil.clean(((req.params.readType == 'client') ? logUtil.clientRequestLogFile : logUtil.robotRequestLogFile)).then(function(data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end('Clear log successfully'); // Send the data to the browser.
            res.end();
        });
    }
};

module.exports = function() {
    return logController;
}