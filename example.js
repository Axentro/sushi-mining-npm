const mining = require("./index");

const url = 'http://127.0.0.1:3000';
const address = 'VDAyYTVjMDYwZjYyZThkOWM5ODhkZGFkMmM3NzM2MjczZWZhZjIxNDAyNWRmNWQ0';
const nprocesses = 2;

mining(url, address, nprocesses);
