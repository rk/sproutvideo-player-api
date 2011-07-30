var SV;
if (!SV) {
    SV = {};
}
 (function() {
    if (!SV.players) {
        SV.players = {};
    }

    if (!SV.Player) {
        SV.Player = function(options) {
            this.videoId = options.videoId;
            this.events = options.events;

            this.iframe = SV.utils.getIframeByVideoId(this.videoId);

            if (!this.iframe) {
                throw 'Can not find video iframe';
            }

            SV.players[options.videoId] = this;
            return this;
        };

        SV.Player.prototype = {
            play: function() {
                this.sendMessage('{"name":"play"}');
            },
            pause: function() {
                this.sendMessage('{"name":"pause"}');
            },
            setVolume: function(vol) {
                this.sendMessage('{"name":"volume", "data":"' + vol + '"}');
            },
            seek: function(loc) {
                this.sendMessage('{"name":"seek", "data":"' + loc + '"}');
            },
            sendMessage: function(message) {
                this.iframe.contentWindow.postMessage(message, 'http://videos.sproutvideo.com');
            }
        };
    }

    if (!SV.utils) {
        SV.utils = {
            getElementsByClassName: function(classname) {
                if (document.getElementsByClassName) {
                    return document.getElementsByClassName(classname);
                } else {
                    var classElements = new Array();
                    var els = document.getElementsByTagName('*');
                    var elsLen = els.length;
                    var pattern = new RegExp("(^|\\s)" + classname + "(\\s|$)");
                    for (i = 0, j = 0; i < elsLen; i++) {
                        if (pattern.test(els[i].className)) {
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
                for (var i = 0; i < len; i++) {
                    if (players[i].src.indexOf(id)) {
                        return players[i];
                    }
                }
            }
        };
    }

    if (!SV.routePlayerEvent) {
        SV.routePlayerEvent = function(e) {
            if (e.origin.split('//')[1] == 'videos.sproutvideo.com') {
                try {
                    var message = JSON.parse(e.data);
                    var player = SV.players[message.id];
                    if (player && player.events && player.events['onStatus']) {
                        player.events['onStatus'](message);
                    }
                } catch(e) {}
            }
        }
    }
    
    if (window.addEventListener) {
        window.addEventListener('message', SV.routePlayerEvent, false);
    } else {
        window.attachEvent('onmessage', SV.routePlayerEvent);
    }
})();