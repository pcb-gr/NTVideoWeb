/**
 * Created by Jeff on 9/24/2016.
 */

var victimDao = {
    baseDao: {},
    model: {},
    findAll: function () {
        var self = this;
        return self.baseDao.find("SELECT victim.* FROM victim ORDER BY name",
            {model: self.model}
        ).then(function (data) {
            return data;
        })
    }
}

module.exports = function(sequelize) {
    victimDao.model = sequelize.models.victim;
    victimDao.baseDao = sequelize.daos.baseDao;
    sequelize.daos.victimDao = victimDao;
    return victimDao;
}