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
        db.query("SELECT `caseid` FROM `mutes` WHERE `id`=?", [user.id], function(error,results,tables) {
            if(error) {
                m.reply("Failed to access database.");
                return console.error("Failed to SELECT `caseid` from user id "+user.id+": "+error);
            }
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
            user.removeRole(global.config.mutedrole,reason);
            m.guild.channels.get(global.config.punishchannel).send({embed:embed})
            db.query("DELETE FROM `mutes` WHERE `caseid`=?", [results[0].caseid], function(error,results,tables) {
                if(error) {
                    m.reply("Failed to delete mute. Unable to unmute.");
                    return console.error("Failed to DELETE user id "+user.id+" FROM mutes TABLE: "+error);
                }
                user.removeRole(global.config.mutedrole,reason);
                m.guild.channels.get(global.config.punishchannel).send({embed:embed})
                m.reply("Unmuted user.");
                Client.emit("modCommandExecuted", (m.content,m.member));
            });
        });
    }
}
