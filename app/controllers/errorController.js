var CommonService = require('../../app/services/commonService');
var errorController  = {
    init: function (req, res, next) {
        var commonService = new CommonService(req.sequelize);
        commonService.findMenusWithCache().then(function (menusBean) {
            res.render('error', { 'menus': menusBean });
        });
    }
};

module.exports = function() {
    return errorController;
}