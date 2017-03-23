const dgram = require('dgram');
const serverPort = 9898;
const serverSocket = dgram.createSocket('udp4');
const multicastAddress = '224.0.0.50';
const multicastPort = 4321;
var sidToAddress = {};
var sidToPort = {};

serverSocket.on('message', function (msg, rinfo) {

    console.log('Receive \x1b[33m%s\x1b[0m (%d bytes) from client \x1b[36m%s:%d\x1b[0m.', msg, msg.length, rinfo.address, rinfo.port);
    var json;
    try
    {
        json = JSON.parse(msg);
    }
    catch (e)
    {
        console.log('\x1b[31mUnexpected message: %s\x1b[0m.', msg);
        return;
    }

    var cmd = json['cmd'];
    if (cmd === 'iam')
    {
        console.log("\n");
        var address = json['ip'];
        var port = json['port'];
        var cmd = '{"cmd": "get_id_list"}';
        console.log('Step 3. Send %s to %s:%d', cmd, address, port);
        var message = new Buffer(cmd);
        serverSocket.send(message, 0, cmd.length, port, address);
    }
    else if (cmd === 'get_id_list_ack')
    {
        console.log("\n");
        var data = JSON.parse(json['data']);
        for (var index in data)
        {
            var sid = data[index];
            var response = '{"cmd": "read", "sid": "' + sid + '"}';
            // Remember this sid's address
            sidToAddress[sid] = rinfo.address;
            sidToPort[sid] = rinfo.port;

            console.log('Step 4. Send \x1b[33m%s\x1b[0m to \x1b[36m%s:%d\x1b[0m.', response, rinfo.address, rinfo.port);
            var message = new Buffer(response);
            serverSocket.send(message, 0, response.length, rinfo.port, rinfo.address);
        }
        console.log("\n");
    }
    else if (cmd === 'read_ack' || cmd === 'report' || cmd === 'heartbeat')
    {
        var model = json['model'];
        var data = JSON.parse(json['data']);
        if (model === 'sensor_ht')
        {
            var temperature = data['temperature'] ? data['temperature'] / 100.0 : 100;
            var humidity = data['humidity'] ? data['humidity'] / 100.0 : 0;
            console.log("Step 5. Got \x1b[32mtemperature/humidity sensor\x1b[0m: \x1b[31m%s\x1b[0m's data: temperature %d, humidity %d\n", json['sid'], temperature, humidity);
        }
        else if (model === 'motion')
        {
            console.log("Step 5. Got \x1b[32mmotion sensor\x1b[0m: \x1b[31m%s\x1b[0m's data: move %s\n", json['sid'], (data['status'] === 'motion') ? 'detected' : 'not detected');
        }
        else if (model === 'magnet')
        {
            console.log("Step 5. Got \x1b[32mcontact/magnet sensor\x1b[0m: \x1b[31m%s\x1b[0m's data: contact %s\n", json['sid'], (data['status'] === 'close') ? 'detected' : 'not detected');
        }
        else if (model === 'ctrl_neutral1')
        {
            console.log("Step 5. Got \x1b[32mlight switch\x1b[0m: \x1b[31m%s\x1b[0m's data: %s\n", json['sid'], data['channel_0']);
        }
        else if (model === 'ctrl_neutral2')
        {
            console.log("Step 5. Got \x1b[32mduplex light switch\x1b[0m: \x1b[31m%s\x1b[0m's data: left %s, right %s\n", json['sid'], data['channel_0'], data['channel_1']);
        }
        else
        {
            console.log("Step 5. Got \x1b[32m%s\x1b[0m: \x1b[31m%s\x1b[0m's data: %s\n", json['model'], json['sid'], json['data']);
        }
    }
    else if (cmd === 'write')
    {
        // Commands from udpclient.js, pass them to gateway
        var sid = json['sid'];
        if (!sid || !sidToPort[sid] || !sidToAddress[sid])
        {
            console.log('Invalid or unknown sid in %s', msg);
        }
        else
        {
            serverSocket.send(msg, 0, msg.length, sidToPort[sid], sidToAddress[sid]);
        }
    }
    else
    {
        console.log('Receive \x1b[33m%s\x1b[0m (%d bytes) from client \x1b[36m%s:%d\x1b[0m.', msg, msg.length, rinfo.address, rinfo.port);
    }
});

// err - Error object, https://nodejs.org/api/errors.html
serverSocket.on('error', function (err) {
    console.log('error, msg - %s, stack - %s\n', err.message, err.stack);
});

serverSocket.on('listening', function () {
    console.log('Step 1. Start a UDP server, listening on port %d.', serverPort);
    serverSocket.addMembership(multicastAddress);
})

console.log('Demo server, in the following steps:');

serverSocket.bind(serverPort);

function sendWhois() {
    var cmd = '{"cmd": "whois"}';
    var message = new Buffer(cmd);
    serverSocket.send(message, 0, cmd.length, multicastPort, multicastAddress);
    console.log('Step 2. Send \x1b[33m%s\x1b[0m to a multicast address \x1b[36m%s:%d\x1b[0m.', cmd, multicastAddress, multicastPort);
}

sendWhois();

setInterval(function () {
    console.log('Step 2. Start another round.');
    sendWhois();
}, 30000);