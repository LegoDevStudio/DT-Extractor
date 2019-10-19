const Command = require("../util/Command");
const fs = require('fs');

var permIdToName = {
    "-1": "Bot Developer",
    "0": "Everyone",
    "1": "Server Moderator",
    "2": "Server Administrator",
    "3": "Server Owner"
}

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "help";
        this.module = "Utility";
        this.description = "List all commands in the bot";
        this.permission = 0;
        this.usage = "[command name]"
    }
    code(args,m) {
        if(args[0] == undefined) {
            // All modules on the bot
            var Utility = "";
            var Moderation = "";
            var AutoResponse = "";
            var Fun = "";

            // Get all files in the command folder.
            fs.readdir("./commands/", (err, files) => {
                if(err) {
                    m.reply("An error occured... For some reason.");
                    return console.error(err);
                }
                for(var i = 0;i<=files.length;i++) {
                    if(i == files.length) {
                        return m.author.send("***__Command List__***\n\n**__Utility__**"+Utility+"\n\n**__Moderation__**"+Moderation+"\n\n**__AutoResponse__**"+AutoResponse+"\n\n**__Fun__**"+Fun+"\n\n*Run the help command with a command as an argument to see more info about the command*").then(msg => m.reply("Sent Command Help to DMs.")).catch(err => {m.reply("Failed to send help info to your dms."); console.error("Failed to send help to member's dms: "+err.stack)});
                    }
                    let file = files[i];
                    var cmd = require("./"+file);
                    cmd = new cmd();
                    if(cmd.module == "Utility") {
                        Utility = Utility + "\n> "+cmd.name+" - "+cmd.description;
                    }
                    if(cmd.module == "Moderation") {
                        Moderation = Moderation + "\n> "+cmd.name+" - "+cmd.description;
                    }
                    if(cmd.module == "AutoResponse") {
                        AutoResponse = AutoResponse + "\n> "+cmd.name+" - "+cmd.description;
                    }
                    if(cmd.module == "Fun") {
                        Fun = Fun + "\n> "+cmd.name+" - "+cmd.description;
                    }
                }
            });
        }else{
            try {
                let file = require("./"+args[0]);
                var cmd = new file();
                let colour = Math.floor(Math.random() * 16777214);
                const data = {
                    "color": colour,
                    "author": {
                        "name": "Command Info | "+cmd.name,
                        "icon_url": Client.user.displayAvatarURL
                    },
                    "fields": [
                        {
                            "name": "Description",
                            "value": cmd.description
                        },
                        {
                            "name": "Module",
                            "value": cmd.module,
                            "inline": true
                        },
                        {
                            "name": "Permission Required",
                            "value": permIdToName[cmd.permission.toString()],
                            "inline": true
                        },
                        {
                            "name": "Enabled",
                            "value": cmd.enabled,
                            "inline": true
                        },
                        {
                            "name": "Usage",
                            "value": prefix+cmd.name+" "+cmd.usage || prefix+cmd.name
                        }
                    ]
                }
                m.reply({embed:data});
            } catch(error) {
                if(error.message.includes("Cannot find module")) return;
                m.reply("An error occured while trying to give you the command info.");
                console.error("Failed to give user command info: "+error.stack);
            }
        }
    }
}