document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady(){
    navigator.splashscreen.hide();
    if(Connection.NONE==navigator.connection.type) {
        if(J.hasPopupOpen){
            J.closePopup();
        }
        J.Toast.show("error","网络未连接！")  
    }
    //注册后退按钮
    document.addEventListener("backbutton", function (e) {
       
        if(J.hasMenuOpen){
            J.Menu.hide();
        }else if(J.hasPopupOpen){
            J.closePopup();
        }else{
            var sectionId = $('section.active').attr('id');
            if(sectionId == 'index'){
                J.confirm('提示','是否退出程序？',function(){
                    navigator.app.exitApp();
                });
            }else{
                window.history.go(-1);
            }
        }
    }, false);
}
J.FindParm = function(query, name) {
    var qArr = query.split("&");
    for(var i=0; i<qArr.length; i++) {
        var item = qArr[i].split("=");
        if(item[0]===name) {
            return item[1];
        }
    }
    return -1;
}
var App = (function(){
    var pages = {};
    var resultPath = "page/result/";
    var selectPath = "page/select/"
    var run = function(){
        $.each(pages,function(k,v){
            var sectionId = '#'+k;
            $('body').delegate(sectionId,'pageinit',function(){
                v.init && v.init.call(v);
            });
            $('body').delegate(sectionId,'pageshow',function(e,isBack){
                //页面加载的时候都会执行
                v.show && v.show.call(v);
                //后退时不执行
                if(!isBack && v.load){
                    v.load.call(v);
                }
            });
        });
		//J.Transition.add('flip','slideLeftOut','flipOut','slideRightOut','flipIn');
        Jingle.launch({
            //transitionType : 'cover',
            showPageLoading : false,
            basePagePath : 'page/',
            remotePage: {
                
                "#voyage-result":resultPath+"voyage/voyage-result.html",
                "#branch":resultPath+"voyage/branch.html",
                "#port-select":selectPath+"voyage/port-select.html",
                "#code-select":selectPath+"voyage/code-select.html",
                
                "#track-result":resultPath+"track/track-result.html",
                
                "#delivery-result":resultPath+"delivery/delivery-result.html",
                
                "#clp-result":resultPath+"clp/clp-result.html",
                
                "#ctnRelease-result":resultPath+"ctnRelease/ctnRelease-result.html",
                "#ctn-info":resultPath+"ctnRelease/ctn-info.html",
                "#ctn-detail":resultPath+"ctnRelease/ctn-detail.html",
                
                "#GPS-result":resultPath+"GPS/GPS-result.html",
                
                "#yard-select":selectPath+"yard/yard-select.html",
                "#typeSize-select":selectPath+"yard/typeSize-select.html",
                "#yard-result":resultPath+"yard/yard-result.html"
            }
        });
       
    };
    var page = function(id,factory){
        return ((id && factory)?_addPage:_getPage).call(this,id,factory);
    }
    var _addPage = function(id,factory){
        pages[id] = new factory();
    };
    var _getPage = function(id){
        return pages[id];
    }
 
    return {
        run : run,
        page : page
    }
}());

var tmplinit = function(html) {
    return html.replace(/\s+</g,"<")
           .replace(/>\s+</g,"><")
           .replace(/>\s+/g,">") 
}

var _switchEvent = function(el, href, query, placeholder){
    var $el = $(el);
    var $btn = $el.find(".submit");
    var $ipt = $el.find(".ipt")
    //var placeholder = ["请输入完整箱号(不区分大小写)","请输入完整提单号(不区分大小写)"];
    $(el).on("tap", "li", function(){
        var $index = $(this).index();
        var href = href || "#track-result?type=";
        var value = $(this).data("value");
        $btn.attr("href", href+value+(("&"+query) || ""))
        $ipt.attr("placeholder", placeholder[$index]);
    })
}

var _refresh = function(el, info){
    var $el = $(el);
    var $switch = $el.find(".search-switch");
    var $ipt = $el.find(".ipt");
    $el.on('pagehide',function(e,isBack){
        if(isBack) {
            var $li = $switch.find("li");
            $li.removeClass("active");
            $li.first().addClass("active");
            $ipt.val("").attr("placeholder", info || "请输入完整箱号(不区分大小写)");
        }
    });
}

/*
 * @param {String} id 地图容器id
 * @param {Array} point 初始化定位的点坐标
 * @param {int} 放大级别
 * @return {Object} 地图对象
 * */
var _createMap = function(id, point, zoom) {
    var map = new BMap.Map(id);   
    var point = new BMap.Point(point[0],point[1]); 
    map.centerAndZoom(point, zoom);
    map.addControl(new BMap.ZoomControl());
    return map;
}


var _checkRequired = function(el, btn, info) {
    var $el = $(el);
    var $ipt = $el.find(".ipt");
    $el.on("tap", btn, function(){
        if(!$ipt.val()) {
            J.Toast.show("error", info || "请填写完整的箱号或者提单号！");
            return false;
        }
    })
}

