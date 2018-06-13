var daosIsAvailable = false;
function setupDaos(connection, cb) {
    connection.daos = {};
    require('./baseDao')(connection);
    require('./movieDao')(connection);
    require('./victimDao')(connection);
    require('./episodeDao')(connection);
    require('./actorDao')(connection);
    require('./directorDao')(connection);
    require('./countryDao')(connection);
    require('./categoryDao')(connection);

    return cb(null, connection);
}

module.exports = function (connection, cb) {

    if (daosIsAvailable)
        return cb(null, connection);
    setupDaos(connection, cb);
    daosIsAvailable = true;
};
