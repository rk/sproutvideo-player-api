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
            var _videoId = options.videoId;
            var _volume = 1,_duration = 0,_currentTime = 0,_loaded = 0;

            var _sendMessage = function(message) {
                _iframe.contentWindow.postMessage(message, 'http://videos.sproutvideo.com');
            };

            var _getIframeByVideoId = function(id) {
                var players = SV.utils.getElementsByClassName('sproutvideo-player');
                var len = players.length;
                for (var i = 0; i < len; i++) {
                    if (players[i].src.indexOf(id)) {
                        return players[i];
                    }
                }
            };

            var _iframe = _getIframeByVideoId(_videoId);

            if (!_iframe) {
                throw 'Can not find video iframe';
            }

            var public = {
                events: options.events,

                play: function() {
                    _sendMessage('{"name":"play"}');
                },
                
                pause: function() {
                    _sendMessage('{"name":"pause"}');
                },

                setVolume: function(vol) {
                    _sendMessage('{"name":"volume", "data":"' + vol + '"}');
                },

                getVolume: function() {
                    return _volume;
                },
                
                seek: function(loc) {
                    _sendMessage('{"name":"seek", "data":"' + loc + '"}');
                },

                getCurrentTime: function() {
                  return _currentTime;  
                },

                getPercentLoaded: function() {
                  return _loaded;  
                },

                getDuration: function() {
                  return _duration;  
                },
                
                updateStatus: function(message) {
                    switch(message.type){
                        case 'volume': 
                            _volume = message.data;
                            break;
                        case 'progress':
                            _currentTime = message.data.time;
                            break;
                        case 'loading':
                            _loaded = message.data;
                            break;
                        case 'ready':
                            _duration = message.data.duration;
                            break;
                    }
                }
            };

            SV.players[_videoId] = public;

            return public;
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
            }
        };
    }

    if (!SV.routePlayerEvent) {
        SV.routePlayerEvent = function(e) {
            if (e.origin.split('//')[1] == 'videos.sproutvideo.com') {
                try {
                    var message = JSON.parse(e.data);
                    var player = SV.players[message.id];
                    player.updateStatus(message);
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