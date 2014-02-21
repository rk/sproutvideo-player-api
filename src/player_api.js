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
            var _playlistId = options.playlistId;
            var _volume = 1,_duration = 0,_currentTime = 0,_loaded = 0,_email = null,_listeners={};

            var _sendMessage = function(message) {
                _iframe.contentWindow.postMessage(message, window.location.protocol + '//videos.sproutvideo.com');
            };

            var _getIframeByVideoId = function(id, type) {
                var className = type == 'video' ? 'sproutvideo-player' : 'sproutvideo-playlist';
                var players = SV.utils.getElementsByClassName(className);
                for (var i = 0; i < players.length; i++) {
                    if (players[i].src.indexOf(id) > -1) {
                        return players[i];
                    }
                }
            };

            var _iframe = _getIframeByVideoId(_videoId||_playlistId, !!_videoId ? 'video' : 'playlist');

            if (!_iframe) {
                throw 'Can not find video iframe';
            }

            var public = {
                events: options.events,

                play: function(index) {
                    if (typeof index != 'undefined') {
                        _sendMessage('{"name":"playVideo", "data":"' + index + '"}');
                    } else {
                        _sendMessage('{"name":"play"}');
                    }
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

                toggleHD: function() {
                    _sendMessage('{"name":"toggleHD"}');
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

                getEmail: function() {
                    return _email;
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
                            _email = message.data.email;
                            break;
                    }
                },

                bind: function(type, listener) {
                    if(typeof _listeners[type] == 'undefined') {
                        _listeners[type] = [];
                    }
                    _listeners[type].push(listener);
                },

                fire: function(event) {
                    if (typeof event == 'string') {
                        event = {type: event};
                    }
                    if (!event.target) {
                        event.target = this;
                    }
                    if (_listeners[event.type] instanceof Array){
                        var listeners = _listeners[event.type];
                        for (var i=0, len=listeners.length; i < len; i++){                          
                            var returnValue = listeners[i].call(this, event);
                            if(returnValue == this.unbind) {
                                this.unbind(event.type, listeners[i]);
                            }
                        }
                    }
                },

                unbind: function(type, listener) {
                    if (_listeners[type] instanceof Array){
                        var listeners = _listeners[type];
                        for (var i=0, len=listeners.length; i < len; i++){
                            if (listeners[i] === listener){
                                listeners.splice(i, 1);
                                break;
                            }
                        }
                    }
                }

            };

            SV.players[_videoId||_playlistId] = public;

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
                    player.fire({type: message.type, data: message.data});
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