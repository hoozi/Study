/**
 * @build: 2014-10-30
 * @NAME : lazyload
 */
/*!
 * Cloudgamer JavaScript Library v0.1
 * Copyright (c) 2009 cloudgamer
 * Blog: http://cloudgamer.cnblogs.com/
 * Date: 2009-10-15
 */

var $$, $$B, $$A, $$F, $$D, $$E, $$CE, $$S;

(function(undefined){

var O, B, A, F, D, E, CE, S;


/*Object*/

O = function (id) {
    return "string" == typeof id ? document.getElementById(id) : id;
};

O.emptyFunction = function(){};

O.extend = function (destination, source, override) {
    if (override === undefined) override = true;
    for (var property in source) {
        if (override || !(property in destination)) {
            destination[property] = source[property];
        }
    }
    return destination;
};

O.deepextend = function (destination, source) {
    for (var property in source) {
        var copy = source[property];
        if ( destination === copy ) continue;
        if ( typeof copy === "object" ){
            destination[property] = arguments.callee( destination[property] || {}, copy );
        }else{
            destination[property] = copy;
        }
    }
    return destination;
};

/*from youa*/
O.wrapper = function(me, parent) {
    var ins = function() { me.apply(this, arguments); };
    var subclass = function() {};
    subclass.prototype = parent.prototype;
    ins.prototype = new subclass;
    return ins;
};


/*Browser*/

/*from youa*/
B = (function(ua){
    var b = {
        msie: /msie/.test(ua) && !/opera/.test(ua),
        opera: /opera/.test(ua),
        safari: /webkit/.test(ua) && !/chrome/.test(ua),
        firefox: /firefox/.test(ua),
        chrome: /chrome/.test(ua)
    };
    var vMark = "";
    for (var i in b) {
        if (b[i]) { vMark = "safari" == i ? "version" : i; break; }
    }
    b.version = vMark && RegExp("(?:" + vMark + ")[\\/: ]([\\d.]+)").test(ua) ? RegExp.$1 : "0";
    
    b.ie = b.msie;
    b.ie6 = b.msie && parseInt(b.version, 10) == 6;
    b.ie7 = b.msie && parseInt(b.version, 10) == 7;
    b.ie8 = b.msie && parseInt(b.version, 10) == 8;
    
    return b;
})(window.navigator.userAgent.toLowerCase());


/*Array*/

A = function(){
    
    var ret = {
        isArray: function( obj ) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },
        indexOf: function( array, elt, from ){
            if (array.indexOf) {
                return isNaN(from) ? array.indexOf(elt) : array.indexOf(elt, from);
            } else {
                var len = array.length;
                from = isNaN(from) ? 0
                    : from < 0 ? Math.ceil(from) + len : Math.floor(from);
                
                for ( ; from < len; from++ ) { if ( array[from] === elt ) return from; }
                return -1;
            }
        },
        lastIndexOf: function( array, elt, from ){
            if (array.lastIndexOf) {
                return isNaN(from) ? array.lastIndexOf(elt) : array.lastIndexOf(elt, from);
            } else {
                var len = array.length;
                from = isNaN(from) || from >= len - 1 ? len - 1
                    : from < 0 ? Math.ceil(from) + len : Math.floor(from);
                
                for ( ; from > -1; from-- ) { if ( array[from] === elt ) return from; }
                return -1;
            }
        }
    };
    
    function each( object, callback ) {
        if ( undefined === object.length ){
            for ( var name in object ) {
                if (false === callback( object[name], name, object )) break;
            }
        } else {
            for ( var i = 0, len = object.length; i < len; i++ ) {
                if (i in object) { if (false === callback( object[i], i, object )) break; }
            }
        }
    };
    
    each({
            forEach: function( object, callback, thisp ){
                each( object, function(){ callback.apply(thisp, arguments); } );
            },
            map: function( object, callback, thisp ){
                var ret = [];
                each( object, function(){ ret.push(callback.apply(thisp, arguments)); });
                return ret;
            },
            filter: function( object, callback, thisp ){
                var ret = [];
                each( object, function(item){
                        callback.apply(thisp, arguments) && ret.push(item);
                    });
                return ret;
            },
            every: function( object, callback, thisp ){
                var ret = true;
                each( object, function(){
                        if ( !callback.apply(thisp, arguments) ){ ret = false; return false; };
                    });
                return ret;
            },
            some: function( object, callback, thisp ){
                var ret = false;
                each( object, function(){
                        if ( callback.apply(thisp, arguments) ){ ret = true; return false; };
                    });
                return ret;
            }
        }, function(method, name){
            ret[name] = function( object, callback, thisp ){
                if (object[name]) {
                    return object[name]( callback, thisp );
                } else {
                    return method( object, callback, thisp );
                }
            };
        });
    
    return ret;
}();


/*Function*/

F = (function(){
    var slice = Array.prototype.slice;
    return {
        bind: function( fun, thisp ) {
            var args = slice.call(arguments, 2);
            return function() {
                return fun.apply(thisp, args.concat(slice.call(arguments)));
            };
        },
        bindAsEventListener: function( fun, thisp ) {
            var args = slice.call(arguments, 2);
            return function(event) {
                return fun.apply(thisp, [E.fixEvent(event)].concat(args));
            };
        }
    };
})();


/*Dom*/

D = {
    getScrollTop: function(node) {
        var doc = node ? node.ownerDocument : document;
        return doc.documentElement.scrollTop || doc.body.scrollTop;
    },
    getScrollLeft: function(node) {
        var doc = node ? node.ownerDocument : document;
        return doc.documentElement.scrollLeft || doc.body.scrollLeft;
    },
    contains: document.defaultView
        ? function (a, b) { return !!( a.compareDocumentPosition(b) & 16 ); }
        : function (a, b) { return a != b && a.contains(b); },
    rect: function(node){
        var left = 0, top = 0, right = 0, bottom = 0;
        //ie8的getBoundingClientRect获取不准确
        if ( !node.getBoundingClientRect || B.ie8 ) {
            var n = node;
            while (n) { left += n.offsetLeft, top += n.offsetTop; n = n.offsetParent; };
            right = left + node.offsetWidth; bottom = top + node.offsetHeight;
        } else {
            var rect = node.getBoundingClientRect();
            left = right = D.getScrollLeft(node); top = bottom = D.getScrollTop(node);
            left += rect.left; right += rect.right;
            top += rect.top; bottom += rect.bottom;
        };
        return { "left": left, "top": top, "right": right, "bottom": bottom };
    },
    clientRect: function(node) {
        var rect = D.rect(node), sLeft = D.getScrollLeft(node), sTop = D.getScrollTop(node);
        rect.left -= sLeft; rect.right -= sLeft;
        rect.top -= sTop; rect.bottom -= sTop;
        return rect;
    },
    curStyle: document.defaultView
        ? function (elem) { return document.defaultView.getComputedStyle(elem, null); }
        : function (elem) { return elem.currentStyle; },
    getStyle: document.defaultView
        ? function (elem, name) {
            var style = document.defaultView.getComputedStyle(elem, null);
            return name in style ? style[ name ] : style.getPropertyValue( name );
        }
        : function (elem, name) {
            var style = elem.style, curStyle = elem.currentStyle;
            //透明度 from youa
            if ( name == "opacity" ) {
                if ( /alpha\(opacity=(.*)\)/i.test(curStyle.filter) ) {
                    var opacity = parseFloat(RegExp.$1);
                    return opacity ? opacity / 100 : 0;
                }
                return 1;
            }
            if ( name == "float" ) { name = "styleFloat"; }
            var ret = curStyle[ name ] || curStyle[ S.camelize( name ) ];
            //单位转换 from jqury
            if ( !/^-?\d+(?:px)?$/i.test( ret ) && /^\-?\d/.test( ret ) ) {
                var left = style.left, rtStyle = elem.runtimeStyle, rsLeft = rtStyle.left;
                
                rtStyle.left = curStyle.left;
                style.left = ret || 0;
                ret = style.pixelLeft + "px";
                
                style.left = left;
                rtStyle.left = rsLeft;
            }
            return ret;
        },
    setStyle: function(elems, style, value) {
        if ( !elems.length ) { elems = [ elems ]; }
        if ( typeof style == "string" ) { var s = style; style = {}; style[s] = value; }
        A.forEach( elems, function(elem ) {
            for (var name in style) {
                var value = style[name];
                if (name == "opacity" && B.ie) {
                    //ie透明度设置 from jquery
                    elem.style.filter = (elem.currentStyle && elem.currentStyle.filter || "").replace( /alpha\([^)]*\)/, "" ) + " alpha(opacity=" + (value * 100 | 0) + ")";
                } else if (name == "float") {
                    elem.style[ B.ie ? "styleFloat" : "cssFloat" ] = value;
                } else {
                    elem.style[ S.camelize( name ) ] = value;
                }
            };
        });
    },
    getSize: function(elem) {
        var width = elem.offsetWidth, height = elem.offsetHeight;
        if ( !width && !height ) {
            var repair = !D.contains( document.body, elem ), parent;
            if ( repair ) {//如果元素不在body上
                parent = elem.parentNode;
                document.body.insertBefore(elem, document.body.childNodes[0]);
            }
            var style = elem.style,
                cssShow = { position: "absolute", visibility: "hidden", display: "block", left: "-9999px", top: "-9999px" },
                cssBack = { position: style.position, visibility: style.visibility, display: style.display, left: style.left, top: style.top };
            D.setStyle( elem, cssShow );
            width = elem.offsetWidth; height = elem.offsetHeight;
            D.setStyle( elem, cssBack );
            if ( repair ) {
                parent ? parent.appendChild(elem) : document.body.removeChild(elem);
            }
        }
        return { "width": width, "height": height };
    }
};


