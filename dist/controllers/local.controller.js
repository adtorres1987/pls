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
exports.getLocal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let desde = req.params.desde || 0;
        let limite = req.params.limite || 20;
        desde = Number(desde);
        limite = Number(limite);
        const response = yield database_1.pool.query('SELECT * FROM locals OFFSET $1 LIMIT $2', [desde, limite]);
        const responseTotal = yield database_1.pool.query('SELECT count(*) total FROM locals');
        return res.json({
            ok: true,
            local: response.rows,
            total: Number(responseTotal.rows[0].total)
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.getLocalByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category_local_id = parseInt(req.params.id);
        const response = yield database_1.pool.query('SELECT * FROM locals WHERE category_local_id = $1', [category_local_id]);
        return res.json({
            ok: true,
            local: response.rows
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.createLocal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, description, email, phone, maximum_capacity, category_local_id, user_id } = req.body;
        const nowDate = new Date();
        const responseLocal = yield database_1.pool.query('INSERT INTO locals (name, description, email, phone, open, active, maximum_capacity, category_local_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id', [name, description, email, phone, false, true, maximum_capacity, category_local_id, user_id, nowDate, nowDate]);
        var local_id = parseInt(responseLocal.rows[0].id);
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
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.updateLocal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        let { name, description, email, phone, maximum_capacity, category_local_id, user_id } = req.body;
        const nowDate = new Date();
        database_1.pool.query('UPDATE locals SET name = COALESCE($1, name), description = COALESCE($2, description), email = COALESCE($3, email), phone = COALESCE($4, phone), maximum_capacity = COALESCE($5, maximum_capacity), category_local_id = COALESCE($6, category_local_id), updated_at = $7 WHERE id = $8', [name, description, email, phone, maximum_capacity, category_local_id, nowDate, id]);
        return res.json({
            ok: true,
            message: 'Local actualizado'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.addLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { local_id, user_id } = req.body;
        const nowDate = new Date();
        var response = yield database_1.pool.query('SELECT * FROM likes WHERE local_id = $1 AND user_id = $2', [local_id, user_id]);
        if (response.rowCount === 0) {
            yield database_1.pool.query('INSERT INTO likes (local_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)', [local_id, user_id, nowDate, nowDate]);
            return res.json({
                ok: true,
                message: 'like'
            });
        }
        else {
            yield database_1.pool.query('DELETE FROM likes WHERE local_id = $1 AND user_id = $2', [local_id, user_id]);
            return res.json({
                ok: true,
                message: 'dislike'
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.addQualification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { qualification, local_id, user_id } = req.body;
        const nowDate = new Date();
        var response = yield database_1.pool.query('SELECT * FROM qualifications WHERE local_id = $1 AND user_id = $2', [local_id, user_id]);
        if (response.rowCount === 0) {
            yield database_1.pool.query('INSERT INTO qualifications (qualification, active, local_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)', [qualification, true, local_id, user_id, nowDate, nowDate]);
        }
        else {
            yield database_1.pool.query('UPDATE qualifications SET qualification = $1, updated_at = $2 WHERE user_id = $3 AND local_id = $4', [qualification, nowDate, user_id, local_id]);
        }
        return res.json({
            ok: true,
            message: 'aggregate rating'
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.buscarLocal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let termino = req.params.termino;
        let desde = req.params.desde || 0;
        let limite = req.params.limite || 20;
        desde = Number(desde);
        limite = Number(limite);
        const response = yield database_1.pool.query("SELECT * FROM locals WHERE UPPER(name::text) like UPPER($1) OFFSET $2 LIMIT $3", ['%' + termino + '%', desde, limite]);
        const responseTotal = yield database_1.pool.query('SELECT count(*) total FROM locals WHERE UPPER(name::text) like UPPER($1)', ['%' + termino + '%']);
        return res.json({
            ok: true,
            local: response.rows,
            total: Number(responseTotal.rows[0].total)
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
