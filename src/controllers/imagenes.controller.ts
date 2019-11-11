import express from 'express';

const app = express();

import * as fs from 'fs'
import * as path from 'path'

export const getImage = async (req: express.Request, res: express.Response) =>  {
	var tipo = req.params.tipo;
    var img = req.params.img;
	
	var pathImagen = path.resolve( __dirname, `../../uploads/${tipo}/${img}`);
	
	console.log(pathImagen);

    if ( fs.existsSync( pathImagen ) ){
        res.sendFile( pathImagen );
    }else{
        var pathNoImagen = path.resolve( __dirname, '../../assets/no-image.png');
        res.sendFile( pathNoImagen );
    }
}