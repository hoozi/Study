/**
 * @build: 2014-09-29
 * @NAME : db
 */

var mysql = require("mysql");
var dbConfig = require("../config")["db"];

var pool = mysql.createPool(dbConfig);

//释放数据库连接
exports.release = function(connection){
    connection.end(function(err) {
        console.log("数据库连接已关闭")
    })
}

exports.execQuery = function(options) {
    pool.getConnection(function(err, connection){
        if(err) {
            console.log("数据库连接异常！")
            throw err;
        } 
        
        var query;
        var sql = options["sql"];
        var args = options["args"];
        var handler = options["handler"];

        if(args) {
           query = connection.query(sql, args, function(err, result) {   
               if(err) {
                   console.log("数据库错误！")
                   throw err;
               }
               handler(result);
           })
          
           console.log(query.sql) 
        } else {
           query = connection.query(sql, function(err, result) {   
               if(err) {
                   console.log("数据库错误！")
                   throw err;
               }
               handler(result);
           })
          
           console.log(query.sql)  
       }
       
       connection.release(function(err) {
           if(err) {
               console.log("数据库关闭出错！")
               throw err;
           }
       })
        
    })
}
