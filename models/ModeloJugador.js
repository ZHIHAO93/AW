"use strict";

var mysql = require('./db');
var passwordHash = require('password-hash');

// Constructor
function Jugador(jugador) {
    this.Nick = jugador.Nick;
    this.Password = jugador.Password;
    this.Nombre_completo = jugador.Nombre_completo;
    this.Sexo = jugador.Sexo;
    this.Foto = jugador.Foto;
    this.Fecha_nacimiento = jugador.Fecha_nacimiento;
};

// Crear el nuevo jugador
Jugador.prototype.create = function(callback) {
    var conexion = mysql.createConnection();
    var nuevoJugador = this;
    console.log(nuevoJugador);
    if(nuevoJugador.Foto === '') {
        nuevoJugador.Foto = './perfil/anonimo.jpg';
    }
    conexion.connect(function(err) {
       if(err) {
           callback(err, "undefined");
       }  else {
           nuevoJugador.Password = passwordHash.generate(nuevoJugador.Password);
           conexion.query(
                   "Insert into jugador set ?",
                   nuevoJugador,
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

Jugador.prototype.read = function(callback) {
    var conexion = mysql.createConnection();
    var nick = this.Nick;
    conexion.connect(function(err) {
        if(err) {
            callback(err, "undefined");
        } else {
            conexion.query(
                    "Select * from jugador where Nick=?",
                    nick,
                    function(err, result) {
                        if(err) {
                            return callback(err);
                        } else {
                            conexion.end();
                            callback(null, result);
                        }
                    }
            );
        }
    });
};

Jugador.prototype.checkPassword = function(pass) {
    if(passwordHash.verify(this.Password, pass)){
        return true;
    } else {
        return false;
    }
};

module.exports = Jugador;