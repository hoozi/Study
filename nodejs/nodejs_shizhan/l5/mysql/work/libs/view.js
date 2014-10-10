/**
 * @build: 2014-10-10
 * @NAME : view
 */
var qs = require("querystring");

exports.sendHTML = function(res, HTML) {
    res.setHeader("Content-type", "text/html;charset=utf-8");
    res.setHeader("Content-Length",Buffer.byteLength(HTML));
    res.end(HTML);
}

exports.parseReceivedData = function(req, callback) {
    var body = "";
    req.setEncoding("utf8");
    req.on("data", function(chunk) {
        body+= chunk;
    })
    req.on("end", function(){
        var data = qs.parse(body);
        callback.call(null, data);
    })
}

exports.actionForm = function(id, path, label) {
   return '<form method="post" action="' + path + '">'
          +'<input type="hidden" name="id" value="' + id + '"/>'
          +'<input type="submit" value="'+ label +'"/>'
          +'</form>'
}

exports.workHitlistHtml = function(rows) {
    var html = "<table>";
    for(var i in rows) {
        html+= "<tr>";
        html+= "<td>日期:<font color='red'>"+rows[i].date+"</font> | </td>";
        html+= "<td>时长:<font color='red'>"+rows[i].hours+"小时</font> | </td>";
        html+= "<td>描述:<font color='red'>"+rows[i].description+"</font></td>";
        if(!rows[i].archived) {
            html+= "<td>"+exports.workArchiveForm(rows[i].id)+"</td>";
        }
        html+= "<td>"+exports.workDeleteForm(rows[i].id)+"</td>";
        html+= "</tr>";
    }  
    html+="</table>";
    return html;
}

exports.workFormHtml = function(){
    var html = '<form method="post" action="/">'
               +'<p>日期（YYYY-MM-DD）：<input type="text" name="date" id="" /></p>'
               +'<p>工作时长：<input type="text" name="hours" id="" /></p>'
               +'<p>描述：<textarea name="description" id="" cols="30" rows="10"></textarea></p>'
               +'<p><input type="submit" value="添加" /></p>'
               +'</form>';
    return html;
}

exports.workArchiveForm = function(id) {
    return exports.actionForm(id, "/archive", '完成')
}

exports.workDeleteForm = function(id) {
    return exports.actionForm(id, "/delete", '删除')
}