App.page("index",function(){
    var pageNum, category;
    this.init = function(){
        $("#news_article").on("articleshow", function(){
            _initNav();
        })
        pageNum = 1;
        category = $("#news-grid").find(".active").data("category");
        _getNews(); 
    }
    
    var _initNav = function() {
        J.Scroll("#newsNav-scroll",{
            hScroll:true,
            hScrollbar : false
        });
        $("#news-grid").on("tap", "a", function(){
            J.showMask();
            J.Scroll("#news-scroll").scroller.scrollTo(0,0);
            $("#news-list").empty();
            category = $(this).data("category");
            pageNum = 1;
            $(this).siblings().removeClass("active").end().addClass("active");
            _getNews();
        })
    }
    var _getNews = function(scroll) {
        FindData.getNews(category, pageNum, function(data) {
            if(pageNum == 1) {
               _renderFirstPage(data); 
            } else {
               _renderNextPage(scroll, data) 
            }
            J.Scroll("#news-scroll");
            var timer1 = null
            J.Refresh("#news-scroll", "pullUp", function(){
                var scroll = this;
                pageNum++;
                clearTimeout(timer1);
                timer1 = setTimeout(function(){_getNews(scroll);},500);
            })
        })
    }
    
    var _renderFirstPage = function(data) {
        if(!data["list"].length) {
            J.Toast.show("info","没有找到任何数据！");
        }
        J.Template.render("#news-list", "news-templ", data);
        J.hideMask();
    }
    var _renderNextPage = function(scroll, data) {
        if(!data["list"].length) {
            J.Toast.show("info","已经是最后一页了！");
            pageNum--;
            return false;
        }
        J.Template.render("#news-list", "news-templ", data, "add");
        scroll.refresh();
        J.showToast("获取成功","success");
    }

})
App.page("news-detail", function() {
    var query, id, img;
    this.init = function(){
        $("#news-detail").on("pagehide", function(e, isBack){
            if(isBack) {
                $("#news-title").empty();
                $("#news-detail-content").empty();
            }
        })
    }
    this.load = function(){
        J.showMask();
        query = $("#news-detail").data("query");
        id = J.FindParm(query, "id");
        _getNewsById();
    }
    var _getNewsById = function(){
        FindData.getNewsById(id, function(data) {
            J.Template.render("#news-title", "news-title-templ", data);
            Handlebars.registerHelper("each", function(data,options){
                var html = "";
                for(var i=0; i<data.length; i++) {
                    var item = "";
                    var suffix = data[i]["suffix"];
                    var url = !!(suffix==".jpg"||suffix==".png"||suffix==".gif")
                    item = options.fn(data[i], {
                        data:{
                            url: url
                        }
                    })
                    html+=item;
                }
                return html;
            })
            J.Template.render("#news-detail-content", "news-detail-templ", data);
            img = $("#news-detail-content").find("img");
            if(img.length) {
                J.imageLoad(img, function(){
                    J.Scroll("#news-detail-scroll");
                    J.hideMask();
                })
            } else {
                J.Scroll("#news-detail-scroll");
                J.hideMask();
            }
            
        })
    }
})
App.page("voyage", function(){
    this.init = function(){
       
    }
})


App.page("port-select", function(){
    this.init = function(){
       _select(".port", "#port-text")
    }
})
App.page("code-select", function(){
    this.init = function(){
       _select(".code", "#code-text")
    }
})
var _select = function(el1, el2) {
    var $item = $(el1).find("li>a");
    $item.tap(function(){
        var $this = $(this);
        var $parent = $this.parent();
        var $siblings = $parent.siblings();
        $siblings.find(".icon").attr("class","icon checkbox-unchecked");
        $this.find(".icon").attr("class","icon checkbox-checked")
        $parent.siblings().removeClass("active");
        $parent.addClass("active")
        $(el2).text($this.text());
        $(el2).data("value",$this.data("value"))
    })
}


App.page("voyage-result", function(){
    var voyageScroll, port, code, vesselEname, vesselCname, voyageIn, voyageOut, $vContent, $branchLink;
    this.init = function(){
    var $voyageWrap = $("#voyage-result");
    $vContent = $("#voyage-content");
    $branchLink = $(".branch-link");
    $voyageWrap.on('pagehide',function(e,isBack){
        if(isBack) $vContent.empty();
    });
        
    }
    this.load = function() {
        pageNum = 1;
        $vContent = $("#voyage-content");
        port = $("#port-text").data("value");
        code = $("#code-text").data("value");
        vesselEname = $("#vesselEname").val() || "";
        vesselCname = $("#vesselCname").val() || "";
        voyageIn = $("#voyageIn").val() || "";
        voyageOut = $("#voyageOut").val() || "";
        voyageScroll = "#voyage-scroll";
        J.showMask();
        _getPage();
    }
    var _getPage = function(scroll){
        FindData.getVoyage(port, code, vesselEname, vesselCname, voyageIn, voyageOut, pageNum, function(data){ 
            Handlebars.registerHelper("list", function(data,options){
                var html = "", len = $vContent.find(".result-list").length;
                for(var i=0; i<data.length; i++) {
                    var item = "";
                    var hasArrivalPort = data[i]["voyageInfo"]["arrivalPort"]=="CNZPU"?true:false;
                    var index = len?len+i+1:i+1;
                    var publishDate = data[i]["voyageInfo"]["publishDate"].substring(0,8);
                    var today = (J.Util.formatDate(new Date(),"yyyyMd") == publishDate) ? "<div class='tag voyage-today'>今天</div>" : "";
                    Handlebars.registerPartial('today', today) 
                    item = options.fn(data[i], {
                        data:{
                            index: index,
                            hasArrivalPort: hasArrivalPort
                        }
                    })
                    html+=item;
                }
                return html;
            })
            if(pageNum == 1){
                _renderFirstPage(data);
            }else{
                _renderNextPage(scroll, data);
            }
            J.Scroll(voyageScroll);
            var timer2 = null
            J.Refresh(voyageScroll, "pullUp", function(){
                var scroll = this;
                pageNum++;
                clearTimeout(timer2);
                timer2 = setTimeout(function(){ _getPage(scroll);},500);
            })
        });
    }
    var _renderFirstPage = function(data) {
        if(!data["list"].length) {
            J.Toast.show("info","没有找到任何数据！");
        }
        J.Template.render("#voyage-content", "voyage-templ", data);
        J.hideMask();
    }
    var _renderNextPage = function(scroll, data) {
        if(!data["list"].length) {
            J.Toast.show("info","已经是最后一页了！");
            pageNum--;
            return false;
        }
        J.Template.render("#voyage-content", "voyage-templ", data, "add");
        scroll.refresh();
        J.showToast("获取成功","success");
    }
     
})


