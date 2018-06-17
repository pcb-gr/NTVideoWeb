var WebSocketModule = require('ws');
var uuid = require("node-uuid");
var WebSocketServer = WebSocketModule.Server;

var WebSocket = {
	connection: null,
    constructor: function(port) {
        var self = this;
        self.wss = new WebSocketServer({port: port});
        console.log('WebSocketServer listening on port %j', port);
        self.wss.on('connection', (conn) => {
        	
        	WebSocket.connection = conn; 
            console.log('From port[%s]. Client is connected', port);

            conn.on('close', ()=> {
            	global.ws = new webSocket();
                console.log('From port[%s]. Client is deleted', port);
            });

        });

    },
    broadcast: function(message) {
        try {
        	WebSocket.connection.send(JSON.stringify(message));
        } catch (e) {
            console.log(e.message)
        }
    }
}

module.exports = function(port=82) {
	WebSocket.constructor(port);
    return WebSocket;
}