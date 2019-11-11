import {Request, Response} from 'express';
import { QueryResult } from 'pg';
import * as bcrypt from 'bcrypt';
import * as jwt from "jsonwebtoken";

import config from "../confg/config";

import { pool } from '../database';

export const login = async (req: Request, res: Response): Promise<Response> => {

    try {
        
        let { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).json({
                ok: false,
                message: "Email y contraseña son requeridos"
            });
        }else{
            const response: QueryResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            var usuarioDB = response.rows[0];
            
            if ( !usuarioDB ){
                return res.status(200).json({
                    ok: false,
                    message: "Invalid credentials"
                });
            }else{
                if (!bcrypt.compareSync(password, usuarioDB.password)){
                    return res.status(200).json({
                        ok: false,
                        message: "Invalid credentials"
                    }); 
                }else{
                    if ( !usuarioDB.active ){
                        return res.status(200).json({
                            ok: false,
                            message: "inactive account"
                        }); 
                    }else{
                        
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

                        const token = jwt.sign(
                            { usuario },
                            config.jwtSecret,
                            { expiresIn: config.expiresIn }
                          );
                          
                        return res.json({
                            ok: true,
                            usuario,
                            token
                        });
                    }
                }
            }

        }
        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }

}

export const loginSocial = async (req: Request, res: Response): Promise<Response> => {

    try {
        
        let { email, name, photo, social_network } = req.body;
        var roles;
        
        if (!(email && name && social_network )) {
            return res.status(400).json({
                ok: false,
                message: "Email y nombre son requeridos"
            });
        }else{
            const response: QueryResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            var usuarioDB = response.rows[0];
            const nowDate = new Date();
            if (usuarioDB) {
                await pool.query('UPDATE users SET name = $1, photo = $2, updated_at = $3 WHERE id = $4', [name, photo, nowDate, usuarioDB.id]);
                const responseRole: QueryResult = await pool.query('SELECT ro.name FROM role_user ru, roles ro '+
                                                                    'WHERE ru.user_id = $1 '+
                                                                    'AND ru.role_id = ro.id', [ usuarioDB.id ]);
                roles = responseRole.rows;
            }else{
                await pool.query('INSERT INTO users (name, email, password, photo, social_network, active, created_at, updated_at) '+
                           'VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', 
                            [name, email, ':)', photo, social_network, true, nowDate, nowDate]);                

                const response: QueryResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

                usuarioDB = response.rows[0];

                const responseRol: QueryResult = await pool.query('SELECT * FROM roles WHERE name = $1', ['client']);
                const rol = responseRol.rows[0];  

                pool.query('INSERT INTO role_user (role_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)', 
                            [rol.id, usuarioDB.id, nowDate, nowDate]);
                
                roles = [{name: 'client'}];

            }
        }

        var usuario = {
            id: usuarioDB.id,
            name: usuarioDB.name,
            email: usuarioDB.email,
            photo: usuarioDB.photo,
            active: usuarioDB.active,
            identification: usuarioDB.identification,
            birth_date: usuarioDB.birth_date,
            social_network: usuarioDB.social_network,
            rol: roles
        }

        const token = jwt.sign(
            { usuario },
            config.jwtSecret,
            { expiresIn: config.expiresIn }
          );
          
        return res.json({
            ok: true,
            usuario,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}

export const register = async (req: Request, res: Response): Promise<Response> => {
    try {
        
        let { name, email, password } = req.body;

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
            await pool.query('INSERT INTO users (name, email, password, social_network, active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id', 
                                                            [name, email, bcrypt.hashSync(password,10), 'normal', true, nowDate, nowDate]);

            const response: QueryResult = await pool.query('SELECT * FROM users WHERE email = $1 ', [email]);

            var usuarioDB = response.rows[0];
            
            await pool.query('INSERT INTO role_user (role_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)', 
                                                            [2, response.rows[0].id, nowDate, nowDate]);

            var usuario = {
                id: usuarioDB.id,
                name: usuarioDB.name,
                email: usuarioDB.email,
                photo: usuarioDB.photo,
                active: usuarioDB.active,
                identification: usuarioDB.identification,
                birth_date: usuarioDB.birth_date,
                social_network: usuarioDB.social_network,
                rol: [{name: 'client'}]
            };

            const token = jwt.sign(
                { usuario },
                config.jwtSecret,
                { expiresIn: config.expiresIn }
                );
            
            return res.json({
                ok: true,
                usuario,
                token
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}