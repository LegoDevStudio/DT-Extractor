const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "unban";
        this.module = "Moderation";
        this.description = "Unban a member in the server";
        this.permission = 2;
        this.usage = "<user id or mention>";
        this.args = 1;
    }
    code(args,m) {
        let user = null;
        if(m.mentions.members.first() == undefined && !isNaN(parseInt(args[0]))) {
            user = m.guild.members.get(args[0]);
        }else if (m.mentions.users.first() != undefined){
            user = m.mentions.users.first();
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
        db.query("SELECT `caseid` FROM `bans` WHERE `id`=?", [user.id], function(error,results,tables) {
            if(error) {
                return console.error("Failed to SELECT `caseid` from user id "+user.id+": "+error);
            }
            console.log(results);
            let embed = {
                "color": 261888,
                "timestamp": Date.now(),
                "author": {
                    "name": "Unban | Case #"+results[0].caseid,
                    "icon_url": user.displayAvatarURL
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
            m.guild.unban(user.id);
            m.guild.channels.get(global.config.punishchannel).send({embed:embed})
            db.query("DELETE FROM `bans` WHERE `caseid`=?", [results[0].caseid], function(error,results,tables) {
                if(error) {
                    return console.error("Failed to DELETE user id "+user.id+" FROM bans TABLE: "+error);
                }
            });
            m.reply("Unbanned user.");
            Client.emit("modCommandExecuted", (m.content,m.member));
        });
    }
}