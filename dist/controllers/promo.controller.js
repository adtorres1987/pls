"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
exports.createPromo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, description, email, phone, maximum_capacity, opening_time, opening_close, category_local_id, user_id, main_street, second_street, latitude, longitude, country, city, province } = req.body;
        const nowDate = new Date();
        const responseLocal = yield database_1.pool.query('INSERT INTO locals (name, description, email, phone, open, active, maximum_capacity, opening_time, opening_close, category_local_id, user_id, created_at, updated_at) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id', [name, description, email, phone, false, true, maximum_capacity, opening_time, opening_close, category_local_id, user_id, nowDate, nowDate]);
        var local_id = parseInt(responseLocal.rows[0].id);
        yield database_1.pool.query('INSERT INTO directions (main_street, second_street, latitude, longitude, country, city, province, created_at, updated_at, local_id) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [main_street, second_street, latitude, longitude, country, city, province, nowDate, nowDate, local_id]);
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
