/**
 * Created by Jeff on 9/24/2016.
 */

var episodeDao = {
    baseDao: {},
    model: {},
    findAll: function () {
        var self = this;
        return self.baseDao.find("SELECT episode.* FROM episode ORDER BY name",
            {model: self.model}
        ).then(function (data) {
            return data;
        })
    },
    findByAliasAndVictimId: function (alias, victimId) {
        var self = this;
        alias = (isNaN(alias)) ? alias.replace(/'/g, "") : alias;
        victimId = (isNaN(victimId)) ? victimId.replace(/'/g, ""): victimId;
        return self.baseDao.find(
            "SET group_concat_max_len = 1073741824; " +
            "SELECT a.*, b.* FROM ( " +
                "SELECT groupName, episodeHref FROM  episode WHERE alias = '" + alias + "' AND  victimId = " + victimId + " GROUP BY groupName ORDER BY groupName " +
            ") a, " +
            "( " +
                "SELECT GROUP_CONCAT(NAME ORDER BY episodeId) episodesName FROM  episode WHERE victimId = " + victimId + " GROUP BY groupName ORDER BY groupName " +
            ") b  GROUP BY a.groupName"
        ).spread(function (data) {
            return data;
        })
    }
}

module.exports = function(sequelize) {
    episodeDao.model = sequelize.models.episode;
    episodeDao.baseDao = sequelize.daos.baseDao;
    sequelize.daos.episodeDao = episodeDao;
    return episodeDao;
}