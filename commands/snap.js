const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "snap";
        this.module = "Moderation";
        this.description = "Kick all members who have been inactive for 2 months.";
        this.permission = 2;
    }
    code(args,m) {
        // Snap people who haven't spoken in 5256005760 milliseconds
        db.query("SELECT `id` FROM `activity` WHERE `last`<=?",[m.createdTimestamp-5256005760],function(error,results,tables) {
            if(error) {
                console.error("Failed to SELECT `id` FROM `activity` WHERE `last`<="+(m.createdTimestamp-5256005760)+": "+error)
                throw "SQL Error Detected.";
            }
            results.forEach(inactive => {
                //Double-Check.
                let member = m.guild.members.get(inactive.id);
                if(member.lastMessage.createdTimestamp <= m.createdTimestamp-5256005760 && !member.roles.has("610160842381459476")) {
                    // Confirmed. Send message then kick.
                    member.user.send("You were kicked from "+m.guild.name+" because you didn't talk for 2 months. If you wish to rejoin, You can find the server on Disboard.").then(msg => {
                        member.kick("Inactivity Purge - Initiated By "+m.author.tag);
                    });
                }
            });
            m.reply("Snapped all members who have been inactive for 2 months.");
            Client.emit("modCommandExecuted", (m.content,m.member));
        });
    }
}