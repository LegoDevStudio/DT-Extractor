var Discord = require("discord.js");
var mysql = require("mysql");
var fs = require("fs");

const version = "1.5.0";
const prefix = ".?";
global.version = version;
global.prefix = prefix;

var Client = new Discord.Client();

var db = mysql.createConnection({
    host     : '54.37.204.19',
    user     : 'u5423_83DUIpXE7u',
    password : process.env.DB_KEY,
    database : 's5423_theCore'
});

console.internalLog = function(msg,state) {
    if(state == -1) state = "Debug";
    if(state == 0) state = "Info";
    if(state == 1) state = "Warning";
    if(state == 2) state = "Error";
    if(state == 3) state = "Critical";
    if(state == 4) state = "Fatal";
    let date = new Date(Date.now());
    console.log("[" + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " at " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "] <" + state + "> " + msg);
    if(state == "Fatal") {
        process.exit(1);
    }
}

console.debug = function(msg) {console.internalLog(msg,-1)};
console.info = function(msg) {console.internalLog(msg,0)};
console.warn = function(msg) {console.internalLog(msg,1)};
console.error = function(msg) {console.internalLog(msg,2)};
console.critical = function(msg) {console.internalLog(msg,3)};
console.fatal = function(msg) {console.internalLog(msg,4)};

var connected = false;

//Connect to database.
db.connect(function(err) {
    // Log into discord
    Client.login(process.env.DISCORD);
    if (err) {
      // If we couldn't connect send critical log and disable mysql connection compatibility
      console.critical('Failed to connect to database: ' + err.stack);
      connected = false;
      return;
    }
    // Got a connection and enabled mysql connection compatibility
    console.info("Successfully connected to database.");
    connected = true;
    global.queryDb = function (cmd,data) {
        return new Promise((res,rej) => {
            if(connected == false) {
                rej({"code":'NOT_CONNECTED',"message":"There's no connection to the SQL Database. Try again later"});
            }
            if(typeof data == "string") {
                data = [data];
            }
            db.query(cmd, data, function(error,results,tables) { 
                if(error) {
                    rej({"code":error.code,"message":error.sqlMessage});
                }else{
                    res(results,tables);
                }
            });
        });
    }
});

global.checkPerms = function (lvl,user){
    /*
      [-1] = Bot Developer
      [0]  = Everyone
      [1]  = Kick Members (Mods)
      [2]  = Ban Members  (Admins)
      [3]  = Server Owner
    */
    return new Promise((res,rej) => {
    Client.fetchApplication().then(application=>{
      if(lvl == -1) if(application.owner.id == user.id) return res(true);
      if(lvl == 0) return res(true);
      if(lvl == 1) if(user.roles.has(global.config.modrole) || user.roles.has(global.config.adminrole) || user.guild.owner == user) return res(true);
      if(lvl == 2) if(user.roles.has(global.config.adminrole) || user.guild.owner == user) return res(true);
      if(lvl == 3) if(user.guild.owner == user) return res(true);
      return res(false);
    });
    });
}

global.getPerms = function(user) {
    return new Promise((res,rej) => {
        Client.fetchApplication().then(application=>{
            if(user.guild.owner == user) return res(3);
            if(user.roles.has(global.config.adminrole)) return res(2);
            if(user.roles.has(global.config.modrole)) return res(1);
            if(application.owner.id == user.id) return res(-1);
            return res(0)
        });
    });
}

var permIdToName = {
    "-1": "Bot Developer",
    "0": "Everyone",
    "1": "Server Moderator",
    "2": "Server Administrator",
    "3": "Server Owner"
}

function formatMessage(content) {
    let args = content.split(" ");
    let result = [];
    args.forEach(arg => {
        if(arg.startsWith("${&") && arg.replace(",","").endsWith("}")) {
            // Role mention
            arg = arg.replace("${&","<@&").replace("}",">");
        }
        result[result.length] = arg;
    });
    return result.join(" ");
}

