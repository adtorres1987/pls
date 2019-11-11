import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import * as fs from 'fs'
import * as path from 'path'

import { pool } from '../database';

export const upload = async (req: Request, res: Response): Promise<Response> => {

    let tipo = req.params.tipo;
    let id =  parseInt( req.params.id );

    var nombreArchivo = "";

    try{

        if(!req.files){
            return res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'No se ha seleccionado ningun archivo'
                        }
                    });
        }
    
        // Valida tipo
        let tiposValidos = ['users','locals', 'menus', 'promos', 'publicities'];
    
        if ( tiposValidos.indexOf( tipo ) < 0 ){
            return res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'Los tipos permitidos son: '+tiposValidos.join(', ')
                        }
                    });
        }
        
        let archivo: any = req.files.archivo;
        let nombreCortado = archivo.name.split('.');
    
        let extension = nombreCortado[nombreCortado.length-1];
    
        // Extensiones permitidas
        let extensionesValidas = ['png','jpg','gif','jpeg',];
        
        if ( extensionesValidas.indexOf( extension ) < 0 ){
            return res.status(400)
                    .json({
                        ok: false,
                        err: {
                            message: 'Las extensiones permitidas para la imagen son: '+extensionesValidas.join(', ')
                        }
                    });
        }
    
        // Cambiar nombre del archivo
        nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;    
    
        let path = `uploads/${ tipo }/${ nombreArchivo }`;
    
        archivo.mv(path);

        // Imagen Cargada
        subirPorTipo( tipo, id, nombreArchivo)
            .then(value => {
                if(!value){
                    return res.json({
                        ok: false,
                        message: 'Error subiendo la imagen, intente mas tarde'
                    });
                }
            }).catch( err => {
                console.log('Error Nro 1:', err);
                borraArchivo(nombreArchivo, tipo);
                return res.json({
                    ok: false,
                    message: 'Error subiendo la imagen, intente mas tarde'
                });
            });

        return res.json({
            ok: true,
            message: 'Imagen subida correctamente',
			photo: nombreArchivo
        });
    
        
    } catch (error) {
        console.log("error upload", error);
        
        borraArchivo(nombreArchivo, tipo);

        return res.status(500).json('Internal server error');
    }
}

var subirPorTipo = async ( tipo: string, id: number, nombreArchivo: string) => {

    if ( tipo === 'locals' ){
        // imagenLocal(id, res, nombreArchivo);
        return await imagenLocal(id, nombreArchivo);
    }
    if ( tipo === 'menus' ){
        // imagenMenu(id, res, nombreArchivo);
        console.log('Subir menus');
    }
    if ( tipo === 'promos' ){
        // imagenPromocion(id, res, nombreArchivo);
        console.log('Subir promos');
    }
    if ( tipo === 'publicities' ){
        // imagenPublicidad(id, res, nombreArchivo);
        console.log('Subir publicities');
    }
    if ( tipo === 'users' ){
        return await imagenUsuario(id, nombreArchivo);
    } else {
        return false;
    }

}

var imagenUsuario = async (id: number, nombreArchivo: string) => {

    try {

        const resUser: QueryResult = await pool.query('SELECT * FROM users WHERE id = $1 ', [id]);

        if (resUser.rowCount > 0) {
        
            var user = resUser.rows[0];
            const nowDate = new Date();
    
            if (user.photo) {
                borraArchivo(user.photo, 'users');
            }
    
            await pool.query('UPDATE users SET photo = $1, updated_at = $2 WHERE id = $3', [ nombreArchivo, nowDate, id]);
    
            return true;
    
        }else{
            borraArchivo(nombreArchivo, 'users');
            return false;
        }

    } catch (error) {
        console.log('error2', error);
        return false;
    }
}

var imagenLocal = async (id: number, nombreArchivo: string) => {

    try {

        const resLocal: QueryResult = await pool.query('SELECT * FROM locals WHERE id = $1 ', [id]);

        if (resLocal.rowCount > 0) {
        
            var local = resLocal.rows[0];
            const nowDate = new Date();
    
            if (local.logo) {
                borraArchivo(local.logo, 'locals');
            }
    
            await pool.query('UPDATE locals SET logo = $1, updated_at = $2 WHERE id = $3', [ nombreArchivo, nowDate, id]);
    
            return true;
    
        }else{
            borraArchivo(nombreArchivo, 'locals');
            return false;
        }

    } catch (error) {
        console.log('error2', error);
        return false;
    }
}

var borraArchivo = (nombreImagen: string, tipo: string) => {

    try {
        // Eliminar imagen que se reemplaza en la base
        let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    
        if ( fs.existsSync(pathImagen) ){
            fs.unlinkSync(pathImagen);
        }

    } catch (error) {
        console.log("Hubo un problema al intentar eliminar la imagen", nombreImagen);
    }

}