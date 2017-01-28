"use strict";

var mysql = require('./db');

function horario(horario) {
    this.horario = horario;
}

horario.prototype.insert = function(id, callback) {
    var conexion = mysql.createConnection();
    var query = "INSERT INTO horarios (id_curso, Dias, Hora_ini, Hora_fin) values ";
    var i;
    for(i=0;i<this.horario.length;i++) {
        query += "('" + id + "', '" + this.horario[i].dia + "', '" + this.horario[i].hora_ini + "', '" + this.horario[i].hora_fin + "')";
        if(i !== this.horario.length-1) {
            query += ",";
        }
    }
    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            conexion.query(
                query,
                function(err, result) {
                    if(err) {
                        console.log(err);
                        callback(err);
                    } else {
                        if(result.affectedRow === 0) {
                            callback(null, false);
                        } else {
                            callback(null, true);
                        }
                    }
                }
            );
        }
    });
};

horario.prototype.update = function(id, callback) {
    var conexion = mysql.createConnection();
    var query = "INSERT INTO horarios (id_curso, Dias, Hora_ini, Hora_fin) values ";
    var i;
    for(i=0;i<this.horario.length;i++) {
        query += "('" + id + "', '" + this.horario[i].dia + "', '" + this.horario[i].hora_ini + "', '" + this.horario[i].hora_fin + "')";
        if(i !== this.horario.length-1) {
            query += ",";
        }
    }
    conexion.connect(function(err) {
        if(err) {
            callback(err);
        } else {
            conexion.query(
                query,
                function(err, result) {
                    if(err) {
                        console.log(err);
                        callback(err);
                    } else {
                        if(result.affectedRow === 0) {
                            callback(null, false);
                        } else {
                            callback(null, true);
                        }
                    }
                }
            );
        }
    });
};

module.exports = horario;