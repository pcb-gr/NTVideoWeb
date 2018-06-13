var DataTypes = require('sequelize');
module.exports = function (sequelize) {
    sequelize.define('episode', {
        episodeId        : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
         },
        victimId         : { type: DataTypes.INTEGER },
        name            : { type: DataTypes.STRING },
        groupName            : { type: DataTypes.STRING },
        episodeHref            : { type: DataTypes.STRING },
        backupHref            : { type: DataTypes.STRING }
     },{tableName: 'episode'});

};
