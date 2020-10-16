const ADODB = require("node-adodb");
const fs = require('fs');

const connection = ADODB.open(
    "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=alwan.accdb;"
);

async function query() {
    try {
        const d = new Date();
        const result = await connection.query(
			`SELECT valueN, (select sum([القيمة]) from [دفعات] ) AS payment, (select sum([القيمة]) from [دفعات_موردين]) AS supplier_payment, (select sum([القيمة]) from [حركات] where [نوع_الحركة] in (select [معرف_نوع_الحركة] from [أنواع_الحركة] where [إدخالية]=true)) AS [input], (select sum([القيمة]) from [حركات] where [نوع_الحركة] in (select [معرف_نوع_الحركة] from [أنواع_الحركة] where [إدخالية]=false)) AS [output] FROM settings WHERE setName='CYCLE_CASH'
`	
		);
        console.log('done')
		console.log(result);
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
