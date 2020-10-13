const ADODB = require("node-adodb");
const fs = require('fs');

const connection = ADODB.open(
    "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=alwan.accdb;"
);

async function query() {
    try {
        const d = new Date();
        const result = await connection.query(
            `SELECT فواتير_الشراء.معرف_البيان, First(فواتير_الشراء.رقم_الفاتورة) AS الفاتورة, First(فواتير_الشراء.التاريخ) AS تاريخ, First(دفعات_موردين.القيمة) AS دفعة, Count(فواتير_الشراء.معرف_الفاتورة) AS عدد_الأقلام FROM الموردون RIGHT JOIN (دفعات_موردين RIGHT JOIN فواتير_الشراء ON دفعات_موردين.معرف_البيان = فواتير_الشراء.معرف_البيان) ON الموردون.معرف_المورد = فواتير_الشراء.معرف_المورد GROUP BY فواتير_الشراء.معرف_البيان ORDER BY First(فواتير_الشراء.التاريخ);`
        );
        
		fs.writeFile('data.json',JSON.stringify(result,null,2),err =>{
			if(err) console.err(err);
		});
		/*
		result.forEach(item =>{
			fs.writeFile('data.json',item['التاريخ'],err =>{
				if(err) console.err(err);
			});
		}) 
		*/
		
    } catch (error) {
        console.error(error);
		fs.writeFile('logs.txt',error.process.message,(err)=>{
			if (err) console.log(err)
		})
    }
}

query();
