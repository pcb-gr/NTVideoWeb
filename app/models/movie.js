var DataTypes = require('sequelize');
module.exports = function (sequelize) {
    sequelize.define('movie', {
        movieId         : {
            field: "movieId",
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name1           : { type: DataTypes.STRING},
        name2           : { type: DataTypes.STRING},
        alias           : { type: DataTypes.STRING},
        isMultiEpisode  : { type: DataTypes.INTEGER},
        dateUpdate      : { type: DataTypes.DATE },
        name1CheckField : { type: DataTypes.STRING},
        name2CheckField : { type: DataTypes.STRING},
        publishYear     : { type: DataTypes.INTEGER},
        isPublic        : { type: DataTypes.INTEGER},
        keyWord         : { type: DataTypes.STRING}
    },{tableName: 'movie'});
};
