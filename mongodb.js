var mongoose = require('mongoose');
var config = require('./config');

connect();
mongoose.connection
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', function () {
        console.log('-----------数据库连接成功！------------');
    });

function connect () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    return mongoose.connect(config.db, {}).connection;
}

exports.mongoose = mongoose;