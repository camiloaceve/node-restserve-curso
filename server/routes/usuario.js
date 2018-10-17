const express = require('express');
const _ = require('underscore');
const bcrypt = require('bcryptjs');


const Usuario = require('../models/usuario');

const app = express();


app.get('/usuarios', function (req, res) {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limit || 5;
    limite = Number(limite);

    Usuario.find({ estado: true})
            .skip(desde)
            .limit(limite)
            .exec( (err, usuario) =>{

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                Usuario.count({ estado: true }, (err, conteo) =>{
                    
                    res.json({
                        ok: true,
                        usuario,
                        cuantos: conteo
                    });
                });

            })

  });
  
  app.post('/usuarios', function (req, res) {
  
      let body = req.body;

      let usuario = new Usuario({
          nombre: body.nombre,
          email: body.email,
         password: bcrypt.hashSync(body.password, 10),
          role: body.role,
      });


      usuario.save((err, usuarioDB) =>{
        
        if(err) {
            res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});
  
  app.put('/usuarios/:id', function (req, res) {
  
      let id = req.parms.id;
      let body = _.pick(req.body, ['nombre','email','img','role','estado']);

      Usuario.findByIdAndUpdate( id, body, { new: true, runValidators: true }, (err, usuarioDB) =>{

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }



          res.json({
              ok: true,
              usuario: usuarioDB
          });
      })
  
  });
  
  app.delete('/usuarios', function (req, res) {


    let id = req.params.id;

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndRemove(id, cambiaEstado, {new: true}, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if ( !usuarioBorrado  ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    })



   });
  

  module.exports = app;