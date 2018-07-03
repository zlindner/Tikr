'use strict'

let express = require('express');
let http = require('http');

let app = express();
app.use(express.static('.'));

let server = http.createServer(app);
server.listen(9000);
console.log('Tikr running @ localhost:9000');