/*Event*/
E = (function(){
    /*from dean edwards*/
    var addEvent, removeEvent, guid = 1,
        storage = function( element, type, handler ){
            if (!handler.$$guid) handler.$$guid = guid++;
            if (!element.events) element.events = {};
            var handlers = element.events[type];
            if (!handlers) {
                handlers = element.events[type] = {};
                if (element["on" + type]) {
                    handlers[0] = element["on" + type];
                }
            }
        };
    if ( window.addEventListener ) {
        var fix = { "mouseenter": "mouseover", "mouseleave": "mouseout" };
        addEvent = function( element, type, handler ){
            if ( type in fix ) {
                storage( element, type, handler );
                var fixhandler = element.events[type][handler.$$guid] = function(event){
                    var related = event.relatedTarget;
                    if ( !related || (element != related && !(element.compareDocumentPosition(related) & 16)) ){
                        handler.call(this, event);
                    }
                };
                element.addEventListener(fix[type], fixhandler, false);
            } else {
                element.addEventListener(type, handler, false);
            };
        };
        removeEvent = function( element, type, handler ){
            if ( type in fix ) {
                if (element.events && element.events[type]) {
                    element.removeEventListener(fix[type], element.events[type][handler.$$guid], false);
                    delete element.events[type][handler.$$guid];
                }
            } else {
                element.removeEventListener(type, handler, false);
            };
        };
    } else {
        addEvent = function( element, type, handler ){
            storage( element, type, handler );
            element.events[type][handler.$$guid] = handler;
            element["on" + type] = handleEvent;
        };
        removeEvent = function( element, type, handler ){
            if (element.events && element.events[type]) {
                delete element.events[type][handler.$$guid];
            }
        };
        function handleEvent() {
            var returnValue = true, event = fixEvent();
            var handlers = this.events[event.type];
            for (var i in handlers) {
                this.$$handleEvent = handlers[i];
                if (this.$$handleEvent(event) === false) {
                    returnValue = false;
                }
            }
            return returnValue;
        };
    }
    
    function fixEvent(event) {
        if (event) return event;
        event = window.event;
        event.pageX = event.clientX + D.getScrollLeft(event.srcElement);
        event.pageY = event.clientY + D.getScrollTop(event.srcElement);
        event.target = event.srcElement;
        event.stopPropagation = stopPropagation;
        event.preventDefault = preventDefault;
        var relatedTarget = {
                "mouseout": event.toElement, "mouseover": event.fromElement
            }[ event.type ];
        if ( relatedTarget ){ event.relatedTarget = relatedTarget;}
        
        return event;
    };
    function stopPropagation() { this.cancelBubble = true; };
    function preventDefault() { this.returnValue = false; };
    
    return {
        "addEvent": addEvent,
        "removeEvent": removeEvent,
        "fixEvent": fixEvent
    };
})();


