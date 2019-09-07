const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "info";
        this.module = "Utility";
        this.description = "Bot Info.";
        this.permission = 0
    }
    code(args,m) {
        let shard = 0;
        let shards = 0;
        if(Client.shard == undefined) {
            shards = 0;
            shard = 0;
        }else{
            shards = Client.shard.count;
            shard = Client.shard.id;
        }
        const embed = {
            "color": 9442302,
            "footer": {
              "text": "Shard "+shard+"/"+shards+" | Uptime "+new Date(Client.uptime).getHours()+" hrs "+new Date(Client.uptime).getMinutes()+" mins "+new Date(Client.uptime).getSeconds()+" secs"
            },
            "author": {
              "name": Client.user.username,
              "icon_url": Client.user.displayAvatarURL
            },
            "fields": [
              {
                "name": "Version",
                "value": version,
                "inline": true
              },
              {
                "name": "Library",
                "value": "discord.js",
                "inline": true
              },
              {
                "name": "Creator",
                "value": Client.application.owner.tag,
                "inline": true
              },
              {
                "name": "Servers",
                "value": Client.guilds.array().length,
                "inline": true
              },
              {
                "name": "​",
                "value": "​",
                "inline": true
              },
              {
                "name": "Users",
                "value": Client.users.array().length,
                "inline": true
              }
            ]
        };
        m.reply({ embed:embed });
    }
    
}