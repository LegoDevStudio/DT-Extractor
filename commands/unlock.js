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
        queryDB("SELECT * FROM `channels` WHERE `id`=?",[user.id]).then(results => {
            server.channels.resolve(results[0].id).messages.fetch(results[0].msg).then(msg => {
                queryDB("DELETE FROM `channels` WHERE `id`=?",[results[0].id]).then(results => {
                    msg.edit("***__Channel Unlocked__***\n**Channel lockdown is now over.**");
                    m.reply("Unlocked Channel");
                    Client.emit("modCommandExecuted", (m.content,m.member));
                }).catch(e => { 
                    if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                    m.reply("Failed to execute database change. At this point you should just get Lego to manually edit the database or prevent the bot from deleting messages.");
                    msg.edit("***__Channel Unlocked__***\n***But because lego's an idiot, an error occured.***\n*cockroach mode activated*")
                    console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
                });
            });
        }).catch(e => { 
            if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
            m.reply("Failed to get data from database. You know what that means.");
            console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
        });
    }
}