/*CustomEvent*/

CE = (function(){
    var guid = 1;
    return {
        addEvent: function( object, type, handler ){
            if (!handler.$$$guid) handler.$$$guid = guid++;
            if (!object.cusevents) object.cusevents = {};
            if (!object.cusevents[type]) object.cusevents[type] = {};
            object.cusevents[type][handler.$$$guid] = handler;
        },
        removeEvent: function( object, type, handler ){
            if (object.cusevents && object.cusevents[type]) {
                delete object.cusevents[type][handler.$$$guid];
            }
        },
        fireEvent: function( object, type ){
            if (!object.cusevents) return;
            var args = Array.prototype.slice.call(arguments, 2),
                handlers = object.cusevents[type];
            for (var i in handlers) {
                handlers[i].apply(object, args);
            }
        },
        clearEvent: function( object ){
            if (!object.cusevents) return;
            for (var type in object.cusevents) {
                var handlers = object.cusevents[type];
                for (var i in handlers) {
                    handlers[i] = null;
                }
                object.cusevents[type] = null;
            }
            object.cusevents = null;
        }
    };
})();


/*String*/

S = {
    camelize: function(s){
        return s.replace(/-([a-z])/ig, function(all, letter) { return letter.toUpperCase(); });
    }
};


/*System*/

