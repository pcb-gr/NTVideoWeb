var SiteMapService = require('../../app/services/siteMapService');
var siteMapController = {
    init: function (req, res, next) {
        var siteMapService = new SiteMapService(req.sequelize);
        siteMapService.generateSiteMap().then(function (data) {
            res.set('Content-Type', 'text/xml');
            res.send(data);
            res.end();
        })
    }
};

module.exports = function () {
    return siteMapController;
}