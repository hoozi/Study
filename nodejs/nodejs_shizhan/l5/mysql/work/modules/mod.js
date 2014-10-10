/**
 * @build: 2014-10-10
 * @NAME : index
 */
/**
 * @build: 2014-10-10
 * @NAME : index
 */
exports.createDB = function(db, server){
   var sql = "CREATE TABLE IF NOT EXISTS time_work ("
               +"id INT(10) NOT NULL AUTO_INCREMENT,"
               +"hours DECIMAL(5,2) DEFAULT 0,"
               +"date DATE,"
               +"archived INT(1) DEFAULT 0,"
               +"description LONGTEXT,"
               +"PRIMARY KEY(id))";
   db.execQuery({
        sql: sql,
        handler: function(resulte){
            console.log("Server started!");
            server.listen(3000)
        }
    })
};
exports.add = function(db, data, callback){
    var sql = "INSERT INTO time_work (hours, date, description)"
              +" VALUES (?, ?, ?)";
    var args = [data.hours, data.date, data.description];
    db.execQuery({
        sql: sql,
        args: args,
        handler: function(result) {
            callback.call(null, result)
        }
    })
}; 
exports.archive = function(db, data, callback){
    var sql = "UPDATE time_work SET archived=1 WHERE id=?";
    var args = [data.id];
    db.execQuery({
        sql: sql,
        args: args,
        handler: function(result) {
            callback.call(null, result)
        }
    })
};
exports.deleteWork = function(db, data, callback){
    var sql = "DELETE FROM time_work WHERE id=?";
    var args = [data.id];
    db.execQuery({
        sql: sql,
        args: args,
        handler: function(result) {
            callback.call(null, result)
        }
    })
}; 
exports.show = function(db, arc_val, callback){
    var sql = "SELECT * FROM time_work "
              +"WHERE archived=? "
              +"ORDER BY date DESC";
    db.execQuery({
        sql: sql,
        args: [arc_val],
        handler: function(result) {
            callback.call(null, result)
        }
    })
}; 
