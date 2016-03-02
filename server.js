var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get("/",function(req,res){
	res.sendfile("client.html");
});


var count = 1;
// 사용자가 웹사이트에 접속을 하면 connection 이벤트가 실행됨 socket 오브젝트가 생성된다. 
// 나머지 이벤트들은 connection 이벤트 안에서 정의 되어야 한다. 
io.on('connection', function(socket){ 
	console.log("user connected: " , socket.id);
	// 사용자 이름을 조립 
	var name = "user" + count++;
	// emit 이벤트를 서버에서 클라이언트로 전달하는 함수 
	socket.emit('welcome', {msg : 'welcome!!'})
	io.to(socket.id).emit('change name', name);

	socket.on('disconnect', function(){
		console.log('user disconneced: ', socket.id);
	});

	socket.on('send message', function(name, text){
		var msg = name + " : " + text;
		console.log(msg);
		io.emit('receive message', msg);
	});
});


http.listen('3000', function(){
	console.log("server on!!!!!");
});
