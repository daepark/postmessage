(function($) {

     if (!("console" in window)) {
         window.console.log = window.console.warn = window.console.error = window.console.debug = function(){};
     }

     $.fn.postmessage = function(options /* ["bind", fn, origin]*/) {
         var args = Array.prototype.slice.call(arguments);
         var method = "send";
         if (args.length > 1) {
             method = args.shift();
         }
         return this.each(function() {
                              var w = this.contentWindow || this;
                              if (!w.postMessage) {
                                  console.warn("postmessage must be invoked on a window or your browser does not support postMessage");
                                  return;
                              }
                              $.postmessage.apply(null, [method, w].concat(args));
                          });
     };

     var pm = $.postmessage = function(method, w) {
         if (method in $.postmessage) {
             var args = Array.prototype.slice.call(arguments);
             args.shift();
             pm[method].apply(null, args);
         }
         else {
             console.warn("postmessage method not supported", method);
         }
     };

     /**
      * options :
      * {
      *   type:    // message type ( type used for $.postmessage.bind )
      *   data:    // JSON data message
      *   success: // success handler
      *   error:   // error handler
      * }
      */
     pm.send = function(w, options) {
         var o = $.extend({}, pm.defaults, options);
         var msg = {data:o.data, type:o.type};
         if (o.success) {
             msg.callback = pm._callback(o.success);
         }
         if (o.error) {
             msg.errback = pm._callback(o.error);
         }
         pm._bind(window);
         w.postMessage(JSON.stringify(msg), o.origin || '*');
     };


     pm.bind = function(w, type, fn, origin) {
         pm._bind(w);
         var l = $(w).data("listeners.postmessage");
         if (!l) {
             l = {};
             $(w).data("listeners.postmessage", l);
         }
         var fns = l[type];
         if (!fns) {
             fns = [];
             l[type] = fns;
         }
         fns.push({fn:fn, origin:origin || pm.origin});
     };

     pm.unbind = function(w, type, fn) {
         var l = $(w).data("listeners.postmessage");
         if (l) {
             if (type) {
                 if (fn) {
                     // remove specific listener
                     var fns = l[type];
                     if (fns) {
                         l[type] = $.grep(fns, function(o,i) { return o.fn !== fn; });
                     }
                 }
                 else {
                     // remove all listeners by type
                     delete l[type];
                 }
             }
             else {
                 // unbind all listeners of all type
                 l = {};
             }
         }
     };

     /**
      * set global origin
      */
     pm.origin = null;

     /**
      * default options
      */
     pm.defaults = {
         type: null,
         data: null,
         success: null,
         error: null,
         origin: "*"
     };

     pm._CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

     pm._random = function() {
         var r = [];
         for (var i=0; i<32; i++) {
             r[i] = pm._CHARS[0 | Math.random() * 32];
         };
         return r.join("");
     };


     pm._callback = function(fn) {
         var cbs = $(window).data("callbacks.postmessage");
         if (!cbs) {
             cbs = {};
             $(window).data("callbacks.postmessage", cbs);
         }
         var r = pm._random();
         cbs[r] = fn;
         return r;
     };

     pm._bind = function(w) {
         // are we already listening to message events on this w?
         if (!$(w).data("listening.postmessage")) {
             if (w.addEventListener) {
                 w.addEventListener("message", pm._dispatch, false);
             }
             else if (w.attachEvent) {
                 w.attachEvent("onmessage", pm._dispatch);
             }
             $(w).data("listening.postmessage", 1);
         }
     };

     pm._dispatch = function(e) {
         //console.log("$.postmessage.dispatch", e, this);
         try {
             var msg = JSON.parse(e.data);
         }
         catch (ex) {
             console.error("postmessage data invalid json: ", ex);
             return;
         }

         if (!msg.type) {
             console.error("postmessage message type required");
             return;
         }

         var cbs = $(this).data("callbacks.postmessage") || {};
         var cb = cbs[msg.type];
         if (cb) {
             cb(msg.data);
         }
         else {
             var l = $(this).data("listeners.postmessage") || {};
             var fns = l[msg.type] || [];
             $.each(fns, function(i,o) {
                        if (o.origin && e.origin !== o.origin) {
                            console.warn("postmessage message origin mismatch", e.origin, o.origin);
                            if (msg.errback) {
                                // notify post message errback
                                var error = {
                                    message: "postmessage origin mismatch",
                                    origin: [e.origin, o.origin]
                                };
                                pm.send(e.source, {data: error, type: msg.errback});
                            }
                            return;
                        }
                        try {
                            var r = o.fn(msg.data);
                            if (msg.callback) {
                                pm.send(e.source, {data: r, type: msg.callback});
                            }
                        }
                        catch (ex) {
                            if (msg.errback) {
                                // notify post message errback
                                pm.send(e.source, {data: ex, type: msg.errback});
                            }
                        }
                    });
         }
     };

})(jQuery);

/**
 * http://www.JSON.org/json2.js
 **/
if (!window.JSON){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==="string"){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());

