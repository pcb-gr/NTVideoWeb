var modelsIsAvailable = false;
function setupModels(connection, cb) {
    require('./movie')(connection);
    require('./victim')(connection);
    require('./episode')(connection);
    require('./actor')(connection);
    require('./director')(connection);
    require('./country')(connection);
    require('./category')(connection);
    require('./addReferences')(connection);
    return cb(null, connection);
}

module.exports = function (connection, cb) {
    if (modelsIsAvailable)
        return cb(null, connection);
    setupModels(connection, cb);
    modelsIsAvailable = true;
};
