"use strict";

var mysql = require('./db');

function Curso(curso) {
    this.titulo = curso.titulo;
    this.descripcion = curso.descripcion;
    this.localidad = curso.localidad;
    this.direccion = curso.direccion;
    this.imagen = curso.imagen;
    this.plazas = curso.plazas;
    this.fecha_ini = curso.fecha_ini;
    this.fecha_fin = curso.fecha_fin;
    this.horario = curso.horario;
}

Curso.prototype.create = function(callback) {
    var conexion = mysql.createConnection();
    var nuevoCurso = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "INSERT INTO cursos SET ?",
                    nuevoCurso,
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

Curso.prototype.delete = function(id, callback) {
    var conexion = mysql.createConnection();
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "DELETE " +
                    "FROM cursos " +
                    "WHERE id=" + id,
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result.affectedRows);
                        }
                    }
            );
        }
    });
};

Curso.prototype.read = function(id, callback) {
    var conexion = mysql.createConnection();
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "SELECT * " +
                    "FROM cursos " +
                    "WHERE id=" + id,
                    function(err, result) {
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            callback(null, result[0]);
                        }
                    }
            );
        }
    });
};

module.exports = Curso;