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
                        conexion.end();
                        if(err) {
                            callback(err, "undefined");
                        } else {
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
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            if(result.affectedRows === 0){
                                callback(null, undefined);
                            } else {
                                callback(null, result.affectedRows);
                            }
                        }
                    }
            );
        }
    });
};

Curso.prototype.updateImg = function(id, imagen, callback) {
    var conexion = mysql.createConnection();
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "UPDATE cursos SET imagen = ? WHERE id = " + id,
                    [imagen],
                    function(err, result) {
                        if(err) {
                            console.log(err);
                            callback(err, "undefined");
                        } else {
                            conexion.end();
                            if(result.affectedRows === 0){
                                callback(null, undefined);
                            } else {
                                callback(null, result.affectedRows);
                            }
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
                        conexion.end();
                        if(err) {
                            callback(err, "undefined");
                        } else {
                            if(result.affectedRows === 0){
                                callback(null, undefined);
                            } else {
                                callback(null, result.affectedRows);
                            }
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
                    "SELECT " +
                    "c.id, c.titulo, c.descripcion, c.localidad, c.direccion, c.plazas, c.fecha_ini, c.fecha_fin, " +
                    "GROUP_CONCAT(CONCAT(h.Dias, ': ', h.Hora_ini, '-', h.Hora_fin)) as horario " +
                    "FROM cursos c, horarios h " +
                    "WHERE c.id=" + id + " AND c.id = h.id_curso " +
                    "GROUP BY c.id",
                    function(err, result) {
                        conexion.end();
                        if(err) {
                            callback(err, undefined);
                        } else {
                            if(result.length === 0){
                                callback(null, null);
                            } else {
                                callback(null, result[0]);
                            }
                        }
                    }
            );
        }
    });
};

Curso.prototype.readImg = function(id, callback) {
    var conexion = mysql.createConnection();
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "SELECT imagen " +
                    "FROM cursos " +
                    "WHERE id=" + id,
                    function(err, result) {
                        conexion.end();
                        if(err) {
                            callback(err, undefined);
                        } else {
                            if(result.length === 0){
                                callback(null, undefined);
                            } else {
                                callback(null, result[0].imagen);
                            }
                        }
                    }
            );
        }
    });
};

// Funcion para sacar numero total de filas en base de datos aparezca str en el titulo de curso 
Curso.prototype.busquedaTotal = function(str, conexion, callback) {
    conexion.query(
            "SELECT COUNT(*) AS num_cursos FROM cursos WHERE titulo like '%" + str + "%'",
            function(err, numRow) {
                if(err){
                callback(err);
                } else {
                    callback(null, numRow[0]);
                }
            });
};

Curso.prototype.busqueda = function(str, num, pos, callback) {
    var conexion = mysql.createConnection();
    var curso = this;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            curso.busquedaTotal(str, conexion, function(err, numRow) {
                if(err) {
                    callback(err);
                } else {
                    conexion.query(
                            "SELECT id, titulo, localidad,  Date_format(fecha_ini, '%d-%m-%Y') as fecha_ini,  Date_format(fecha_fin, '%d-%m-%Y') as fecha_fin " + 
                            "FROM cursos " +
                            "WHERE titulo like '%" + str + "%' " +
                            "ORDER BY fecha_ini " + 
                            "LIMIT " + num + " OFFSET " + pos, 
                            function(err, result) {
                                if(err) {
                                    callback(err, "undefined");
                                } else {
                                    conexion.end();
                                    result.numRow = numRow.num_cursos;
                                    callback(null, result);
                                }
                            }
                    );
                }
            });
        }
    });
};

module.exports = Curso;