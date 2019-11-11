import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import { pool } from '../database';

export const getSchedules = async (req: Request, res: Response): Promise<Response> => {

    try {
        const response: QueryResult = await pool.query('SELECT * FROM schedules');
        return res.status(200).json(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }

}

export const getSchedulesByIdLocal = async (req: Request, res: Response): Promise<Response> => {

    try {
		const id = parseInt(req.params.id);
        const response: QueryResult = await pool.query('SELECT * FROM schedules WHERE local_id = $1', [id]);
        return res.status(200).json(response.rows);
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }

}

export const createSchedule = async (req: Request, res: Response): Promise<Response> => {
    try {
        
        let { day, open_time, close_time, local_id  } = req.body;
        const nowDate = new Date();

	    await pool.query('INSERT INTO schedules (day, open_time, close_time, local_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [day, open_time, close_time, local_id, nowDate, nowDate]);
		
		return res.json({
			ok: true,
			schedule: {
				day, 
				open_time, 
				close_time, 
				local_id
			}
		});


    } catch (error) {
        return res.status(500).json('Internal server error');
    }
}


export const updateSchedule = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);
        let { day, open_time, close_time } = req.body;
        
        const nowDate = new Date();

        pool.query('UPDATE schedules SET day = COALESCE($1, day), open_time = COALESCE($2, open_time), close_time = COALESCE($3, close_time), updated_at = $4 WHERE id = $5',
                   [day, open_time, close_time, nowDate, id]);
		
		return res.json({
			ok: true,
			message: 'Horario actualizado'
		});

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
};


export const deleteDirection = async (req: Request, res: Response): Promise<Response> => {
    try {

        const id = parseInt(req.params.id);

        pool.query('DELETE FROM schedules WHERE id = $1', [id]);
            return res.json({
                ok: true,
                message: 'Horario eliminado'
            });

    } catch (error) {
        return res.status(500).json('Internal server error');
    }
};