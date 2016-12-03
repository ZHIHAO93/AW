"use strict";
var mysql = require('mysql');

function createConnection(){
    return mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "saboteur"
    });
}

module.exports = {
	mysql: mysql,
	createConnection: createConnection
};