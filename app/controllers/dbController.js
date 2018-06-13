var dbController = {
    repairAllTable: function (req, res, next) {
        req.sequelize.daos.baseDao.repairAllTable().then(function(data) {
            res.send(data);
        });
    }
};

module.exports = function() {
    return dbController;
}