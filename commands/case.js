const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "case";
        this.module = "Moderation";
        this.description = "View a single mod log case";
        this.permission = 1;
        this.usage = "<case id>";
        this.args = 1;
    }
    code(args,m) {
        if(isNaN(parseInt(args[0]))) {
            return "Case id must be a number."
        }
        db.query("SELECT * FROM `cases` WHERE `caseid`=?", [parseInt(args[0])], function(error,results,fields) {
            if(error) {
                m.reply("Failed to select from database.");
                return console.error("Failed to SELECT * from `cases` WHERE `caseid`="+args[0]+": "+error);
            }
            if(results[0] == undefined) {
                return "Case doesn't exist.";
            }
            let type = "";
            if(results[0].type == 0) type = "Warn";
            if(results[0].type == 1) type = "Mute";
            if(results[0].type == 2) type = "Kick";
            if(results[0].type == 3) type = "Ban";
            const embed = {
                "color": 1681632,
                "timestamp": Date.now(),
                "author": {
                  "name": "Case #"+args[0],
                  "icon_url": Client.fetchUser(results[0].user).displayAvatarURL
                },
                "fields": [
                  {
                    "name": "Member",
                    "value": "<@"+results[0].user+">",
                    "inline": true
                  },
                  {
                    "name": "Moderator",
                    "value": "<@"+results[0].issuer+">",
                    "inline": true
                  },
                  {
                    "name": "Type",
                    "value": type,
                    "inline": true
                  },
                  {
                    "name": "Reason",
                    "value": results[0].reason,
                    "inline": true
                  }
                ]
            };
            m.reply({ embed:embed });
        });
    }
}
