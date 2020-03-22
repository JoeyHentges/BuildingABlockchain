// Requirements
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

// Blockchain
const { Blockchain } = require('./src/Blockchain/Blockchain');
const coin = new Blockchain();

const app = express();

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Export app to be used in Server.js
module.exports.app = app;
module.exports.coin = coin;

// Add Routes to the app
app.use('/', require('./main/routes/routes').router);