App.page('branch', function(){
    var id, $bContent, query;
    this.init = function(){
        $bContent = $("#branch-content")
        $("#branch").on('pagehide',function(e,isBack){
            if(isBack) $bContent.empty();
        });
    }
    this.load = function(){
        J.showMask();
        query = $("#branch").data("query");
        id = J.FindParm(query, "id");
        $bContent = $("#branch-content");
        _branch();
    }
    
    var _branch = function(){
        
        FindData.getVoyageBranch(id, function(data) {
            J.Template.render("#branch-content", "branch-templ", data);
            J.hideMask();
            J.Scroll("#branch-scroll");
        })
    }
})

App.page('track', function(){
    var $trackSwitch,query,href,newhref;
    this.init = function(){
        _thisPage = "#track";
       query = $("#track").data("query");
       href = $("#track-search").attr("href");
       track = J.FindParm(query, "track");
       _trackInit()
       _switchEvent(_thisPage, null, query, ["请输入完整箱号(不区分大小写)","请输入完整提单号(不区分大小写)"]);
       _checkRequired(_thisPage,".track-search");
       _refresh(_thisPage);
    }
    var _trackInit = function(){
        if(track=="importTrace") {
            $("#track-title").text("进口跟踪");
        } else {
            $("#track-title").text("出口跟踪");
        }
        newhref = href.indexOf("?") ? href+"&"+query : "?" + query;
        $("#track-search").attr("href", newhref)
    }

});

App.page('track-result', function(){
    var type, hasTrace, query, value;
    this.init = function(){
        $("#track-result").on('pagehide',function(e,isBack){
            if(isBack) {
                $("#ctn-content").empty();
                $("#node-content").empty();
            }
        });
        query = $("#track-result").data("query");
        hasTrace = J.FindParm(query,"track");
       _resultInit();
    }
    this.load = function(){
       value = $("#track-ipt").val();
       query = $("#track-result").data("query");
       hasTrace = J.FindParm(query,"track");
       type = J.FindParm(query,"type");
       J.showMask();
       _getTrace();  
    }
    
    var _resultInit = function() {
       if(hasTrace=="importTrace") {
           $("#hasTitle").text("进口跟踪查询结果");
       } else {
           $("#hasTitle").text("出口跟踪查询结果");
       }
    }
    
    var _getTrace = function() {
        FindData.getTrace(type, hasTrace, value, function(data) {
            J.hideMask();
            if(type=="ctn") {
               _ctn(data)
            } else {
               _bill(data) 
            }
            J.Scroll("#ctn");
            J.Scroll("#node");
        })
    }
    
    var _ctn = function(data) {
        if(data.flag=="0"){
             J.Toast.show("info", "没有相关记录!");
             return false;
         }
         if(data.ctnFlag=="m"){
             J.alert("温馨提示","我们发现这个箱号下存在多个提单，我们给您列出其中一条提单的相关信息，若要精确查询信息请按提单号进行查询!");
         }
         
         if(data.flag==100){
             J.Toast.show("info", "没有访问权限!"); 
             return false;
         }
        J.Template.render("#ctn-content", "ctn-templ", data);
        Handlebars.registerHelper("list", function(data,options){
            var html = "";
            for(var i=data.length-1; i>=0; i--) {
                item = options.fn(data[i]);
                html+=item;
            }
            return html;
        })
        J.Template.render("#node-content", "node-ctn-templ", data);
    }
    
    var _bill = function(data) {
        J.Template.render("#ctn-content", "bl-templ", data);
        Handlebars.registerHelper("list", function(data,options){
            var html = "",multi = "";
            for(var i=data.length-1; i>=0; i--) {
                var hasSon = data[i].nodeFlagCtn;
                var item = "";
                var nodeSequence = data[i].nodeSequence;
                var nextNodeSequence = i!=0?data[i-1].nodeSequence:data[0].nodeSequence;
                
                //是否有子节点（N代表有；否则代表无）
                if(hasSon=="N") {
                    item = options.fn(data[i], {
                        data: {
                            hasSon:true
                        }
                    });
                } else {
                    
                    //前一个是否和后一个相同，相同的话nodeCtnNo与nodeDate缓存，并且跳过不渲染主体。
                    if(nodeSequence==nextNodeSequence&&i!=0) {
                        multi+="<p>箱号："+data[i].nodeCtnNo+"<br/>时间："+data[i].nodeDate+"</p>";
                        continue;
                    }
                     multi+="<p>箱号："+data[i].nodeCtnNo+"<br/>时间："+data[i].nodeDate+"</p>";
                    Handlebars.registerPartial('multi', multi);
                    item = options.fn(data[i], {
                        data: {
                            hasSon:false
                        }
                    });
                    multi=""    
                }
                html+=item;
            }
            return html;
        })
        J.Template.render("#node-content", "node-bl-templ", data);
    }

})

