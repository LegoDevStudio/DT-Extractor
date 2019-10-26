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

global.permIdToName = {
    "-1": "Bot Developer",
    "0": "Everyone",
    "1": "Server Moderator",
    "2": "Server Administrator",
    "3": "Server Owner"
}