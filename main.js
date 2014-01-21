var app = angular.module('app', []);

app.controller('ctrl', function ($scope) {
    $scope.listening = false;
    var listeningState = false;
    $scope.result = '';
    $scope.postUrl = 'newImage';
    $scope.log = [];
    function applyLog(text) {
        function go() {
            $scope.log.unshift({text: text});
        }
        if ($scope.$$phase) {
            go();
        } else {
            $scope.$apply(go);
        }
    }
    $scope.$watch('listening', function () {
        if (listeningState && !$scope.listening) {
            recognition.stop();
        }
        if (!listeningState && $scope.listening) {
            recognition.start();
        }
    });
    var recognition = new webkitSpeechRecognition();

    function say(text) {
        applyLog("stop listening");
        recognition.abort();

        var msg = new SpeechSynthesisUtterance(text);
        msg.onend = function () {
            applyLog("start listening");
            recognition.start();
        };
        window.speechSynthesis.speak(msg);
        applyLog("-> " + text);
    }

    recognition.continuous = true;
    var first = true;
    recognition.onstart = function() {
        $scope.$apply(function () {
            listeningState = true;
            $scope.listening = listeningState;
            if (first) {
                first = false;
                setTimeout(function () { say('please talk now.'); }, 1);
            }
        });
    };
    recognition.onend = function() {
        $scope.$apply(function () {
            listeningState = false;
            $scope.listening = listeningState;
        });
    };

    recognition.onerror = function(event) {
        applyLog("recognition error: " + event.error + " " + event.message);
    };
    $scope.heard = function(txt) {
        var match = txt.match(/picture (\d+)/)
        if (match && match.length == 2) {
            var num = match[1];
            say('taking picture ' + num);
            grab(function (blob) {
                applyLog('posting');
                $.ajax({
                    type: "POST",
                    url: $scope.postUrl + "?tag=" + num,
                    contentType: "image/jpeg",
                    processData: false,
                    data: blob,
                    success: function () {
                        say('saved '+num);
                    },
                    error: function () {
                        say(num+' failed to save');
                    }
                });
            });
        } else {
            say('you said: '+txt);
        }
    }
    recognition.onresult = function(event) {
        $scope.$apply(function () {
            $scope.result = JSON.stringify(event.results);
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    $scope.heard(event.results[i][0].transcript);
                } 
            }
        });
    };

    applyLog("start listening");
    recognition.start();

    var canvas = document.createElement('canvas');
    var video = document.getElementById('videoPreview');
    
    MediaStreamTrack.getSources(function (sourceInfos) {
        var bestId = null;
        sourceInfos.forEach(function (info) {
            if (!bestId && info.facing == 'environment') {
                bestId = info.id;
            }
        });
        navigator.webkitGetUserMedia({
            video: {
                optional: [{sourceId: bestId}],
                mandatory: {
                    minHeight: 1024
                }
            }
        }, function (localMediaStream) {
            video.src = window.URL.createObjectURL(localMediaStream);
            
            video.addEventListener("loadeddata", function () {
                applyLog("loaded");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                applyLog("set canvas to "+canvas.width+"x"+canvas.height);
                video.play();
                setTimeout(grab, 500);
            }, false);

        }, function (err) {
            applyLog(err);
        });
    });


    function grab(cb) {
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(cb, 'image/jpeg');
    }
    
});
