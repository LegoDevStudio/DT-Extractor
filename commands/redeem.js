const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "redeem";
        this.module = "Boost";
        this.description = "Server Boost Rewards";
        this.usage = "<color> <name of role>";
        this.permission = 0;
        this.args = 2;
    }
    code(args,m) {
        if(m.member.premiumSinceTimestamp == undefined) {
          return "<:info:622917463407067140> You must be boosting this server in order to redeem rewards.";
        }
        queryDb("SELECT * FROM `rewards` WHERE `id`=?", [m.author.id]).then((res,tables) => {
            if(res[0] != undefined) {
                return m.reply("<:info:622917463407067140> It seems like you've already claimed your reward. If you believe this is in error, contact LegoDev#0001 in DMs");
            }
            m.reply("<a:loading:622917463700668423> Creating your role. This can take a few seconds.").then(msg => {
                // Create a new role with data
                m.guild.roles.create({
                  data: {
                    name: args.splice(1).join(" "),
                    color: args[0],
                    position:37,
                    permissions: 0,
                    hoist: false,
                    mentionable: false
                  },
                  reason:"Nitro Boost Rewards"
                })
                .then(role => {
                    msg.edit("<@"+m.author.id+"> <a:loading:622917463700668423> Updating Database. Please wait...");
                    queryDb("INSERT INTO `rewards`(`id`, `roleId`) VALUES (?,?)", [m.author.id,role.id]).then((results,tab) => {
                        msg.edit("<@"+m.author.id+"> <:success:622917463234838538> Successfully updated database. You now have your role.");
                        m.member.roles.add(role);
                    }).catch(e => { 
                        msg.edit("<@"+m.author.id+"> <:error:624886916575264778> Whoops! An SQL error was encountered. You have recieved your role, but we are unable to check to see if you are still boosting. LegoDev has been automatically contacted and will manually enter the database entry soon."); 
                        m.guild.members.get("1867301808726343682").user.send(m.author.tag + " redeemed boost reward but unable to automatically alter database. Please execute the following command on the database\n`INSERT INTO \`rewards\`(\`id\`, \`roleId\`) VALUES ('"+m.author.id+"','"+role.id+"')`");
                        m.member.roles.add(role);
                        console.error(e.stack);
                    });
                })
                .catch(e => { msg.edit("<@"+m.author.id+"> <:error:624886916575264778> Whoops! An error was encountered while attempting to create the role."); console.error(e.stack); })
            });
        }).catch(e => { m.reply("<:error:624886916575264778> Failed to query database. SQL Error."); console.error(e.stack) });
    }
}
