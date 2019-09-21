const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "redeem";
        this.module = "Boost";
        this.description = "Server Boost Rewards";
        this.permission = 0;
    }
    code(args,m) {
        if(m.member.premiumSinceTimestamp == undefined) {
          return "You must be boosting this server in order to redeem rewards.";
        }
    }
    db.query("SELECT * FROM `rewards` WHERE 'id'=?", [m.author.id], function(error,results,tables) {
    
    });
}
