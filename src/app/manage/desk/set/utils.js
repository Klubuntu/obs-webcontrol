const configapp = "../../../data/config.json"
const fs = require('fs')

// import { writeFileSync, readFile } from 'fs';
  
export function saveConfig(data){
    fs.writeFile(configapp, data, (err) => {
        if (err){
            console.error("[APP] Received Error");
            console.log(err);
        }
        else {
          console.log("[APP] Config Saved Successfully");
        }
    });
}

export function readConfig(){
    readFile(configapp, 'utf8', function(err, data){
        console.log(data);
    });
}