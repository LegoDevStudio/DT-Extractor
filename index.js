global.Discord = require("discord.js");
var mysql = require("mysql");
global.fs = require("fs");
global.lang = require("./lang/en.json");

global.version = "1.5.0";
global.prefix = ".!";

global.Client = new Discord.Client();

global.db = mysql.createConnection({
    host     : '54.37.204.19',
    user     : 'u5423_83DUIpXE7u',
    password : process.env.DB_KEY,
    database : 's5423_theCore'
});

String.prototype.format = function(data) {
  if(typeof data == "string") {
    data = [data];
  }
  data.forEach(value => {
    this = this.replace("{}", value);
  }
  return this;
}

console.internalLog = function(msg,state) {
  if(state == -1) state = "Debug";
  if(state == 0) state = "Info";
  if(state == 1) state = "Warning";
  if(state == 2) state = "Error";
  if(state == 3) state = "Critical";
  if(state == 4) state = "Fatal";
  let date = new Date(Date.now());
  console.log("[" + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "] <" + state + "> " + msg);
  if(state == "Fatal") {
    process.exit(1);
  }
}

console.debug = function(msg) {console.internalLog(msg,-1)};
console.info = function(msg) {console.internalLog(msg,0)};
console.warn = function(msg) {console.internalLog(msg,1)};
console.error = function(msg) {console.internalLog(msg,2)};
console.critical = function(msg) {console.internalLog(msg,3)};
console.fatal = function(msg) {console.internalLog(msg,4)};

var connected = false;

db.connect(function(err) {
  Client.login(process.env.DISCORD);
  if(err) {
    // Failed to connect.
    console.critical(lang.db.connect.fail.format([err.stack]));
    return;
  }
  console.info(lang.db.connect.success);
  connected = true;
  global.queryDB = function(cmd,data) {
    return new Promise((res,rej) => {
      if(!connected) {
        rej({"code":"NOT_CONNECTED","message":lang.db.query.error.notconnected});
      }else{
        if(typeof data == "string") {
          data = [data];
        }
        db.query(cmd,data,function(error,results,tables) {
          if(error) {
            rej({"code":error.code,"message":error.sqlMessage});
          }else{
            res(results,tables);
          }
        });
      }
    });
  }
});

global.checkPerms = function (lvl,user) {
  /*
    [-1] = Bot Developer
    [0]  = Everyone
    [1]  = Helper
    [2]  = Moderator
    [3]  = Senior Moderator
    [4]  = Administration
    [5]  = Server Owner
  */
  return new Promise((res,rej) => {
    Client.fetchApplication().then(application => {
      if(lvl == -1) if(application.owner.id == user.id) return res(true);
      if(lvl == 0) return res(true);
      if(lvl == 1) if(user.roles.has(global.config.roles.helper) || user.roles.has(global.config.roles.moderator) || user.roles.has(global.config.roles.seniormod) || user.roles.has(global.config.roles.admin) ||
user.roles.has(global.config.roles.owner)) return res(true);
      if(lvl == 2) if(user.roles.has(global.config.roles.moderator) || user.roles.has(global.config.roles.seniormod) || user.roles.has(global.config.roles.admin) ||
user.roles.has(global.config.roles.owner)) return res(true);
      if(lvl == 3) if(user.roles.has(global.config.roles.seniormod) || user.roles.has(global.config.roles.admin) || user.roles.has(global.config.roles.owner)) return res(true);
      if(lvl == 4) if(user.roles.has(global.config.roles.admin) ||
user.roles.has(global.config.roles.owner)) return res(true);
      if(lvl == 5) if(user.roles.has(global.config.roles.owner)) return res(true);
      return res(false);
    });
  });
}

global.getPerms = function(user) {
  return new Promise((res,rej) => {
    Client.fetchApplication().then(application => {
      if(user.guild.owner == user) return res(5);
      if(user.roles.has(global.config.admin)) return res(4);
      if(user.roles.has(global.config.seniormod)) return res(3);
      if(user.roles.has(global.config.mod)) return res(2);
      if(user.roles.has(global.config.helper)) return res(1);
      if(application.owner.id == user.id) return res(-1);
      return res(0);
    });
  });
}

global.permIdToName = {
  "-1":"Bot Developer",
  "0": "Everyone",
  "1": "Server Helper",
  "2": "Server Moderator",
  "3": "Server Senior Moderator",
  "4": "Server Administrator",
  "5": "Server Owner"
}

//LINE 114 - TO DO
