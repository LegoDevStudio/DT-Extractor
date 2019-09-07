const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "unlock";
        this.module = "Moderation";
        this.description = "End Lockdown in a channel";
        this.permission = 2;
        this.usage = "<channel>";
        this.args = 1;
    }
    code(args,m) {
        let user = null;
        if(m.mentions.channels.first() != undefined) {
            user = m.mentions.channels.first();
        }else{
            return "Please mention a channel."
        }
        // 0 = warn
        // 1 = mute
        // 2 = kick
        // 3 = ban
        let start = Date.now().toString();
        db.query("SELECT * FROM `channels` WHERE `id`=?",[user.id], function(error,results,fields) {
            Client.guilds.get(results[0].guild).channels.get(results[0].id).fetchMessage(results[0].msg).then(msg => {
                db.query("DELETE FROM `channels` WHERE `id`=?",[results[0].id],function(error,results,fields) {
                    if(error) {
                        m.reply("Failed to unlock channel. Channel remains in LOCKED state.");
                        return console.error("Failed to unlock channel "+result.id+": "+error);
                    }
                    msg.edit("***__Channel Unlocked__***\n**Channel lockdown is now over.**");
                    m.reply("Unlocked Channel");
                    Client.emit("modCommandExecuted", (m.content,m.member));
                });
            });
        });
    }
}
