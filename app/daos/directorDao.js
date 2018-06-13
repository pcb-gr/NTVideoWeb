/**
 * Created by Jeff on 9/24/2016.
 */

var directorDao = {
    baseDao: {},
    model: {},
    findAll: function () {
        var self = this;
        return self.baseDao.find("SELECT director.* FROM director ORDER BY name",
            {model: self.model}
        ).then(function (data) {
            return data;
        })
    }
}

module.exports = function(sequelize) {
    directorDao.model = sequelize.models.director;
    directorDao.baseDao = sequelize.daos.baseDao;
    sequelize.daos.directorDao = directorDao;
    return directorDao;
}