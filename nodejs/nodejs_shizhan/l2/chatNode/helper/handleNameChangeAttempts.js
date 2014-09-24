/**
 * @build: 2014-09-11
 * @NAME : handleNameChangeAttempts
 */

//更名请求
module.exports = function(socket, nickNames, namesUsed, currentRoom) {
    
    //socket.id为当前用户
    
    socket.on("nameAttempt", function(name){
        
        //判断昵称中是否有Guest，禁止含有Guest的昵称
        if(name.indexOf("访客")>=0) {
            socket.emit('nameResult', {
                success: false,
                message: "系统：昵称中禁止使用\'访客\'"
            });
        } else {
            
            //判断昵称是否已经被注册
            if(namesUsed.indexOf(name)===-1) {
                
                //没被注册
                var previousName = nickNames[socket.id]; //获得用户原来的昵称
                var previousNameIndex = namesUsed.indexOf(previousName);//获得用户原来昵称的索引值
                
                namesUsed.push(name)
                //删除用户原来的昵称
                delete namesUsed[previousNameIndex];
                
                nickNames[socket.id] = name;
                
                socket.emit('nameResult', {
                    success: true,
                    name: name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit('message', {
                    text: "系统："+previousName + ' 更改成 ' + name,
                    stats: true
                });
                
            } else {
                socket.emit('nameResult', {
                    success: false,
                    message: "系统："+name+"已经被注册了"
                });
            }
        }
    })
}

