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
            queryDB("SELECT * FROM `quotes`",[]).then(results => {
                let random = Math.floor(Math.random() * (results.length-1));
                let quote = results[random];
                m.reply("\n> "+quote.text+"\n- "+quote.user);
            }).catch(e => { 
                if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                m.reply("Failed to get data from database. *dammit lego*");
                console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
            });
        }else{
            if(!isNaN(parseInt(args[0]))) {
                queryDB("SELECT * FROM `quotes` WHERE `id`=?",[parseInt(args[0])]).then(results => {
                    let quote = results[0];
                    m.reply("\n> "+quote.text+"\n- "+quote.user);
                }).catch(e => { 
                    if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                    m.reply("Failed to get data from database.");
                    console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
                });
            }else{
                if(args[0] == "list") {
                    queryDB("SELECT `id` FROM `quotes`",[]).then(results => {
                        let msg = "";
                        results.forEach(result => {
                            msg = msg + "\n"+result.id;
                        });
                        m.reply("Quote list:"+msg+"\n\n*Run "+prefix+"quote <id> to view quote*");
                    }).catch(e => { 
                        if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                        m.reply("Failed to get data from database. *come on lego it's simple programming*");
                        console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
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
                                    queryDB("INSERT INTO `quotes`(`text`, `user`) VALUES (?,?)", [args.splice(2).join(" "),message.mentions.users.first().tag]).then(results => {
                                        m.reply("Quote Added.");
                                    }).catch(e => { 
                                        if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                                        m.reply("Failed to execute database change. Quote not added.");
                                        console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
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
                            queryDB("DELETE FROM `quotes` WHERE `id`=?", [parseInt(args[1])]).then(results => {
                                m.reply("Quote Removed.");
                            }).catch(e => { 
                                if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
                                m.reply("Failed to execute database change. Quote not removed.");
                                console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
                            });
                        }
                    });
                }
            }
        }
    }
}
