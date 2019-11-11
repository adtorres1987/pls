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
exports.getSchedules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM schedules');
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.getSchedulesByIdLocal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const response = yield database_1.pool.query('SELECT * FROM schedules WHERE local_id = $1', [id]);
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.createSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { day, open_time, close_time, local_id } = req.body;
        const nowDate = new Date();
        yield database_1.pool.query('INSERT INTO schedules (day, open_time, close_time, local_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [day, open_time, close_time, local_id, nowDate, nowDate]);
        return res.json({
            ok: true,
            schedule: {
                day,
                open_time,
                close_time,
                local_id
            }
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.updateSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        let { day, open_time, close_time } = req.body;
        const nowDate = new Date();
        database_1.pool.query('UPDATE schedules SET day = COALESCE($1, day), open_time = COALESCE($2, open_time), close_time = COALESCE($3, close_time), updated_at = $4 WHERE id = $5', [day, open_time, close_time, nowDate, id]);
        return res.json({
            ok: true,
            message: 'Horario actualizado'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.deleteDirection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        database_1.pool.query('DELETE FROM schedules WHERE id = $1', [id]);
        return res.json({
            ok: true,
            message: 'Horario eliminado'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
