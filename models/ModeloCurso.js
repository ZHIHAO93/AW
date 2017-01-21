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

Curso.prototype.update = function(id, callback) {
    var conexion = mysql.createConnection();
    var nuevoCurso = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "UPDATE cursos SET ? WHERE id = " + id,
                    nuevoCurso,
                    function(err, result) {
                        if(err) {
                            console.log(err);
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

Curso.prototype.busqueda = function(str, num, pos, callback) {
    var conexion = mysql.createConnection();
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "SELECT titulo, localidad,  Date_format(fecha_ini, '%d-%m-%Y') as fecha_ini,  Date_format(fecha_fin, '%d-%m-%Y') as fecha_fin " + 
                    "FROM cursos " +
                    "WHERE titulo like '%" + str + "%' " +
                    "ORDER BY fecha_ini " + 
                    "LIMIT " + num + " OFFSET " + pos, 
                    function(err, result) {
                        if(err) {
                            console.log(err);
                            callback(err, "undefined");
                        } else {
                            console.log(result);
                            conexion.end();
                            callback(null, result);
                        }
                    }
            );
        }
    });
};

module.exports = Curso;