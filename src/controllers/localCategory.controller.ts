import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import { pool } from '../database';

export const getLocalCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT * FROM category_locals');
        return res.status(200).json(response.rows);
    } catch (error) {
        return res.status(500).json('Internal server error');
    }
}

export const createLocalCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        let { name } = req.body;
        
        const responseVerify: QueryResult = await pool.query('SELECT * FROM category_locals WHERE UPPER(name) = UPPER($1)', [name]);

        if (responseVerify.rowCount > 0){
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Categoria Repetida'
                }
            })
        }else{
            const nowDate = new Date();
            await pool.query('INSERT INTO category_locals (active, name, created_at, updated_at) VALUES ($1, $2, $3, $4)',
                            [true, name, nowDate, nowDate]);

            return res.json({
                ok: true,
                categoria: {
                    name,
                    active: true
                }

            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}

export const updateLocalCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        let { name, active } = req.body;
        const nowDate = new Date();
        await pool.query('UPDATE category_locals SET name = COALESCE($1, name), active = COALESCE($2, active), created_at = $3 WHERE id = $4', [name, active, nowDate, id]);
        
        return res.json({
            ok: true,
            message: 'Categoria actualizada'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}

export const deleteLocalCategory = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
                
        const nowDate = new Date();

        pool.query('UPDATE category_locals SET active = $1, updated_at = $2 WHERE id = $3', [false, nowDate, id]);
            return res.json({
                ok: true,
                message: 'Categoria eliminada'
            });

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
}