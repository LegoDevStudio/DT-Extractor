  
module.exports = class {
    constructor() {
      this.name = "";
      this.module = "";
      this.description = "";
      this.permission = 0;
      this.enabled = true;
      this.usage = "";
      this.args = 0;
      this.alias = [];
    }
    code(args,message) {
      throw "Command enabled but no code to execute!";
    }
    execute(args,message) {
      return new Promise((res,rej) => {
        // Promise Rejection Object
        /* 
           {
              code [NUMBER]: Simple id for the error
              message [STRING]: Breif error message.
           }
        */
        if(this.enabled == false) return rej({"code":1,"message":"Command is disabled."});
        if(args.length<this.args) return rej({"code":3,"message":this.usage});
        try{
          let result = this.code(args,message);
          //If the result (return) returned is a string, we're gonna send a basic reply. If it's not dont do anything.
          if(typeof result == "string") {
            message.reply(result);
          }
          res();
        }catch(error) {
          rej({"code":2,"message":error.message});
        }
      });
    }
  }