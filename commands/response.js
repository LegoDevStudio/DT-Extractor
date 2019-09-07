const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "response";
        this.module = "AutoResponse";
        this.description = "response configuation";
        this.permission = 2;
        this.usage = "<add/remove/list> [options]";
        this.args = 1;
    }
    code(args,m) {
        if(args[0] == "add") {
            if(args[1] == undefined) {
                return "You must define a trigger message\n?response add <trigger message>";
            }
            // So user enters trigger message then we prompt for response.
            let trigger = args.splice(1).join(" ");
            const filter = msg => msg.author.id == m.author.id;
            // Errors: ['time'] treats ending because of the time limit as an error
            m.reply("You have 2 minutes to enter a response the bot will send.")
            m.channel.awaitMessages(filter, { max: 1, time: 120000, errors: ['time'] })
                .then(collected => {
                    let msg = collected.array()[0];
                    m.reply("Adding autoresponse...");
                    db.query("INSERT INTO `responces`(`msg`, `response`) VALUES (?,?)", [trigger,msg.content], function(error,results,fields) {
                        if(error) {
                            m.reply("Failed to add autoresponse.");
                            return console.error("Failed to INSERT autoresponse: "+error);
                        }
                        m.reply("Successfully added `"+trigger+"` as an autorespose. Try it out!");
                    });
                })
                .catch(collected => m.reply("Canceled addition."));
        }else if(args[0] == "remove") {
            if(args[1] == undefined) {
                return "You must define a trigger message\n?response remove <trigger message>";
            }
            db.query("DELETE FROM `responces` WHERE `msg`=?", [args.splice(1).join(" ")], function(error,results,fields) {
                if(error) {
                    m.reply("Failed to delete autoresponse.");
                    return console.error("Failed to DELETE autoresponse: "+error);
                }
                m.reply("Deleted autoresponse.");
            });
        }else if(args[0] == "list") {
            db.query("SELECT * FROM `responces`", function(error,results,fields) {
                let list = "";
                results.forEach(result => {
                    list = list + "\n" + result.msg;
                });
                m.reply("List of autoresponses:\n```"+list+"\n```");
            });
        }
    }
}
