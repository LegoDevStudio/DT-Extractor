// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
var sa = require("superagent");
var bodyParser = require('body-parser')
var status = {"status":1,"desc":""};
global.config = require("./config/config.json");
var fs = require("fs");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/panel/:section",(req,res) => { res.sendFile(__dirname + "/views/panel/"+req.params.section+".html")});

app.get("/panel", (req,res) => {
  res.sendFile(__dirname + "/views/panel/main.html");
});

app.get("/config/:section",(req,res) => {
  if(req.params.section=="general") {
    res.send([global.config.modrole,global.config.adminrole,global.config.mutedrole,global.config.punishchannel,global.config.announcements.channelid])
  }
  if(req.params.section=="join") {
    console.log([config.announcements.joinmsg.enabled,config.announcements.joinmsg.text,config.announcements.joinmsg.sendAsDM])
    res.send([config.announcements.joinmsg.enabled,config.announcements.joinmsg.text,config.announcements.joinmsg.sendAsDM])
  }
  if(req.params.section=="leave") {
    res.send([config.announcements.leavemsg.enabled,config.announcements.leavemsg.text]);
  }
  if(req.params.section=="ban") {
    res.send([config.announcements.banmsg.enabled,config.announcements.banmsg.text]);
  }
  if(req.params.section=="welcome") {
    res.send([config.welcomemsg.enabled,config.welcomemsg.text,config.welcomemsg.channel,config.welcomemsg.dm]);
  }
});

app.post("/config/:section", (req,res) => {
  if(req.params.section=="general") {
    config.modrole = req.body["a[]"][0];
    config.adminrole = req.body["a[]"][1];
    config.mutedrole = req.body["a[]"][2];
    config.punishchannel = req.body["a[]"][3];
    config.announcements.channelid = req.body["a[]"][4];
    saveConfig();
    res.send(true);
  }
  if(req.params.section=="join") {
    if(req.body["a[]"][0] == "true") { req.body["a[]"][0] = true }else{ req.body["a[]"][0] = false }
    if(req.body["a[]"][2] == "true") { req.body["a[]"][2] = true }else{ req.body["a[]"][2] = false }
    console.log(JSON.stringify(req.body));
    config.announcements.joinmsg.enabled = req.body["a[]"][0];
    config.announcements.joinmsg.text = req.body["a[]"][1];
    config.announcements.joinmsg.sendAsDM = req.body["a[]"][2];
    saveConfig();
    res.send(true)
  }
  if(req.params.section=="leave") {
    if(req.body["a[]"][0] == "true") { req.body["a[]"][0] = true }else{ req.body["a[]"][0] = false }
    console.log(JSON.stringify(req.body));
    config.announcements.leavemsg.enabled = req.body["a[]"][0];
    config.announcements.leavemsg.text = req.body["a[]"][1];
    saveConfig();
    res.send(true);
  }
  if(req.params.section=="ban") {
    if(req.body["a[]"][0] == "true") { req.body["a[]"][0] = true }else{ req.body["a[]"][0] = false }
    console.log(JSON.stringify(req.body));
    config.announcements.banmsg.enabled = req.body["a[]"][0];
    config.announcements.banmsg.text = req.body["a[]"][1];
    saveConfig();
    res.send(true);
  }
  if(req.params.section=="welcome") {
    if(req.body["a[]"][0] == "true") { req.body["a[]"][0] = true }else{ req.body["a[]"][0] = false }
    if(req.body["a[]"][3] == "true") { req.body["a[]"][3] = true }else{ req.body["a[]"][3] = false }
    console.log(JSON.stringify(req.body));
    config.welcomemsg.enabled = req.body["a[]"][0];
    config.welcomemsg.dm = req.body["a[]"][3];
    config.welcomemsg.channel = req.body["a[]"][2];
    config.welcomemsg.text = req.body["a[]"][1];
    saveConfig();
    res.send(true);
  }
});

app.get("/cardinal", (req,res) => {
  res.sendStatus(200);
});

global.saveConfig = function() {
    // Save bot''s config.
    fs.writeFileSync("./config/config.json",JSON.stringify(global.config));
}

global.changeState = function(state,desc) {
  status = {"status":state,"desc":desc};
  return true;
}

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
  var index = require("./index");
  sa.post("https://legodev-system-status.glitch.me/api/status")
        .send({"key":process.env.API_KEY,"status":status.status,"desc":status.desc,"id":"dte"})
        .end((err,res) => {
            if(err || !res.ok) {
              console.log("Failed to change status: "+err.stack);
            }
        });
  setInterval(() => {
    sa.post("https://legodev-system-status.glitch.me/api/status")
        .send({"key":process.env.API_KEY,"status":status.status,"desc":status.desc,"id":"dte"})
        .end((err,res) => {
            if(err || !res.ok) {
              console.log("Failed to change status: "+err.stack);
            }
        });
  },59000)
});
