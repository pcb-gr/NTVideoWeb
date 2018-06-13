/**
 * Created by Jeff on 9/23/2016.
 */
var settings = require('../../config/settings');
var Sequelize = require('sequelize');

var sequelize = new Sequelize(settings.database.database, settings.database.username, settings.database.password, {
    host: settings.database.host,
    port: settings.database.port,
    dialect: settings.database.protocol,
    dialectOptions: {
        multipleStatements: true
    },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    define: {
        timestamps: false
    }
});

module.exports = function () {
    return sequelize;
};
