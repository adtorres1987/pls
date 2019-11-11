import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import { pool } from '../database';

export const getMenuCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
        const response: QueryResult = await pool.query('SELECT * FROM menu_categories');
        return res.status(200).json(response.rows);
    } catch (error) {
        return res.status(500).json('Internal server error');
    }
}

export const createMenuCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        let { name, type } = req.body;
        
        const responseVerify: QueryResult = await pool.query('SELECT * FROM menu_categories WHERE UPPER(name) = UPPER($1)', [name]);

        if (responseVerify.rowCount > 0){
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Categoria Repetida'
                }
            })
        }else{
            const nowDate = new Date();
            await pool.query('INSERT INTO menu_categories (active, name, type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                            [true, name, type, nowDate, nowDate]);
            
            return res.json({
                ok: true,
                categoria: {
                    name,
                    active: true,
                    type
                }
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}

export const updateMenuCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        let { name, type, active } = req.body;
        const nowDate = new Date();
        await pool.query('UPDATE menu_categories SET name = COALESCE($1, name), active = COALESCE($2, active), type = COALESCE($3, type), created_at = $4 WHERE id = $5', [name, active, type, nowDate, id]);
        
        return res.json({
            ok: true,
            message: 'Categoria actualizada'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
}

export const deleteMenuCategory = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
                
        const nowDate = new Date();

        pool.query('UPDATE menu_categories SET active = $1, updated_at = $2 WHERE id = $3', [false, nowDate, id]);
            return res.json({
                ok: true,
                message: 'Categoria eliminada'
            });

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
}