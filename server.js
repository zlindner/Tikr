'use strict'

/* TODO:
 * implement connection pooling
 * add connection.release()
 * email verification
 *     set verified column to true when email is verified
 */

let express = require('express');
let http = require('http');
let mysql = require('mysql');
let bcrypt = require('bcrypt');

let app = express();
app.use(express.static('.'));

let db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'no no no',
    database: 'tikr'
});

db.connect(function(err) {
    if (err) throw err;
    
    console.log('Connected to db');
});

app.get('/login', function(req, res) {
    let email = req.query.email;
    let password = req.query.password;

    // casts binary hash to string
    db.query('SELECT CAST(password as CHAR) FROM account WHERE email="' + email + '";', function(err, result) {
        if (err) throw err;

        if (result.length == 0) {
            // no account with given email
            return res.json({status: 'fail'});
        } else {
            // for some reason json key is 'CAST(password as CHAR)'
            let hash = result[0]['CAST(password as CHAR)'];
            
            bcrypt.compare(password, hash, function(err, match) {
                if (err) throw err;

                if (match) {
                    // password was a match
                    return res.json({status: 'success'});
                } else {
                    // password wasn't a match
                    return res.json({status: 'fail'});
                }
            });
        }
    });
});

app.get('/createAccount', function(req, res) {
    let email = req.query.email;
    let password = req.query.password;

    db.query('SELECT * FROM account WHERE email="' + email + '";', function(err, result) {
        if (err) throw err;

        // account doesn't already exist with that email
        if (result.length == 0) {
            bcrypt.hash(password, 10, function(err, hash) {
                if (err) throw err;
        
                db.query('INSERT INTO account (email, password) VALUES("' + email + '", "' + hash + '")', function(err, result) {
                    if (err) throw err;

                    // email verification
                });
            });
        } else {
            // account already exists with that email
            return res.json({status: 'fail'});
        }
    });
});

let server = http.createServer(app);
server.listen(9000);
console.log('Tikr running @ localhost:9000');