//SERVER
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

//DB
const jsonstore = require('jsonstore.io');
const db = new jsonstore(process.env.KEY);

//EXPRESS
app.use(express.static("public"));

//GAME VARIABLES
let goal = 100;
let total = 0;
let ctimer = 0;
let ltimer = 0;
let times = [];
let players = {};

//SOCKET.IO
io.on("connection", socket => {
  console.log(`${socket.id} connected`);

  //set new user up
  socket.emit("id");
  players[socket.io] = 0;

  socket.on("click", data => {
    total++;

    players[socket.id] = data.clicks;

    if (total >= goal) {
      goal *= Math.floor(Math.random() * 12) + 1;
      times.push(ctimer);
      ctimer = 0;
    }
  });

  socket.on("message", data => {
    socket.broadcast.emit("message", data);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    console.log(`${socket.id} disconnected`);
  });
});

//LIVE UPDATING
setInterval(() => {
  let data = { goal: goal, total: total, ctimer: ctimer, ltimer: times[times.length-1], avgtime: eval(times.join('+')) / times.length, players: players };
  io.emit("update", data);
}, 1);

setInterval(() => { ctimer++ }, 1000);


//test commit
//END
http.listen(3000, () => {
  console.clear();
  console.log("server started");
});