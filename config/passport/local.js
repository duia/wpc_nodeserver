'use strict';

/**
 * Module dependencies.
 */

const LocalStrategy = require('passport-local').Strategy;
const User = require('../../app/models/user');

/**
 * Expose
 */

module.exports = new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    function (username, password, done) {
        const options = {
            criteria: { username: username },
            select: 'name username hashed_password salt'
        };
        User.load(options, function (err, user) {
            if (err) return done(err);
            if (!user) {
              return done(null, false, { message: '账号不存在' });
            }
            if (!user.authenticate(password)) {
              return done(null, false, { message: '密码错误' });
            }
            return done(null, user);
        });
    }
);
