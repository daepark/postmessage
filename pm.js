(function($) {

     if (!window.console) {
         window.console.log = window.console.warn = window.console.error = window.console.debug = function(){};
     }

     /**
      * {
      *   window:  // window to postMessage to
      *   data:    // JSON data message
      *   success: // success handler
      *   error:   // error handler
      * }
      */
     var pm = $.postMessage = function(options) {
         var o = $.extend({}, pm.defaults, options);
         if (!o.window || !o.window.postMessage) {
             return;
         }
         var msg = {data:o.data, type:o.type};
         if (o.success) {
             o.callback = pm.callback(o.success);
         }
         if (o.error) {
             o.errback = pm.callback(o.error);
         }
         o.window.postMessage(JSON.stringify(msg), '*');
     };

     $.postMessage.defaults = {
         window: window.parent,
         data: null,
         success: null,
         error: null
     };

     var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
     pm.random = function() {
         var r = [];
         for (var i=0; i<32; i++) {
             r[i] = 0 | Math.random() * 32;
         };
         return r.join("");
     };

     pm.callbacks = {};
     pm.callback = function(fn) {
         var r = pm.random();
         pm.callbacks[r] = fn;
         return r;
     };

     pm.listeners = {};
     pm.bind = function(type, fn, origin) {
         var l = pm.listeners[type];
         if (!l) {
             l = pm.listeners[type] = [];
         }
         l.push({callback:fn, origin:origin});
     };

     pm.dispatch = function(e) {
         try {
             var msg = JSON.parse(e.data);
         }
         catch (ex) {
             console.error("$.postMessage invalid json: ", ex);
             return;
         }

         if (!msg.type) {
             console.error("$.postMessage event type required");
             return;
         }

         var cb = pm.callbacks[msg.type];
         if (cb) {
             cb(msg.data);
             delete pm.callbacks[msg.type];
         }
         else {
             var l = pm.listeners[msg.type];
             if (l) {
                 $.each(l, function(i,o) {
                     if (o.origin && e.origin !== o.origin) {
                         console.warn("$.postMessage event origin mismatch", e.origin, o.origin);
                         return;
                     }
                     try {
                         var r = o.callback(msg.data);
                         if (msg.callback) {
                             // notify post message callback
                             $.postMessage({data: r, type: msg.callback});
                         }
                     }
                     catch (ex) {
                         if (msg.errback) {
                             // notify post message errback
                             $.postMessage({data: "" + ex, type: msg.errback});
                         }
                     }
                 });
                 delete pm.listeners[msg.type];
             }
         }
     };

     /**
      * http://www.JSON.org/json2.js
      **/
     if (!window.JSON){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==="string"){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());



 })(jQuery);