App.page('delivery', function(){
    this.init = function(){
        _switchEvent("#delivery", "#delivery-result?type=", null, ["请输入完整箱号(不区分大小写)","请输入完整提单号(不区分大小写)"]);
       _checkRequired("#delivery", ".delivery-search");
       _refresh("#delivery");
    }
})

App.page('delivery-result', function(){
    var value, type, query
    this.init = function(){
        $("#delivery-result").on('pagehide',function(e,isBack){
            if(isBack) {
                $("#delivery-content").empty();
            }
        });  
    }
    this.load = function(){
        J.showMask();
        value = $("#delivery-ipt").val();
        query = $("#delivery-result").data("query");
        type = J.FindParm(query, "type");
        _getDelivery();
    }
    
    var _getDelivery = function(){
        FindData.getDelivery(type, value, function(data) {
            if(data.flag==1) {
                _success(data)
            } else {
                _error(data)
            }
            J.Scroll("#delivery-scroll");
        })
    }
    
    var _success = function(data) {
        if(!data["list"].length) {
            J.Toast.show("info", "没有相关记录!");
            return false; 
        }
        Handlebars.registerHelper("list", function(data,options){
            var html = "";
            for(var i=0; i<data.length; i++) {
                var item = "";
                var matou = data[i].matou;
                var receivetime = data[i].receivetime;
                var ifcsumFlag = !!(data[i].ifcsumFlag=="Y");
                var matouFlag = !!(data[i].matouFlag=="Y");
                var customFlag = !!(data[i].customFlag=="Y");
                var sldFlag = !!(data[i].sldFlag=="Y");
                var sendEnable = !!(data[i].sendEnable=="Y");
                var sendFlag = !!(data[i].sendFlag=="Y");
                var pass = "";
                
                var passFlag = data[i].passFlag;
                switch(passFlag) {
                    case "Y":
                       pass = "<p>"+matou+" : 已经放行<br/>"+receivetime+"</p>" 
                    break;
                    case "N":
                        pass = "<p class='err1'>"+matou+" : 不能放行<br/>"+receivetime+"</p>" 
                    break;
                    case "T":
                        pass = "<p class='err2'>"+matou+" : 取消放行<br/>"+receivetime+"</p>" 
                    break;    
                }
                Handlebars.registerPartial('passFlag', pass);
                item = options.fn(data[i],{
                    data:{
                        ifcsumFlag: ifcsumFlag,
                        matouFlag: matouFlag,
                        customFlag: customFlag,
                        sldFlag: sldFlag,
                        sendEnable: sendEnable,
                        sendFlag: sendFlag
                    }
                });
                html+=item;
            }
            return html;
        })
        J.Template.render("#delivery-content", "delivery-templ", data);
        J.hideMask();
    }
    
    var _error = function(data) {
        if(data.flag==2) {
            J.Toast.show("error", "查询出错！"); 
        } else {
            J.Toast.show("error", "未知错误！");
        }
    }
})

App.page('clp', function(){
    this.init = function(){
        _switchEvent("#clp", "#clp-result?type=", null, ["请输入完整箱号(不区分大小写)","请输入完整装箱单编号(不区分大小写)"]);
       _checkRequired("#clp", ".clp-search", "请填写完整的箱号或者装箱单编号！");
       _refresh("#clp");
    }
});

App.page('clp-result', function(){
    var value, type, query
    this.init = function(){
       $("#clp-result").on('pagehide',function(e,isBack){
            if(isBack) {
                $("#clp-content").empty();
            }
       });
    }
    
    this.load = function(){
        J.showMask();
        value = $("#clp-ipt").val();
        query = $("#clp-result").data("query");
        type = J.FindParm(query, "type");
        _getCLP();
    }
    
    var _getCLP = function(){
        FindData.getClp(type, value, function(data){
            J.hideMask();
            if(!data["costcoMainDeo"]) {
                J.Toast.show("info", "没有相关记录!");
                return false;
            }
            _success(data);
            J.Scroll("#clp-scroll");
        })
    }
    var _success = function(data) {
        J.alert("温馨提示","装箱单发往: "+data.receiver);
        var total = 0;
        for(var i=0; i<data["costcoBlDeoList"].length;i++) {
            var grossWeight = parseInt(data["costcoBlDeoList"][i]["grossWeight"], 10)
            total+=grossWeight;
        }
        Handlebars.registerPartial('total', total+"");
        J.Template.render("#clp-content", "clp-templ", data);
    }
})

App.page('ctnRelease', function(){
    this.init = function(){
        _switchEvent("#ctnRelease", "#ctnRelease-result?type=", null, ["请输入完整提单号(不区分大小写)","请输入完整订舱号(不区分大小写)"]);
       _checkRequired("#ctnRelease", ".ctnRelease-search", "请填写完整的提单号或者订舱号！");
       _refresh("#ctnRelease", "请输入完整提单号(不区分大小写)");
    }
})

