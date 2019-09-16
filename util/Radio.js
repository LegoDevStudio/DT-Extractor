const ytdl = require('ytdl-core');
const YouTube = require("simple-youtube-api");
var streamOptions = { seek: 0, volume: 1, passes: 1 };
var youtube = new YouTube("AIzaSyC7qosqO9qOZkBP6_r7DnKbJCk92gHAaOg");
const ytdld = require('ytdl-core-discord');


var PresetQueue = [];

var Queue = [];
// An easier dang way I can make this work
var Connection = null;
// Music connection
var Dispatcher = null;
// The music player

function urlToId(text) {return ytdl.getVideoID(text)}
function idToUrl(id) {return "https://www.youtube.com/watch?v="+id;}

console.log("Music Manager Loaded 😃");

youtube.getPlaylistByID("PL4IELTxH5Z34vw7sb3_wI94e0pS1iQGO9").then(playlist => {
	playlist.getVideos().then(videos => {
		videos.forEach(video => {
			PresetQueue[PresetQueue.length] = /*{"id":*/video.id/*,"title":video.title};*/
		});
		start();
	}).catch(e=>console.error(e.stack));
}).catch(e=>console.error(e.stack));

function randomiseQueue() {
  return new Promise((res,rej) => {
	  for(var i = 0;i<=PresetQueue.length;i++) {
      if(i==PresetQueue.length) res();
		  Queue[Queue.length] = PresetQueue[Math.floor(Math.random() * (PresetQueue.length-1))];
	  }
  });
}

function start() {
  Client.guilds.get("413155443997802528").channels.get("622529210463944714").join()
        .then(connection => { 
          Connection = connection;
          randomiseQueue().then(() => {
            music();
          });
  }).catch(e => {
          console.log("lego is a dumb dumb\n"+e.stack);
  });
}

function endMusic() {
	randomiseQueue().then(() => {
    music();
  });
}

async function music() {
          console.log("A");
          let song = Queue.shift();
          console.log(song);
          //const stream = ytdl(idToUrl(song));
          Dispatcher = Connection.playStream(ytdl(idToUrl(song), { filter : 'audioonly' }), streamOptions);
          //Dispatcher = Connection.playArbitraryInput('https://cdn.glitch.com/29710454-c8ff-4cb6-ac58-7fe9acf1a470%2FChicken%20Nuggets?v=1568661003257');
          //Dispatcher = Connection.playStream(stream, streamOptions);
          //Dispatcher = Connection.playFile(__dirname+"/chicken_nugget.mp3");
          Dispatcher.on("start", () => {
            console.log("playing radio id "+song);
          });
          Dispatcher.on("end", reason => {
            console.log(reason);
             setTimeout(() => {
               Dispatcher.end();
                console.log("B")
                if(Queue.length==0) {return endMusic()}
                music();
                //Dispatcher.end();
             },((song.length*1000)-Dispatcher.totalStreamTime));
          });
          Dispatcher.on("error", data => {
            console.error(data)
          });
}