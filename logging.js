const fs = require('fs');

function logging(fileName,msg){
    const date = new Date();
    const logStream = fs.createWriteStream(`${__dirname}/${fileName}`,{flags:'a'});
    logStream.write("Date :"+date.toDateString()+" , "+date.getHours()+":"+date.getMinutes()+ ' : '+msg+'\n');
}

module.exports = logging;