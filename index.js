const ws = require("ws");
const query = require("./data");
//let client = new ws("wss://testt-websocket.herokuapp.com/");
let client = new ws("ws://localhost:4000/");

let timer;

client.on("open", (socket) => {
    console.log("Connected to server");
    ping();
    client.send("Client: hi");
});

client.on("message", async (data) => {
    let msg;
    try {
        msg = JSON.parse(data);
        console.log(msg);
    } catch (error) {
        console.log("ERORR on reciving message form server");
        client.send("Retry to send request");
    }
    if (!msg) return client.send("Empty request");
    let stm = "";
    switch (msg.path) {
        case "/sale":
            stm = "select * from فواتير_المبيع";

            if (msg.person) {
                if (stm.includes("where")) {
                    stm += ` and معرف_الزبون in(select معرف_الزبون from الزبائن where الاسم='${msg.person}')`;
                } else {
                    stm += ` where معرف_الزبون in(select معرف_الزبون from الزبائن where الاسم='${msg.person}')`;
                }
            }

            if (msg.product) {
                if (stm.includes("where")) {
                    stm += ` and معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'${msg.product}'))`;
                } else {
                    stm += ` where معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'${msg.product}'))`;
                }
            }

            if (msg.start) {
                if (stm.includes("where")) {
                    stm += ` and التاريخ between #${msg.start}# and #${msg.end}#`;
                } else {
                    stm += ` where التاريخ between #${msg.start}# and #${msg.end}#`;
                }
            }

            console.log(stm);
            client.send(await query(stm));
            break;

        case "/buy":
            stm = "select * from فواتير_الشراء";

            if (msg.person) {
                if (stm.includes("where")) {
                    stm += ` and معرف_المورد in(select معرف_المورد from الموردون where الاسم='${msg.person}')`;
                } else {
                    stm += ` where معرف_المورد in(select معرف_المورد from الموردون where الاسم='${msg.person}')`;
                }
            }

            if (msg.product) {
                if (stm.includes("where")) {
                    stm += ` and معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'${msg.product}'))`;
                } else {
                    stm += ` where معرف_المادة in(select First(معرف_المادة) from مواد_مصنعة where inStr(الاسم&" "&الصنف&" "&النوع,'${msg.product}'))`;
                }
            }

            if (msg.start) {
                if (stm.includes("where")) {
                    stm += ` and التاريخ between #${msg.start}# and #${msg.end}#`;
                } else {
                    stm += ` where التاريخ between #${msg.start}# and #${msg.end}#`;
                }
            }

            console.log(stm);
            client.send(await query(stm));
            break;
    }
});

client.on("error", (err) => {
    console.log("Unable to connect with server\n", err);
});

client.on("close", (code, reason) => {
    console.log("Disconnected to server\nRetrying to connect.");
    setTimeout(() => {
        client = new ws("wss://testt-websocket.herokuapp.com/");
    }, 5000);

    clearTimeout(timer);
});

function ping() {
    client.ping("this is ping message", (err) => {
        if (err) console.error("Error to ping to server\n", err);
    });
    timer = setTimeout(ping, 20000);
}

/*


select رقم_الفاتورة,الموردون.الاسم as المورد, الموردون.معرف_المورد ,العدد,فواتير_الشراء.السعر,مواد_مصنعة.الاسم&" "&الصنف&" "&النوع as المادة,معرف_الفاتورة,التاريخ
from الموردون,فواتير_الشراء,مواد_مصنعة
where  الموردون.الاسم='مكتبة المورد' and الموردون.معرف_المورد=فواتير_الشراء.معرف_المورد and مواد_مصنعة.معرف_المادة=فواتير_الشراء.معرف_المادة







*/
