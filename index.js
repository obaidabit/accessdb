const WebSocket = require("ws");
const query = require("./data");
const log = require("./logging");
let client;
let pingTimeout;

function connect() {
    client = new WebSocket("wss://testt-websocket.herokuapp.com/");

    client.on("open", function () {
        log("debug.log", "Server is connected");
        ping();
    });
    client.on("error", function (err) {
        log(
            "error.log",
            __filename.slice(__dirname.length + 1) +
                " at " +
                new Error(err).stack
        );
        if (pingTimeout) clearTimeout(pingTimeout);
    });
    client.on("close", function (err) {
        log(
            "error.log",
            __filename.slice(__dirname.length + 1) +
                " at " +
                new Error(err).stack
        );
        setTimeout(connect, 60000);
        if (pingTimeout) clearTimeout(pingTimeout);
    });
    client.on("pong", () => {
        pingTimeout = setTimeout(ping, 30000);
    });

    function ping() {
        client.ping("Ping message.", undefined, undefined);
    }

    client.on("message", async (data) => {
        let msg;

        if (!data) return client.send("Empty request", undefined, undefined);

        try {
            msg = JSON.parse(data);
        } catch (error) {
            log(
                "error.log",
                __filename.slice(__dirname.length + 1) +
                    " at " +
                    new Error(error).stack
            );
            client.send("Retry to send request", undefined, undefined);
        }
        log("debug.log", "msg: " + data);

        let stm = "";

        switch (msg.path) {
            case "/sale":
                stm = `SELECT فواتير_المبيع.معرف_البيان as rid, (select [رقم_المادة] from [مواد_مصنعة] where [فواتير_المبيع].[معرف_المادة]=[مواد_مصنعة].[معرف_المادة]) AS product_number, (select [الاسم] from [الزبائن] where [الزبائن].[معرف_الزبون]=[فواتير_المبيع].[معرف_الزبون]) AS client, Format( فواتير_المبيع.[التاريخ],"dd/mm/yyyy") as [date], (select [الاسم]&" "&[الصنف]&" "&[النوع] as  product from [مواد_مصنعة] where  [فواتير_المبيع].[معرف_المادة]=[مواد_مصنعة].[معرف_المادة]) AS product,[السعر] AS price, فواتير_المبيع.[العدد] as num,(select last([السعر]) from [فواتير_الشراء] where [فواتير_الشراء].[معرف_المادة]=[فواتير_المبيع].[معرف_المادة]  group by [معرف_المادة]  ) as buy_price,(select [حسم] from [دفعات] where [دفعات].[معرف_البيان]=[فواتير_المبيع].[معرف_البيان]) AS sale, (select [القيمة] from [دفعات] where [دفعات].[معرف_البيان]=[فواتير_المبيع].[معرف_البيان]) AS payment , (select [userName] from [users] where [userID]=[فواتير_المبيع].[المستخدم]) AS [user] FROM فواتير_المبيع`;

                if (msg.person) {
                    if (
                        stm.includes("where التاريخ") ||
                        stm.includes("where معرف_المادة")
                    ) {
                        stm += ` and معرف_الزبون in(select معرف_الزبون from الزبائن where الاسم='${msg.person}')`;
                    } else {
                        stm += ` where معرف_الزبون in(select معرف_الزبون from الزبائن where الاسم='${msg.person}')`;
                    }
                }

                if (msg.product) {
                    if (
                        stm.includes("where معرف_الزبون") ||
                        stm.includes("where التاريخ")
                    ) {
                        stm += ` and معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'${msg.product.trim()}'))`;
                    } else {
                        stm += ` where معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'${msg.product.trim()}'))`;
                    }
                }

                if (msg.start) {
                    if (
                        stm.includes("where معرف_الزبون") ||
                        stm.includes("where معرف_المادة")
                    ) {
                        stm += ` and التاريخ between #${msg.start}# and #${msg.end}#`;
                    } else {
                        stm += ` where التاريخ between #${msg.start}# and #${msg.end}#`;
                    }

                    if (msg.start === msg.end) stm += "+1";
                }

                client.send(await query(stm), undefined, undefined);
                break;

            case "/buy":
                stm = `SELECT فواتير_الشراء.معرف_البيان as rid,فواتير_الشراء.رقم_الفاتورة as pid,Format(فواتير_الشراء.التاريخ,"dd/mm/yyyy") AS [date],(select [الاسم] from [الموردون] where [فواتير_الشراء].[معرف_المورد]=[الموردون].[معرف_المورد]) AS supplier,(select [رقم_المادة] from [مواد_مصنعة] where [فواتير_الشراء].[معرف_المادة]=[مواد_مصنعة].[معرف_المادة]) AS product_number,(select [الاسم]&" "&[الصنف]&" "&[النوع] as  product from [مواد_مصنعة] where  [فواتير_الشراء].[معرف_المادة]=[مواد_مصنعة].[معرف_المادة]) AS product,[العدد] as num,[السعر] as price,[حسم0] as sale FROM فواتير_الشراء `;

                if (msg.person) {
                    if (
                        stm.includes("where التاريخ") ||
                        stm.includes("where معرف_المادة")
                    ) {
                        stm += ` and معرف_المورد in(select معرف_المورد from الموردون where الاسم='${msg.person}')`;
                    } else {
                        stm += ` where معرف_المورد in(select معرف_المورد from الموردون where الاسم='${msg.person}')`;
                    }
                }

                if (msg.product) {
                    if (
                        stm.includes("where معرف_المورد") ||
                        stm.includes("where التاريخ")
                    ) {
                        stm += ` and معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'${msg.product}'))`;
                    } else {
                        stm += ` where معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'${msg.product}'))`;
                    }
                }

                if (msg.start) {
                    if (
                        stm.includes("where معرف_المورد") ||
                        stm.includes("where معرف_المادة")
                    ) {
                        stm += ` and التاريخ between #${msg.start}# and #${msg.end}#`;
                    } else {
                        stm += ` where التاريخ between #${msg.start}# and #${msg.end}#`;
                    }
                    if (msg.start === msg.end) stm += "+1";
                }

                client.send(await query(stm), undefined, undefined);
                break;

            case "/balance":
                stm = `SELECT valueN,(select sum([القيمة]) from [دفعات] ${
                    msg.date ? "where [التاريخ] < #" + msg.date + "#+1" : ""
                }) AS payment, (select sum([القيمة]) from [دفعات_موردين] ${
                    msg.date ? "where [التاريخ] < #" + msg.date + "#+1" : ""
                } ) AS supplier_payment,(select sum([القيمة]) from [حركات] where [نوع_الحركة] in (select [معرف_نوع_الحركة] from [أنواع_الحركة] where [إدخالية]=true) ${
                    msg.date ? "and [التاريخ] < #" + msg.date + "#+1" : ""
                }) AS [input], (select sum([القيمة]) from [حركات] where [نوع_الحركة] in (select [معرف_نوع_الحركة] from [أنواع_الحركة] where [إدخالية]=false) ${
                    msg.date ? "and [التاريخ] < #" + msg.date + "#+1" : ""
                }) AS [output] FROM settings WHERE setName='CYCLE_CASH'`;

                client.send(await query(stm), undefined, undefined);
                break;

            case "/saler":
                stm = `SELECT * FROM الموردون`;

                client.send(await query(stm), undefined, undefined);
                break;

            case "/customer":
                stm = `SELECT * FROM الزبائن`;

                client.send(await query(stm), undefined, undefined);
                break;
            case "/movement":
                stm = `SELECT [معرف_الحركة] as mid,Format(التاريخ,"dd/mm/yyyy") as [date],(select [الحركة] from [أنواع_الحركة] where [معرف_نوع_الحركة]=[نوع_الحركة]) as movement_type,[القيمة] as cost,[البيان] as [note],(select [userName] from [users] where [userID]=[المستخدم]) AS [user] from [حركات] `;

                if (msg.start) {
                    stm += ` where التاريخ between #${msg.start}# and #${msg.end}#`;
                    if (msg.start === msg.end) stm += "+1";
                }
                if (msg.type) {
                    stm += ` and [نوع_الحركة]=(select [معرف_نوع_الحركة] from [أنواع_الحركة] where [الحركة]='${msg.type}')`;
                }

                client.send(await query(stm), undefined, undefined);
                break;
        }
    });
}

connect();
