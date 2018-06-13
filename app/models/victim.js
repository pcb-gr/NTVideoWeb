var DataTypes = require('sequelize');
module.exports = function (sequelize) {
    sequelize.define('victim', {
        victimId        : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
         },
        movieId         : { type: DataTypes.INTEGER },
        name            : { type: DataTypes.STRING },
        isDefault       : { type: DataTypes.INTEGER },
        movieHref       : { type: DataTypes.STRING },
        thumb           : { type: DataTypes.STRING },
        poster          : { type: DataTypes.STRING },
        smallImage      : { type: DataTypes.STRING },
        description     : { type: DataTypes.STRING },
        totalEpisode    : { type: DataTypes.INTEGER },
        currentEpisode  : { type: DataTypes.INTEGER },
        duration        : { type: DataTypes.STRING },
        quality         : { type: DataTypes.STRING },
        hasSub          : { type: DataTypes.INTEGER },
        hasDubbing      : { type: DataTypes.INTEGER },
        hasTrans        : { type: DataTypes.INTEGER },
        movieDetailHref : { type: DataTypes.STRING },
        isContinue      : { type: DataTypes.INTEGER },
        dateUpdate      : { type: DataTypes.DATE },
        updateState     : { type: DataTypes.INTEGER },
        viewed          : { type: DataTypes.INTEGER },
        rating          : { type: DataTypes.INTEGER },
        schedule        : { type: DataTypes.STRING},
        victimTypeNo    : { type: DataTypes.INTEGER },
        playListHtml    : { type: DataTypes.STRING},
     },{tableName: 'victim'});

};
