window postmessage plugin
=========================

Modern browsers now support cross-window/cross-domain/cross-origin messaging
through window.postMessage.

postmessage is a simple wrapper for window.postMessage and the window message
event, for those who wish to use this feature in a more jQuery-like way.

postmessage falls back to window location hash polling for browsers that do
not support window.postMessage (i.e., IE7).

postmessage allows messaging back and forth using JSON where
window.postMessage only allows simple string-based messages.

postmessage also allows for complete request/response roundtrips using
success/error callbacks modeled after jQuery.ajax.

postmessage is tested on Safari 4, WebKit (Nightlies), Chrome 4, Firefox 3,
IE8, IE7 and Opera 10.10.


API
===

pm(options)
-----------
        Send postmessage.

        options:Map (Required)
                A set of key/value pairs that configure the postmessage:

                target:Window (Required)
                        The target window to send the postmessage.

                type:String (Required)
                        The postmessage type. The postmessage will be
                        dispatched to handler(s) bound to postmessages of this 
                        type.

                data:Object (Required)
                        The postmessage data to be sent.

                success:Function (Optional)
                        A function to be called if the postmessage succeeds. 
                        The function gets passed the object returned by the 
                        postmessage handler.

                error:Function (Optional)
                        A function to be called if the postmessage fails. The 
                        function gets passed the object thrown (Exception) by 
                        the postmessage handler.

                origin:String (Optional)
                        The target origin for the postmessage to be 
                        dispatched, either as the literal string "*"
                        (indicating no preference) or as a URI. The 
                        postmessage will only be dispatched if the scheme, 
                        hostname and port match the target origin. 
                        Default is "*".

                url:String (Optional)
                        Required if window.postMessage is not available or 
                        using location hash. The current url of the target 
                        window you are sending the postmessage to. This is 
                        required for setting the location hash of the target 
                        window since you may not have access to reading the 
                        target window.location. 

                hash:Boolean (Optional)
                        You can force passing postmessages via the target 
                        window location hash by setting this to true.


pm.bind(type, fn, [origin], [hash])
-----------------------------------
        Bind postmessage handler on the current window.

        type:String (Required)
                The postmessage type to bind to.

        fn:Function (Required)
                The postmessage handler. A function to execute each time the 
                postmessage type is received. The function gets passed the 
                postmessage data.

        origin:String (Optional)
                A URI specifying the origin of the postmessage. If specified, 
                the postmessage handler will only be executed if the 
                postmessage is received from the same origin matching the 
                scheme, hostname and port. Otherwise, the postmessage sender 
                will be notified through it's error callback of the origin 
                mismatch:

                    {
                        "message": "postmessage origin mismatch",
                        "origin": [
                            "http://www.abc.com",
                            "http://www.xyz.com"
                        ]
                    }

                You can set this globally. However, the origin specified in 
                the bind method will take precedence.

                    pm.origin = "http://www.xyz.com";

        hash:Boolean (Optional)
                You can force location hash polling to check for postmessages 
                by setting this to true. This is required only if you are 
                (forcefully) passing postmessages via the location hash.


pm.unbind([type], [fn])
-----------------------
        Remove a previously-attached postmessage handler from the current 
        window. If type is not specified, all postmessage handlers will be 
        removed.

        type:String (Optional)
                The postmessage type to unbind from. If only the type is 
                specified all handlers of this type will be removed.

        fn:Function (Optional)
                The function that is to be no longer executed.


For examples and more:
======================
http://postmessage.freebaseapps.com
