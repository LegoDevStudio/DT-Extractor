const Command = require("../util/Command");

module.exports = class extends Command {
    constructor() {
        super();
        this.name = "config";
        this.module = "Utility";
        this.description = "Config Options";
        this.permission = 2
        this.usage = "<set/list> [option] [value]";
        this.args = 1;
        this.enabled = false
    }
    code(args,m) {
        if(args[0] == "list") {
            m.reply("List of config options\nModRole: "+global.config.modrole+"\nAdminRole: "+global.config.adminrole+"\nMutedRole: "+global.config.mutedrole+"\nLogChannel: "+global.config.punishchannel+"\nAnnouncements:\n  JoinMessage:\n    Enabled: "+global.config.announcements.joinmsg.enabled+"\n    Message: "+global.config.announcements.joinmsg.text+"\n    DMs: "+global.config.announcements.joinmsg.sendAsDM+"\n  LeaveMessage:\n    Enabled: "+global.config.announcements.leavemsg.enabled+"\n    Message: "+global.config.announcements.leavemsg.text+"\n  BanMessage:\n    Enabled: "+global.config.announcements.banmsg.enabled+"\n    Message: "+global.config.announcements.banmsg.text+"\n  Channel: <#"+global.config.announcements.channelid+">\nWelcomeMessage:\n  Enabled: "+global.config.welcomemsg.enabled+"\n  DMs: "+global.config.welcomemsg.dms+"\n  Message: "+global.config.welcomemsg.text+"\n  Channel: <#"+global.config.welcomemsg.channel+">\nServerLogs:\n  Enabled: "+global.config.actionlog.enabled+"\n  Enabled Events: "+global.config.actionlog.events+"\n  Channel: <#"+global.config.actionlog.channel+">\n\nTo access an option which is nested in other options, it's <main option>.<sub option>.<option>");
        }
        if(args[0] == "set") {
            if(args[1] == "ModRole") {
                if(args[2] == undefined) {
                    return "ModRole: Expects Role Mention or Id";
                }
                let id = "";
                if(m.mentions.roles.first()) {
                    id = m.mentions.roles.first().id;
                }else if(!isNaN(parseInt(args[2]))){
                    id = args[2];
                }else{
                    return "Value must be id or role mention.";
                }
                global.config.modrole = id;
                global.saveConfig();
                return "Set."
            }
            if(args[1] == "AdminRole") {
                if(args[2] == undefined) {
                    return "AdminRole: Expects Role Mention or Id";
                }
                let id = "";
                if(m.mentions.roles.first()) {
                    id = m.mentions.roles.first().id;
                }else if(!isNaN(parseInt(args[2]))){
                    id = args[2];
                }else{
                    return "Value must be id or role mention.";
                }
                global.config.adminrole = id;
                global.saveConfig();
                return "Set."
            }
            if(args[1] == "MutedRole") {
                if(args[2] == undefined) {
                    return "MutedRole: Expects Role Mention or Id";
                }
                let id = "";
                if(m.mentions.roles.first()) {
                    id = m.mentions.roles.first().id;
                }else if(!isNaN(parseInt(args[2]))){
                    id = args[2];
                }else{
                    return "Value must be id or role mention.";
                }
                global.config.mutedrole = id;
                global.saveConfig();
                return "Set."
            }
            if(args[1] == "LogChannel") {
                if(args[2] == undefined) {
                    return "LogChannel: Expects Channel Mention or Id";
                }
                let id = "";
                if(m.mentions.channels.first()) {
                    id = m.mentions.channels.first().id;
                }else if(!isNaN(parseInt(args[2]))){
                    id = args[2];
                }else{
                    return "Value must be id or channel mention.";
                }
                global.config.punishchannel = id;
                global.saveConfig();
                return "Set."
            }
            let options = args.splice(1).join(" ").split(".");
            if(options[2] != undefined) {
                options[2] = options[2].split(" ")[0];
            }
            if(options[1] != undefined) {
                options[1] = options[1].split(" ")[0];
            }
            console.log(options);
            if(options[0] == "Announcements") {
                if(options[1] == "JoinMessage") {
                    if(options[2] == "Enabled") {
                        if(args[2] == undefined) {
                            return "Enabled: Expects true or false. Anything else defaults to false.";
                        }
                        if(args[2] == "true") {
                            global.config.announcements.joinmsg.enabled = true;
                        }else{
                            global.config.announcements.joinmsg.enabled = false;
                        }
                        global.saveConfig();
                        return "Set.";
                    }
                    if(options[2] == "Message") {
                        if(args[2] == undefined) {
                            return "Message: Expects String.";
                        }
                        global.config.announcements.joinmsg.text = args.splice(1).join(" ");
                        global.saveConfig();
                        return "Set.";
                    }
                    if(options[2] == "DMs") {
                        if(args[2] == undefined) {
                            return "DMs: Expects true or false. Anything else defaults to false.";
                        }
                        if(args[2] == "true") {
                            global.config.announcements.joinmsg.sendAsDM = true;
                        }else{
                            global.config.announcements.joinmsg.sendAsDM = false;
                        }
                        global.saveConfig();
                        return "Set.";
                    }
                    return "List of config options for Announcements.JoinMessage:\nEnabled\nMessage\nDMs";
                }
                if(options[1] == "LeaveMessage") {
                    if(options[2] == "Enabled") {
                        if(args[2] == undefined) {
                            return "Enabled: Expects true or false. Anything else defaults to false.";
                        }
                        if(args[2] == "true") {
                            global.config.announcements.leavemsg.enabled = true;
                        }else{
                            global.config.announcements.leavemsg.enabled = false;
                        }
                        global.saveConfig();
                        return "Set.";
                    }
                    if(options[2] == "Message") {
                        if(args[2] == undefined) {
                            return "Message: Expects String";
                        }
                        global.config.announcements.leavemsg.text = args.splice(1).join(" ");
                        global.saveConfig();
                        return "Set.";
                    }
                    return "List of config options for Announcements.LeaveMessage:\nEnabled\nMessage";
                }
                if(options[1] == "BanMessage") {
                    if(options[2] == "Enabled") {
                        if(args[2] == undefined) {
                            return "Enabled: Expects true or false. Anything else defaults to false.";
                        }
                        if(args[2] == "true") {
                            global.config.announcements.banmsg.enabled = true;
                        }else{
                            global.config.announcements.banmsg.enabled = false;
                        }
                        global.saveConfig();
                        return "Set.";
                    }
                    if(options[2] == "Message") {
                        if(args[2] == undefined) {
                            return "Message: Expects String";
                        }
                        global.config.announcements.banmsg.text = args.splice(1).join(" ");
                        global.saveConfig();
                        return "Set.";
                    }
                    return "List of config options for Announcements.BanMessage:\nEnabled\nMessage";
                }
                if(options[1] == "Channel") {
                    if(args[2] == undefined) {
                        return "Channel: Expects Channel Mention or Id";
                    }
                    let id = "";
                    if(m.mentions.channels.first()) {
                        id = m.mentions.channels.first().id;
                    }else if(!isNaN(parseInt(args[2]))){
                        id = args[2];
                    }else{
                        return "Value must be id or role mention.";
                    }
                    global.config.announcements.channelid = id;
                    global.saveConfig();
                    return "Set."
                }
                return "List of config options for Announcements:\nJoinMessage.Enabled\nJoinMessage.Message\nJoinMessage.DMs\nLeaveMessage.Enabled\nLeaveMessage.Message\nBanMessage.Enabled\nBanMessage.Message";
            }
            if(options[0] == "WelcomeMessage") {
                if(options[1] == "Enabled") {
                    if(args[2] == undefined) {
                        return "Enabled: Expects true or false. Anything else defaults to false.";
                    }
                    if(args[2] == "true") {
                        global.config.welcomemsg.enabled = true;
                    }else{
                        global.config.welcomemsg.enabled = false;
                    }
                    global.saveConfig();
                    return "Set.";
                }
                if(options[1] == "Message") {
                    if(args[2] == undefined) {
                        return "Message: Expects String";
                    }
                    global.config.welcomemsg.text = args.splice(1).join(" ");
                    global.saveConfig();
                    return "Set.";
                }
                if(options[1] == "DMs") {
                    if(args[2] == undefined) {
                        return "DMs: Expects true or false. Anything else defaults to false.";
                    }
                    if(args[2] == "true") {
                        global.config.welcomemsg.dm = true;
                    }else{
                        global.config.welcomemsg.dm = false;
                    }
                    global.saveConfig();
                    return "Set.";
                }
                if(options[1] == "Channel") {
                    if(args[2] == undefined) {
                        return "Channel: Expects Channel Mention or Id";
                    }
                    let id = "";
                    if(m.mentions.channels.first()) {
                        id = m.mentions.channels.first().id;
                    }else if(!isNaN(parseInt(args[2]))){
                        id = args[2];
                    }else{
                        return "Value must be id or role mention.";
                    }
                    global.config.welcomemsg.channel = id;
                    global.saveConfig();
                    return "Set."
                }
                return "List of config options for WelcomeMessage:\nEnabled\nMessage\nDMs\nChannel";
            }
            return "List of config options\nModRole\nAdminRole\nMutedRole\nLogChannel\nAnnouncements.JoinMessage.Enabled\nAnnouncements.JoinMessage.Message\nAnnouncements.JoinMessage.DMs\nAnnouncements.LeaveMessage.Enabled\nAnnouncements.LeaveMessage.Message\nAnnouncements.BanMessage.Enabled\nAnnouncements.BanMessage.Message\nAnnouncements.Channel\nWelcomeMessage.Enabled\nWelcomeMessage.DMs\nWelcomeMessage.Message\nWelcomeMessage.Channel";
        }
    }
}