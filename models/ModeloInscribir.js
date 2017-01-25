"use strict";

var mysql = require('./db');

function inscribir(inscribir) {
    this.id_usuario = inscribir.id_usuario;
    this.id_curso = inscribir.id_curso;
};

inscribir.prototype.create = function(callback) {
    var conexion = mysql.createConnection();
    var nuevoInscrito = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "INSERT INTO inscrito SET ?",
                    nuevoInscrito,
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result.insertedId);
                        }
                    }
            );
        }
    });
};

inscribir.prototype.readCursoByUserId = function(id, callback) {
    var conexion = mysql.createConnection();
    conexion.connect(function(err) {
        if(err){
            callback(err, "undefined");
        } else {
            conexion.query(
                    "SELECT cursos.titulo, cursos.localidad, cursos.fecha_ini, cursos.fecha_fin " +
                    "FROM inscrito, cursos " +
                    "WHERE inscrito.id_usuario=" + id + " AND inscrito.id_curso = cursos.id",
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result);
                        }
                    }
            );
        }
    });
};

module.exports = inscribir;