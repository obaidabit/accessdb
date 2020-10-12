const ADODB = require("node-adodb");

const connection = ADODB.open(
    "Provider=Microsoft.ACE.OLEDB.16.0;Data Source=alwan.accdb;",
    true
);

async function query() {
    try {
        const d = new Date();
        const result = await connection.query(
            `select * from فواتير_المبيع where معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'دفتر راصور بلاستيك عربي وسط 70'))`
        );
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

query();
