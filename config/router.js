/**
 * 路由控制模块
 */
const index = require('../app/controllers/index');
const users = require('../app/controllers/user');
const douban = require('../app/controllers/doubanApi');

const auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

const articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

module.exports = function(app, passport){

    app.route('/login')
        .get(users.login)
        .post(passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: true
        }), users.session);
    app.route('/register')
        .get(users.register)
        .post(users.create);
    app.get('/logout', users.logout);

    app.use('/v2/movie', douban);


    // 首页
    app.use('/', auth.requiresLogin, index);

    /**
     * Error handling
     */

    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
                || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }

        console.error(err.stack);

        if (err.stack.includes('ValidationError')) {
            res.status(422).render('422', { error: err.stack });
            return;
        }

        // error page
        res.status(500).render('500', { error: err.stack });
    });

    // assume 404 since no middleware responded
    app.use(function (req, res) {
        const payload = {
            url: req.originalUrl,
            error: 'Not found'
        };
        if (req.accepts('json')) return res.status(404).json(payload);
        res.status(404).render('404', payload);
    });

}
