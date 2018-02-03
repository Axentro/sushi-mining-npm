const cluster = require('cluster');

const mining = function(url, address, nprocesses) {
    if (cluster.isMaster) {
	const client = require('./lib/client');
	client.connect(url, address, nprocesses);
    } else {
	require('./lib/miner');
    }
}

module.exports = mining;
