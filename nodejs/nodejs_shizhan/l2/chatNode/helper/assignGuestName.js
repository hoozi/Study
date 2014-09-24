/**
 * @build: 2014-09-10
 * @NAME : assignGuestName
 */

//分配用户昵称
module.exports = function(socket, guestNumber, nickNames, namesUsed){
    var name = "访客" + guestNumber;
    
    //把用户昵称跟客户端连接id关联上
    nickNames[socket.id] = name;
    
    //让用户知道他们的昵称
    socket.emit("nameResult", {
        success: true,
        name: name
    });
    
    namesUsed.push(name);
    
    //增加用来生成昵称的计数器
    return guestNumber + 1;
}
