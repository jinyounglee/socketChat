var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use(express.static(path.join(__dirname,'public111')));

// name 에서 socket_id로의 매핑 테이블이 필요 socket_ids 에 맵핑 정보 저장
// 특정 사용자에게만 쪽지를 보내려면 io.sockets.socket(socket_id).emit 메서드를 사용해야한다.
var socket_ids = [];

// index.html 회원가입 페이지
app.get("/",function(req,res){
	res.sendfile(__dirname + "/public/client.html");
});

function registUser(socket,name){
    // socket_id와 name 테이블에 셋업
    // 현재 클라이언트 소켓에 있는 name을 pre_name이라는 변수로 읽어온다.
    // 대화명이 바뀔 경우 기존에 socket_ids에 기존의 대화명으로 저장되어있는 socket.id를 삭제하기 위함
    // 데이터가 삭제되면 socket_ids에 name을 key값으로 하여 socket.id 저장
    socket.get('name', function(err,pre_name){
        // pre_nick이 있는경우 소켓에 있는 닉을 지운다
        if(pre_name != undefined ) {
            delete socket_ids[pre_name];
        }

        socket_ids[name] = socket.id;
        socket.set('nickname',name,function(){
            //  socket_ids의 property의 키들로 저장이 되었기 때문에
            //  Object.keys(socket_ids)를 이용하여 nickname 리스트를 추출할 수 있다.
            socket.emit('userlist',{users:Object.keys(socket_ids)});
        });
    });
}


var count = 1;
// 사용자가 웹사이트에 접속을 하면 connection 이벤트가 실행됨 socket 오브젝트가 생성된다. 
// 나머지 이벤트들은 connection 이벤트 안에서 정의 되어야 한다. 
io.on('connection', function(socket){ 
	console.log("user connected: " , socket.id);
	// 등록한 사용자 이름을 가져오자

    // 순차적으로 사용자 이름 배정
	var name = "user" + count++;
	// emit 이벤트를 서버에서 클라이언트로 전달하는 함수 
	socket.emit('welcome', {msg : 'welcome!!'})
	io.to(socket.id).emit('change name', name);

	socket.on('disconnect', function(data){
        socket.get('name',function(err,name){
            if(name != undefined){
                delete socket_ids[name];
            }
            socket.emit('userlist',{user:Object.keys[socket_ids]});
        });
		console.log('user disconneced: ', socket.id);
	});
	// 간단하게 생각해서 emit은 보내고 on은 받아온다.
	socket.on('send message', function(name, text){
		var msg = name + " : " + text;
		console.log(msg);
		io.emit('receive message', msg);
	});

    socket.on('change username',function(data){
        registUser(socket.data.name);
    });

});


http.listen('3000', function(){
	console.log("server on!!!!!");
});
