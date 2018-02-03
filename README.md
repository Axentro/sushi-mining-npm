# sushi-mining-npm

Mining npm module for SushiCoin.

## Install

```bash
npm install --save sushi-mining
```

## Usage

See `example.js`.

```node
const mining = require('sushi-mining');
const url = '[connecting url]';
const address = '[wallet address]';
const n = 2; // number of processes

mining(url, address, n);
```
