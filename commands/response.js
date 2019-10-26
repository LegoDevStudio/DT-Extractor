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
                    queryDB("INSERT INTO `responces`(`msg`, `response`) VALUES (?,?)", [trigger,msg.content]).then(results => {
                        m.reply("Successfully added `"+trigger+"` as an autorespose. Try it out!");
                    }).catch(e => { 
                        if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                        m.reply("Failed to execute database change. Response not added.");
                        console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
                    });
                })
                .catch(collected => m.reply("Canceled addition."));
        }else if(args[0] == "remove") {
            if(args[1] == undefined) {
                return "You must define a trigger message\n?response remove <trigger message>";
            }
            queryDB("DELETE FROM `responces` WHERE `msg`=?", [args.splice(1).join(" ")]).then(results => {
                m.reply("Deleted autoresponse.");
            }).catch(e => { 
                if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                m.reply("Failed to execute database change. Response not removed.");
                console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
            });
        }else if(args[0] == "list") {
            queryDB("SELECT * FROM `responces`",[]).then(results => {
                let list = "";
                results.forEach(result => {
                    list = list + "\n" + result.msg;
                });
                m.reply("List of autoresponses:\n```"+list+"\n```");
            }).catch(e => { 
                if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                m.reply("Failed to get data from database.");
                console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
            });
        }
    }
}