// When discord client is ready, this is fired
Client.on("ready", () => {
    //We check if the client has been lauched with or without database connection combatibility.
    if(connected == false) {
        // We warn that the bot relies on mysql for some stuff and will not operate correctly without it.
        console.warn("Discord bot was launched but mysql connection encountered an error, or was forcefully turned off.");
        console.warn("Some features require database connection and will not operate.");
    }else{
        // Working as intended
        console.debug("Discord bot was launched and mysql connection ready.");
    }
  
    //require("./util/Radio");

    global.db = db;
    global.Discord = Discord;
    global.Client = Client;

    // Bot setup.
    Client.user.setActivity("messages | v"+version, {"type":"WATCHING"});
    Client.fetchApplication().then(application => {
        Client.application = application;
    });
    if(connected == true) {
    setInterval(() => {
        db.query("SELECT * FROM `mutes`", function(error,results,fields) {
            results.forEach(result => {
                // Since the start of mute time and and duration of mute are both in milliseconds,
                // We add them together and see if it's smaller than the current time. If so unmute
                // Else we keep them muted.
                if((parseInt(result.start)+result.duration) <= Date.now() && result.duration != 0) {
                    // Time is over. We unmute them.
                    Client.guilds.get("413155443997802528").fetchMember(result.id).then(member => {
                        db.query("DELETE FROM `mutes` WHERE `id`=?", [result.id], function(error,results,tables) {
                            if(error) {
                                return console.error("Failed to delete mute from user id "+result.id+": "+error.stack);
                            }
                            member.removeRole(global.config.mutedrole, "Mute over.");
                            member.user.send("Your mute in "+member.guild.name+" is over.");
                            let embed = {
                                "color": 261888,
                                "timestamp": Date.now(),
                                "author": {
                                    "name": "Unmute | Case #"+result.caseid,
                                    "icon_url": member.user.displayAvatarURL
                                },
                                "fields": [
                                    {
                                        "name": "Username",
                                        "value": "<@"+member.id+">",
                                        "inline": true
                                    },
                                    {
                                        "name": "Moderator",
                                        "value": "<@551117156054728704>",
                                        "inline": true
                                    },
                                    {
                                        "name": "Reason",
                                        "value": "Mute over. Auto."
                                    }
                                ]
                            };
                            member.guild.channels.get(global.config.punishchannel).send({embed:embed});
                        });
                    });
                }else{
                    // To make sure they stay muted
                    Client.guilds.get("413155443997802528").fetchMember(result.id).then(member => {
                        member.addRole(global.config.mutedrole,"Making sure mute stays enforced...");
                    });
                }
            });
        });
        db.query("SELECT * FROM `channels`",function(error,results,fields) {
            results.forEach(result => {
                if((parseInt(result.start)+result.duration) <= Date.now() && result.duration != 0) {
                    // If over edit msg and unlock.
                    Client.guilds.get(result.guild).channels.get(result.id).fetchMessage(result.msg).then(msg => {
                        msg.edit("***__Channel Unlocked__***\n**Channel lockdown is now over.**");
                        db.query("DELETE FROM `channels` WHERE `id`=?",[result.id],function(error,results,fields) {
                            if(error) {
                                return console.error("Failed to unlock channel "+result.id+": "+error);
                            }
                        });
                    });
                }
            });
        });
    },30000);
    setInterval(() => {
        db.query("SELECT * FROM `automessage`", function(error,results,fields) {
            results.forEach(result => {
                var now = new Date();
                var millisTill = new Date(now.getFullYear(), now.getMonth(), now.getDate(), result.hour, result.minute, result.second, 0) - Date.now();
                /*if(Date.now() % millisTill*1000 <= 999 && Date.now() % millisTill*1000 >= -999) {
                    Client.guilds.get(result.guild).channels.get(result.channel).send(result.text);
                }*/
                if(now.getHours() == result.hour && now.getMinutes() == result.minute && now.getSeconds() == result.second) {
                    Client.guilds.get(result.guild).channels.get(result.channel).send(result.text);
                }
            });
        });
        queryDb("SELECT * FROM `rewards`", []).then((res,fields) => {
            res.forEach(result => {
                var user = Client.guilds.resolve("413155443997802528").members.resolve(result.id);
                var role = Client.guilds.resolve("413155443997802528").roles.resolve(result.roleid);
                if(user.premiumSinceTimestamp == null) {
                    queryDb("DELETE FROM `rewards` WHERE `id`=?", [user.id]).then((results,fieldss) => {
                        role.delete('Member cancelled server boost.');
                        user.user.send("Your custom role you gained from boosting The CORE has been deleted because you've removed your nitro boost from the server.\nIf you believe this is in error, contact LegoDev#0001 in dms.");
                    }).catch(e => {
                        console.error(e.stack);
                        role.guild.members.get("1867301808726343682").user.send(user.user.tag + " removed server boost but failed to update database. Please execute the following command on the database\n`DELETE FROM \`rewards\` WHERE \`id\`='"+user.id+"'`");
                    });
                }
            });
        }).catch(e => {console.log("Failed to query db for rewards: \n"+e.stack);});
    },1000);
    }
});

