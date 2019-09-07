const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "purge";
        this.module = "Moderation";
        this.description = "Clear messages from channel (1000 messages max)";
        this.permission = 0;
        this.usage = "<amout of messages to clear>";
        this.args = 1;
    }
    code(args,m) {
        if(isNaN(parseInt(args[0]))) {
            return m.reply("Must be a number.")
        }
        m.channel.bulkDelete(parseInt(args[0])).then(messages => {
            m.reply("Deleted "+messages.size+" messages.").then(msg => {
                setTimeout(() => msg.delete(),5000);
            });
        }).catch(err => {
            m.reply("Failed to delete messages.");
            console.error("Failed to delete messages: "+err.stack);
        });
    }
}