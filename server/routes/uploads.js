const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files){
        return res.status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'No se ha selecionado ningun archivo'
                    }
                });
        }

        // validar tipo
        let tiposValido = ['producto', 'usuario'];
        if( tiposValido.indexOf( tipo ) <0 ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Las tipos permitidos son ' + tiposValido.join(', ')
                }
            })
        }


        let archivo = req.files.archivo;
        let nombrecortado = archivo.name.split('.');
        let extension = nombrecortado[nombrecortado.length - 1];

        // Extenciones permitidas
        let extencionesValidas = ['png', 'jpg', 'jpeg'];

        if (extencionesValidas.indexOf( extension ) < 0 ){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Las extensiones permitidas son ' + extencionesValidas.join(', '),
                    ext: extension
                }
            })
        }

        // Cambiar nombre al archivo
        let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension}`;


        archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
            if (err)
              return res.status(500).json({
                  ok: false,
                  err
              });
        
            if (tipo === 'usuarios') {
                imagenUsuario(id, res, nombreArchivo);        
            }  else {
                imagenProducto(id, res, nombreArchivo);
            } 

     });
});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, UsuarioDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!UsuarioDB){

            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }


        borraArchivo(UsuarioDB.img, 'usuarios')


        UsuarioDB.img = nombreArchivo;

        UsuarioDB.save((err, usuarioGuardado) => {

            res.json({
                ok: true,
                Usuario: usuarioGuardado,
                img:nombreArchivo
            });

        });


    });

}


function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB){

            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
          });
    }

borraArchivo(productoDB.img, 'productos')

productoDB.img = nombreArchivo;

productoDB.save((err, productoGuardado) => {

    res.json({
        ok: true,
        producto: productoGuardado,
        img: nombreArchivo
    });

    });

});

}


function borraArchivo(nombreImagen, tipo) {
    
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen}`);
    if ( fs.existsSync(pathImagen) ){
        fs.unlinkSync(pathImagen);

    }
}

module.exports = app;