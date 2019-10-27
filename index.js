global.Discord = require("discord.js");
global.Client = new Discord.Client();
global.fs = require("fs");
global.prefix = ".?"
global.version = "1.5.0";
global.CommandStore = require("./CmdStore");
global.spintax = require('spintax');
const errorMsgs = ["U-Undyne I s-said don-n't press t-that button!","Well shit the duct tape and gum failed, time to apply more"]

CommandStore.prototype.registerCommands = (folder) => {
    fs.readdir("."+folder, function(err, items) {
        for(var i = 0;i<items.length;i++) {
            if(!items[i].endsWith(".js")) return;
            CommandStore.registerCommand("/"+folder+"/"+items[i]);
        }
    });
}
global.CommandStore = new CommandStore();
require("./util/Database");
require("./util/Permissions");
require("./util/Console");

global.errorMessage = () => return errorMsgs[Math.floor(Math.random() * (errorMsgs.length-1))];

Client.on("ready", () => {
    console.info("Online.");
    var events = require("./util/Events");
    CommandStore.registerCommands("/commands");
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
		"mod":server.roles.resolve(config.roles.mod),
		"admin":server.roles.resolve(config.roles.admin)
    }
    
    if(!connected) {
		console.warn("Due to failure to connect to the database, Database checks cannot occur.");
	}else{
		events();
    }
});

Client.on("message", m => {
    let locked = false;
    queryDB("SELECT * FROM `channels` WHERE `id`=?",[m.channel.id]).then(results => {
        if(results[0] != undefined) {
            // Locked.
            m.delete();
            locked = true
        }
    }).catch(e => { 
        console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
    });
    if(locked) return;
    if(m.content.startsWith(prefix)) {
        var cmd = m.content.replace(prefix,"").split(" ")[0];
        var args = m.content.replace(prefix,"").split(" ").splice(1);
        console.log(cmd+" "+args);
        CommandStore.execute(cmd,m,args);
    }else{
        // Custom Responces
        queryDB("SELECT * FROM `responces`",[]).then(results => {
            results.forEach(result => {
                if(m.content.toLowerCase() == result.msg) {
                    /*
                        {} allows you to have things that change depending on the message.
                        {name.user} will output the username of the author.
                        {name.member} will output the displayname of the author.
                        {name.bot} will output the name of the bot.
                        {permlevel} will output the permission level the author has on the bot.
                        {mention} will mention the author.
                    */
                    global.getPerms(m.member).then(permlevel => {
                        let response = result.response.replace("{name.user}",m.author.username).replace("{name.member}",m.member.displayName).replace("{name.bot}",Client.user.username).replace("{permlevel}",permIdToName[permlevel]).replace("{mention}","<@"+m.author.id+">");
                        
                        m.channel.send(response);
                    });
                }
            });
        }).catch(e => { 
            console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
        });
    }
});
