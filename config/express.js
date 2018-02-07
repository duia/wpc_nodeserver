'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const session = require('express-session');
const compression = require('compression');
const cookieParser = require('cookie-parser');
// const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const csrf = require('csurf');
const cors = require('cors');
const upload = require('multer')();
const mongodb = require('../mongodb');

const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const morgan = require('morgan');
const winston = require('winston');
const helpers = require('view-helpers');
const pkg = require('../package.json');
const config = require('./');

const env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app, passport) {

    // Compression middleware (should be placed before express.static)
    app.use(compression({
        threshold: 512
    }));

    app.use(cors({
        origin: ['http://localhost:3000'],//可以访问的域名
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
        credentials: true
    }));

    // Static files middleware
    app.use(express.static(config.root + '/public'));

    // Use winston on production
    let log = 'dev';
    if (env !== 'development') {
        log = {
            stream: {
                write: message => winston.info(message)
            }
        };
    }

    // Don't log during tests
    // Logging middleware
    if (env !== 'test') app.use(morgan(log));

    // view engine setup
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'ejs');

    // expose package.json to views
    app.use(function (req, res, next) {
        res.locals.pkg = pkg;
        res.locals.env = env;
        next();
    });

    // bodyParser should be above methodOverride
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(upload.single('image'));
    app.use(methodOverride(function (req) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));


    // CookieParser should be above session
    app.use(cookieParser());
    // app.use(cookieSession({ secret: pkg.name }));
    // session设置
    app.use(session({
        secret: pkg.name,
        resave: false, // 即使 session 没有被修改，也保存 session 值，默认为 true
        saveUninitialized: true,// 是否自动保存未初始化的会话
        cookie: {
            maxAge: 1000*60*60
        },
        store: new MongoStore({
            mongooseConnection: mongodb.mongoose.connection, //使用已有的数据库连接
            collection : 'sessions'
        })

    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // should be declared after session and flash
    app.use(helpers(pkg.name));

    app.use(csrf());
    // This could be moved to view-helpers :-)
    app.use(function (req, res, next) {
        res.locals.csrf_token = req.csrfToken();
        next();
    });

    if (env === 'development') {
        app.locals.pretty = true;
    }

};
