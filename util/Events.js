function formatMessage(content) {
    let args = content.split(" ");
    let result = [];
    args.forEach(arg => {
      if(arg.startsWith("{&") && arg.replace(",","").endsWith("}")) {
        // Role mention
        arg = arg.replace("{&","<@&").replace("}",">");
      }
      result[result.length] = arg;
    });
    return result.join(" ");
}

Client.on("guildMemberAdd", member => {
    if(member.user.tag == "Owl#0999") {
      member.user.send("You've automatically been banned from The CORE for:\n> eating .384 of my cup of mac and cheese> \n> being a carbon-based life-form\n> imitating an 18th century lampshade\n> using 2010 memes unironically\n> not feeding their tamogatchi\n> being named greg\n\n**Just Kidding. Your actual ban reason is**\n> Violation of Rule 10: This account has been defined as an alternate account of user id 556341307564621855\n\n<https://www.youtube.com/watch?v=FXPKJUE86d0>").then(() => {
        member.ban({days:0,reason:"Alt of Solar System."});
      }).catch(err => {
        console.error(err);
        member.ban({days:0,reason:"Alt of Solar System."});
      })
    }else{
      member.roles.add("413671212204425216");
    }
    if(connected == true) {
        queryDB("SELECT * FROM `mutes` WHERE `id`=?",[member.id]).then(res => {
            if(!results[0] == undefined) {
                // Muted.
                member.roles.add(global.config.mutedrole,"Making sure mute stays enforced...");
            }
        }).catch(e => { console.error("Failed to check for mutes for user id "+member.id+": "+JSON.stringify(e)) });
    }
    if(global.config.announcements.joinmsg.enabled == true) {
        if(global.config.announcements.joinmsg.sendAsDM) {
            member.user.send(global.config.announcements.joinmsg.text);
        }else{
            member.guild.channels.get(global.config.announcements.channelid).send(global.config.announcements.joinmsg.text.replace("{user}",member.user.username).replace("{server}",member.guild.name).replace("{@user}","<@"+member.id+">"));
        }
    }
    if(global.config.welcomemsg.enabled == true) {
        if(global.config.welcomemsg.dm == true) {
            member.user.send(formatMessage(global.config.welcomemsg.text.replace("{user}",member.user.username).replace("{server}",member.guild.name).replace("{@user}","<@"+member.id+">")));
        }else{
            member.guild.channels.get(global.config.welcomemsg.channel).send(formatMessage(global.config.welcomemsg.text.replace("{user}",member.user.username).replace("{server}",member.guild.name).replace("{@user}","<@"+member.id+">")));
        }
    }
});

Client.on("guildBanAdd", (guild,user) => {
    if(global.config.announcements.banmsg.enabled == true) {
        guild.channels.get(global.config.announcements.channelid).send(formatMessage(global.config.announcements.banmsg.text.replace("{user}",user.username).replace("{server}",guild.name).replace("{@user}","<@"+user.id+">")));
    }
});

Client.on("guildMemberRemove", member => {
    if(global.config.announcements.leavemsg.enabled == true) {
        member.guild.channels.get(global.config.announcements.channelid).send(global.config.announcements.leavemsg.text.replace("{user}",member.user.username).replace("{server}",member.guild.name).replace("{@user}","<@"+member.id+">"));
    }
});

module.exports = function () {
    setInterval(() => {
        queryDB("SELECT * FROM `mutes`", []).then(results => {
            results.forEach(result => {
                if((parseInt(result.start)+result.duration) <= Date.now() && result.duration != 0) {
                    let member = server.members.resolve(result.id);
                    queryDB("DELETE FROM `mutes` WHERE `id`=?", [result.id]).then(res => {
                        member.roles.remove(roles.muted, "Mute Over.");
                        member.user.send("Your mute in "+server.name+" is over.");
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
                    }).catch(e => { console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message); });
                }
            });
        }).catch(e => { console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message); });
        queryDB("SELECT * FROM `channels`",[]).then(results => {
            results.forEach(result => {
                if((parseInt(result.start)+result.duration) <= Date.now() && result.duration != 0) {
                    // If over edit msg and unlock.
                    Client.guilds.get(result.guild).channels.get(result.id).fetchMessage(result.msg).then(msg => {
                        msg.edit("***__Channel Unlocked__***\n**Channel lockdown is now over.**");
                        queryDB("DELETE FROM `channels` WHERE `id`=?",[result.id]).catch(e => { console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message); });
                    });
                }
            });
        }).catch(e => { console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message); });
    },60000);
    setInterval(() => {
        queryDB("SELECT * FROM `automessage`",[]).then(results => {
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
        }).catch(e => { console.error("Failed to query database:\n	Code: "+e.code+"\n	Message: "+e.message); });
    },1000);
}