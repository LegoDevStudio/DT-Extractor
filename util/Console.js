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

  global.String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };