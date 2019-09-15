 /*
  Lego seems to have found out that he could make a music bot.
  So this is the music handler :D
*/


// Important Shit.
var Client = null;
var Discord = null;
var youtube = null;
const ytdl = require('ytdl-core');
const YouTube = require("simple-youtube-api");
var streamOptions = { seek: 0, volume: 1, passes: 2 };

// ar.shift(); to remove first section

// Music Shit.
var Queue = [];
// Example of a song in queue: {name:"Example",length:0,"songID":"gc0ZnQzz-9k","issuer":[DiscordUser]}
var MinVotes = 1;
// Minimum votes needed to skip. The amount of people in the voice channel -2 will be added onto this value. 
var CurrentSkips = [];
// Amount of skips currently registered. Resets when new music plays.
var Connection = null;
// Music connection
var Dispatcher = null;
// The music player
var Channel = null;
// Channel object of the channel music started in.
var Now = null;
// Currently Playing


// Functions
function urlToId(text) {return ytdl.getVideoID(text)}
function idToUrl(id) {return "https://www.youtube.com/watch?v="+id;}

// Init the manager (We need to do this to get Client and Discord.
function _init_() {
  Client = global.Client;
  Discord = global.Discord;
  youtube = new YouTube("AIzaSyC7qosqO9qOZkBP6_r7DnKbJCk92gHAaOg");
  console.log("Music Manager Loaded 😃");
  
  /*Client.on("voiceStateUpdate", (oldm,newm) => {
  if(newm.voiceChannelID == newm.guild.member(Client.user).voiceChannelID) {
    if(oldm.voiceChannelID != newm.guild.member(Client.user).voiceChannelID){
      MinVotes = 2+(newm.voiceChannel.members.array().length - 2)
      // Probably Joined :/
    }
  }else{
    if(newm.voiceChannelID != oldm.guild.member(Client.user).voiceChannelID){
      MinVotes = 2+(newm.voiceChannel.members.array().length - 2)
      // Probably Joined :/
    }
  }
  
});*/
}

function addQueue(url, user, channel) {
    return new Promise((res,rej) => {
    let id = urlToId(url);
    ytdl.getInfo(idToUrl(id))
    .then(info=>{
        Queue[Queue.length] = {name:info.title,length:info.length_seconds,songID:id,issuer:user};
        if(Queue.length==1&&Channel==null) start(user,channel);
        res(info.title);
    })
    .catch(e=>{
        rej(e.message);
    });
    });
}

function addQueueByTitle(title, user, channel) {
    return new Promise((res,rej) => {
      youtube.searchVideos(title, 1).then(videos => {
        let id = videos[0].id;
        console.log(videos[0]);
    ytdl.getInfo(idToUrl(id))
    .then(info=>{
        Queue[Queue.length] = {name:info.title,length:info.length_seconds,songID:id,issuer:user,thumbnail:videos[0].thumbnails.high.url};
        if(Queue.length==1&&Channel==null) start(user,channel);
        console.log("Added '"+info.title+"' to the queue. Requested by '"+user.displayName+"'",-1);
        res(info.title);
    })
    .catch(e=>{
        rej(e.message);
    });
    }).catch(e => { rej(e.message); });
      });
}

function getQueue() {
  return new Promise((res,rej) => {
    let string = "";
    for(var i = 0;i<=Queue.length;i++) {
      if(i>=Queue.length) {
        if(Channel == null) {
          res("Nothing in queue currently.")
        }else{
          res(string);
        }
      }else{
        string = string + "`"+Queue[i].name+"` added by "+Queue[i].issuer.user.username+ "\n";
      }
    }
  });
}

function getNow() {
  return Now;
}

function editVolume(volume) {
  streamOptions.volume = volume/100
  if(Dispatcher != null) {
    Dispatcher.volume = volume/100
  }
  return true;
}

function addSkip(user) {
  // Skip the current song.
  return new Promise((res,rej) => {
    if(Channel == null) {
      return res(null);
    }
    /*if(user.hasPermission("MOVE_MEMBERS")) {skip(); return res(true)};
    if(Now.issuer.id == user.id) {skip(); return res(true)};*/
    let result = false;
    for(var i = 0;i<=CurrentSkips.length;i++) {
      if(i==CurrentSkips.length) {
        if(result == true) {res(false);}else{
          CurrentSkips[CurrentSkips.length] = user.id
          if(CurrentSkips.length>=MinVotes) {skip();}
          res(true);
        }
      }else{
        if(user.id = CurrentSkips[i]) result = true;
      }
    }
  });
}

function skip() {
  // Skip!
  Channel.send("Skipping song...");
  Dispatcher.end('skip');
}

function stopMusic() {
  Dispatcher.end('stoppingMusic');
}

function endMusic() {
  Queue = [];
  CurrentSkips = [];
  Channel = null;
  Connection = null;
  Dispatcher = null;
  Now = null;
}

function start(user,channel) {
  user.voiceChannel.join()
        .then(connection => { 
          //MinVotes = 2+(user.voiceChannel.members.array().length - 2)
          Connection = connection;
          music(user,channel)
  }).catch(e => {
          channel.send("Something seems to have gone wrong.\n```\n"+e.message+"\n```");
        });
}

function music(user,channel) {
  Channel = channel
          let song = Queue.shift();
          Now = song;
          CurrentSkips = [];
          const stream = ytdl(idToUrl(song.songID), { filter : 'audioonly' });
          Dispatcher = Connection.playStream(stream, streamOptions);
          Dispatcher.on("start", () => {
            let embed = {
              "color": 2790165,
              "image": {
                "url": Now.thumbnail
              },
              "author": {
                "name": "Now Playing | DT Extractor Music Addon",
                "icon_url": Client.user.displayAvatarUrl
              },
              "fields": [
                {
                  "name": "NOW",
                  "value": song.name
                },
                {
                  "name": "ADDED BY",
                  "value": song.issuer.user.username,
                  "inline": true
                }/*,
                {
                  "name": "NEXT",
                  "value": Queue[0].name,
                  "inline": true
                }*/
              ]
            };
            channel.send({embed});
          });
          Dispatcher.on("end", reason => {
            if(reason == "skip") {
              //Dispatcher.end();
              if(Queue.length==0) {Channel.send("Queue Finished."); return endMusic()}
              music(user, channel);
            }else if(reason == "stoppingMusic") {
              Dispatcher.end();
              Connection.disconnect();
              endMusic();
            }else{
              setTimeout(() => {
                //Dispatcher.end();
                if(Queue.length==0) {Channel.send("Queue Finished."); return endMusic()}
                music(user, channel);
              },((song.length*1000)-Dispatcher.totalStreamTime)+2000);
            }
        });
}

setInterval(() => {
exports.MinVotes = MinVotes
exports.streamOptions = streamOptions;
exports.Channel = Channel
exports.Now = Now
exports.CurrentSkips = CurrentSkips
exports.Queue = Queue
},100);
exports._init_ = _init_
exports.addQueue = addQueue
exports.addQueueByTitle = addQueueByTitle
exports.getQueue = getQueue
exports.getNow = getNow
exports.editVolume = editVolume
exports.addSkip = addSkip
exports.stopMusic = stopMusic