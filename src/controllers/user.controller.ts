import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import * as bcrypt from 'bcrypt';

import { pool } from '../database';

export const getUsers = async (req: Request, res: Response): Promise<Response> => {

    try {
        const response: QueryResult = await pool.query('SELECT us.id, us.name, us.identification, us.birth_date, us.photo, us.email, us.social_network, us.active, ro.name rol '+
                                                       'FROM users us, role_user ru, roles ro '+
                                                       'WHERE us.id = ru.user_id '+
                                                       'AND ru.role_id = ro.id ');
        return res.status(200).json(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }

}

export const getUserById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const response: QueryResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        var usuarioDB = response.rows[0];

        if(usuarioDB){
            const responseRole: QueryResult = await pool.query('SELECT ro.name FROM role_user ru, roles ro '+
                                                                'WHERE ru.user_id = $1 '+
                                                                'AND ru.role_id = ro.id', [usuarioDB.id]);
            var rolesDB = responseRole.rows;
    
            var usuario = {
                id: usuarioDB.id,
                name: usuarioDB.name,
                email: usuarioDB.email,
                active: usuarioDB.active,
                identification: usuarioDB.identification,
                birth_date: usuarioDB.birth_date,
                photo: usuarioDB.photo,
                social_network: usuarioDB.social_network,
                rol: rolesDB
            }
            return res.json(usuario);
        }else{
            return res.status(400).json({
                ok: false,
                err: {
                    'message': 'usuario no encontrado'
                }
            })
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}

export const createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        
        let { name, email, password, social_network, rol_id } = req.body;
        
        const responseVerify: QueryResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if ( responseVerify.rowCount > 0 ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ya existe un usuario con este correo '+email
                }
            });
        }else{
            const nowDate = new Date();
            await pool.query('INSERT INTO users (name, email, password, social_network, active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                                                            [name, email, bcrypt.hashSync(password,10), social_network, true, nowDate, nowDate]);

            const response: QueryResult = await pool.query('SELECT * FROM users WHERE email = $1 ', [email]);
            
            await pool.query('INSERT INTO role_user (role_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)', 
                                                            [rol_id, response.rows[0].id, nowDate, nowDate]);
            
            return res.json({
                ok: true,
                usuario: {
                    name, 
                    email, 
                    social_network, 
                    active: true,
                    created_at: nowDate,
                    updated_at: nowDate
                }
            });
        }

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
}

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
        let { name, identification, birth_date, email } = req.body;
		
		var cumple;
        
		if (birth_date){
			cumple = new Date(birth_date);
		}

        const nowDate = new Date();

        pool.query('UPDATE users SET name = COALESCE($1, name), identification = COALESCE($2, identification), email = COALESCE($3, email), birth_date = COALESCE($4, birth_date), updated_at = $5 WHERE id = $6',[name, identification, email, cumple, nowDate, id]);
		
		
		const response: QueryResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
		var usuarioDB = response.rows[0];
		
		const responseRole: QueryResult = await pool.query('SELECT ro.name FROM role_user ru, roles ro WHERE ru.user_id = $1 AND ru.role_id = ro.id', [usuarioDB.id]);
        var rolesDB = responseRole.rows;
    
		var usuario = {
			id: usuarioDB.id,
			name: usuarioDB.name,
			email: usuarioDB.email,
			active: usuarioDB.active,
			identification: usuarioDB.identification,
			birth_date: usuarioDB.birth_date,
			photo: usuarioDB.photo,
			social_network: usuarioDB.social_network,
			rol: rolesDB
		}
		
		
		return res.json({
			ok: true,
			message: 'Usuario actualizado',
			usuario
		});

    } catch (error) {
		console.log(error);
        return res.status(500).json('Internal server error');
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
                
        const nowDate = new Date();

        pool.query('UPDATE users SET active = $1 WHERE id = $2', [false, id]);
            return res.json({
                ok: true,
                message: 'Usuario eliminado'
            });

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
};