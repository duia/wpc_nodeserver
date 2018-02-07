require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const passport = require('passport');

const models = join(__dirname, 'app/models');
const app = express();

module.exports = app;

// Bootstrap models
fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(models, file)));

require('./config/passport')(passport);
require('./config/express')(app, passport);
require('./config/router')(app, passport);
