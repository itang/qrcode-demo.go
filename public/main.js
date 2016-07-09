// QRCODE reader Copyright 2011 Lazar Laszlo
// http://www.webqr.com

var gCtx = null;
var gCanvas = null;
var c = 0;
var stype = 0;
var gUM = false;
var webkit = false;
var moz = false;
var v = null;

var ws;

var vidhtml = '<video id="v" autoplay></video>';


function initCanvas(w, h) {
    gCanvas = document.getElementById("qr-canvas");
    gCanvas.style.width = w + "px";
    gCanvas.style.height = h + "px";
    gCanvas.width = w;
    gCanvas.height = h;
    gCtx = gCanvas.getContext("2d");
    gCtx.clearRect(0, 0, w, h);
}


var i = 0;
function captureToCanvas() {
    i++;
    console.log("capture " + i);

    if (stype != 1)
        return;
    if (gUM) {
        try {
            var start = new Date().getTime();
            gCtx.drawImage(v, 0, 0);

            var dataURL = gCanvas.toDataURL('image/png');
            /*if(i == 1) {
                console.log(dataURL);
            }*/
            ws.send(dataURL);

            try {
                qrcode.decode();
            }
            catch (e) {
                console.log(e);
                setTimeout(captureToCanvas, 1000);
            } finally {
                var end = new Date().getTime();
                console.log("cost time: " + (end - start) + "ms");
            }
        }
        catch (e) {
            console.log(e);
            setTimeout(captureToCanvas, 1000);
        }
    }
}


function isCanvasSupported() {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
}

function success(stream) {
    if (webkit)
        v.src = window.URL.createObjectURL(stream);
    else if (moz) {
        v.mozSrcObject = stream;
        v.play();
    }
    else
        v.src = stream;
    gUM = true;
    setTimeout(captureToCanvas, 500);
}

function error(error) {
    gUM = false;
    return;
}

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function read(a) {
    console.log(a);
    var html = "<br>";
    if (a.indexOf("http://") === 0 || a.indexOf("https://") === 0)
        html += "<a target='_blank' href='" + a + "'>" + a + "</a><br>";
    html += "<b>" + htmlEntities(a) + "</b><br><br>";
    var $result = document.getElementById("result");
    $result.innerHTML = $result.innerHTML + html;
}

function load() {
    if (isCanvasSupported() && window.File && window.FileReader) {
        initCanvas(800, 600);
        qrcode.callback = read;
        document.getElementById("mainbody").style.display = "inline";
        setwebcam();
    }
    else {
        document.getElementById("mainbody").style.display = "inline";
        document.getElementById("mainbody").innerHTML = '<p id="mp1">QR code scanner for HTML5 capable browsers</p><br>' +
            '<br><p id="mp2">sorry your browser is not supported</p><br><br>' +
            '<p id="mp1">try <a href="http://www.mozilla.com/firefox"><img src="firefox.png"/></a> or <a href="http://chrome.google.com"><img src="chrome_logo.gif"/></a> or <a href="http://www.opera.com"><img src="Opera-logo.png"/></a></p>';
    }
}

function setwebcam() {
    var options = true;
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
            navigator.mediaDevices.enumerateDevices()
                .then(function (devices) {
                    devices.forEach(function (device) {
                        if (device.kind === 'videoinput') {
                            if (device.label.toLowerCase().search("back") > -1)
                                options = {'deviceId': {'exact': device.deviceId}, 'facingMode': 'environment'};
                        }
                        console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
                    });
                    setwebcam2(options);
                });
        }
        catch (e) {
            console.log(e);
        }
    }
    else {
        console.log("no navigator.mediaDevices.enumerateDevices");
        setwebcam2(options);
    }

}

function setwebcam2(options) {
    console.log(options);
    document.getElementById("result").innerHTML = "- scanning -";
    if (stype == 1) {
        setTimeout(captureToCanvas, 500);
        return;
    }
    var n = navigator;
    document.getElementById("outdiv").innerHTML = vidhtml;
    v = document.getElementById("v");


    if (n.getUserMedia)
        n.getUserMedia({video: options, audio: false}, success, error);
    else if (n.webkitGetUserMedia) {
        webkit = true;
        n.webkitGetUserMedia({video: options, audio: false}, success, error);
    }
    else if (n.mozGetUserMedia) {
        moz = true;
        n.mozGetUserMedia({video: options, audio: false}, success, error);
    }

    //document.getElementById("qrimg").src="qrimg2.png";
    //document.getElementById("webcamimg").src="webcam.png";
    // document.getElementById("qrimg").style.opacity=0.2;
    document.getElementById("webcamimg").style.opacity = 1.0;

    stype = 1;
    setTimeout(captureToCanvas, 500);
}


function webSocketTest() {
    if ("WebSocket" in window) {
        console.log("WebSocket is supported by your Browser!");

        // Let us open a web socket
        ws = new WebSocket("ws://localhost:8081/ws");

        ws.onopen = function () {
            // Web Socket is connected, send data using send()
            //ws.send("Message to send");
            console.log("Message is sent...");
        };

        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            console.log("Message is received..." + received_msg);
        };

        ws.onclose = function () {
            // websocket is closed.
            console.log("Connection is closed...");
        };
    } else {
        // The browser doesn't support WebSocket
        alert("WebSocket NOT supported by your Browser!");
    }
}

webSocketTest();