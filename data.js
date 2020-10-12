const ADODB = require("node-adodb");

const connection = ADODB.open(
    "Provider=Microsoft.ACE.OLEDB.16.0;Data Source=alwan.accdb;",
    true
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
    }
}

module.exports = query;
