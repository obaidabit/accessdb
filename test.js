const ADODB = require("node-adodb");
const fs = require("fs");

const connection = ADODB.open(
    "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=alwan.accdb;",
    true
);

async function query() {
    try {
        const d = new Date();
        const result = await connection.query(
            `SELECT فواتير_المبيع.معرف_البيان as rid, (select [رقم_المادة] from [مواد_مصنعة] where [فواتير_المبيع].[معرف_المادة]=[مواد_مصنعة].[معرف_المادة]) AS product_number, (select [الاسم] from [الزبائن] where [الزبائن].[معرف_الزبون]=[فواتير_المبيع].[معرف_الزبون]) AS client, Format(فواتير_المبيع.التاريخ,"dd/mm/yyyy") AS [date], (select [الاسم]&" "&[الصنف]&" "&[النوع] as  product from [مواد_مصنعة] where  [فواتير_المبيع].[معرف_المادة]=[مواد_مصنعة].[معرف_المادة]) AS product,  [فواتير_المبيع].[السعر] AS price, فواتير_المبيع.[العدد] as num , (select last([السعر]) from [فواتير_الشراء] where [فواتير_الشراء].[معرف_المادة]=[فواتير_المبيع].[معرف_المادة]  group by [معرف_المادة]  ) AS buy_price,(select [حسم] from [دفعات] where [دفعات].[معرف_البيان]=[فواتير_المبيع].[معرف_البيان]) AS sale,(select [userName] from [users] where [userID]=[فواتير_المبيع].[المستخدم]) as [user] FROM فواتير_المبيع where [التاريخ] between #1/1/2020# and #1/2/2020#`
        );
        console.log("done");
        console.log(result);
        fs.writeFile("data.json", JSON.stringify(result, null, 2), (err) => {
            if (err) console.err(err);
        });
    } catch (error) {
        console.error(error);
        fs.writeFile("logs.txt", error.process.message, (err) => {
            if (err) console.log(err);
        });
    }
}

//query();

async function sort() {
    const posts = require("./data.json");

    let group = posts.reduce((r, a) => {
        r[a["معرف_البيان"]] = [...(r[a["معرف_البيان"]] || []), a];
        return r;
    }, {});
    console.log("group", group);
    fs.writeFile("data2.json", JSON.stringify(group, null, 2), (err) => {
        if (err) console.err(err);
    });
}
