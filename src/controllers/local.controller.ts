import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import { pool } from '../database';


export const getLocal = async (req: Request, res: Response): Promise<Response> => {

    try {

        let desde = req.params.desde || 0;
        let limite = req.params.limite || 20;

        desde = Number(desde);
        limite = Number(limite);
        
        const response: QueryResult = await pool.query('SELECT * FROM locals OFFSET $1 LIMIT $2', [desde, limite]);

        const responseTotal: QueryResult = await pool.query('SELECT count(*) total FROM locals');

        return res.json({
            ok: true,
            local: response.rows,
            total: Number(responseTotal.rows[0].total)
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json('Internal server error');
    }

};

export const getLocalByCategory = async (req: Request, res: Response): Promise<Response> => {

    try {

        const category_local_id = parseInt(req.params.id);
        
        const response: QueryResult = await pool.query('SELECT * FROM locals WHERE category_local_id = $1', [category_local_id]);

        return res.json({
            ok: true,
            local: response.rows
        });

    } catch (error) {
        return res.status(500).json('Internal server error');
    }

};


export const createLocal = async (req: Request, res: Response): Promise<Response> => {

    try {

        let { name, description, email, phone, maximum_capacity, category_local_id, user_id } = req.body;
        const nowDate = new Date();

        const responseLocal: QueryResult = await pool.query('INSERT INTO locals (name, description, email, phone, open, active, maximum_capacity, category_local_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id', [name, description, email, phone, false, true, maximum_capacity, category_local_id, user_id, nowDate, nowDate]);
        
        var local_id = parseInt( responseLocal.rows[0].id );
                                     
        return res.json({
            ok: true,
            local: {
                id: local_id,
                name,
                description,
                email,
                phone
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}


export const updateLocal = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
        let { name, description, email, phone, maximum_capacity, category_local_id, user_id } = req.body;
        
        const nowDate = new Date();

        pool.query('UPDATE locals SET name = COALESCE($1, name), description = COALESCE($2, description), email = COALESCE($3, email), phone = COALESCE($4, phone), maximum_capacity = COALESCE($5, maximum_capacity), category_local_id = COALESCE($6, category_local_id), updated_at = $7 WHERE id = $8',
                   [name, description, email, phone, maximum_capacity, category_local_id, nowDate, id]);
		
		return res.json({
			ok: true,
			message: 'Local actualizado'
		});

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
};


export const addLike = async (req: Request, res: Response): Promise<Response> => {
    try {
        
        let { local_id, user_id } = req.body;
        const nowDate = new Date();

        var response = await pool.query('SELECT * FROM likes WHERE local_id = $1 AND user_id = $2', [local_id, user_id]);
        
        if (response.rowCount === 0 ){
            await pool.query('INSERT INTO likes (local_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)', 
                             [local_id, user_id, nowDate, nowDate]);
            return res.json({
                ok: true,
                message: 'like'
            });
        }else{
            await pool.query('DELETE FROM likes WHERE local_id = $1 AND user_id = $2', 
                             [local_id, user_id]);
            return res.json({
                ok: true,
                message: 'dislike'
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}


export const addQualification = async (req: Request, res: Response): Promise<Response> => {
    try {
        
        let { qualification, local_id, user_id } = req.body;
        const nowDate = new Date();

        var response = await pool.query('SELECT * FROM qualifications WHERE local_id = $1 AND user_id = $2', [local_id, user_id]);
        
        if (response.rowCount === 0 ){
            await pool.query('INSERT INTO qualifications (qualification, active, local_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)', 
                             [qualification, true, local_id, user_id, nowDate, nowDate]);
        }else{
            await pool.query('UPDATE qualifications SET qualification = $1, updated_at = $2 WHERE user_id = $3 AND local_id = $4', 
                             [qualification, nowDate, user_id, local_id]);
        }

        return res.json({
            ok: true,
            message: 'aggregate rating'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}

export const buscarLocal = async (req: Request, res: Response): Promise<Response> => {
    try {

        let termino = req.params.termino;

        let desde = req.params.desde || 0;
        let limite = req.params.limite || 20;

        desde = Number(desde);
        limite = Number(limite);
                
        const response: QueryResult = await pool.query("SELECT * FROM locals WHERE UPPER(name::text) like UPPER($1) OFFSET $2 LIMIT $3", [ '%'+termino+'%', desde, limite ]);

        const responseTotal: QueryResult = await pool.query('SELECT count(*) total FROM locals WHERE UPPER(name::text) like UPPER($1)', [ '%'+termino+'%']);

        return res.json({
            ok: true,
            local: response.rows,
            total: Number(responseTotal.rows[0].total)
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
};