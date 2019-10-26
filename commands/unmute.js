const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "unmute";
        this.module = "Moderation";
        this.description = "unmute a member in the server";
        this.permission = 1;
        this.usage = "<user id or mention>";
        this.args = 1;
    }
    code(args,m) {
        let user = null;
        if(m.mentions.members.first() == undefined && !isNaN(parseInt(args[0]))) {
            user = m.guild.members.get(args[0]);
        }else if (m.mentions.members.first() != undefined){
            user = m.mentions.members.first();
        }else{
            return "Must be a userid or mention."
        }
        global.getPerms(user).then(perms => {
            if(perms > 1) {
                return "This member is an admin. I cannot do that.";
            }
        });
        // 0 = warn
        // 1 = mute
        // 2 = kick
        // 3 = ban
        let start = Date.now().toString();
        queryDB("SELECT `caseid` FROM `mutes` WHERE `id`=?", [user.id]).then(results => {
            if(results[0] == undefined) m.reply("Unable to find user in database. Maybe muted from another bot?");
            console.log(results);
            let embed = {
                "color": 261888,
                "timestamp": Date.now(),
                "author": {
                    "name": "Unmute | Case #"+results[0].caseid,
                    "icon_url": user.user.displayAvatarURL
                },
                "fields": [
                    {
                        "name": "Username",
                        "value": "<@"+user.id+">",
                        "inline": true
                    },
                    {
                        "name": "Moderator",
                        "value": "<@"+m.author.id+">",
                        "inline": true
                    }
                ]
            };
            queryDB("DELETE FROM `mutes` WHERE `caseid`=?", [results[0].caseid]).then(results => {
                user.removeRole(global.config.mutedrole,reason);
                m.guild.channels.get(global.config.punishchannel).send({embed:embed})
                m.reply("Unmuted user.");
                Client.emit("modCommandExecuted", (m.content,m.member));
            }).catch(e => { 
                if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                m.reply("Failed to execute database change. User has not been unmuted.");
                console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
            });
        }).catch(e => { 
            if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
            m.reply("Failed to execute database change. User has not been unmuted.");
            console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
        });
    }
}
