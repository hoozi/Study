/**
 * @build: 2014-10-17
 * @NAME : findData
 */

;(function(){
var BASE_URL = "http://www.yibutong.com.cn/"
 
var _get = function(url, param, success, error) {
    _ajax("get", url, param, success, error);
}

var _post = function(url, param, success, error) {
    _ajax("post", url, param, success, error);
}
 
function _ajax(type, url, param, success, error) {
    var options = {
        url: BASE_URL+url,
        type: type || "get",
        data: param,
        timeout : 60000,//超时时间默认1分钟
        dataType : 'json',
        success : success,
        error: function(xhr, type) {
            if(error){
                error(xhr,type);
            }else{
                _parseError(xhr,type,url);
            }
        }
    };    
    $.ajax(options);
}

function _parseError(xhr,type,url){
    if(J.hasPopupOpen){
        J.hideMask();
    }
    if(type == 'timeout'){
        J.showToast('连接服务器超时,请检查网络是否畅通！','error');
    }else if(type == 'parsererror'){
        J.showToast('解析返回结果失败！','error');
    }else if(type == 'error'){
        var data;
        try{
            data = JSON.parse(xhr.responseText);
            if(data.code && data.message){
                J.showToast(data.message,'error');
            }else{
                J.showToast('连接服务器失败！','error');
            }
        }catch(e){
            J.showToast('连接服务器失败！','error');
        }
    } else {
        J.showToast('未知异常','error');
    }
}

window.FindData = {
    getVoyage: function(port, code, vesselEname, vesselCname, voyageIn, voyageOut, pageNum, success){
        _post("voyage/loadVoyageInfoByFormToJson.action", {
            port: port,
            code: code,
            vesselEname: vesselEname.toUpperCase(),
            vesselCname: encodeURI(vesselCname),
            voyageIn: voyageIn.toUpperCase(),
            voyageOut: voyageOut.toUpperCase(),
            gotoPage: pageNum
        }, success)
    },
    getVoyageBranch: function(id, success) {
        _post("voyage/loadBranchVoyageInfo.action", {id:id}, success);
    },
    getTrace: function(type, hasTrace, value, success) {
        if(hasTrace=="importTrace") {
            if(type=="ctn") {
              _post("trace/importTrace.action", {containerQueryType: type, ctnno:value.toUpperCase(), blno:""}, success)  
            } else {
              _post("trace/importTrace.action", {containerQueryType: type, ctnno:"", blno:value.toUpperCase()}, success) 
            }
        } else {
            if(type=="ctn") {
              _post("trace/exportTrace.action", {containerQueryType: type, ctnno:value.toUpperCase(), blno:""}, success)  
            } else {
              _post("trace/exportTrace.action", {containerQueryType: type, ctnno:"", blno:value.toUpperCase()}, success) 
            }
        }

    },
    getDelivery: function(type, value, success) {
        if(type=="ctn") {
            _post("delivery/searchDatResultForAll.action",{billNoDelivery:"",ctnNoDelivery:value.toUpperCase()}, success);
        } else {
            _post("delivery/searchDatResultForAll.action",{billNoDelivery:value.toUpperCase(),ctnNoDelivery:""}, success);
        }
    },
    getClp: function(type, value, success) {
        if(type=="ctn") {
            _post("clp/clpRecordQuery.action",{ctn_no:value.toUpperCase(),costcoNo:"",type:"ctn"}, success);
        } else {
            _post("clp/clpRecordQuery.action",{ctn_no:"",costcoNo:value.toUpperCase(),type:"costco"}, success);
        }
    },
    getCtn: function(type, value, pageNo, success) {
        if(type=="bl") {
            _post("ctnRelease/getCtnRealseInfo.action",{blno:value.toUpperCase(),bookingNo:"",gotoPage:pageNo}, success);
        } else {
            _post("ctnRelease/getCtnRealseInfo.action",{blno:"",bookingNo:value.toUpperCase(),gotoPage:pageNo}, success);
        }
    },
    getCtnInfo: function(id, success) {
         _post("ctnRelease/getCtnRealseContainer.action",{ctnRealseId:id}, success);
    },
    getNews: function(cat, pageNo, success) {
        _post("infoContents/loadInfoContentsListToJson.action", {category: cat, gotoPage: pageNo}, success);
    },
    getNewsById: function(id, success) {
        _post("infoContents/loadInfoContentById.action", {id: id}, success);
    },
    getTruck: function(truckLis, success) {
        _post("gpsTrack/getGpsInfoByTruck.action", {truckLis: truckLis.toUpperCase()}, success);
    }
} 

})();
