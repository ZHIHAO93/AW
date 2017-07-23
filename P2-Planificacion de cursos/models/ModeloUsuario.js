"use strict";

var mysql = require('./db');

function Usuario(usuario) {
    this.correo = usuario.correo;
    this.password = usuario.password;
    this.nombre = usuario.nombre;
    this.apellido = usuario.apellido;
    this.sexo = usuario.sexo;
    this.nacimiento = usuario.nacimiento;
};

Usuario.prototype.create = function(callback) {
    var conexion = mysql.createConnection();
    var nuevoUsuario = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "INSERT INTO usuarios SET ?",
                    nuevoUsuario,
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result.insertId);
                        }
                    }
            );
        }
    });
};

Usuario.prototype.read = function(correo, callback) {
    
};

Usuario.prototype.update = function(id, callback) {
    
};

Usuario.prototype.delete = function(id, callback) {
    
};

module.exports = Usuario;