// remove css image flicker
if (B.ie6) {
    try {
        document.execCommand("BackgroundImageCache", false, true);
    } catch(e) {}
};


/*define*/

$$ = O; $$B = B; $$A = A; $$F = F; $$D = D; $$E = E; $$CE = CE; $$S = S;

})();

var LazyLoad = function(elems, options) {
    //初始化程序
    this._initialize(elems, options);
    //如果没有元素就退出
    if ( this.isFinish() ) return;
    //初始化模式设置
    this._initMode();
    //进行第一次触发
    this.resize(true);
};

LazyLoad.prototype = {
  //初始化程序
  _initialize: function(elems, options) {
    this._elems = elems;//加载元素集合
    this._rect = {};//容器位置参数对象
    this._range = {};//加载范围参数对象
    this._loadData = null;//加载程序
    this._timer = null;//定时器
    this._lock = false;//延时锁定
    //静态使用属性
    this._index = 0;//记录索引
    this._direction = 0;//记录方向
    this._lastScroll = { "left": 0, "top": 0 };//记录滚动值
    this._setElems = function(){};//重置元素集合程序
    
    var opt = this._setOptions(options);
    
    this.delay = opt.delay;
    this.threshold = opt.threshold;
    this.beforeLoad = opt.beforeLoad;
    
    this._onLoadData = opt.onLoadData;
    this._container = this._initContainer($$(this.options.container));//容器
  },
  //设置默认属性
  _setOptions: function(options) {
    this.options = {//默认值
        container:  window,//容器
        mode:       "dynamic",//模式
        threshold:  0,//加载范围阈值
        delay:      100,//延时时间
        beforeLoad: function(){},//加载前执行
        onLoadData: function(){}//显示加载数据
    };
    return $$.extend(this.options, options || {});
  },
  //初始化容器设置
  _initContainer: function(container) {
    var doc = document,
        isWindow = container == window || container == doc
            || !container.tagName || (/^(?:body|html)$/i).test( container.tagName );
    if ( isWindow ) {
        container = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
    }
    //定义执行方法
    var oThis = this, width = 0, height = 0;
    this.load = $$F.bind( this._load, this );
    this.resize = $$F.bind( this._resize, this );
    this.delayLoad = function() { oThis._delay( oThis.load ); };
    this.delayResize = function(){//防止重复触发bug
        var clientWidth = container.clientWidth,
            clientHeight = container.clientHeight;
        if( clientWidth != width || clientHeight != height ) {
            width = clientWidth; height = clientHeight;
            oThis._delay( oThis.resize );
        }
    };
    //记录绑定元素方便移除
    this._binder = isWindow ? window : container;
    //绑定事件
    $$E.addEvent( this._binder, "scroll", this.delayLoad );
    isWindow && $$E.addEvent( this._binder, "resize", this.delayResize );
    //获取容器位置参数函数
    this._getContainerRect = isWindow && ( "innerHeight" in window )
        ? function(){ return {
                "left": 0, "right": window.innerWidth,
                "top":  0, "bottom":window.innerHeight
            };}
        : function(){ return oThis._getRect(container); }   ;
    //设置获取scroll值函数
    this._getScroll = isWindow
        ? function() { return {
                "left": $$D.getScrollLeft(), "top": $$D.getScrollTop()
            };}
        : function() { return {
                "left": container.scrollLeft, "top": container.scrollTop
            };};
    return container;
  },
  //初始化模式设置
  _initMode: function() {
    switch ( this.options.mode.toLowerCase() ) {
        case "vertical" ://垂直方向
            this._initStatic( "vertical", "vertical" );
            break;
        case "horizontal" ://水平方向
            this._initStatic( "horizontal", "horizontal" );
            break;
        case "cross" :
        case "cross-vertical" ://垂直正交方向
            this._initStatic( "cross", "vertical" );
            break;
        case "cross-horizontal" ://水平正交方向
            this._initStatic( "cross", "horizontal" );
            break;
        case "dynamic" ://动态加载
        default :
            this._loadData = this._loadDynamic;
    }
  },
  //初始化静态加载设置
  _initStatic: function(mode, direction) {
    //设置模式
    var isVertical = direction == "vertical";
    if ( mode == "cross" ) {
        this._crossDirection = $$F.bind( this._getCrossDirection, this,
            isVertical ? "_verticalDirection" : "_horizontalDirection",
            isVertical ? "_horizontalDirection" : "_verticalDirection" );
    }
    //设置元素
    var pos = isVertical ? "top" : "left",
        sortFunction = function( x, y ) { return x._rect[ pos ] - y._rect[ pos ]; },
        getRect = function( elem ) { elem._rect = this._getRect(elem); return elem; };
    this._setElems = function() {//转换数组并排序
        this._elems = $$A.map( this._elems, getRect, this ).sort( sortFunction );
    };
    //设置加载函数
    this._loadData = $$F.bind( this._loadStatic, this,
        "_" + mode + "Direction",
        $$F.bind( this._outofRange, this, mode, "_" + direction + "BeforeRange" ),
        $$F.bind( this._outofRange, this, mode, "_" + direction + "AfterRange" ) );
  },
  //延时程序
  _delay: function(run) {
    clearTimeout(this._timer);
    if ( this.isFinish() ) return;
    var oThis = this, delay = this.delay;
    if ( this._lock ) {//防止连续触发
        this._timer = setTimeout( function(){ oThis._delay(run); }, delay );
    } else {
        this._lock = true; run();
        setTimeout( function(){ oThis._lock = false; }, delay );
    }
  },
  //重置范围参数并加载数据
  _resize: function(change) {
    if ( this.isFinish() ) return;
    this._rect = this._getContainerRect();
    //位置改变的话需要重置元素位置
    if ( change ) { this._setElems(); }
    this._load(true);
  },
  //加载程序
  _load: function(force) {
    if ( this.isFinish() ) return;
    var rect = this._rect, scroll = this._getScroll(),
        left = scroll.left, top = scroll.top,
        threshold = Math.max( 0, this.threshold | 0 );
    //记录原始加载范围参数
    this._range = {
        top:    rect.top + top - threshold,
        bottom: rect.bottom + top + threshold,
        left:   rect.left + left - threshold,
        right:  rect.right + left + threshold
    };
    //加载数据
    this.beforeLoad();
    this._loadData(force);
  },
  //动态加载程序
  _loadDynamic: function() {
    this._elems = $$A.filter( this._elems, function( elem ) {
            return !this._insideRange( elem );
        }, this );
  },
  //静态加载程序
  _loadStatic: function(direction, beforeRange, afterRange, force) {
    //获取方向
    direction = this[ direction ]( force );
    if ( !direction ) return;
    //根据方向历遍图片对象
    var elems = this._elems, i = this._index,
        begin = [], middle = [], end = [];
    if ( direction > 0 ) {//向后滚动
        begin = elems.slice( 0, i );
        for ( var len = elems.length ; i < len; i++ ) {
            if ( afterRange( middle, elems[i] ) ) {
                end = elems.slice( i + 1 ); break;
            }
        }
        i = begin.length + middle.length - 1;
    } else {//向前滚动
        end = elems.slice( i + 1 );
        for ( ; i >= 0; i-- ) {
            if ( beforeRange( middle, elems[i] ) ) {
                begin = elems.slice( 0, i ); break;
            }
        }
        middle.reverse();
    }
    this._index = Math.max( 0, i );
    this._elems = begin.concat( middle, end );
  },
  //垂直和水平滚动方向获取程序
  _verticalDirection: function(force) {
      return this._getDirection( force, "top" );
  }, 
  _horizontalDirection: function(force) {
      return this._getDirection( force, "left" );
  },
  //滚动方向获取程序
  _getDirection: function(force, scroll) {
    var now = this._getScroll()[ scroll ], _scroll = this._lastScroll;
    if ( force ) { _scroll[ scroll ] = now; this._index = 0; return 1; }
    var old = _scroll[ scroll ]; _scroll[ scroll ] = now;
    return now - old;
  },
  //cross滚动方向获取程序
  _getCrossDirection: function(primary, secondary, force) {
    var direction;
    if ( !force ) {
        direction = this[ primary ]();
        secondary = this[ secondary ]();
        if ( !direction && !secondary ) {//无滚动
            return 0;
        } else if ( !direction ) {//次方向滚动
            if ( this._direction ) {
                direction = -this._direction;//用上一次的相反方向
            } else {
                force = true;//没有记录过方向
            }
        } else if ( secondary && direction * this._direction >= 0 ) {
            force = true;//同时滚动并且方向跟上一次滚动相同
        }
    }
    if ( force ) {
        this._lastScroll = this._getScroll(); this._index = 0; direction = 1;
    }
    return ( this._direction = direction );
  },
  //判断是否加载范围内
  _insideRange: function(elem, mode) {
    var range = this._range, rect = elem._rect || this._getRect(elem),
        insideH = rect.right >= range.left && rect.left <= range.right,
        insideV = rect.bottom >= range.top && rect.top <= range.bottom,
        inside = {
                "horizontal":   insideH,
                "vertical":     insideV,
                "cross":        insideH && insideV
            }[ mode || "cross" ];
    //在加载范围内加载数据
    if ( inside ) { this._onLoadData(elem); }
    return inside;
  },
  //判断是否超过加载范围
  _outofRange: function(mode, compare, middle, elem) {
    if ( !this._insideRange( elem, mode ) ) {
        middle.push(elem);
        return this[ compare ]( elem._rect );
    }
  },
  _horizontalBeforeRange: function(rect) { return rect.right < this._range.left; },
  _horizontalAfterRange: function(rect) { return rect.left > this._range.right; },
  _verticalBeforeRange: function(rect) { return rect.bottom < this._range.top; },
  _verticalAfterRange: function(rect) { return rect.top > this._range.bottom; },
  //获取位置参数
  _getRect: function(node) {
    var n = node, left = 0, top = 0;
    while (n) { left += n.offsetLeft; top += n.offsetTop; n = n.offsetParent; };
    return {
        "left": left, "right": left + node.offsetWidth,
        "top": top, "bottom": top + node.offsetHeight
    };
  },
  //是否完成加载
  isFinish: function() {
    if ( !this._elems || !this._elems.length ) {
        this.dispose(); return true;
    } else {
        return false;
    }
  },
  //销毁程序
  dispose: function(load) {
    clearTimeout(this._timer);
    if ( this._elems || this._binder ) {
        //加载全部元素
        if ( load && this._elems ) {
            $$A.forEach( this._elems, this._onLoadData, this );
        }
        //清除关联
        $$E.removeEvent( this._binder, "scroll", this.delayLoad );
        $$E.removeEvent( this._binder, "resize", this.delayResize );
        this._elems = this._binder = null;
    }
  }
};

