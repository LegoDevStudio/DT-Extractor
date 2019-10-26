var mysql = require("mysql");

var db = mysql.createConnection({
    host     : '68.191.146.82',
    port     : '2223',
    user     : 'dt-extractor',
    password : "5gybsDTQ3hSJ2B7r",
    database : 'dtExtractor'
});

global.connected = false;

db.connect(function(err) {
    Client.login("NjI2NjYzMjE5Mzk3Nzg3NjU4.Xay5ag.ZJ54gbmDV6cZb-ERGSyrJjrdV2M")
    if(err) {
      // Failed to connect.
      console.critical("Failed to connect to database:\n{}".format(err.stack));
      return;
    }
    console.info("Database connected successfully.");
    global.connected = true;
    global.queryDB = function(cmd,data) {
      return new Promise((res,rej) => {
        if(!connected) {
          rej({"code":"NOT_CONNECTED","message":"Database not connected."});
        }else{
          if(typeof data == "string") {
            data = [data];
          }
          db.query(cmd,data,function(error,results,tables) {
            if(error) {
              rej({"code":error.code,"message":error.sqlMessage});
            }else{
              res(results);
            }
          });
        }
      });
    }
  });