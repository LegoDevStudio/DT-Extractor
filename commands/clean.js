const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "clean";
        this.module = "Moderation";
        this.description = "Clean bot messages from a channel.";
        this.permission = 1;
        this.usage = "(optional number)";
    }
    code(args,m) {
        let msgs = [];
        let count = 50;
        if(args[0] != undefined && !isNaN(parseInt(args[0]))) {
            count = parseInt(args[0]);
        }
        m.channel.fetchMessages({ limit: count }).then(messages => {
            messages.array().forEach(message => {
                if(message.author.bot) { msgs[msgs.length] = message; }
            });
        });
        m.channel.bulkDelete(msgs, false).then(() => {
            m.reply("Cleared "+msgs.length+" messages.").then(msg => {
                setTimeout(() => {
                    msg.delete();
                },5000);
            });
        });
    }
    
}