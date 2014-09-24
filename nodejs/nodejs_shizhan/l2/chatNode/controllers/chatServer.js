/**
 * @build: 2014-09-10
 * @NAME : chatServer
 */

//初始化socket.io
var socketio = require("socket.io")
   ,helper = require("../helper")
   ,io
   ,guestNumber = 1
   ,nickNames = {}
   ,namesUsed = []
   ,currentRoom = {};

//启动socket.io服务器
exports.listen = function(server) {
    io = socketio.listen(server);
    io.set("log level", 1);
    
    //定义每个用户连接的处理逻辑
    io.sockets.on("connection", function(socket) {

        //用户连接上时，给一个访客名
        guestNumber = helper.assignGuestName(socket, guestNumber, nickNames, namesUsed);
        
        //在用户连接上时，将其放在Lobby聊天室里
        helper.joinRoom(socket, '默认房间', io, nickNames, currentRoom);
        
        //处理用户的消息，更名，以及聊天室的创建和变更
        helper.handleMessageBroadcasting(socket, nickNames);
        helper.handleNameChangeAttempts(socket, nickNames, namesUsed, currentRoom);
        helper.handleRoomJoining(socket, io, nickNames, currentRoom);
        
        //用户发请求时，向其提供已经被占用的聊天室列表
        socket.on("rooms", function(){
            socket.emit("rooms", io.sockets.manager.rooms);  
        });
        
        //用户断开连接后，清除逻辑
        helper.handleClientDisconnection(socket, nickNames, namesUsed);
    });
         
}  

