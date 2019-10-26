const Command = require("../util/Command");
const fs = require('fs');

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "help";
        this.module = "Utility";
        this.description = "List all commands in the bot";
        this.permission = 0;
        this.usage = "[command name]";
        this.alias = ["cmds","list","commands"]
    }
    code(args,m) {
        if(args[0] == undefined) {
            // All modules on the bot
            var Utility = "";
            var Moderation = "";
            var AutoResponse = "";
            var Fun = "";

            // Get all files in the command folder.
            let cmds = Object.values(CommandStore.cmds)
            cmds.forEach(file => {
                var cmd = file;
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
            });
            return m.author.send("***__Command List__***\n\n**__Utility__**"+Utility+"\n\n**__Moderation__**"+Moderation+"\n\n**__AutoResponse__**"+AutoResponse+"\n\n**__Fun__**"+Fun+"\n\n*Run the help command with a command as an argument to see more info about the command*").then(msg => m.reply("Sent Command Help to DMs.")).catch(err => {m.reply("Failed to send help info to your dms."); console.error("Failed to send help to member's dms: "+err.stack)});
        }else{
            args[0] = args[0].toLowerCase();
            try {
                var cmd = CommandStore.cmds[args[0]];
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
                        },
                        {
                            "name": "Alias",
                            "value": cmd.alias.join(", ")
                        }
                    ]
                }
                m.reply({embed:data});
            } catch(error) {
                if(error.message.includes("Cannot read property")) {
                    CommandStore.alias.forEach(ali => {
                        if(ali[0] == undefined) return;
                        ali[0].forEach(cmdd => {
                            if(cmdd == args[0]) {
                                console.log("alias");
                                var cmd = CommandStore.cmds[ali[1]];
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
                                        },
                                        {
                                            "name": "Alias",
                                            "value": cmd.alias.join(", ")
                                        }
                                    ]
                                }
                                return m.reply({embed:data});
                            }
                        });
                        return "No command with that name exists.";
                    });
                }else{
                    m.reply("An error occured while trying to give you the command info.");
                    console.error("Failed to give user command info: "+error.stack);
                }
            }
        }
    }
}