const ADODB = require("node-adodb");
const fs = require('fs')

const connection = ADODB.open(
    "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=alwan.accdb;"
);

async function query(stm) {
    if (!stm) {
        return "Uable to query to database";
    }
    try {
        const result = await connection.query(stm);
        return JSON.stringify(result);
    } catch (error) {
        console.error(error);
		fs.writeFile('logs.txt',error.process.message,(err)=>{
			if (err) console.log(err)
		})
    }
}

module.exports = query;
