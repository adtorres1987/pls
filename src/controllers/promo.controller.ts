import {Request, Response} from 'express';
import { QueryResult } from 'pg';

import { pool } from '../database';


export const createPromo = async (req: Request, res: Response): Promise<Response> => {

    try {

        let { name, description, email, phone, maximum_capacity, opening_time, opening_close, category_local_id, user_id, main_street, second_street, latitude, longitude, country, city, province  } = req.body;
        const nowDate = new Date();

        const responseLocal: QueryResult = await pool.query('INSERT INTO locals (name, description, email, phone, open, active, maximum_capacity, opening_time, opening_close, category_local_id, user_id, created_at, updated_at) '+
                                                            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id',
                                                            [name, description, email, phone, false, true, maximum_capacity, opening_time, opening_close, category_local_id, user_id, nowDate, nowDate]);
        
        var local_id = parseInt( responseLocal.rows[0].id );

        await pool.query('INSERT INTO directions (main_street, second_street, latitude, longitude, country, city, province, created_at, updated_at, local_id) '+
                         'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', 
                         [main_street, second_street, latitude, longitude, country, city, province, nowDate, nowDate, local_id]);
                                     
        return res.json({
            ok: true,
            local: {
                id: local_id,
                name,
                description,
                email,
                phone,
                direction: {
                    main_street,
                    second_street,
                    latitude,
                    longitude,
                    country,
                    city,
                    province,
                }
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
        
}