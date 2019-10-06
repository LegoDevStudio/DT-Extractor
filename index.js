global.Discord = require("discord.js");
var mysql = require("mysql");
global.fs = require("fs");

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
    console.critical("Failed to connect to database:\n{}".format(err.stack);
    return;
  }
  console.info(lang.db.connect.success);
  connected = true;
  global.queryDB = function(cmd,data) {
    return new Promise((res,rej) => {
      if(!connected) {
        rej({"code":"NOT_CONNECTED","message":"Database not connected."});
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
      if(lvl == 1) if(user.roles.has(config.roles.helper) || user.roles.has(config.roles.moderator) || user.roles.has(config.roles.seniormod) || user.roles.has(config.roles.admin) ||
user.roles.has(config.roles.owner)) return res(true);
      if(lvl == 2) if(user.roles.has(config.roles.moderator) || user.roles.has(config.roles.seniormod) || user.roles.has(config.roles.admin) ||
user.roles.has(config.roles.owner)) return res(true);
      if(lvl == 3) if(user.roles.has(config.roles.seniormod) || user.roles.has(config.roles.admin) || user.roles.has(config.roles.owner)) return res(true);
      if(lvl == 4) if(user.roles.has(config.roles.admin) ||
user.roles.has(config.roles.owner)) return res(true);
      if(lvl == 5) if(user.roles.has(config.roles.owner)) return res(true);
      return res(false);
    });
  });
}

global.getPerms = function(user) {
  return new Promise((res,rej) => {
    Client.fetchApplication().then(application => {
      if(user.guild.owner == user) return res(5);
      if(user.roles.has(config.roles.admin)) return res(4);
      if(user.roles.has(config.roles.seniormod)) return res(3);
      if(user.roles.has(config.roles.mod)) return res(2);
      if(user.roles.has(config.roles.helper)) return res(1);
      if(application.owner.id == user.id) return res(-1);
      return res(0);
    });
  });
}

function formatMessage(content) {
  let args = content.split(" ");
  let result = [];
  args.forEach(arg => {
    if(arg.startsWith("${&") && arg.replace(",","").endsWith("}")) {
      // Role mention
      arg = arg.replace("${&","<@&").replace("}",">");
    }
    result[result.length] = arg;
  });
  return result.join(" ");
}
    
Client.on("ready", () => {
	console.info("Bot Booted.");
	
	Client.user.setActivity("messages | v"+version, {"type":"WATCHING"});
	
	global.server = Client.guilds.resolve("413155443997802528");
	server.roles.fetch().then(roles => {
		console.debug("Fetched {} roles and stored in cache".format(roles.size));
	}).catch(err => {
		console.warn("Failed to fetch roles:\n{}".format(err.stack));
	});
	server.members.fetch({cache:true}).then(members => {
		console.debug("Fetched {} members and stored in cache".format(members.size));
	}).catch(err => {
		console.warn("Failed to fetch members:\n{}".format(err.stack));
	});
	
	global.roles = {
		"muted":server.roles.resolve(config.roles.muted),
		"helper":server.roles.resolve(config.roles.helper),
		"mod":server.roles.resolve(config.roles.mod),
		"seniormod":server.roles.resolve(config.roles.seniormod),
		"admin":server.roles.resolve(config.roles.admin)
	}
	
	if(!connected) {
		console.warn("Due to failure to connect to the database, Database checks cannot occur.");
	}else{
		setInterval(() => {
			//TODO - Redo database.
		},60000);
		
	}
});
	
Client.on("message", message => {
	
});
