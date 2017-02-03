var express = require('express');
var daoUsuario = require('../models/ModeloUsuario');
var daoCurso = require('../models/ModeloCurso');
var daoHorario = require('../models/ModeloHorario');
var daoInscrito = require('../models/ModeloInscribir');
var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });
var router = express.Router();
var passport = require('passport');
var passportHTTP = require('passport-http');

router.use(passport.initialize());

var miEstrategia = 
  new passportHTTP.BasicStrategy(
      { realm: "Autenticaion requerida" },
      function(user, pass, callback) {
        var usu = new daoUsuario("undefined");
        usu.readByEmail(user, function(err, usuario) {
            if(err) {
                callback(err);
            } else {
                if(usuario && usuario.password === pass){
                  callback(null, usuario);
                } else {
                  callback(null, false);
                }
            }
        });
      }
  );

passport.use(miEstrategia);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
});

// Insertar un nuevo usuario
/*
{ 
  "correo": "zhzheng@ucm.es",
  "password": "123456",
  "nombre": "Zhihao",
  "apellido": "Zheng",
  "sexo": "H",
  "nacimiento": "1993-10-08" }
*/
router.post('/nuevoUsuario', function(req, res, next) {
    var usuario = new daoUsuario(req.body);
    usuario.create(function(err, id) {
        if(err) {
            res.status(500);
            res.end();
        } else {
            res.status(201);
            res.json({ id: id });
        }
    });
});

// Comprobar el correo del nuevo usurio
router.get('/comprobarUsuario', 
        passport.authenticate('basic', {session: false}), 
        function(req, res, next) {
          if(req.user){
            res.json({ permitido: true, id: req.user.id });  
          } else {
            res.status(401);
            res.end();
          }
});

// hacer logout, aunque no guardamos en ningun sitio la informacion de autenticacion
router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

// Inscribir a un curso
/*
{ 
  "id_usuario": "1",
  "id_curso": "6"}
*/
router.post('/inscribirCurso', function(req, res, next) {
    console.log(req.body);
    var inscrito = new daoInscrito(req.body);
    if(isNaN(req.body.id_usuario) || isNaN(req.body.id_curso)){
      res.status(404);
      res.end();
    } else {
      inscrito.create(function(err, id) {
          if(err) {
              res.status(500);
              res.end();
          } else {
              res.status(201);
              res.json({ id: id });
          }
      });
    }
});

router.get('/obtencionCurso', function(req, res, next) {
    var inscrito = new daoInscrito("undefined");
    var idUsuario = req.query.id_usuario;
    if(isNaN(idUsuario)){
        res.status(404);
        res.end();
    } else {
        inscrito.readCursoByUserId(idUsuario, function(err, result) {
            if(err){
              res.status(500);
              res.end();
            } else {
              res.json(result);
            }
        })
    }
});

// Insertar un nuevo curso
/*
{
    "titulo" : "p1",
    "descripcion" : "p1",
    "localidad":"madrid",
    "direccion":"complutense",
    "imagen" : "",
    "plazas":"5",
    "fecha_ini" : "2016-11-11",
    "fecha_fin":"2017-11-11",
    "horario" : [
        {"dia":"mier.", "hora_ini":"12:00", "hora_fin":"13:00"},
        {"dia":"sab.", "hora_ini":"18:00","hora_fin":"19:00"}
    ]
}
 */
router.post('/nuevoCurso', function(req, res, next) {
    // comprobamos todos los campos obligatorios esta rellenos
    if(req.body.titulo !== undefined && req.body.descripcion !== undefined && req.body.localidad !== undefined &&
            req.body.direccion !== undefined && req.body.plazas !== undefined && req.body.fecha_ini !== undefined &&
            req.body.fecha_fin !== undefined && req.body.horario !== undefined) {
        var curso = new daoCurso(req.body);
        curso.create(function(err, id) {
            if(err) {
                res.status(500);
                res.end();
            } else {
                var horario = new daoHorario(req.body.horario);
                horario.insert(id, function(err, exito) {
                    if(err) {
                        res.status(500);
                        res.end();
                    } else {
                        console.log(exito);
                        if(exito === false){
                          res.status(404);
                          res.end();
                        } else {
                          res.json({ id: id });
                        }
                    }
                });
            }
        });   
    } else {
        // error falta de introducir algun dato
        res.status(400);
        res.end();
    }
});

// Modificar un curso
/*
{
    "id" : 1,
    "titulo" : "p1",
    "descripcion" : "p1",
    "localidad":"madrid",
    "direccion":"complutense",
    "imagen" : "",
    "plazas":"5",
    "fecha_ini" : "2016-11-11",
    "fecha_fin":"2017-11-11",
    "horario" : [
        {"dia":"mier.", "hora_ini":"12:00", "hora_fin":"13:00"},
        {"dia":"sab.", "hora_ini":"18:00","hora_fin":"19:00"}
    ]
}
 */
router.put('/modificaCurso', function(req, res, next) {
   var idCurso = Number(req.body.id);
   var curso = new daoCurso(req.body);
   curso.update(idCurso, function(err, affectedRows) {
       if(err) {
           res.status(500);
           res.end();
       } else {
           if(affectedRows === 0){
                res.status(404);
            } else {
                res.status(200);
            }
            res.end();
       }
   });
});

