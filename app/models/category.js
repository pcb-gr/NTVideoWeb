var DataTypes = require('sequelize');
module.exports = function (sequelize) {
    sequelize.define('category', {
        categoryId         : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name           : { type: DataTypes.STRING },
        alias           : { type: DataTypes.STRING }
    },{tableName: 'category'});
};
