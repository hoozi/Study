/**
 * @build: 2014-09-11
 * @NAME : handleClientDisconnection
 */
module.exports = function(socket,  nickNames, namesUsed,currentRoom){
    socket.on('disconnect', function() {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        socket.broadcast.emit("leaveRoom", {
            text: "系统："+namesUsed[nameIndex]+"下线了~"
        })
        //删除名字
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}
