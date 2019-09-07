const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "quote";
        this.module = "Fun";
        this.description = "Get a random quote";
        this.permission = 0;
        this.usage = "[options]";
    }
    code(args,m) {
        if(args[0] == undefined) {
            db.query("SELECT * FROM `quotes`", function(error,results,fields) {
                if(error) {
                    m.reply("Failed to get a quote. SQL error occured.");
                    return console.error("Failed to SELECT * FROM `quotes`: "+error);
                }
                let random = Math.floor(Math.random() * (results.length-1));
                let quote = results[random];
                m.reply("\n> "+quote.text+"\n- "+quote.user);
            });
        }else{
            if(!isNaN(parseInt(args[0]))) {
                db.query("SELECT * FROM `quotes` WHERE `id`=?",[parseInt(args[0])],function(error,results,fields) {
                    if(error) {
                        m.reply("Failed to get quote. SQL error occured.");
                        return console.error("Failed to SELECT * FROM `quotes` WHERE `id`="+args[0]+": "+error);
                    }
                    let quote = results[0];
                    m.reply("\n> "+quote.text+"\n- "+quote.user);
                });
            }else{
                if(args[0] == "list") {
                    db.query("SELECT `id` FROM `quotes`", function(error,results,fields) {
                        if(error) {
                            m.reply("Failed to get quote list. SQL error occured.");
                            return console.error("Failed to SELECT `id` FROM `quotes`: "+error);
                        }
                        let msg = "";
                        results.forEach(result => {
                            msg = msg + "\n"+result.id;
                        });
                        m.reply("Quote list:"+msg+"\n\n*Run "+prefix+"quote <id> to view quote*");
                    });
                }
                if(args[0] == "add") {
                    checkPerms(1,m.member).then(res => {
                        if(res == false) {
                            getPerms(m.member).then(result => {
                                return m.reply("***You do not have the required permissions to run that command***\n**Your Permission Level:** "+permIdToName[result.toString()]+"\n**Required Permission Level:** "+permIdToName[file.permission.toString()]);
                            });
                        }else{
                            // args[1] = member mention
                            if(message.mentions.users.first()) {
                                if(args.splice(2).join(" ") == "") {
                                    m.reply("Please provide a message to send.");
                                }else{
                                    db.query("INSERT INTO `quotes`(`text`, `user`) VALUES (?,?)", [args.splice(2).join(" "),message.mentions.users.first().tag], function(error,results,tables) {
                                        if(error) {
                                            m.reply("Failed to add quote to database.");
                                            return console.error("Failed to INSERT INTO `quotes`: "+error);
                                        }
                                        m.reply("Quote Added.");
                                    });
                                }
                            }else{
                                m.reply("Please mention a user.");
                            }
                        }
                    });
                }
                if(args[0] == "remove") {
                    checkPerms(1,m.member).then(res => {
                        if(res == false) {
                            getPerms(m.member).then(result => {
                                return m.reply("***You do not have the required permissions to run that command***\n**Your Permission Level:** "+permIdToName[result.toString()]+"\n**Required Permission Level:** "+permIdToName[file.permission.toString()]);
                            });
                        }else{
                            // args[1] = id
                            if(args[1] == undefined || isNaN(parseInt(args[1]))) {
                                return m.reply("Please provide a quote id to remove. MUST be a number.");
                            }
                            db.query("DELETE FROM `quotes` WHERE `id`=?", [parseInt(args[1])], function(error,results,tables) {
                                if(error) {
                                    m.reply("Failed to delete quote.");
                                    return console.error("Failed to DELETE quote: "+error);
                                }
                                m.reply("Quote Removed.");
                            });
                        }
                    });
                }
            }
        }
    }
}
