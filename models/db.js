"use strict";
var mysql = require('mysql');
var config = require('../config');

function createConnection(){
    return mysql.createConnection({
            host: config.dbHost,
            user: config.dbUser,
            password: config.dbPassword,
            database: config.dbName
    });
}

module.exports = {
	mysql: mysql,
	createConnection: createConnection
};