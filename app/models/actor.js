var DataTypes = require('sequelize');
module.exports = function (sequelize) {
    sequelize.define('actor', {
        actorId         : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name           : { type: DataTypes.STRING },
        alias           : { type: DataTypes.STRING }
    },{tableName: 'actor'});
};
