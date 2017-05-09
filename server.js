var http = require('http')
var express = require("express")
var fs = require("fs")
var path = require("path")
var app = express()
var server = http.createServer(app)
var io = require('socket.io')(server)
var arDrone = require('ar-drone');
var drone = arDrone.createClient({ip: "192.168.1.222"})


//app.use("/dronestream", express.static(path.join(__dirname + "/node_modules/dronestream/dist")))
app.use("/client", express.static(path.join(__dirname + '/client')))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/client/index.html'))
    //require("fs").createReadStream(__dirname + "/client/index.html").pipe(res);
})


drone.on('navdata', function (navdata) {
    io.sockets.emit("navdata", navdata)
})

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('joyMove', function (joymove) {
        console.log("joy move" + joymove)
    })
    socket.on('stop', function(key){
        console.log("hover")
        drone.stop()
    })
    socket.on('keyMove', function (move) {
        console.log(move.command + move.speed)
        
        drone[move.command](move.speed)
        
        // switch (key) {
        //     case 87: {
        //         drone.up(0.2)
        //         console.log("up")
        //         break
        //     }
        //     case 68: {
        //         console.log("right")
        //         drone.clockwise(0.5)
        //         break
        //     }
        //     case 83: {
        //         console.log("down")
        //         drone.down(0.2)
        //         break                
        //     }
        //     case 65: {
        //         console.log("left")
        //         drone.counterClockwise(0.1)
        //         break
        //     }
        // }
    })

    socket.on('takeoff', function () {
        console.log("takeoff")
        // ref.fly       = true;
        // control.ref(ref);
        // control.pcmd();
        // control.flush();
        drone.takeoff(function(){
            socket.emit("takingOff")
            console.log("airbone")
        }
        )
    })
    socket.on('revcover', function () {
        console.log("revcover")
        drone.disableEmergency()
        // ref.emergency = false; 
        // control.ref(ref);
        // control.flush();
    })
    socket.on('land', function () {
        console.log("land")
        // ref.fly = false;
        // control.ref(ref);
        // control.flush();

        drone.stop()
        drone.land(function(){
            console.log("landed")
            socket.emit("landed")
        })
    })
});


server.listen(3000, function(){console.log("up 3000")})
require("dronestream").listen(server, {ip: "192.168.1.222"})