// Eliminar un curso con id
// http://localhost:3000/eliminarCurso?id=1
router.delete('/eliminarCurso', function(req, res, next) {
   var idCurso = Number(req.query.id);
   var curso = new daoCurso("undefined");
   if(idCurso !== undefined && !isNaN(idCurso)) {
       curso.delete(idCurso, function(err, affectedRows) {
           if(err) {
                res.status(500);
           } else {
                if(affectedRows === 0){
                    res.status(404);
                } else {
                    res.status(200);
                }
           }
           res.end();
       });
   } else {
       res.status(404);
       res.end();
   }
});

// Leer un curso
// http://localhost:3000/leerCurso?id=2
router.get('/leerCurso', function(req, res, next) {
   var idCurso = Number(req.query.id);
   var curso = new daoCurso("undefined");
   if(idCurso !== undefined && !isNaN(idCurso)) {
       curso.read(idCurso, function(err, result) {
           if(err) {
                console.log(err);
                res.status(500);
                res.end();
           } else {
                if(result === 0){
                    res.status(404);
                    res.end();
                } else {
                    res.json(result);
                }
           }
       });
   } else {
       res.status(404);
       res.end();
   }
});

// busqueda de cursos
router.get('/busqueda', function(req, res, next) {
  var str = req.query.str;
  var num = Number(req.query.num);
  var pos = Number(req.query.pos);
  var curso = new daoCurso("undefined");
  if(str !== undefined && !isNaN(num) && !isNaN(pos)){
    curso.busqueda(str, num, pos, function(err, result) {
      if(err){
        res.status(500);
        res.end();
      } else {
        if(result.length === 0){
          res.status(404);
          res.end();
        } else {
          res.json({result: result, numRow: result.numRow});
        }
      }
    });
  } else {
    res.status(404);
    res.end();
  }
});

router.put('/cursos/:id/imagen', upload.single("imagen"), function(req, res, next) {
  var idCurso = Number(req.params.id);
  if(!isNaN(idCurso) && req.file){

    var curso = new daoCurso("undefined");
    curso.updateImg(idCurso, req.file.buffer, function(err, affectedRows) {
      if(err) {
        res.status(500);
        res.end();
      } else {
        if(affectedRows === 0){
          res.status(404);
      } else {
        res.status(200);
      }
        res.end();
      }
    });
  } else {
    res.status(404);
    res.end();
  }

});

// Leer imagen de un curso
router.get('/cursos/:id/imagen', function(req, res, next) {
  var idCurso = Number(req.params.id);
  if(isNaN(idCurso)){
    next(new Error("Id no es numerico!"));
  } else {
    var curso = new daoCurso("undefined");
    curso.readImg(idCurso, function(err, imagen) {
      if(err){
        next(err);
      } else {
        if(imagen){
          res.end(imagen);
        } else {
          res.status(404);
          res.end("Not found");
        }
      }
    });
  }
});

// leer los cursos proximos
router.get('/usuario/:id/proximosCursos', function(req, res, next) {
    var idUsuario = req.params.id;
    if(isNaN(idUsuario)){
        next(new Error("Id no es numerico!"));
    } else {
        var curso = new daoCurso("undefined");
        curso.readProximos(idUsuario, function(err, cursos) {
            if(err) {
                next(err);
            } else {
                if(cursos){
                  res.json(cursos);
                } else {
                  res.status(404);
                  res.end("Not found");
                }
            }
        });
    }
});

// leer los cursos realizados
router.get('/usuario/:id/cursosRealizados', function(req, res, next) {
    var idUsuario = req.params.id;
    if(isNaN(idUsuario)){
        next(new Error("Id no es numerico!"));
    } else {
        var curso = new daoCurso("undefined");
        curso.readRealizados(idUsuario, function(err, cursos) {
            if(err) {
                next(err);
            } else {
                if(cursos){
                  res.json(cursos);
                } else {
                  res.status(404);
                  res.end("Not found");
                }
            }
        });
    }
});

// leer la franja de las horas
router.get('/usuario/:id/franjaHorario', function(req, res, next) {
    var idUsuario = req.params.id;
    var ini = req.query.ini;
    var fin = req.query.fin;
    if(isNaN(idUsuario)){
        next(new Error("Id no es numerico!"));
    } else {
        var curso = new daoCurso("undefined");
        curso.franjaHorario(idUsuario, ini, fin, function(err, cursos) {
            if(err) {
                next(err);
            } else {
                if(cursos){
                  var horas = ["00:00", "24:00"];
                  cursos.forEach(function(obj) {
                    if(horas.indexOf(obj.Hora_ini) === -1){
                        horas.push(obj.Hora_ini);
                    }
                    if(horas.indexOf(obj.Hora_fin) === -1){
                        horas.push(obj.Hora_fin);
                    }
                  });
                  horas.sort();
                  res.json({ horario: horas, curso: cursos });
                } else {
                  res.status(404);
                  res.end("Not found");
                }
            }
        });
    }
});

module.exports = router;