var ImagesLazyLoad = $$.wrapper(function(options) {
    this._initialize( options );
    //如果没有元素就退出
    if ( this.isFinish() ) return;
    //初始化模式设置
    this._initMode();
    //进行第一次触发
    this.resize(true);
}, LazyLoad);

$$.extend( ImagesLazyLoad.prototype, {
  //初始化程序
  _initialize: function(options) {
    LazyLoad.prototype._initialize.call(this, [], options);
    //设置子类属性
    var opt = this.options;
    this.onLoad = opt.onLoad;
    var attribute = this._attribute = opt.attribute;
    //设置加载图片集合
    var getSrc = opt.getSrc,
        filter = $$F.bind( this._filter, this,
                opt["class"],
                getSrc ? function(img){ return getSrc(img); }
                    : function(img){ return img.getAttribute( attribute ) || img.src; },
                opt.holder
            );
    this._elems = $$A.filter(
            opt.images || this._container.getElementsByTagName("img"), filter
        );
    //判断属性是否已经加载的方法
    this._hasAttribute = $$B.ie6 || $$B.ie7
        ? function(img){ return attribute in img; }
        : function(img){ return img.hasAttribute( attribute ); };
  },
  //设置默认属性
  _setOptions: function(options) {
    return LazyLoad.prototype._setOptions.call(this, $$.extend({//默认值
        images:     undefined,//图片集合
        attribute:  "data-src",//保存原图地址的自定义属性
        holder:     "",//占位图
        "class":    "",//筛选样式
        getSrc:     undefined,//获取原图地址程序
        onLoad:     function(){}//加载时执行
    }, $$.extend( options, {
        onLoadData: this._onLoadData
    })));
  },
  //筛选整理图片对象
  _filter: function(className, getSrc, holder, img) {
    if ( className && (" " + img.className + " ").indexOf(" " + className + " ") == -1 ) return false;//排除样式不对应的
    //获取原图地址
    var src = getSrc(img);
    if ( !src ) return false;//排除src不存在的
    if ( src == img.src ) {
        //排除已经加载或不能停止加载的
        if ( img.complete || $$B.chrome || $$B.safari ) return false;
        img.removeAttribute("src");//移除src
    }
    if ( holder ) { img.src = holder; }
    //用自定义属性记录原图地址
    img.setAttribute( this._attribute, src );
    return true;
  },
  //显示图片
  _onLoadData: function(img) {
    var attribute = this._attribute;
    if ( this._hasAttribute( img ) ) {
        img.src = img.getAttribute( attribute );
        img.removeAttribute( attribute );
        this.onLoad( img );
    }
  }
});
