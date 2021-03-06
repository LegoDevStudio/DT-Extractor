const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "lock";
        this.module = "Moderation";
        this.description = "Lockdown a channel";
        this.permission = 2;
        this.usage = "<channel> [time length (m/h/d)] [reason]";
        this.args = 1;
        this.alias = ["lockdown"]
    }
    code(args,m) {
        let user = null;
        if(m.mentions.channels.first() != undefined) {
            user = m.mentions.channels.first();
        }else{
            return "Please mention a channel."
        }
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
        user.send("***__Channel Locked__***\n**Staff have left the following message**\n*"+reason+"*").then(msg => {
            queryDB("INSERT INTO `channels`(`id`, `reason`, `initiator`, `duration`, `start`, `msg`, `guild`) VALUES (?,?,?,?,?,?,?)", [user.id,reason,m.author.id,time,start,msg.id,m.guild.id]).then(results => {
                let length = timeRaw +" "+timeMeasure;
                    if(time == 0) {
                    length = "Infinity";
                }
                m.reply("Locked Channel.");
                Client.emit("modCommandExecuted", (m.content,m.member));
            }).catch(e => { 
                if(e.code == "NOT_CONNECTED") {msg.delete(); return "Database is not connected. Bot functionaly limited.";}
                m.reply("Failed to execute database change. Channel is not locked");
                msg.edit(spintax.unspin("***__Channel Unlocked Due To {Stupid Lego|Catastrophic} Error__***\n**come on lego fix your bot**\n\n*cockroach mode activated*"));
                console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
            });
        });
        
    }
}