var ctnData = [];
App.page('ctnRelease-result', function(){
    var value, type, query, pageNum
    this.init = function(){
       $("#ctnRelease-result").on('pagehide',function(e,isBack){
            if(isBack) {
                ctnData = null;
                $("#ctnRelease-content").empty();
            }
       });
    }
    
    this.load = function(){
        J.showMask();
        pageNum = 1;
        value = $("#ctnRelease-ipt").val();
        query = $("#ctnRelease-result").data("query");
        type = J.FindParm(query, "type");
        _getPage();
    }
    var _getPage = function(scroll){
        FindData.getCtn(type, value, pageNum, function(data){
            Handlebars.registerHelper("list", function(data,options){
                var html = "", len = $("#ctnRelease-content").find(".result-list").length;
                for(var i=0; i<data.length; i++) {
                    var item = "";
                    var statusTmp = "";
                    var index = len?len+i+1:i+1;
                    var status = data[i]["status"];
                    switch(status) {
                        case "B":
                          statusTmp = "<span>已订舱</span>";
                        break;
                        case "R":
                          statusTmp = "<span>已放箱</span>";
                        break;
                        case "N":
                          statusTmp = "<span>已拒绝</span>";
                        break;
                        case "P":
                          statusTmp = "<span>已打印</span>";
                        break;
                        case "T":
                          statusTmp = "<span>已领取</span>";
                        break;
                        case "C":
                          statusTmp = "<span>已提箱</span>";
                        break;   
                    }
                    Handlebars.registerPartial('status', statusTmp);
                    item = options.fn(data[i], {
                        data:{
                            index: index,
                            ctnindex: index-1
                        }
                    })
                    html+=item;
                }
                return html;
            }) 
            if(pageNum == 1){
                _renderFirstPage(data);
            }else{
                _renderNextPage(scroll, data);
            }
            J.Scroll("#ctnRelease-scroll");
            var timer3 = null;
            J.Refresh("#ctnRelease-scroll", "pullUp", function(){
                var scroll = this;
                pageNum++;
                clearTimeout(timer3);
                timer3 = setTimeout(function(){_getPage(scroll)},500);
            })
        });
    }
    var _renderFirstPage = function(data) {
        if(!data["list"].length) {
            J.Toast.show("info","没有找到任何数据！");
            return false;
        }
        ctnData = data["list"];
        J.Template.render("#ctnRelease-content", "ctnRelease-templ", data);
        J.hideMask();
    }
    var _renderNextPage = function(scroll, data) {
        if(!data["list"].length) {
            J.Toast.show("info","已经是最后一页了！");
            pageNum--;
            return false;
        }
        ctnData = ctnData.concat(data["list"]);
        J.Template.render("#ctnRelease-content", "ctnRelease-templ", data, "add");
        scroll.refresh();
        J.showToast("获取成功","success");
    }
})

App.page('ctn-detail',function(){
    var id, query;
    this.init = function(){
        
        $("#ctn-detail").on('pagehide',function(e,isBack){
            if(isBack) {
                $("#ctn-detail-content").empty();
            }
        });
    }
    
    this.load = function(){
        query = $("#ctn-detail").data("query");
        id = J.FindParm(query, "id");
        _getDetail();
    }
    
    var _getDetail = function(){
        var data = ctnData[id];
        var bookingType = "-"
        switch(data.bookingType) {
            case "S":
                bookingType = "船公司订舱";
            break;
            case "A":
                bookingType = "船代订舱";
        }
        Handlebars.registerPartial('bookingType', bookingType);
        J.Template.render("#ctn-detail-content", "ctn-detail-templ", data);
    }
})

App.page('ctn-info',function(){
    var id, query, newData={};
    this.init = function(){
        
        $("#ctn-info").on('pagehide',function(e,isBack){
            if(isBack) {
                $("#ctn-info-content").empty();
                $("#ctn-grid").empty();
            }
        });
    }
    
    this.load = function(){
        J.showMask();
        query = $("#ctn-info").data("query");
        id = J.FindParm(query, "id");
        _getInfo();
        $("#hgrid-scroll").on("tap", "a", function(){
            var text = $(this).text();
            var target = $("#ctn-info-content li.to[data-type^='"+text+"']")[0];
            J.Scroll("#ctn-info-scroll").scroller.scrollToElement(target,300);
            $(this).siblings().removeClass("active").end().addClass("active");
        })
    }
    
    var _getInfo = function(){
        FindData.getCtnInfo(id, function(data) {
            newData.list = data
            _getCtnNav(newData);
            _getCtnInfo(newData);
             J.hideMask();
        });
    }
        
    var _getCtnNav = function(data) {
        Handlebars.registerHelper("list", function(data,options){
            var html = "";
            for(var i=0;i<data.length;i++) {
                var item = "";
                var hasFirst = !!(i==0);
                item = options.fn(data[i], {
                    data:{
                        first: hasFirst
                    }
                })
                html+=item
            }
            return html;
        })
        J.Template.render("#ctn-grid", "ctn-info-nav", data);
        J.Scroll("#hgrid-scroll",{
            hScroll:true,
            hScrollbar : false
        });
    }
    
    var _getCtnInfo = function(data) {
        Handlebars.registerHelper("with", function(data,options){
            var html = "";
            for(var i=0;i<data.length;i++) {
                var item = "";
                var ctnRelease = "";
                var ctnTake = ""
                var ctnReleaseFlag = data[i]["ctnReleaseFlag"];
                var ctnTakeFlag = data[i]["ctnTakeFlag"];
                switch(ctnReleaseFlag) {
                    case "Y":
                        ctnRelease = "<span class='s1'>已放箱</span>";
                    break;
                    case "R":
                        ctnRelease = "<span class='s2'>已拒绝</span>";
                    break;
                    default:
                        ctnRelease = "<span class='s3'>未放箱</span>"; 
                }
                if(ctnTakeFlag=="Y") {
                    ctnTake = "<span class='s1'>已提箱</span>"
                } else {
                    ctnTake = "<span class='s2'>未提箱</span>"
                }
                Handlebars.registerPartial('ctnReleaseFlag', ctnRelease);
                Handlebars.registerPartial('ctnTakeFlag', ctnTake);
                item = options.fn(data[i]);
                html+=item
            }
            return html;
        });
        J.Template.render("#ctn-info-content", "ctn-info-templ", data);
        J.Scroll("#ctn-info-scroll");
        
    }
});

