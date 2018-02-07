'use strict';

/**
 * Module dependencies.
 */
const express = require('express');
const router = express.Router();

const User = require('../models/user');
const {wrap: async} = require('co');
const {respond} = require('./../utils');

/**
 * Load
 */

router.load = async(function* (req, res, next, _id) {
    const criteria = {_id};
    try {
        req.profile = yield User.load({criteria});
        if (!req.profile) return next(new Error('User not found'));
    } catch (err) {
        return next(err);
    }
    next();
});

/**
 * Create user
 */

router.create = async(function* (req, res) {
    const user = new User(req.body);
    user.provider = 'local';
    try {
        yield user.save();
        req.logIn(user, err => {
            if (err) req.flash('info', 'Sorry! We are not able to log you in!');
            return res.redirect('/');
        });
    } catch (err) {
        const errors = Object.keys(err.errors)
            .map(field => err.errors[field].message);

        res.render('register', {
            title: '注册',
            errors,
            user
        });
    }
});

/**
 *  Show profile
 */

router.show = function (req, res) {
    const user = req.profile;
    respond(res, 'users/show', {
        title: user.name,
        user: user
    });
};

router.register = function () {
};

/**
 * Auth callback
 */

router.authCallback = login;

/**
 * Show login form
 */

router.login = function (req, res) {
    res.render('login', {
        title: '登录'
    });
};

/**
 * Show sign up form
 */

router.register = function (req, res) {
    res.render('register', {
        title: '注册',
        user: new User()
    });
};

/**
 * Logout
 */

router.logout = function (req, res) {
    req.logout();
    res.redirect('/login');
};

/**
 * Session
 */

router.session = login;

/**
 * Login
 */

function login(req, res) {
    const redirectTo = req.session.returnTo
        ? req.session.returnTo
        : '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
}

module.exports = router;