Client.on("guildMemberAdd", member => {
    if(connected == true) {
        db.query("SELECT * FROM `mutes` WHERE `id`=?",[member.id], function(error,results,fields) {
            if(error) {
                return console.error("Failed to check for mutes for user id "+member.id+": "+error.stack);
            }
            if(!results[0] == undefined) {
                // Muted.
                member.addRole(global.config.mutedrole,"Making sure mute stays enforced...");
            }
        });
    }
    if(global.config.announcements.joinmsg.enabled == true) {
        if(global.config.announcements.joinmsg.sendAsDM) {
            member.user.send(global.config.announcements.joinmsg.text);
        }else{
            member.guild.channels.get(global.config.announcements.channelid).send(global.config.announcements.joinmsg.text.replace("${user}",member.user.username).replace("${server}",member.guild.name).replace("${@user}","<@"+member.id+">"));
        }
    }
    if(global.config.welcomemsg.enabled == true) {
        if(global.config.welcomemsg.dm == true) {
            member.user.send(formatMessage(global.config.welcomemsg.text.replace("${user}",member.user.username).replace("${server}",member.guild.name).replace("${@user}","<@"+member.id+">")));
        }else{
            member.guild.channels.get(global.config.welcomemsg.channel).send(formatMessage(global.config.welcomemsg.text.replace("${user}",member.user.username).replace("${server}",member.guild.name).replace("${@user}","<@"+member.id+">")));
        }
    }
    if(global.config.actionlog.events.indexOf("Member Joined") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Member Joined | "+member.user.tag,
              "icon_url": member.user.displayAvatarURL
            },
            "fields": [
              {
                "name": "Joined Discord At",
                "value": member.user.createdAt
              }
            ]
        };
        member.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("guildBanAdd", (guild,user) => {
    if(global.config.announcements.banmsg.enabled == true) {
        guild.channels.get(global.config.announcements.channelid).send(formatMessage(global.config.announcements.banmsg.text.replace("${user}",user.username).replace("${server}",guild.name).replace("${@user}","<@"+user.id+">")));
    }
    if(global.config.actionlog.events.indexOf("Member Banned") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Member Banned | "+user.tag,
              "icon_url": user.displayAvatarURL
            }
        };
        guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("guildBanRemove", (guild,user) => {
    if(global.config.actionlog.events.indexOf("Member Unbanned") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Member Unbanned | "+user.tag,
              "icon_url": user.displayAvatarURL
            }
        };
        guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("messageUpdate", (oldm,newm) => {
    if(global.config.actionlog.events.indexOf("Message Edited") != -1) {
        if(global.config.actionlog.ignored.indexOf(oldm.channel.name) != -1) return;
        if(oldm.content == newm.content) return;
        let colour = Math.floor(Math.random() * 16777214);
        if(oldm.content.split("").length >= 1014) {
            oldm.content = oldm.content.split("").splice(1011).join("")+"...";
        }
        if(newm.content.split("").length >= 1014) {
            newm.content = newm.content.split("").splice(1011).join("")+"...";
        }
        const embed = {
            "description":"<#"+newm.channel.id+"> [Jump To Message]("+newm.url+")",
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Message Edited | "+newm.author.tag,
              "icon_url": newm.author.displayAvatarURL
            },
            "fields": [
              {
                "name": "Old",
                "value": "`"+oldm.content+"`"
              },
              {
                "name": "New",
                "value": "`"+newm.content+"`"
              }
            ]
        };
        oldm.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("messageDelete", (m) => {
    if(global.config.actionlog.events.indexOf("Message Deleted") != -1) {
        if(global.config.actionlog.ignored.indexOf(m.channel.name) != -1) return;
        let colour = Math.floor(Math.random() * 16777214);
        if(m.content.split("").length >= 1014) {
            m.content = m.content.split("").splice(1011).join("")+"...";
        }
        const embed = {
            "description": "<#"+m.channel.id+">",
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Message Deleted | "+m.author.tag,
              "icon_url": m.author.displayAvatarURL
            },
            "fields": [
              {
                "name": "Content",
                "value": "`"+m.content+"`"
              }
            ]
        };
        m.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("messageDeleteBulk", (coll) => {
    if(global.config.actionlog.events.indexOf("Bulk Message Deletion") != -1) {
        if(global.config.actionlog.ignored.indexOf(coll.first().channel.name) != -1) return;
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Bulk Message Deletion",
              "icon_url": Client.user.displayAvatarURL
            },
            "fields": [
              {
                "name": "Amount deleted",
                "value": coll.array().length
              }
            ]
        };
        coll.first().guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("channelCreate", (channel) => {
    if(global.config.actionlog.events.indexOf("Channel Created") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Channel Created",
              "icon_url": Client.user.displayAvatarURL
            },
            "fields": [
              {
                "name": "Channel Name",
                "value": channel.name
              }
            ]
        };
        channel.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("channelDelete", (channel) => {
    if(global.config.actionlog.events.indexOf("Channel Deleted") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Channel Deleted",
              "icon_url": Client.user.displayAvatarURL
            },
            "fields": [
              {
                "name": "Channel Name",
                "value": channel.name
              }
            ]
        };
        channel.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("roleCreate", (channel) => {
    if(global.config.actionlog.events.indexOf("Role Created") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Role Created",
              "icon_url": Client.user.displayAvatarURL
            },
            "fields": [
              {
                "name": "Role Name",
                "value": channel.name
              }
            ]
        };
        channel.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("roleDelete", (channel) => {
    if(global.config.actionlog.events.indexOf("Role Deleted") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Role Deleted",
              "icon_url": Client.user.displayAvatarURL
            },
            "fields": [
              {
                "name": "Role Name",
                "value": channel.name
              }
            ]
        };
        channel.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("roleUpdate", (oldr,newr) => {
    if(oldr.position != newr.position || oldr.id == oldr.guild.id) return;
    if(global.config.actionlog.events.indexOf("Role Updated") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Role Updated",
              "icon_url": Client.user.displayAvatarURL
            },
            "fields": [
              {
                "name": "Old Role Name",
                "value": oldr.name,
                "inline": true
              },
              {
                "name": "Old Colour",
                "value": oldr.hexColor,
                "inline": true
              },
              {
                "name": "Old Position",
                "value": oldr.calculatedPosition,
                "inline": true
              },
              {
                "name": "New Role Name",
                "value": newr.name,
                "inline": true
              },
              {
                "name": "New Colour",
                "value": newr.hexColor,
                "inline": true
              },
              {
                "name": "New Position",
                "value": newr.calculatedPosition,
                "inline": true
              }
            ]
        };
        oldr.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("guildMemberUpdate", (oldm,newm) => {
    if(oldm.roles.array().length == newm.roles.array().length) {
        if(oldm.nickname != newm.nickname) {
            if(global.config.actionlog.events.indexOf("Nickname Changed") != -1) {
                let colour = Math.floor(Math.random() * 16777214);
                const embed = {
                    "color": colour,
                    "timestamp": Date.now(),
                    "author": {
                      "name": "Nickname Changed | "+newm.user.tag,
                      "icon_url": newm.user.displayAvatarURL
                    },
                    "fields": [
                      {
                        "name": "Old Nickname",
                        "value": oldm.displayName
                      },
                      {
                        "name": "New Nickname",
                        "value": newm.displayName
                      }
                    ]
                };
                oldm.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
            }
        }
        if(oldm.voiceChannelID == undefined && newm.voiceChannelID != undefined) {
            if(global.config.actionlog.events.indexOf("Member Joined Voice Channel") != -1) {
                let colour = Math.floor(Math.random() * 16777214);
                const embed = {
                    "color": colour,
                    "timestamp": Date.now(),
                    "author": {
                      "name": "Member Joined Voice Channel | "+newm.user.tag,
                      "icon_url": newm.user.displayAvatarURL
                    },
                    "fields": [
                      {
                        "name": "Voice Channel",
                        "value": "<#"+newm.voiceChannelID+">"
                      }
                    ]
                };
                oldm.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
            }
        }else 
        if(oldm.voiceChannelID != undefined && newm.voiceChannelID == undefined) {
            if(global.config.actionlog.events.indexOf("Member Left Voice Channel") != -1) {
                let colour = Math.floor(Math.random() * 16777214);
                const embed = {
                    "color": colour,
                    "timestamp": Date.now(),
                    "author": {
                      "name": "Member Left Voice Channel | "+newm.user.tag,
                      "icon_url": newm.user.displayAvatarURL
                    },
                    "fields": [
                      {
                        "name": "Voice Channel",
                        "value": "<#"+oldm.voiceChannelID+">"
                      }
                    ]
                };
                oldm.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
            }
        }else 
        if(oldm.voiceChannelID != newm.voiceChannelID) {
            if(global.config.actionlog.events.indexOf("Member Moved Voice Channel") != -1) {
                let colour = Math.floor(Math.random() * 16777214);
                const embed = {
                    "color": colour,
                    "timestamp": Date.now(),
                    "author": {
                      "name": "Member Moved Voice Channel | "+newm.user.tag,
                      "icon_url": newm.user.displayAvatarURL
                    },
                    "fields": [
                      {
                        "name": "Old Voice Channel",
                        "value": "<#"+oldm.voiceChannelID+">"
                      },
                      {
                        "name": "New Voice Channel",
                        "value": "<#"+newm.voiceChannelID+">"
                      }
                    ]
                };
                oldm.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
            }
        }
    }
    if(oldm.roles.array().length < newm.roles.array().length) {
        let roles = [[],[]];
        let newRoles = "";
        newm.roles.array().forEach(role => {
            roles[0][roles[0].length] = role.name
        });
        oldm.roles.array().forEach(role => {
            roles[1][roles[1].length] = role.name
        });
        roles[0].forEach(role0 => {
            roles[1].forEach(role1 => {
                if(!roles[1].includes(role0) && !newRoles.includes(role0)) {
                    newRoles = newRoles+role0;
                }
            });
        });
        if(global.config.actionlog.events.indexOf("Role Given") != -1) {
            let colour = Math.floor(Math.random() * 16777214);
            const embed = {
                "color": colour,
                "timestamp": Date.now(),
                "author": {
                  "name": "Role Given | "+newm.user.tag,
                  "icon_url": newm.user.displayAvatarURL
                },
                "fields": [
                  {
                    "name": newRoles,
                    "value": "​"
                  }
                ]
            };
            oldm.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
        }
    }
    if(oldm.roles.array().length > newm.roles.array().length) {
        let roles = [[],[]];
        let newRoles = "";
        newm.roles.array().forEach(role => {
            roles[0][roles[0].length] = role.name
        });
        oldm.roles.array().forEach(role => {
            roles[1][roles[1].length] = role.name
        });
        roles[0].forEach(role0 => {
            roles[1].forEach(role1 => {
                if(!roles[0].includes(role1) && !newRoles.includes(role1)) {
                    newRoles = newRoles+role1;
                }
            });
        });
        if(global.config.actionlog.events.indexOf("Role Removed") != -1) {
            let colour = Math.floor(Math.random() * 16777214);
            const embed = {
                "color": colour,
                "timestamp": Date.now(),
                "author": {
                  "name": "Role Removed | "+newm.user.tag,
                  "icon_url": newm.user.displayAvatarURL
                },
                "fields": [
                  {
                    "name": newRoles,
                    "value": "​"
                  }
                ]
            };
            oldm.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
        }
    }
});

Client.on("modCommandExecuted", (command,member) => {
    if(global.config.actionlog.events.indexOf("Moderator Commands Used") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
                "name": "Moderator Command Used | "+member.user.tag,
                "icon_url": member.user.displayAvatarURL
            },
            "fields": [
                {
                    "name": "Command",
                    "value": command
                }
            ]
        };
        member.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("guildMemberRemove", member => {
    if(global.config.announcements.leavemsg.enabled == true) {
        member.guild.channels.get(global.config.announcements.channelid).send(global.config.announcements.leavemsg.text.replace("${user}",member.user.username).replace("${server}",member.guild.name).replace("${@user}","<@"+member.id+">"));
    }
    if(global.config.actionlog.events.indexOf("Member Left") != -1) {
        let colour = Math.floor(Math.random() * 16777214);
        const embed = {
            "color": colour,
            "timestamp": Date.now(),
            "author": {
              "name": "Member Left | "+member.user.tag,
              "icon_url": member.user.displayAvatarURL
            }
        };
        member.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
    }
});

Client.on("message", message => {
    if (message.content.includes('discord.gg/'||'discordapp.com/invite/'||'discordapp.net/invite/')) { //if it contains an invite link
        let code = message.content.split("discord.gg/").split("discordapp.com/invite/").split("discordapp.net/invite/").splice(1).split(" ")[0];
        Client.fetchInvite("discord.gg/"+code).then(invite => {
            if(global.config.actionlog.events.indexOf("Log Invites/Invite Info") != -1) {
                let colour = Math.floor(Math.random() * 16777214);
                const embed = {
                    "color": colour,
                    "timestamp": Date.now(),
                    "author": {
                        "name": "Invite Infomation",
                        "icon_url": member.user.displayAvatarURL
                    },
                    "fields": [
                        {
                            "name": "Code",
                            "value": invite.code
                        },
                        {
                            "name": "Guild Name",
                            "value": invite.guild.name
                        }
                    ]
                };
                message.guild.channels.get(global.config.actionlog.channel).send({embed:embed});
            }
        });
    }
    if(message.author.bot) return;
    db.query("UPDATE `activity` SET `last`=? WHERE `id`=?", [message.createdTimestamp,message.author.id], function(error,results,tables) {
        if(error) {
            return console.error("Failed to log user activity of id "+message.author.id+": "+error);
        }
    });
    let locked = false;
    db.query("SELECT * FROM `channels` WHERE `id`=?",[message.channel.id],function(error,results,fields) {
        if(results[0] != undefined) {
            // Locked.
            message.delete();
            locked = true
        }
    });
    if(locked) return;
    if(message.content.startsWith(prefix)) {
        var command = message.content.split(" ")[prefix.split(" ").length-1].replace(prefix,"");
        var args = message.content.split(" ").splice(prefix.split(" ").length);
        try{
            var file = require("./commands/"+command.toLowerCase()+".js");
            file = new file();
            global.checkPerms(file.permission,message.member).then(res => {
                if(res == false) {
                    global.getPerms(message.member).then(result => {
                        return message.reply("***You do not have the required permissions to run that command***\n**Your Permission Level:** "+permIdToName[result.toString()]+"\n**Required Permission Level:** "+permIdToName[file.permission.toString()]);
                    });
                }else{
                    file.execute(args,message).catch(err => {
                        if(err.code == 1) return;
                        if(err.code == 2) {
                            return message.reply("An error was thrown when executing the command:\n```\n"+err.message+"\n```");
                        }
                        if(err.code == 3) {
                            return message.reply("Invalid Usage. Usage: ?"+command.toLowerCase()+" "+err.message);
                        }
                    });
                }
            });
        }catch(error) {
            if(error.message.includes("Cannot find module")) return;
            message.reply("An error was thrown when attempting to execute the command:\n```"+error+"\n```");
        }
    }else{
        // Custom Responces
        db.query("SELECT * FROM `responces`", function(error,results,fields) {
            results.forEach(result => {
                if(message.content.toLowerCase() == result.msg) {
                    /*
                        ${} allows you to have things that change depending on the message.
                        ${name.user} will output the username of the author.
                        ${name.member} will output the displayname of the author.
                        ${name.bot} will output the name of the bot.
                        ${permlevel} will output the permission level the author has on the bot.
                        ${mention} will mention the author.
                    */
                    global.getPerms(message.member).then(permlevel => {
                        let response = result.response.replace("${name.user}",message.author.username).replace("${name.member}",message.member.displayName).replace("${name.bot}",Client.user.username).replace("${permlevel}",permIdToName[permlevel]).replace("${mention}","<@"+message.author.id+">");
                        
                        message.channel.send(response);
                    });
                }
            });
        });
    }
});
