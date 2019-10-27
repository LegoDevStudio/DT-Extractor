const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "ping";
        this.module = "Utility";
        this.description = "Returns the time in milliseconds it takes to send infomation to Discord.";
        this.alias = ["isalive"]
    }
    code(args,m) {
        m.channel.send("Please wait...").then(msg => {
            var time = Date.now() - msg.createdTimestamp;
            msg.edit("<@"+m.author.id+"> Pong! It took "+time+" milliseconds to edit this message.");
        });
    }
    
}