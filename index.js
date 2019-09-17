var Discord = require("discord.js");
var fs = require("fs");

var Client = new Discord.Client();

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

Client.login("NjA5Mjk2NTQ2MzE5Njk1ODcy.XU0pqQ.7h445GunAkbre4GbcBJw499pm1I");

// When discord client is ready, this is fired
Client.on("ready", () => {
    console.log("Ready.");
    require("./util/Radio");
    global.Discord = Discord;
    global.Client = Client;
});
