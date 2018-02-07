var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    // console.log("session:" + req.session)
    // console.log("session.id:" + req.session.id)
    res.render('index', {
        title: 'Express',
        username : req.user.username
    });
});

module.exports = router;