App.page("GPS-result", function(){
    var gpsMap, truckLis, newData={}; 
    this.init = function(){
        gpsMap = _createMap("gps-map", [121.676167,29.889518], 15);
    }
    this.load = function(){
        J.showMask();
        truckLis = $("#truckLis").val(); 
        _getTruck() 
    }
    
    var _getTruck = function(){
        FindData.getTruck(truckLis, function(data) {
            J.hideMask();
            newData["truckInfo"] = data;
            if($(".truck-block").length) {
                $(".truck-block").remove();
            }
            if(data.truckLicense) {
                var div = document.createElement("div");
                div.className = "truck-block";
                div.innerHTML = "<i class='ybticon gpsarrow'></i>"
                gpsMap.centerAndZoom(new BMap.Point(data.longitude, data.latitude), 15);
                var block = new _customBlock(new BMap.Point(data.longitude, data.latitude), div, data.direction);
                gpsMap.addOverlay(block);
                J.Template.render("#truck-info", "gps-tmepl", newData);
            } else {
                J.showToast('没有对应的车辆GPS信息！','info');
            }
            
        })
    }
   
        
        function _customBlock(center, div, rotate) {
            this.center = center;
            this.div = div;
            this.rotate = rotate;
            
        }
        
        //继承百度地图的Overlay类
        _customBlock.prototype = new BMap.Overlay();
        
        /* 初始化标注
         * @map {Object} 百度地图
         * @return {Object} 将创建的div返回，给map操作 
         * */
        _customBlock.prototype.initialize = function(map) {
                this.map = map;
                this.map.getPanes().floatPane.appendChild(this.div);
                //$(this.div).rotateScale({angle: -this.rotate})
                return this.div;    
        }
        
        //绘制
        _customBlock.prototype.draw = function() {
                var position = this.map.pointToOverlayPixel(this.center);    
                this.div.style.left = position.x-12 + "px";    
                this.div.style.top = position.y-15 + "px";
                this.div.style.WebkitTransform = "rotate("+ (this.rotate-45) +"deg)";
                this.div.style.Transform = "rotate("+ (this.rotate-45) +"deg)"
        }
     

})

