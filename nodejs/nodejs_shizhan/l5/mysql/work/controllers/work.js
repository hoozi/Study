/**
 * @build: 2014-10-10
 * @NAME : work
 */

var mod = require("../modules/mod");
var view = require("../libs/view")

exports.createDB = function(db, server) {
    mod.createDB(db, server)
}

exports.add = function(db, req, res){
    view.parseReceivedData(req, function(work) {
        mod.add(db, work, function(){
            exports.show(db, res)
        })
    })
}; 
exports.archive = function(db, req, res){
    view.parseReceivedData(req, function(work) {
        mod.archive(db, work, function(){
             exports.show(db, res)
        })
    })
};
exports.deleteWork = function(db, req, res){
     view.parseReceivedData(req, function(work) {
        mod.deleteWork(db, work, function(){
             exports.show(db, res)
        })
    })
}; 
exports.show = function(db, res, showArchived){
    var arc_val = (showArchived) ? 1 : 0;
    mod.show(db, arc_val, function(rows){
        var html = (showArchived) ? "" : '<a href="/archived">已完成</a><br/>';
        html+= view.workHitlistHtml(rows);
        html+= view.workFormHtml();
        view.sendHTML(res, html);
    })
}; 
exports.showArchived = function(db, res){
    exports.show(db, res, true)
}; 