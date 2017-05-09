


var io = require('socket.io-client');
var socket = io()
var nipplejs = require('nipplejs')
var $ = require('jquery')

var speed = 0;
var lastKey = -99;
var interval;



joy2 = nipplejs.create({
    zone: document.getElementById('droneStream'),
    // mode: "static",
    restOpacity: 110,
    size: 100,
    color: "red"
})


joy2.on('move', function (evt, data) {
    if (data.direction) {
        var move = {
            command: data.direction.angle,
            speed: data.force > 1 ? 1 : data.force
        }
        if (move.command) {
            socket.emit("keyMove", move)
        }
        $("#content").text("excute command:" + move.command + " speed:" + move.speed)
    }
})
joy2.on('end', function (evt, data) {
    onStop()
})

window.onkeyup = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 87 || key == 68 || key == 65 || key == 83 || (key => 37 && key <= 40)) {
        onStop()
    }
}

window.onkeydown = function (e) {
    var key = e.keyCode ? e.keyCode : e.which;
    var command;
    if (key == 87 || key == 68 || key == 65 || key == 83 || (key => 37 && key <= 40)) {
        console.log(key)
        if (lastKey === key) {
            speed = speed < 1 ? speed + 0.02 : 1
        }
        else {
            speed = 0.1
            lastKey = key
        }
        switch (key) {
            case 87: { command = "up"; break }
            case 68: { command = "clockwise"; break }
            case 83: { command = "down"; break }
            case 65: { command = "counterClockwise"; break }
            case 37: { command = "left"; break }
            case 38: { command = "front"; break }
            case 39: { command = "right"; break }
            case 40: { command = "back"; break }
        }
        var move = {
            command: command,
            speed: speed.toFixed(2)
        }
        $("#content").text("excute command:" + move.command + " speed:" + move.speed)
        if (move.command) {
            socket.emit("keyMove", move)
        }
    }
}


$("#takeoff").click(function (e) {
    startTimer()
    socket.emit('takeoff')
})

socket.on("takingOff", function () {
    $("#content").text("airborn").fadeIn(500).fadeOut(1000)
})

$("#land").click(function (e) {
    $("#content").text("landeding").fadeIn(500).fadeOut(1000)
    socket.emit('land')
})

socket.on("landed", function () {
    $("#content").text("landed").fadeIn(500).fadeOut(1000)
})

$("#stop").click(function (e) {
        onStop()
})

$("#revcover").click(function (e) {
    $("#content").text("revcover").fadeIn(500).fadeOut(1000)
    socket.emit('revcover')
})



function startTimer() {
    var count = 3;
    function updateTimer() {
        if (count > 0) {
            $("#content").fadeOut('fast', function () {
                $("#content").text(count);
                $("#content").fadeIn();
                count--;
            });

        }
        else if (count == 0) {
            $("#content").fadeOut('fast', function () {
                $("#content").text("taknig off");
                $("#content").fadeIn();
                count--;
            });

        }
        else {
            $("#content").fadeOut();
            clearInterval(interval);
        }

    }
    var interval = setInterval(function () { updateTimer() }, 500)
}


///////////////////////////////////////////////////////////////
////////////////navigate with on screen button/////////////////
///////////////////////////////////////////////////////////////


$("#right").mousedown(function (e) { onMouseDown(e) }).mouseup(onStop)
$("#left").mousedown(function (e) { onMouseDown(e) }).mouseup(onStop)
$("#back").mousedown(function (e) { onMouseDown(e) }).mouseup(onStop)
$("#front").mousedown(function (e) { onMouseDown(e) }).mouseup(onStop)
$("#clockwise").mousedown(function (e) { onMouseDown(e) }).mouseup(onStop)
$("#counterClockwise").mousedown(function (e) { onMouseDown(e) }).mouseup(onStop)
$("#up").mousedown(function (e) { onMouseDown(e) }).mouseup(onStop)
$("#down").mousedown(function (e) { onMouseDown(e) }).mouseup(onStop)

function onMouseDown(e) {
    clearInterval(interval)
    interval = setInterval(function () {
        speed = speed > 1 ? 1 : speed + 0.1
        var move = {
            command: e.currentTarget.id,
            speed: speed
        };
        $("#content").text("excute command:" + move.command + " speed:" + move.speed)
        console.log(move)
        if (move.command) {
            socket.emit("keyMove", move)
        }
    }, 1000)
}

function onStop() {
    clearInterval(interval)
    $("#content").text("hoovering")
    speed = 0
    socket.emit('stop')
}

socket.on("navdata", function (navdata) {
    if (navdata) {
        if (navdata.demo.batteryPercentage < 18) {
            $("#battery").text(navdata.demo.batteryPercentage + "to low to FLY!!")
        }
        else {
            $("#battery").text(navdata.demo.batteryPercentage)
        }
        $("#altitudeMeters").text(navdata.demo.altitudeMeters)
        $("#clockTurn").text(navdata.demo.rotation.clockwise)
        $("#frontBack").text(navdata.demo.rotation.frontBack)
        $("#leftRight").text(navdata.demo.rotation.leftRight)
        $("#velocityX").text(navdata.demo.velocity.x)
        $("#velocityY").text(navdata.demo.velocity.y)
        $("#velocityZ").text(navdata.demo.velocity.z)
    }
})