/*--Jingle--*/
App.page('calendar',function(){
    this.init = function(){
        new J.Calendar('#calendar_demo',{
            onRenderDay : function(day,date){
                if(day == 5){
                    return '<div>'+day+'</div><div style="font-size: .8em;color: red">威武</div>'
                }
                return day;
            },
            onSelect:function(date){
                alert(date);
            }
        });
        $('#btn_popup_calendar').tap(function(){
            J.popup({
                html : '<div id="popup_calendar"></div>',
                pos : 'center',
                backgroundOpacity : 0.4,
                showCloseBtn : false,
                onShow : function(){
                    new J.Calendar('#popup_calendar',{
                        date : new Date(2013,7,1),
                        onSelect:function(date){
                            $('#btn_popup_calendar').text(date);
                            J.closePopup();
                        }
                    });
                }
            });
        });
    }
});
App.page('refresh',function(){
    this.init = function(){
        J.Refresh({
            selector : '#down_refresh_article',
            type : 'pullDown',
            pullText : '你敢往下拉么...',
            releaseText : '什么时候你才愿意放手？',
            refreshTip : '最后一次拉的人：<span style="color:#e222a5">骚年</span>',
            callback : function(){
                var scroll = this;
                setTimeout(function () {
                    $('#down_refresh_article ul.list li').text('嗯哈，长大后我就成了你~');
                    scroll.refresh();
                    J.showToast('更新成功','success');
                }, 2000);
            }
        });
//    最简约的调用方式
var timer = null;
        J.Refresh( '#up_refresh_article','pullUp', function(){
            var scroll = this;
            clearTimeout(timer);
            timer = setTimeout(function () {
                var html = '';
                for(var i=0;i<10;i++){
                    html += '<li style="color:#E74C3C">我是被拉出来的...</li>'
                }
                $('#up_refresh_article ul.list').append(html);
                scroll.refresh();
                J.showToast('加载成功','success');
            }, 2000);
        })
    }
});
App.page('scroll',function(){
    this.init = function(){
        $('#h_scroll_article').on('articleshow',function(){
            J.Scroll('#h_scroll_demo',{hScroll:true,hScrollbar : false});
        })
    }
});
App.page('menu',function(){
    this.init = function(){
        $.get('html/custom_aside.html',function(aside){
            $('#aside_container').append(aside);
        })
    }
});
App.page('layout',function(){
    this.init = function(){
        $('#layout_header_ctrl').on('change',function(event,el){
            J.alert('提示','你点了'+$(el).text());
        })
        $('#layout-btn-getmore').tap(function(){
            J.popup({
                html: '<div style="height: 100px;line-height: 100px;font-size: 20px;font-weight: 600;text-align: center;">这里展示更多功能</div>',
                pos : 'bottom-second',
                showCloseBtn : false
            });
        })
    }
});
App.page('popup',function(){
    this.init = function(){
        $('#btn_alert').tap(function(){
            J.alert('提示','这是一个Alert');
        })
        $('#btn_confirm').tap(function(){
            J.confirm('提示','这是一个Confirm！',function(){J.showToast('你选择了“确定”')},function(){J.showToast('你选择了“取消”')});
        })
        $('#btn_loading').tap(function(){
            J.showMask();
        })
        $('#btn_center').tap(function(){
            J.popup({
                html: '<div style="height: 100px;text-align: center;font-size: 20px;font-weight: 600;margin-top: 10px;color:#E74C3C ">随意设计你的弹出框吧</div>',
                pos : 'center'
            })
        })
        $('#btn_from_tpl').tap(function(){
            J.popup({
                tplId : 'tpl_popup_login',
                pos : 'center'
            })
        })
        $('#btn_t_top').tap(function(){
            J.popup({
                html: '这是一个来自顶部的弹出框',
                pos : 'top',
                showCloseBtn : false
            })
        })
        $('#btn_t_ts').tap(function(){
            J.popup({
                html: '这是一个在header之下的弹出框',
                pos : 'top-second',
                showCloseBtn : false
            })
        })
        $('#btn_t_bottom').tap(function(){
            J.popup({
                html: '这是一个来自底部弹出框',
                pos : 'bottom',
                showCloseBtn : false
            })
        })
        $('#btn_t_bs').tap(function(){
            J.popup({
                html: '这是一个在footer之上的弹出框',
                pos : 'bottom-second',
                showCloseBtn : false
            })
        })
        $('#btn_popover').tap(function(){
            J.popover('<ul class="list"><li style="color:#000;">Hello Jingle</li><li style="color:#000;">你好，Jingle</li></ul>',{top:'50px',left:'10%',right:'10%'},'top');
        });
        $('#btn_actionsheet').tap(function(){
            J.Popup.actionsheet([{
                text : '告诉QQ好友',
                handler : function(){
                    J.showToast('告诉QQ好友！');
                }
            },{
                text : '告诉MSN好友',
                handler : function(){
                    J.showToast('告诉MSN好友！');
                }
            }
            ]);
        });
    }
});
App.page('slider',function(){
    this.init = function(){
        var slider;
        $('#slider_section article').on('articleshow',function(){
            slider = new J.Slider({
                selector : '#slider_test',
                onBeforeSlide : function(){
                    return true;
                },
                onAfterSlide : function(i){
                    //alert(i);
                }
            });
        });
        $('#slider_prev').tap(function(){slider.prev()});
        $('#slider_next').tap(function(){slider.next()});
    }
});
App.page('toast',function(){
    this.init = function(){
        $('#btn_t_default').tap(function(){
            J.showToast('这是默认的Toast,默认3s后小时');
        })
        $('#btn_t_success').tap(function(){
            J.showToast('恭喜，success,5s后消失','success',5000);
        })
        $('#btn_t_error').tap(function(){
            J.showToast('抱歉，error','error');
        })
        $('#btn_t_info').tap(function(){
            J.showToast('提示，info','info');
        })
        $('#btn_t_top').tap(function(){
            J.showToast('更新了50条数据','toast top');
        })
    }
});
App.page('chart_line',function(){
    var line,$chart;
    this.init = function(){
        //重新设置canvas大小
        $chart = $('#line_canvas');
        var wh = App.calcChartOffset();
        $chart.attr('width',wh.width).attr('height',wh.height-30);

        renderLine();
        $('#changeLineType').on('change',function(e,el){
            updateChart(el.data('type'));
        })
    }

    function renderLine(){
        var data = {
            labels : ["一月","二月","三月","四月","五月","六月","七月",'八月','九月','十月','十一月','十二月'],
            datasets : [
                {
                    name : 'A产品',
                    color : "#72caed",
                    pointColor : "#95A5A6",
                    pointBorderColor : "#fff",
                    data : [65,59,90,81,56,55,40,20,13,20,11,60]
                },
                {
                    name : 'B产品',
                    color : "#a6d854",
                    pointColor : "#95A5A6",
                    pointBorderColor : "#fff",
                    data : [28,48,40,19,96,27,100,40,40,70,11,89]
                }
            ]
        }
        line = new JChart.Line(data,{
            id : 'line_canvas',
            smooth : false,
            fill : false
        });
        line.on('tap.point',function(d,i,j){
            J.alert(data.labels[i],d);
        });
        line.draw();
    }
    function updateChart(type){
        if(type == 'smooth'){
            line.refresh({
                smooth : true,
                fill : false
            });
        }else if(type == 'area'){
            line.refresh({
                smooth : true,
                fill : true
            });
        }else{
            line.refresh({
                smooth : false,
                fill : false
            });
        }

    }
});
App.page('chart_bar',function(){
    var $chart;
    this.init = function(){
        //重新设置canvas大小
        $chart = $('#bar_canvas');
        var wh = App.calcChartOffset();
        $chart.attr('width',wh.width).attr('height',wh.height);

        var data = {
            labels : ["一月","二月","三月","四月","五月","六月","七月",'八月','九月','十月','十一月','十二月'],
            datasets : [
                {
                    name : 'A产品',
                    color : "#72caed",
                    pointColor : "#95A5A6",
                    pointBorderColor : "#fff",
                    data : [65,59,90,81,56,55,40,20,13,20,11,60]
                },
                {
                    name : 'B产品',
                    color : "#a6d854",
                    pointColor : "#95A5A6",
                    pointBorderColor : "#fff",
                    data : [28,48,40,19,96,27,100,40,40,70,11,89]
                }
            ]
        }
        var bar = new JChart.Bar(data,{
            id : 'bar_canvas'
        });
        bar.on('tap.bar',function(d,i,j){
            J.alert(data.labels[i],d);
        });
        bar.on('longTap.bar',function(d,i,j){
            J.alert('提示',d+' = 按住750ms会出现此提示');
        });
        bar.draw();
    }
});
App.page('chart_pie',function(){
    var pie,$chart;
    this.init = function(){
        //重新设置canvas大小
        $chart = $('#pie_canvas');
        var wh = App.calcChartOffset();
        $chart.attr('width',wh.width).attr('height',wh.height-100);
        renderPie();
        $('#changePieType').on('change',function(e,el){
            updateChart(el.data('type'));
        })
    }

    function renderPie(){
        var pie_data = [
            {
                name : '直接访问',
                value: 335,
                color:"#F38630"
            },{
                name : '联盟广告',
                value : 234,
                color : "#E0E4CC"
            },{
                name : '视频广告',
                value : 135,
                color : "#72caed"
            },{
                name : '搜索引擎',
                value : 1400,
                color : "#a6d854"
            }
        ];
        pie = new JChart.Pie(pie_data,{
            id : 'pie_canvas',
            clickType : 'rotate'
        });
        pie.on('rotate',function(d,i,j){
            $('#pie_segment_info').html(d.name + '    '+ d.value).show();
        });
        pie.draw();
    }
    function updateChart(type){
        $('#pie_segment_info').hide();
        if(type == 'pie'){
            pie.refresh({
                isDount : false
            });
        }else if(type == 'dount'){
            pie.refresh({
                isDount : true,
                dountText : '访问来源'
            });
        }

    }
});
App.page('chart_drag',function(){
    var $lineChart,$barChart;
    this.init = function(){
        //重新设置canvas大小
        $lineChart = $('#chart_drag_line_canvas');
        $barChart = $('#chart_drag_bar_canvas');
        var wh = App.calcChartOffset();
        $lineChart.attr('width',wh.width).attr('height',wh.height-30);
        $barChart.attr('width',wh.width).attr('height',wh.height-30);
        var data = {
            labels : ["2012","二月","三月","四月","五月","六月","七月",'八月','九月','十月','十一月','十二月','2013',"二月","三月","四月","五月","六月","七月",'八月','九月','十月','十一月','十二月','2014','一月','二月'],
            datasets : [
                {
                    name : 'A产品',
                    color : "#72caed",
                    pointColor : "#95A5A6",
                    pointBorderColor : "#fff",
                    data : [65,59,90,81,56,55,40,20,13,20,11,60,65,59,90,81,56,55,40,20,11,20,10,60,11,60,65]
                },
                {
                    name : 'B产品',
                    color : "#a6d854",
                    pointColor : "#95A5A6",
                    pointBorderColor : "#fff",
                    data : [28,48,40,19,96,27,100,40,40,70,11,89,28,48,40,19,96,27,100,40,40,70,10,89,28,48,40]
                }
            ]
        }
        $('#changeDragChartType').on('change',function(e,el){
            renderChart(el.data('type'),data);
        })
        renderChart('line',data);
    }
    var renderChart = function(type,data){
        if(type == 'line'){
            $lineChart.show();
            $barChart.hide();
            new JChart.Line(data,{
                id : 'chart_drag_line_canvas',
                datasetGesture : true,
                datasetOffsetNumber : 10
            }).draw(true);
        }else{
            $lineChart.hide();
            $barChart.show();
            new JChart.Bar(data,{
                id : 'chart_drag_bar_canvas',
                datasetGesture : true,
                datasetOffsetNumber : 10
            }).draw(true);
        }
    }
});
App.page('chart_dynamic',function(){
    var pause = false,$chart;
    var datasets = [[65,59,90,81,56,55,40,20,3,20,10,60],[28,48,40,19,96,27,100,40,40,70,10,89]];
    var data = {
        labels : ["一月","二月","三月","四月","五月","六月","七月",'八月','九月','十月','十一月','十二月'],
        datasets : [
            {
                name : 'A产品',
                color : "#72caed",
                pointColor : "#95A5A6",
                pointBorderColor : "#fff",
                data : datasets[0]
            },
            {
                name : 'B产品',
                color : "#a6d854",
                pointColor : "#95A5A6",
                pointBorderColor : "#fff",
                data : datasets[1]
            }
        ]
    }

    this.init = function(){
        //重新设置canvas大小
        $chart = $('#dynamic_line_canvas');
        var wh = App.calcChartOffset();
        $chart.attr('width',wh.width).attr('height',wh.height-30);
        var line = new JChart.Line(data,{
            id : 'dynamic_line_canvas'
        });
        line.draw();
        refreshChart(line);
        $('#pause_dynamic_chart').on('tap',function(){
            pause = !pause;
            $(this).text(pause?'继续':'暂停');
        })
    }

    function refreshChart(chart){
        setTimeout(function(){
            if(!pause){
                datasets[0].shift();
                datasets[0].push(Math.floor(Math.random()*100));
                datasets[1].shift();
                datasets[1].push(Math.floor(Math.random()*100));
                chart.load(data);
            }
            refreshChart(chart);
        },1000);
    }
});
App.page('form',function(){
    this.init = function(){
        alert('init');
        $('#checkbox_1').on('change',function(){
            alert($(this).data('checkbox'));
        })
    }
})

App.run();
