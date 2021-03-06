
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var tv = require('./routes/tv');
var client = require('./routes/client');

var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/tv', tv.index);
app.get('/client', client.index);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//关闭多余调试信息
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
  
  //socket.emit('news', { hello: 'world' });

  // tv端注册一个房间
  // 跟其他页面隔离
  socket.on('getRoom', function (data) {
  	socket.join(data.room);
  	//给tv端反馈
  	socket.emit('gotRoom', data);
  });

  // 从client端接受控制请求，转发到对应的tv端
  socket.on('video', function(data) {
  	console.log(data);
  	socket.broadcast.to(data.room).emit('video', data);
  })

  // 从client端接受送礼请求，转发到对应的tv端
  socket.on('gift', function(data) {
  	console.log(this);
  	socket.broadcast.to(data.room).emit('gift', data);
  })

});
