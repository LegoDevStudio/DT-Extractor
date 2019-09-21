const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "mute";
        this.module = "Moderation";
        this.description = "Mute a member in the server";
        this.permission = 1;
        this.usage = "<user id or mention> [time length (m/h/d)] [reason]";
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
        let time = args[1];
        let timeRaw = undefined;
        let timeMeasure = undefined;
        let timeMeasureRaw = undefined;
        let reason = undefined;
        if(time == undefined) {
            time = null;
        }else{
            if(time.includes("m")) {
                timeMeasure = "Minutes";
                timeMeasureRaw = "m";                        
            }else if(time.includes("h")) {
                timeMeasure = "Hours";
                timeMeasureRaw = "h";
            }else if(time.includes("d")) {
                timeMeasure = "Days";
                timeMeasureRaw = "d";
            }else{
                let time = null;
            }

            if(timeMeasure == undefined) {
                time = null;
            }else if(isNaN(parseInt(time.replace(timeMeasureRaw, "")))) {
                // Not actually a number
                time = null
            }
        }
        if(time == null) {
            reason = args.splice(1).join(" ");
        }else{
            reason = args.splice(2).join(" ");
        }
        // Internally, Perminant mutes have a duration of 0 as the database hasn't been built to handle perminant mutes.
        if(time == null) {
            time = 0;
        }else{
            time = parseInt(time.replace(timeMeasureRaw,""));
            timeRaw = time;
            if(timeMeasure == "Minutes") {
                time = time * 60 * 1000;
            }else if(timeMeasure == "Hours") {
                time = time * 60 * 60 * 1000;
            }else{
                time = time * 24 * 60 * 60 * 1000;
            }
        }
        if(reason == undefined) {
            reason = "No Reason Defined.";
        }
        // 0 = warn
        // 1 = mute
        // 2 = kick
        // 3 = ban
        let start = Date.now().toString();
        db.query("INSERT INTO `cases`(`user`, `issuer`, `type`, `reason`, `duration`, `start`, `active`) VALUES (?,?,?,?,?,?,?)", [user.id,m.author.id,1,reason,time,start,true], function(error,results,tables) {
            if(error) {
                m.reply("Failed to execute database change. User has not been punished.");
                return console.error("Failed to INSERT user id "+user.id+" INTO cases TABLE: "+error);
            }
            let length = timeRaw +" "+timeMeasure;
                if(time == 0) {
                length = "Infinity";
            }
            db.query("SELECT `caseid` FROM `cases` WHERE `user`=? AND `start`=?", [user.id, start], function(error,results,tables) {
                console.log(results);
                let embed = {
                    "color": 16711683,
                    "timestamp": Date.now(),
                    "author": {
                        "name": "Mute | Case #"+results[0].caseid,
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
                            "name": "Length",
                            "value": length
                        },
                        {
                            "name": "Reason",
                            "value": reason
                        },
                    ]
                };
                db.query("INSERT INTO `mutes`(`id`, `issuer`, `reason`, `duration`, `start`, `caseid`) VALUES (?,?,?,?,?,?)", [user.id,m.author.id,reason,time,start,results[0].caseid], function(error,results,tables) {
                    if(error) {
                        m.reply("Failed to execute database change. User has not been punished.");
                        return console.error("Failed to INSERT user id "+user.id+" INTO mutes TABLE: "+error);
                    }
                    user.roles.add(global.config.mutedrole,reason);
                    m.guild.channels.get(global.config.punishchannel).send({embed:embed})
                    m.reply("Muted user.");
                    Client.emit("modCommandExecuted", (m.content,m.member));
                });
            });
        });
    }
}
