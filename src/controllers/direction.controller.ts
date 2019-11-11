import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import { pool } from '../database';

export const getDirections = async (req: Request, res: Response): Promise<Response> => {

    try {
        const response: QueryResult = await pool.query('SELECT * FROM directions');
        return res.status(200).json(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }

}

export const getDirectionByIdLocal = async (req: Request, res: Response): Promise<Response> => {

    try {
		const id = parseInt(req.params.id);
        const response: QueryResult = await pool.query('SELECT * FROM directions WHERE local_id = $1', [id]);
        return res.status(200).json(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }

}

export const createDirection = async (req: Request, res: Response): Promise<Response> => {
    try {
        
        let { main_street, second_street, latitude, longitude, country, city, province, local_id  } = req.body;
        const nowDate = new Date();

	    await pool.query('INSERT INTO directions (main_street, second_street, latitude, longitude, country, city, province, created_at, updated_at, local_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [main_street, second_street, latitude, longitude, country, city, province, nowDate, nowDate, local_id]);
		
		return res.json({
			ok: true,
			direccion: {
				main_street,
				second_street,
				latitude,
				longitude,
				country,
				city,
				province,
				local_id
			}
		});


    } catch (error) {
        return res.status(500).json('Internal server error');
    }
}


export const updateDirection = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
        let { main_street, second_street, latitude, longitude, country, city, province, local_id  } = req.body;
        
        const nowDate = new Date();

        pool.query('UPDATE directions SET main_street = COALESCE($1, main_street), second_street = COALESCE($2, second_street), latitude = COALESCE($3, latitude), longitude = COALESCE($4, longitude), country = COALESCE($5, country), city = COALESCE($6, city), province = COALESCE($7, province), updated_at = $8 WHERE id = $9 AND local_id = $10',
                   [main_street, second_street, latitude, longitude, country, city, province, nowDate, id, local_id]);
		
		return res.json({
			ok: true,
			message: 'Direccion actualizada'
		});

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
};


export const deleteDirection = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
                
        const nowDate = new Date();

        pool.query('DELETE FROM directions WHERE id = $1', [id]);
            return res.json({
                ok: true,
                message: 'Direccion eliminada'
            });

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
};