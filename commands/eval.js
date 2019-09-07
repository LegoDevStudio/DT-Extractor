const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "eval";
        this.module = "Utility";
        this.description = "Execute code using the eval() function";
        this.permission = -1;
        this.usage = "<code to execute>";
        this.args = 1;
    }
    code(args,m) {
        try {
            let result = eval(args.join(" "));
            let colour = Math.floor(Math.random() * 16777214);
            const embed = {
                "color": colour,
                "timestamp": Date.now(),
                "author": {
                  "name": Client.user.username,
                  "icon_url": Client.user.displayAvatarURL
                },
                "fields": [
                  {
                    "name": "Code Inputted",
                    "value": "```js\n"+args.join(" ")+"\n```"
                  },
                  {
                    "name": "Code Execution Result",
                    "value": "```js\n"+result+"\n```"
                  }
                ]
            };
            m.reply({embed:embed});
        }catch(err) {
            let colour = Math.floor(Math.random() * 16777214);
            const embed = {
                "color": colour,
                "timestamp": Date.now(),
                "author": {
                  "name": Client.user.username,
                  "icon_url": Client.user.displayAvatarURL
                },
                "fields": [
                  {
                    "name": "Code Inputted",
                    "value": "```js\n"+args.join(" ")+"\n```"
                  },
                  {
                    "name": "Code Execution Error",
                    "value": "```\n"+err+"\n```"
                  }
                ]
            };
            m.reply({embed:embed});
        }
    }
}