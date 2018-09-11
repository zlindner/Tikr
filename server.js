"use strict";

let express = require("express");
let http = require("http");
let mysql = require("mysql");
let bcrypt = require("bcryptjs");
let mailer = require("nodemailer");
let request = require("request");

let app = express();
app.use(express.static("."));

// server config file
/*let config = require("./config");

console.log("Initiailizing database connection pool...");

let pool = mysql.createPool({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    connectionLimit: config.db.connectionLimit
});

console.log("Connection pool successfully initialized");
console.log("Initializing mailer...");

// smtp transporter
let transporter = mailer.createTransport({
    service: config.mailer.service,
    auth: {
        user: config.mailer.username,
        pass: config.mailer.password
    }
});

console.log("Mailer successfully initialized");*/

let stocks = [];

console.log("Loading stock information...");

request(
    {
        url: "https://api.iextrading.com/1.0/ref-data/symbols",
        json: true
    },
    function(err, res, json) {
        if (err) throw err;

        if (res.statusCode == 200) {
            stocks = json;
            console.log("Stock information successfully loaded");
        }
    }
);

app.get("/login", function(req, res) {
    let email = req.query.email;
    let password = req.query.password;

    // casts binary hash to string
    pool.query('SELECT CAST(password as CHAR) FROM account WHERE email="' + email + '"', function(err, result) {
        if (err) throw err;

        if (result.length == 0) {
            // no account with given email
            return res.json({ status: "fail" });
        } else {
            // for some reason json key is 'CAST(password as CHAR)'
            let hash = result[0]["CAST(password as CHAR)"];

            bcrypt.compare(password, hash, function(err, match) {
                if (err) throw err;

                if (match) {
                    // password was a match
                    pool.query('SELECT * FROM account WHERE email="' + email + '"', function(err, account) {
                        return res.json({
                            status: "success",
                            balance: account[0].balance,
                            id: account[0].account_id,
                            verified: account[0].verified
                        });
                    });
                } else {
                    // password wasn't a match
                    return res.json({ status: "fail" });
                }
            });
        }
    });
});

app.get("/createAccount", function(req, res) {
    let email = req.query.email;
    let password = req.query.password;

    pool.query('SELECT * FROM account WHERE email="' + email + '"', function(err, result) {
        if (err) throw err;

        // account doesn't already exist with that email
        if (result.length == 0) {
            bcrypt.hash(password, 10, function(err, hash) {
                if (err) throw err;

                let id = Math.floor(Math.random() * 90000000) + 10000000;

                console.log(id);

                pool.query('INSERT INTO account (email, password, verify_id) VALUES("' + email + '", "' + hash + '", "' + id + '")', function(err, result) {
                    if (err) throw err;

                    // email verification
                    sendEmail(email, id, req.get("host"));
                });
            });
        } else {
            // account already exists with that email
            return res.json({ status: "fail" });
        }
    });
});

function sendEmail(email, id, host) {
    let link = "http://" + host + "/verify?id=" + id;

    let options = {
        to: email,
        subject: "Tikr account verification",
        html: 'Hello,<br>Please click on the link to verify your email.<br><a href="' + link + '">Verify</a>'
    };

    transporter.sendMail(options, function(err, res) {
        if (err) throw err;

        console.log("sent");
    });
}

app.get("/verify", function(req, res) {
    let linkID = req.query.id;

    pool.query('SELECT * FROM account WHERE verify_id="' + linkID + '"', function(err, result) {
        if (err) throw err;

        if (result.length == 0) {
            return res.end("<h1>Bad request</h1>");
        }

        let userID = result[0].id;

        if (userID == linkID) {
            let email = result[0].email;

            pool.query('UPDATE account SET verified="1", verify_id=NULL WHERE email="' + email + '"', function(err, result) {
                if (err) throw err;

                return res.end("<h1>Email has successfully been verified</h1>");
            });
        } else {
            return res.end("<h1>Bad request</h1>");
        }
    });
});

app.get("/search", function(req, res) {
    let term = req.query.term;
    let filtered = [];
    const LIMIT = 25;

    stocks
        .filter(function(stock) {
            return ~stock.symbol.toLowerCase().indexOf(term) || ~stock.name.toLowerCase().indexOf(term);
        })
        .slice(0, LIMIT)
        .forEach(function(stock) {
            if (stock.name.length > 0) {
                filtered.push({
                    label: stock.symbol + " - " + stock.name,
                    value: stock.symbol
                });
            } else {
                filtered.push({
                    label: stock.symbol,
                    value: stock.symbol
                });
            }
        });

    res.send(filtered);
});

app.get("/buy", function(req, res) {
    let id = req.query.id;
    let symbol = req.query.symbol;
    let price = req.query.price;
    let shares = req.query.shares;
    let time = req.query.time;
    let type = 0; // type is 0 for buying shares

    pool.query('INSERT INTO transaction VALUES ("' + symbol + '", "' + price + '", "' + time + '", "' + type + '", "' + shares + '", "' + id + '")', function(err, result) {
        if (err) throw err;

        let cost = price * shares;

        //TODO: update account balance

        res.json({ status: "success" });
    });
});

app.get("/transactions", function(req, res) {
    let id = req.query.id;

    pool.query('SELECT * FROM transaction WHERE account_id="' + id + '"', function(err, result) {
        if (err) throw err;

        res.send(result);
    });
});

// graceful shutdown
process.on("SIGINT", function() {
    console.log("\nShutting down server...");

    pool.end(function(err) {
        if (err) throw err;

        process.exit();
    });
});

let server = http.createServer(app);
server.listen(9000);
console.log("Tikr running @ localhost:9000");
