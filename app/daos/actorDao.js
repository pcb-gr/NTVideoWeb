/**
 * Created by Jeff on 9/24/2016.
 */

var actorDao = {
    baseDao: {},
    model: {},
    findAll: function () {
        var self = this;
        return self.baseDao.find("SELECT actor.* FROM actor ORDER BY name",
            {model: self.model}
        ).then(function (data) {
            return data;
        })
    }
}

module.exports = function(sequelize) {
    actorDao.model = sequelize.models.actor;
    actorDao.baseDao = sequelize.daos.baseDao;
    sequelize.daos.actorDao = actorDao;
    return actorDao;
}