/**
 * Util 工具类实现，前端常用的方法集
 * @version 1.0.0
 * @author ccy
 * @date 2018/11/05
 * @param root
 */
(function(root){
	root.Util = {
		/** 简单的数组去重（主要针对数组元素为number类型） */
		arrayDeduplication: function(arr){
			return arr.sort().reduce(function(init, current){
				if(init.length === 0 || init[init.length - 1] !== current) init.push(current)
				return init;
			}, []);	
		},
		/** 判断null (js 中的bug之一，typeof null 返回 object)*/
		isNull: function(obj){
			if(!obj && typeof obj === 'object'){
				return true;
			}
			return false;
		},
		/**
		 * 深拷贝函数
		 * */
		clone: function(obj){
			function getType(obj){
				return Object.prototype.toString.call(obj).slice(8,-1);
			}
			function getReg(a){
				var c = a.lastIndexOf('/');
				var reg = a.substring(1,c);
				var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t', '\w': '\\w', '\s': '\\s', '\d': '\\d'};
				for(var i in escMap){
					if(reg.indexOf(i)){
						reg.replace(i,escMap[i]);
					}
				}
				var attr = a.substring(c+1);
				return new RegExp(reg, attr);
			}
			var construct = getType(obj);
			var res;
			if(construct === 'Array'){
				res = [];
			}else if(construct === 'Object'){
				res = {}
			}
			for(var item in obj){
				if(obj[item] === obj) continue;//存在引用则跳出当前循环
				if(getType(obj[item]) === 'Function'){
					res[item] = new Function("return "+obj[item].toString())();
				}else if(getType(obj[item]) === 'RegExp'){
					res[item] = getReg(obj[item].toString());
				}else if(getType(obj[item]) === 'Object'){
					res[item] = clone(obj[item]);
				}else{
					res[item] = obj[item];
				}
			}
			return res;
		},
		/**
		 * json与字符串相互转化
		 * */
		json2Str: function(obj){
			return JSON.stringify(obj);
		},
		str2Json: function(str){
			return JSON.parse(str);
		},
		/**
		 * 初始化
		 * */
		init: function(){
			this.extend();
			this.override.init();
		},
		/**
		 * 当前浏览器不支持 requestAnimationFrame、bind、JSON 进行重写
		 * */
		override: {
			/** 仅支持Object.defineProperty JavaScript引擎,实现Array.prototype.reduce polyfill */
			arrayReduce: function(){
				if (!Array.prototype.reduce) {
				    Object.defineProperty(Array.prototype, 'reduce', {
					value: function(callback /*, initialValue*/) {
					    if (this === null) {
						throw new TypeError( 'Array.prototype.reduce called on null or undefined' );
					    }
					    if (typeof callback !== 'function') {
						throw new TypeError( callback + ' is not a function');
					    }
					    var o = Object(this),
						len = o.length >>> 0,
						k = 0,
						value;
					    if (arguments.length >= 2) {
						value = arguments[1];
					    } else {
						while (k < len && !(k in o)) {
						    k++;
						}
						if (k >= len) throw new TypeError( 'Reduce of empty array with no initial value' );
						value = o[k++];
					    }
					    while (k < len) {
						if (k in o) value = callback(value, o[k], k, o);
						k++;
					    }
					    return value;
					}
				    });
				}else{
					return Array.prototype.reduce;
				}
			}
			/**
			 * 兼容window.JSON
			 * 详情参见：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON
			 * */
			JSON: function(){
				if (!window.JSON) {
					  window.JSON = {
					    parse: function(sJSON) { return eval('(' + sJSON + ')'); },
					    stringify: (function () {
					      var toString = Object.prototype.toString;
					      var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
					      var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
					      var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
					      var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
					      return function stringify(value) {
						if (value == null) {
						  return 'null';
						} else if (typeof value === 'number') {
						  return isFinite(value) ? value.toString() : 'null';
						} else if (typeof value === 'boolean') {
						  return value.toString();
						} else if (typeof value === 'object') {
						  if (typeof value.toJSON === 'function') {
						    return stringify(value.toJSON());
						  } else if (isArray(value)) {
						    var res = '[';
						    for (var i = 0; i < value.length; i++)
						      res += (i ? ', ' : '') + stringify(value[i]);
						    return res + ']';
						  } else if (toString.call(value) === '[object Object]') {
						    var tmp = [];
						    for (var k in value) {
						      if (value.hasOwnProperty(k))
							tmp.push(stringify(k) + ': ' + stringify(value[k]));
						    }
						    return '{' + tmp.join(', ') + '}';
						  }
						}
						return '"' + value.toString().replace(escRE, escFunc) + '"';
					      };
					    })()
					  };
					}
			},
			/**
			 * 兼容性问题重写bind
			 * */
			bind: function(){
				if(!Function.prototype.bind){
					Function.prototype.bind = function(ctx){
						var self = this, boundArgs = arguments;
						return function(){
							var args = [];
							for(var i=1;i<boundArgs.length;i++){
								args.push(boundArgs[i]);
							}
							for(var i=0;i<arguments.length;i++){
								args.push(arguments[i]);
							}
							self.apply(ctx, args);
						};
					}
				}
			},
			/**
			 * requestAnimationFrame
			 * */
			requestAnimationFrame: function(){
				//兼容Date.now();
				if (!Date.now){
					Date.now = function() { return new Date().getTime(); };
				}
				//兼容requestAnimationFrame
				var vendors = ['webkit', 'moz'];
			    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
				var vp = vendors[i];
				window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
				window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
							   || window[vp+'CancelRequestAnimationFrame']);
			    }
			    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)
				|| !window.requestAnimationFrame || !window.cancelAnimationFrame) {
				var lastTime = 0;
				window.requestAnimationFrame = function(callback) {
				    var now = Date.now();
				    var nextTime = Math.max(lastTime + 16, now);
				    return setTimeout(function(){
							callback(lastTime = nextTime);
					   },nextTime - now);
				};
				window.cancelAnimationFrame = clearTimeout;
			    }
			},
			init: function(){
				for(var o in this.override){
					if('init' !== o){
						this.override[o]();
					}
				}
				//this.bind();
				//this.JSON();
				//this.requestAnimationFrame();
			}
		},

		/**
		 * 将Util常用方法浅拷贝至root属性
		 * */
		extend: function(){
			root.G = this.G;
			root.S = this.S;
			root.H = this.H;
			root.Show = this.Show;
			root.Hide = this.Hide;
		},
		/**
		 * 获取随机6位16进制数 (常用获取随机颜色)
		 * @return {string} 000000~ffffff
		 * */
		getRandomSixHex: function(){
			return (Math.random()*0xffffff>>0).toString(16);
		},
		/**
		 * 判断对象是否为数组 
		 * (instanceof 检测当前对象的原型是否为Array或者继承Array
		 * var a={},b=[];a.prototype=b;此时a本对象，但利用instanceof会检测为Array.)
		 * @param obj
		 * @return boolean
		 * */
		isArray: function(obj){
			if(!Array.isArray){
				return Object.prototype.toString.call(obj) === '[object Array]';
			}else{
				return Array.isArray(obj);
			}
		},
		/**
		 * 字符串转驼峰 example： get_cookie --> getCookie
		 * @param {string} str
		 * @param {flag} flag 默认 _
		 * */
		toHump: function(str, flag){
			/*flag = flag || '_';
			var arrs = str.split(flag);
			var res = [];
			for(var i=1;i<arr.length;i++){
				arr[i] = arr[i].substring(0,1).toUppCase() + arr[i].substring(1);
				res.push(arr[i]);
			}
			res.unshift(arr[0]);
			return res.join('');*/
			//利用正则更简便
			flag = flag || '_';
			return str.replace(new RegExp(flag+'(\\w)','g'), function(match,$1,offset,str){
				return $1.toUpperCase();
			})
		},
		/**
		 * 获取元素boundingClientRect
		 * @return {x:x,y:y,left:left,top:top,rigth:right,bottom:bottom,width:width,height:height}
		 * */
		getBoundClientRect: function(id){
			var dom = G(id);
			if(!dom) return;
			if(dom.getBoundingClientRect()){
				return dom.getBoundingClientRect();
			}else{
				var x=0,
					y=0,
					w=dom.clientWidth,
					h=dom.clientHeight;
				//循环累加偏移量
				for(var e=dom;e!=null;e=e.offsetParent){
					x += e.offsetLeft;
					y += e.offsetTop;
				}
				//循环减去父节点滚动偏移量
				for(var e=dom.parentNode;e!=null && e.nodeType == 1;e=e.parentNode){
					x -= e.scrollLeft;
					y -= e.scrollTop;
				}
				return {x:x,y:y,left:x,top:y,right:x+w,bottom:y+h,width:w,height:h};

			}
		},
		/**
		 * 吐司信息
		 * @param {string} info 打印信息
		 * @param {number} duration 显示时长 单位s
		 * @param {number} width 元素宽
		 * @param {number} height 元素高
		 * */
		toast: function(info,duration,width){
			//info为空或者存在吐司元素返回空
			if(!info || G('_toast_info')) return;
			var div = document.createElement('div'),
				id = '_toast_info',
				width = width || 1000,
				left = this.getViewportSize().w/2-width/2,
				top = this.getViewportSize().h/2,
				timer;
			duration = duration ? duration : 3;
			div.id = id;
			div.innerHTML = info;
			div.style = 'background-color:#000000;color:#ffffff;text-align:center;position:absolute;left:'+left+'px;top:'+top+'px;width:'+width+'px;font-size:30px;';
			document.body.appendChild(div);
			if(!timer){
				timer = setTimeout(function(){
					div.parentNode.removeChild(div);
					clearTimeout(timer);
				}, duration * 1000);
			}
		},
		/**
		 * 查询窗口的视口尺寸
		 * */
		getViewportSize: function(w){
			w = w || window;
			//除 IE8 及更早的版本外，其他浏览器都能用 
			if(w.innerWidth){
				return {w: w.innerWidth, h: w.innerHeight};
			}
			//对标准模式下的 IE (或任何浏览器)
			var d = w.document;
			if(document.compatMode == 'CSS1Compat'){
				return {w: d.documentElement.clientWidth, h: d.documentElement.clientHeight};
			}
			//对怪异模式下的浏览器
			return {w: d.body.clientWidth, h: d.body.clientHeight};
		},
		/**
		 * cookie存取删除封装
		 * @props get[name,defaultValue]
		 * @props set[name,value,day,path]
		 * @props del[name]				
		 * */
		cookie : {
			get: function(name, defaultValue){
				var result = new RegExp('(^|;| )'+name+'=([^;]*?)(;|$)','g').exec(document.cookie)[2];
				return result ? result : defaultValue;
			},
			set: function(name, value, day, path){
				day = day ? day : 1;
				path = path ? path : '/';
				var expires = new Date();
				expires.setTime(expires.getTime()+day*24*60*60);
				document.cookie = name+'='+value+'; expires='+expires.toGMTString()+'; path='+path+'; ';
			},
			del: function(name){
				this.set(name,null,-1);
			}
		},
		/**
		 * 获取url参数，类比request.getParameter(param)
		 * @param {string} name
		 * @param {string} defaultValue
		 * */
		getParam: function(name, defaultValue){
			var result = new RegExp('(\\?|&)'+name+'=(.*?)(&|$)','g').exec(location.search)[2];
			return result ? result : defaultValue;
		},
		/**
		 * 去除字符串前后空格
		 * @param {string} str
		 * */
		trim: function(str){
			return str.replace(/^\s*(.*?)\s*$/g, '$1');
		},
		/**
		 * 自定义call函数
		 * @param {string/function} fn
		 * @param {string/Array} args
		 * */
		call: function(fn, args){
			if(typeof fn === 'string' && fn){
				return eval('('+fn+')');
			}else if(typeof fn === 'function'){
				if(!(args instanceof Array)){
					var temp = [];
					for(var i=1;i<arguments.length;i++){
						temp.push(arguments[i]);
					}
					args = temp;
				}
				fn.apply(window, args);
			}
		},
		/**
		 * 获取当前项目根路径
		 * */
		getContextPath: function(){
			return '/' + location.href.split('/')[3] + '/';
		},
		/**
		 * 获取父窗口或顶级父窗口
		 * */
		getParent: function(){
			return window == window.parent ? window.parent : window.top;
		},
		/**
		 * ajax方法封装
		 * */
		ajax: function(option = {}){
		    option.type = (option.type || 'GET').toUpperCase();
		    var xmlHttp,
			_async = option.async || true,
			data = [];
		    for(var i in option.data){
			data.push(encodeURIComponent(i) + '=' + encodeURIComponent(option.data[i]))
		    }
		    data = data.join('&');
		    if(window.XMLHttpRequest){
			xmlHttp = new XMLHttpRequest();
		    }else{
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		    }
		    xmlHttp.onreadystatechange = function(){
			if(xmlHttp.readyState === 4){
			    var status = xmlHttp.status;
			    if(status >= 200 && status < 300){
				var rsp = xmlHttp.responseText || xmlHttp.responseXML;
				option.success && option.success(JSON.parse(rsp))
			    }else{
				option.error && option.error(status);
			    }
			}
		    };
		    if(option.type === 'GET'){
			xmlHttp.open('GET', option.url + '?' + data, _async);
		    }else if(option.type === 'POST'){
			xmlHttp.open('POST', option.url, _async);
			xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xmlHttp.send(data);
		    }
		},
		/**
		 * 根据ID获取某个元素
		 * @param id
		 * @return dom元素对象
		 */
		get: function(id){
			return document.getElementById(id);
		},
		/**
		 * 显示一个元素
		 * @param id
		 */
		v: function(id)
		{
			var temp = G(id);
			if(temp){
				temp.style.visibility = 'visible';
			}
		},
		/**
		 * 隐藏一个元素
		 * @param id
		 */
		h: function(id)
		{
			var temp = G(id);
			if(temp){
				temp.style.visibility = 'hidden';
			}
		},
		/**
		 * 显示一个元素，与S不同的是，修改的是display属性
		 * @param id
		 */
		displayB: function(id)
		{
			var temp = G(id);
			if(temp){
				temp.style.display = 'block';
			}
		},
		/**
		 * 隐藏一个元素，同Show
		 * @param id
		 */
		displayN: function(id)
		{
			var temp = G(id);
			if(temp){
				temp.style.display = 'none';
			}
		},
		/**
		 * 按键监听
		 * */
		eventHadnler: function(keyCode){
			console.log('keyCode:',keyCode);
			//do sth;
		},
		none: {}
	};
	if(/webkit/g.test(navigator.userAgent.toLowerCase())){
		document.onkeydown = Util.eventHadnler;
	}else{
		document.onkeypress = Util.eventHandler;
	}
	Util.init();
})(window);
