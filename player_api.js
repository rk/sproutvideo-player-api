var JSON;JSON||(JSON={}),function(){function str(a,b){var c,d,e,f,g=gap,h,i=b[a];i&&typeof i=="object"&&typeof i.toJSON=="function"&&(i=i.toJSON(a)),typeof rep=="function"&&(i=rep.call(b,a,i));switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";gap+=indent,h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1)h[c]=str(c,i)||"null";e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g;return e}if(rep&&typeof rep=="object"){f=rep.length;for(c=0;c<f;c+=1)typeof rep[c]=="string"&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e))}else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g;return e}}function quote(a){escapable.lastIndex=0;return escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b=="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function f(a){return a<10?"0"+a:a}"use strict",typeof Date.prototype.toJSON!="function"&&(Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;typeof JSON.stringify!="function"&&(JSON.stringify=function(a,b,c){var d;gap="",indent="";if(typeof c=="number")for(d=0;d<c;d+=1)indent+=" ";else typeof c=="string"&&(indent=c);rep=b;if(b&&typeof b!="function"&&(typeof b!="object"||typeof b.length!="number"))throw new Error("JSON.stringify");return str("",{"":a})}),typeof JSON.parse!="function"&&(JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e=="object")for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),d!==undefined?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver=="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")})}();

SV = {
    players: {},
    
    Player: function(options) {
        this.videoId = options.videoId;
        this.events = options.events;
        
        this.iframe = SV.utils.getIframeByVideoId(options.videoId);
            
        if(!this.iframe) {
            throw 'Can not find video iframe';
        }
        
        SV.players[options.videoId] = this;
    
        return this;
    },
    
    utils: {
        getElementsByClassName: function(classname) {
    	    if (document.getElementsByClassName) {
    		    return document.getElementsByClassName(classname);
    	    } else {
                var classElements = new Array();
                var els = document.getElementsByTagName('*');
                var elsLen = els.length;
                var pattern = new RegExp("(^|\\s)"+classname+"(\\s|$)");
                for (i = 0, j = 0; i < elsLen; i++) {
                    if ( pattern.test(els[i].className) ) {
                        classElements[j] = els[i];
                        j++;
                    }
                }
                return classElements;
    	    }
        },
        
        getIframeByVideoId: function(id) {
            var players = SV.utils.getElementsByClassName('sproutvideo-player');
            var len = players.length;
            for(var i=0;i<len;i++) {
                if(players[i].src.indexOf(id)) {
                    return players[i];
                }
            }
        }
    },
    
    routePlayerEvent: function(data) {
        try{
            var message = JSON.parse(data);
            var player = SV.players[message.id];
            if(player && player.events && player.events['onStatus']) {
                player.events['onStatus'](data);
            }
        }catch(e){}
    }
};

SV.Player.prototype = {
    play: function() {
        this.sendMessage('{"name":"play"}');
    },
    pause: function() {
        this.sendMessage('{"name":"pause"}');
    },
    setVolume: function(vol) {
        this.sendMessage('{"name":"volume", "data":"'+vol+'"}');
    },
    seek: function(loc) {
        this.sendMessage('{"name":"seek", "data":"'+loc+'"}');
    },
    sendMessage: function(message){
        this.iframe.contentWindow.postMessage(message,'http://videos.sproutvideo.com');
    }
};

window.addEventListener('message', function(e){
    var origin = e.origin;
    if (origin == 'http://videos.sproutvideo.com' || origin == 'https://videos.sproutvideo.com') {
        SV.routePlayerEvent(e.data);
    }
}, false);