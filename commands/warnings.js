const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "warnings";
        this.module = "Moderation";
        this.description = "View all case numbers for a user";
        this.permission = 1;
        this.usage = "<user id or mention>";
        this.args = 1;
        this.alias = ["warns"]
    }
    code(args,m) {
        let user = null;
        if(m.mentions.members.first() == undefined && !isNaN(parseInt(args[0]))) {
            user = m.guild.members.get(args[0]);
        }else if (m.mentions.members.first() != undefined){
            user = m.mentions.members.first();
        }else{
            return "Must be a userid or mention."
        }
        queryDB("SELECT `caseid` FROM `cases` WHERE `user`=?", [user.id]).then(results => {
            if(error) {
                m.reply("Unable to fetch case.");
                return console.error("Failed to SELECT `caseid` from `cases` WHERE `user`="+user.id+": "+error);
            }
            let cases = "";
            results.forEach(result => {
                cases = cases + "\n" + result.caseid;
            });
            m.reply("Here's a list of cases for "+user.user.username+"."+cases+"\nUse ?case <case id> to view them.");
        }).catch(e => { 
            if(e.code == "NOT_CONNECTED") return "Database is not connected. Bot functionaly limited.";
            m.reply("Failed to get data from database.");
            console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message);
        });
    }
}
