const ADODB = require("node-adodb");
const fs = require('fs');

const connection = ADODB.open(
    "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=alwan.accdb;"
);

async function query() {
    try {
        const d = new Date();
        const result = await connection.query(
			`SELECT فواتير_المبيع.معرف_البيان,, (select [رقم_المادة] from [مواد_مصنعة] where [فواتير_المبيع].[معرف_المادة]=[مواد_مصنعة].[معرف_المادة]) AS Expr1, (select [الاسم] from [الزبائن] where [الزبائن].[معرف_الزبون]=[فواتير_المبيع].[معرف_الزبون]) AS client, فواتير_المبيع.[التاريخ], (select [الاسم]&" "&[الصنف]&" "&[النوع] as  product from [مواد_مصنعة] where  [فواتير_المبيع].[معرف_المادة]=[مواد_مصنعة].[معرف_المادة]) AS Expr2, فواتير_المبيع.[مستهلك], فواتير_المبيع.[العدد]FROM  [فواتير_المبيع]`
		);
        console.log('done')
		fs.writeFile('data.json',JSON.stringify(result,null,2),err =>{
			if(err) console.err(err);
		});

    } catch (error) {
        console.error(error);
		fs.writeFile('logs.txt',error.process.message,(err)=>{
			if (err) console.log(err)
		})
    }
}

query();
