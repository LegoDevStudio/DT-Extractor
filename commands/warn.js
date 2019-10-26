const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "warn";
        this.module = "Moderation";
        this.description = "Warn a member.";
        this.permission = 1;
        this.usage = "<user id or mention> [reason]";
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
        let reason = "No Reason Defined.";
        if(args[1] != undefined) {
            reason = args.splice(1).join(" ");
        }
        // 0 = warn
        // 1 = mute
        // 2 = kick
        // 3 = ban
        let start = Date.now().toString();
        queryDB("INSERT INTO `cases`(`user`, `issuer`, `type`, `reason`, `duration`, `start`, `active`) VALUES (?,?,?,?,?,?,?)", [user.id,m.author.id,0,reason,0,start,true]).then(results => {

            queryDB("SELECT `caseid` FROM `cases` WHERE `user`=? AND `start`=?", [user.id, start]).then(results => {
                console.log(results);
                let embed = {
                    "color": 16711683,
                    "timestamp": Date.now(),
                    "author": {
                        "name": "Warn | Case #"+results[0].caseid,
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
                        },
                        {
                            "name": "Reason",
                            "value": reason
                        },
                    ]
                };
                m.guild.channels.get(global.config.punishchannel).send({embed:embed});
                user.user.send("Hey, You got warned by a moderator in "+m.guild.name+" for "+reason+". If you continue your behaviour, further punishment will occur.");
                m.reply("Warned user.");
            }).catch(e => { 
                if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                m.reply(m.author.username + ": please let this command execute normally\nDT Extractor: With this bot? NO WAY!\nThe database errored :/");
                console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
            });
        }).catch(e => { 
            if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
            m.reply(m.author.username + ": please let this command execute normally\nDT Extractor: With this bot? NO WAY!\nThe database errored :/");
            console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
        });
    }
}
