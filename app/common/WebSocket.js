var WebSocketModule = require('ws');
var WebSocketServer = WebSocketModule.Server;

var WebSocket = {
    connection: null,
    constructor: function (port, callback, onConnection, onClose) {
        var self = this;
        self.wss = new WebSocketServer({port: port});
        console.log('WebSocketServer listening on port %j', port);
        callback();
        self.wss.on('connection', function (conn) {
            WebSocket.connection = conn;
            console.log('From port[%s]. Client is connected', port);
            onConnection(WebSocket);
        });

        self.wss.on('close', function () {
            onClose();
        });
    },
    broadcast: function (message) {
        try {
            WebSocket.connection.send(JSON.stringify(message));
        } catch (e) {
            console.log(e.message)
        }
    }
}

module.exports = function (port, callback, onConnection, onClose) {
    WebSocket.constructor(port, callback, onConnection, onClose);
}