const cluster = require('cluster');
const path = require('path');
const protocol = require('./protocol');
const webSocketClinet = require('websocket').client;
const client = new webSocketClinet();

let __connection = null;
let __nprocesses = 0;
let __address = null;

const killMiners = function() {
    for (const id in cluster.workers) {
	console.log(`kill id: ${id}, pid: ${cluster.workers[id].process.pid}`);
	process.kill(cluster.workers[id].process.pid);
    }
}

const launchMiners = function() {
    for (let i = 0 ; i < __nprocesses ; i ++) {
	const process = cluster.fork();
    }
}

const setup = function() {

    const foundNonce = function(message) {
	console.log(`found new nonce! ${message.nonce}`);

	if (__connection) {
	    __connection.send(protocol.foundNonce(message.nonce));
	}
    }

    for (const id in cluster.workers) {
	cluster.workers[id].on('message', foundNonce);
    }
}

client.on('connectFailed', (error) => {
    console.error(error.toString());
    process.exit(0);
});

client.on('connect', (connection) => {
    __connection = connection;
    __connection.send(protocol.handshake(__address));

    connection.on('error', (error) => {
	console.error(error.toString());

	killMiners();
	process.exit(0);
    });

    connection.on('close', () => {
	console.log('connection closed');
	killMiners();
	process.exit(0);
    });

    connection.on('message', (message) => {
	const messageJson = JSON.parse(message.utf8Data);
	const type = messageJson.type;
	const content = messageJson.content;

	switch (parseInt(type)) {
	case 0x002:
	    const accepted = protocol.accepted(content);

	    for (const id in cluster.workers) {
		cluster.workers[id].send({ latestHash: accepted.latestHash, difficulty: accepted.difficulty });
	    }

	    break;
	case 0x003:
	    console.error('handshake rejected');
	    console.error(`reason: ${protocol.reason(content)}`);

	    killMiners();
	    process.exit(-1);
	    break;
	case 0x005:
	    const updated = protocol.blockUpdated(content);

	    killMiners();
	    launchMiners();
	    setup();

	    for (const id in cluster.workers) {
		cluster.workers[id].send({ latestHash: updated.latestHash, difficulty: updated.difficulty });
	    }

	    break;
	default:
	    console.log(`unknown protocol. message type ${messageJson.type}`);
	    break;
	}
    });
});

const connect = function(url, address, nprocesses) {
    __address = address;
    __nprocesses = nprocesses;

    launchMiners();

    setup();
    client.connect(url);
}

exports.connect = connect;
