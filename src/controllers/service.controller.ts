import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import { pool } from '../database';

export const getServices = async (req: Request, res: Response): Promise<Response> => {

    try {
        const response: QueryResult = await pool.query('SELECT * FROM services');
        return res.status(200).json(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }

}

export const createService = async (req: Request, res: Response): Promise<Response> => {
    try {
        
        let { name } = req.body;
        
        const responseVerify: QueryResult = await pool.query('SELECT * FROM services WHERE UPPER(name) = $1', [name.toUpperCase()]);

        if ( responseVerify.rowCount > 0 ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ya existe el servicio '+name
                }
            });
        }else{
            const nowDate = new Date();
            pool.query('INSERT INTO services (name, active, created_at, updated_at) VALUES ($1, $2, $3, $4)', [name, true, nowDate, nowDate]);
            
            return res.json({
                ok: true,
                servicio: {
                    name
                }
            });
        }

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
}


export const updateService = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
        let { name, active } = req.body;
        
        const nowDate = new Date();

        if (name){
            const responseVerify: QueryResult = await pool.query('SELECT * FROM services WHERE UPPER(name) = $1 AND id != $2', [name.toUpperCase(), id]);

            if ( responseVerify.rowCount > 0 ) {
                return res.json({
                    ok: true,
                    message: 'Ya existe otro servicio con este nombre: '+name
                });
            }
        }

        pool.query('UPDATE services SET name = COALESCE($1, name), active = COALESCE($2, active), updated_at = $3 WHERE id = $4',
                   [name, active, nowDate, id]);
            return res.json({
                ok: true,
                message: 'Servicio actualizado'
            });
        


    } catch (error) {
        return res.status(500).json('Internal server error');
    }
};


export const deleteService = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
                
        const nowDate = new Date();

        pool.query('UPDATE services SET active = $1, updated_at = $2 WHERE id = $3', [false, nowDate, id]);
            return res.json({
                ok: true,
                message: 'Servicio eliminado'
            });

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
};