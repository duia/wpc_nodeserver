'use strict';

/*!
 * Module dependencies.
 */
const local = require('./passport/local');
const User = require('../app/models/user');

/**
 * Expose
 */

module.exports = function (passport) {

    // use these strategies
    passport.use('local', local);

    // serialize sessions
    passport.serializeUser(function(user, done) { done(null, user.id) });
    passport.deserializeUser(function(id, done) { User.load({ criteria: { _id: id } }, done) });

};
