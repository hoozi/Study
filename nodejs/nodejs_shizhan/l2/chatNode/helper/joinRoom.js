/**
 * @build: 2014-09-10
 * @NAME : joinRoom
 */

//加入聊天室
module.exports = function(socket, room, io, nickNames, currentRoom){
    
    //用户进入房间
    socket.join(room);
    
    //记录用户的当前房间
    currentRoom[socket.id] = room;
    socket.emit("joinResult", {
        room: room
    })
    
    //让房间里的其他用户知道有新用户进入了房间
    socket.broadcast.to(room).emit("message", {
        text: "系统："+nickNames[socket.id] + "进入了" + room,
        stats: true
    });
    
    //确定有哪些用户在这个房间里
    var usersInRoom = io.sockets.clients(room);
    
    //如果不止一个用户在房间中，那么遍历出这些用户
    if(usersInRoom.length > 1) {
        var usersInRoomSummary = "系统："+room+"中的用户:";
        for(var index in usersInRoom) {
            var userSocketId = usersInRoom[index].id;
            
            //排除当前用户
            if(userSocketId != socket.id) {
                
                //第二个用户昵称开始
                if(index > 0) {
                    usersInRoomSummary+= ",";
                }
                usersInRoomSummary+= nickNames[userSocketId]
            }
        }
        
        usersInRoomSummary += '.';
        socket.emit('message', {
            text: usersInRoomSummary,
            stats: true
        });
    }
    
}
