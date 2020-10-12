const http = require("http");

let requestCount = 0;

const serverRequest = http.request(
    {
        hostname: "localhost",
        port: 4000,
        path: "/login",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    },
    (res) => {
        let chunks = "";
        console.log("Connnection is established");

        res.on("data", (chunk) => {
            chunks += chunk;
        });

        res.on("error", (err) => {
            console.log("Connection Error :\n" + err);
            console.log("Unable to receive server response.\n");
        });
    }
);

serverRequest.on("error", (err) => {
    console.log("\nConnection Error :\n" + err);
    console.log("Retring to connect.\nRequest number :" + requestCount);

    setTimeout(connect, 20000);
});

function connect() {
    serverRequest.write(
        JSON.stringify({
            username: "color",
            password: "1234",
        })
    );

    serverRequest.end();
    requestCount++;

    return new Promise((resolve, reject) => {
        let data = "";
        serverRequest.on("response", (res) => {
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                console.log("Connected to server successfully.");
                resolve({ token: res.headers.access_token, data });
            });
        });
    });
}

module.exports = connect;
