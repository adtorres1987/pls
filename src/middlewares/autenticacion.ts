import {Request, Response, NextFunction} from 'express';
import * as jwt from 'jsonwebtoken';
import config from "../confg/config";
import { QueryResult } from 'pg';
import { pool } from '../database';

//=======================
// Verificar Token
//=======================
export const verificaToken = (req: Request, res: Response, next: NextFunction) => {

	const token = <string>req.get("Authorization");
	let jwtPayload;

	//Try to validate the token and get data
	try {
		jwtPayload = <any>jwt.verify(token, config.jwtSecret);
		// console.log('jwtPayload', jwtPayload.usuario);
		res.locals.jwtPayload = jwtPayload;
	} catch (error) {
		//If token is not valid, respond with 401 (unauthorized)
		// res.status(401).send();
		return res.status(401).json({
			ok: false,
			err: {
				message: 'Token no válido'
			},
			err2: error
		});
		// return;
	}	
	//Call the next middleware or controller
	
	next();

}

export const checkRole = (roles: Array<string>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		
		//Get the user ID from previous midleware
		const user_id = res.locals.jwtPayload.usuario.id;

		var rolesDB = [];

		try {
			console.log(user_id);
			const response: QueryResult = await pool.query('SELECT ro.name FROM role_user ru, roles ro '+
                                                                'WHERE ru.user_id = $1 '+
																'AND ru.role_id = ro.id', [user_id]);	
			rolesDB = response.rows;
		} catch (id) {
			res.status(401).send();
		}
		
		//Check if array of authorized roles includes the user's role
		rolesDB.forEach(rol => {
			if (roles.indexOf(rol.name) > -1) {
				next();
			}else {
				return res.status(401).json({
					ok: false,
					err: {
						message: 'El usuario no tiene permisos'
					}
				});
			}
		});
	};
  };
