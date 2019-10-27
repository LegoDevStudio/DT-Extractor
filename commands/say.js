const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "say";
        this.module = "Utility";
        this.description = "Echo!";
        this.permission = 3
    }
    code(args,m) {
        m.channel.send(args.join(" "))
        m.delete();
    }
}