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
        db.query("SELECT `caseid` FROM `cases` WHERE `user`=?", [user.id], function(error,results,fields) {
            if(error) {
                m.reply("Unable to fetch case.");
                return console.error("Failed to SELECT `caseid` from `cases` WHERE `user`="+user.id+": "+error);
            }
            let cases = "";
            results.forEach(result => {
                cases = cases + "\n" + result.caseid;
            });
            m.reply("Here's a list of cases for "+user.user.username+"."+cases+"\nUse ?case <case id> to view them.");
        });
    }
}
