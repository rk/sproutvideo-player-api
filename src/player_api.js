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
            var _videoId = options.videoId,
                _playlistId = options.playlistId,
                _volume = 1,
                _duration = 0,
                _currentTime = 0,
                _loaded = 0,
                _email = null,
                _playing = false,
                _listeners = {};

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

            this.events = options.events;

            this.play = function(index) {
                if (typeof index !== 'undefined') {
                    _sendMessage('{"name":"playVideo", "data":"' + index + '"}');
                } else {
                    _sendMessage('{"name":"play"}');
                }
            };

            this.pause = function() {
                _sendMessage('{"name":"pause"}');
            };

            this.setVolume = function(vol) {
                _sendMessage('{"name":"volume", "data":"' + vol + '"}');
            };

            this.getVolume = function() {
                return _volume;
            };

            this.seek = function(loc) {
                _sendMessage('{"name":"seek", "data":"' + loc + '"}');
            };

            this.toggleHD = function() {
                _sendMessage('{"name":"toggleHD"}');
            };

            this.getCurrentTime = function() {
                return _currentTime;
            };

            this.getPercentLoaded = function() {
                return _loaded;
            };

            this.getDuration = function() {
                return _duration;
            };

            this.getEmail = function() {
                return _email;
            };

            this.getPlaying = function() {
                return _playing;
            };

            this.updateStatus = function(message) {
                switch(message.type) {
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
                    case 'play':
                    case 'playVideo':
                        _playing = true;
                        break;
                    case 'pause':
                    case 'completed':
                        _playing = false;
                        break;
                }

                this.fire(message);

                if (this.events && this.events['onStatus']) {
                    this.events['onStatus'](message);
                }
            };

            this.bind = function(type, listener) {
                if (typeof _listeners[type] === 'undefined') {
                    _listeners[type] = [];
                }
                _listeners[type].push(listener);
            };

            this.fire = function(event) {
                if (typeof event === 'string') {
                    event = {type: event};
                }
                if (!event.target) {
                    event.target = this;
                }
                if (_listeners[event.type] instanceof Array){
                    var listeners = _listeners[event.type];
                    for (var i=0, len=listeners.length; i < len; i++) {
                        var returnValue = listeners[i].call(this, event);
                        if (returnValue === this.unbind) {
                            this.unbind(event.type, listeners[i]);
                        }
                    }
                }
            };

            this.unbind = function(type, listener) {
                if (_listeners[type] instanceof Array){
                    var listeners = _listeners[type];
                    for (var i=0, len=listeners.length; i < len; i++) {
                        if (listeners[i] === listener) {
                            listeners.splice(i, 1);
                            break;
                        }
                    }
                }
            };

            SV.players[_videoId||_playlistId] = this;
        };
    }

    if (!SV.utils) {
        SV.utils = {
            getElementsByClassName: function(classname) {
                if (document.getElementsByClassName) {
                    return document.getElementsByClassName(classname);
                } else {
                    var classElements = [];
                    var els = document.getElementsByTagName('*');
                    var elsLen = els.length;
                    var pattern = new RegExp("(^|\\s)" + classname + "(\\s|$)");
                    for (var i = 0, j = 0; i < elsLen; i++) {
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
                    SV.players[message.id].updateStatus(message);
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