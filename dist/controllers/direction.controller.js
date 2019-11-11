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
exports.getDirections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM directions');
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.getDirectionByIdLocal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const response = yield database_1.pool.query('SELECT * FROM directions WHERE local_id = $1', [id]);
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.createDirection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { main_street, second_street, latitude, longitude, country, city, province, local_id } = req.body;
        const nowDate = new Date();
        yield database_1.pool.query('INSERT INTO directions (main_street, second_street, latitude, longitude, country, city, province, created_at, updated_at, local_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [main_street, second_street, latitude, longitude, country, city, province, nowDate, nowDate, local_id]);
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
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.updateDirection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        let { main_street, second_street, latitude, longitude, country, city, province, local_id } = req.body;
        const nowDate = new Date();
        database_1.pool.query('UPDATE directions SET main_street = COALESCE($1, main_street), second_street = COALESCE($2, second_street), latitude = COALESCE($3, latitude), longitude = COALESCE($4, longitude), country = COALESCE($5, country), city = COALESCE($6, city), province = COALESCE($7, province), updated_at = $8 WHERE id = $9 AND local_id = $10', [main_street, second_street, latitude, longitude, country, city, province, nowDate, id, local_id]);
        return res.json({
            ok: true,
            message: 'Direccion actualizada'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.deleteDirection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const nowDate = new Date();
        database_1.pool.query('DELETE FROM directions WHERE id = $1', [id]);
        return res.json({
            ok: true,
            message: 'Direccion eliminada'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
