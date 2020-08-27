const socket = io();

let clicks = 0;
let timer = 0;
let ellapsed = 0;

$('.pg1').click(function(){
  $('.page2,.page3').fadeOut();
  $('.page1').delay(500).fadeToggle();
});
$('.pg2').click(function(){
  $('.page1,.page3').fadeOut();
  $('.page2').delay(500).fadeToggle();
});
$('.pg3').click(function(){
  $('.page1,.page2').fadeOut();
  $('.page3').delay(500).fadeToggle();
});

$('.cus-hei').css("height",$(window).height()/1.85);

let use="0123456789ABCDEF",color="#";for(let o=0;o<3;o++)color+=use[Math.floor(16*Math.random())]+"F";

socket.on("id",id => {
 document.getElementById("id").innerHTML = `${socket.id}`;
});

socket.on("message", data => {
  /* data
  {
    id: "...",
    text: "...",
    color: "#..."
  }
  */
  $('.messages').append(`<span style = "color:${data.color};">${data.id} said</span>: ${data.text}<br>`)
});

//For the message send
$("#text").on('keydown',function(e){
  if(e.keyCode==13){
    $('.send').trigger('click')
  }
});
$('.send').click(function(){
  $('.messages').append(`<span style = "color:${color};">${socket.id} said</span>: ${$("#text").val()}<br>`)
  let data = {id: socket.id, text: $('#text').val(), color: color};
  socket.emit("message", data);
  $('#text').val('')
});

let pending = false;

function clicked() {
  // Click counter
  clicks++;

  let data = {clicks: clicks};
  socket.emit("click", data);

  $('#clicks').html(clicks)

  $('#cps').html(`${(clicks / ellapsed).toFixed(2)}`)

  if(!pending){
    $('footer').fadeOut(500, function(){
      $('footer').css({"position":"fixed"});
      $('footer p').html("Good job! Now <span>click on the top 3 navigation buttons.</span> They are Statistics, Leaderboard, and Chat. You can click on that same button again to show only the vital statistics.");
      $('footer').fadeIn(200);
      pending = true;
    });
  }
  // Timer
  timer = 0;
}

$('.nav').click(function(){
  if(pending){
    $('footer p').fadeOut(200,function(){
      $('footer p').removeAttr("style").html("Great work! Now <span>keep clicking</span> to help your teammates acheive each goal!").fadeIn(200).delay(2500).fadeOut(500, function(){
        $('footer').remove();
      });
    });
  }
});

setInterval(() => {
  // Timer
  $('#timer').html(timer);
  timer++;
  ellapsed++;
}, 1000);

socket.on("update", data => {
  // Update Important Data
  document.getElementById("total").innerHTML = `${data.total}`;

  document.getElementById("goal").innerHTML = `${data.goal}`;
  
  document.getElementById("reached").innerHTML = `${data.goal - data.total}`;

  document.getElementById("etogoal").innerHTML = `${((data.total / data.goal) * 100).toFixed(2)}%`;

  document.getElementById("tototal").innerHTML = `${isNaN(((clicks / data.total) * 100).toFixed(2))?100:((clicks / data.total) * 100).toFixed(2)}%`;

  document.getElementById("togoal").innerHTML = `${((clicks / data.goal) * 100).toFixed(2)}%`;

  document.body.style.backgroundSize = `${(((data.total / data.goal) * 100) / 2).toFixed(2)}%`;

  document.getElementById("ctimer").innerHTML = data.ctimer;

  document.getElementById("atimer").innerHTML = `${Math.round(data.avgtime)?data.avgtime:data.ctimer}`;

  document.getElementById("atimer").innerHTML = data.ltimer;

  $('#people').html(Object.keys(data.players).length-1);

  //For leaderboard
  /* players
  {
    "...": 123,
    ...
  }
  */

  $(".leaderboard").empty();

  let shown = 0;

  if(shown <= 10) {
    Object.keys(data.players).sort(function(a, b) {
      let A = data.players[a];
      let B = data.players[b];
      if (A < B) {
        return 1;
      }
      else if (A > B) {
        return -1;
      }
      else return 0;
    })
    .map(id => {
      if(id == "undefined") return;

      if(id === socket.id) {
        $('.leaderboard').append(`<li class="your-id">${id}: <span>${((data.players[id] / data.total)*100).toFixed(2)}%</span></li>`);
      } else {
        $('.leaderboard').append(`<li>${id}: <span>${((data.players[id] / data.total)*100).toFixed(2)}%</span></li>`);
      }

      shown++;
    });
  }
});