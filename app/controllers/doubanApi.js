var express = require('express');
var http = require('http');
var router = express.Router();

var doubanUrl = 'http://api.douban.com';

router.get('*', function(req, res, next) {
    http.get(doubanUrl + '/v2/movie' + req.url, function(response){
        var body = [];
        response.on('data',function(chunk){
            body.push(chunk);
        });
        response.on('end',function(){
            body = Buffer.concat(body);
            console.log(body.toString());
            res.json(body.toString());
        });
    });
});

module.exports = router;