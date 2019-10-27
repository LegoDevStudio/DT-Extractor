class CommandStore {
    constructor() {
        this.cmds = {};
        this.alias = [];
    }
    registerCommand(file) {
        file = require("."+file);
        file = new file();
        this.cmds[file.name] = file;
        console.log(this.cmds[file.name])
        this.alias[this.alias.length] = [file.alias,file.name];
    }
    execute(cmdName,msg,args) {
        console.log("hello!")
        cmdName = cmdName.toLowerCase();
        if(this.cmds.hasOwnProperty(cmdName)) {
            console.log(cmdName+" "+args);
            checkPerms(this.cmds[cmdName].permission,msg.member).then(res => {
                console.log(res);
                if(res == false) {
                    getPerms(msg.member).then(result => {
                        return msg.reply("***You do not have the required permissions to run that command***\n**Your Permission Level:** "+permIdToName[result.toString()]+"\n**Required Permission Level:** "+permIdToName[this.cmds[cmdName].permission.toString()]);
                    });
                }else{
                    console.log(cmdName+" "+args);
                    this.cmds[cmdName].execute(args,msg).catch(err => {
                        if(err.code == 1) return;
                        if(err.code == 2) {
                            const embed = {
                                "description": "**An error was detected and intercepted.\nThe bot has recovered.**",
                                "color": 16764416,
                                "timestamp": Date.now(),
                                "author": {
                                    "name": "Command Error Detected",
                                    "icon_url": Client.user.displayAvatarURL
                                },
                                "fields": [
                                    {
                                        "name": "Error Dump",
                                        "value": "```\n"+err.message+"\n```"
                                    }
                                ]
                            };
                            msg.channel.send({embed});
                        }
                        if(err.code == 3) {
                            msg.reply("Incorrect Usage: "+prefix+this.cmds[cmdName].name+" "+err.message);
                        }
                    });
                }
            }).catch(e => { console.log(e); });
        }else{
            if(this.alias == []) return;
            this.alias.forEach(ali => {
                if(ali[0] == undefined) return;
                ali[0].forEach(cmd => {
                    if(cmd == cmdName) {
                        console.log("alias");
                        return this.execute(ali[1],msg,args);
                    }
                })
            });
        }
    }
    disableCommand(cmdName) {
        this.cmds[cmdName].enabled = false;
    }
    enableCommand(cmdName) {
        this.cmds[cmdName].enabled = true;
    }
}

module.exports = CommandStore;