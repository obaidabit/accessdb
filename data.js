const ADODB = require("node-adodb");
const log = require('./logging');

const connection = ADODB.open(
    "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=alwan.accdb;"
);
log('debug.log','Connected to database');

async function query(stm) {
    if (!stm) {
        return "Uable to query to database";
    }
    try {
        const result = await connection.query(stm);
        return JSON.stringify(result);
    } catch (error) {
        log('error.log',__filename.slice(__dirname.length + 1)+" at "+new Error(error).stack);
    }
}

module.exports = query;
