var io = require('socket.io'),
    fs = require('fs'),
    path = require('path');

exports.attach = function (server, shell) {
    var oldListeners = server.listeners('request');
    server.removeAllListeners('request');
    server.on('request', function (req, res) {
        if (req.url === '/shotgun/shotgun.client.js') {
            try {
                fs.readFile(path.join(__dirname, '/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js'), function (err, socketIoClient) {
                    fs.readFile(path.join(__dirname, '/client/shotgun.client.js'), function (err, shotgunClient) {
                        fs.readFile(path.join(__dirname, '/client/jquery.shotgunConsole.js'), function (err, jqueryShotgunConsole) {
                            res.writeHead(200, { 'Content-Type': 'application/javascript' });
                            res.end(socketIoClient + '\n\n' + shotgunClient + '\n\n' + jqueryShotgunConsole);
                        });
                    });
                });
            } catch (e) {}
        }
        else {
            for (var i = 0, l = oldListeners.length; i < l; i++) {
                oldListeners[i].call(server, req, res);
            }
        }
    });
    io.listen(server, { log: false })
        .of('/shotgun')
        .on('connection', function (socket) {
            socket.on('execute', function (cmdStr, context, options) {
                console.log('Received: ' + cmdStr)
                var result = shell.execute(cmdStr, context, options);
                socket.emit('result', result);
            });
        });
};