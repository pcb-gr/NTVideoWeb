var DataTypes = require('sequelize');
module.exports = function (sequelize) {
    sequelize.define('country', {
        countryId         : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name           : { type: DataTypes.STRING },
        alias           : { type: DataTypes.STRING },
        flag           : { type: DataTypes.STRING }
    },{tableName: 'country'});
};
