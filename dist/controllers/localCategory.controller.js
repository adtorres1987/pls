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
exports.getLocalCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM category_locals');
        return res.status(200).json(response.rows);
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.createLocalCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name } = req.body;
        const responseVerify = yield database_1.pool.query('SELECT * FROM category_locals WHERE UPPER(name) = UPPER($1)', [name]);
        if (responseVerify.rowCount > 0) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Categoria Repetida'
                }
            });
        }
        else {
            const nowDate = new Date();
            yield database_1.pool.query('INSERT INTO category_locals (active, name, created_at, updated_at) VALUES ($1, $2, $3, $4)', [true, name, nowDate, nowDate]);
            return res.json({
                ok: true,
                categoria: {
                    name,
                    active: true
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.updateLocalCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        let { name, active } = req.body;
        const nowDate = new Date();
        yield database_1.pool.query('UPDATE category_locals SET name = COALESCE($1, name), active = COALESCE($2, active), created_at = $3 WHERE id = $4', [name, active, nowDate, id]);
        return res.json({
            ok: true,
            message: 'Categoria actualizada'
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.deleteLocalCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const nowDate = new Date();
        database_1.pool.query('UPDATE category_locals SET active = $1, updated_at = $2 WHERE id = $3', [false, nowDate, id]);
        return res.json({
            ok: true,
            message: 'Categoria eliminada'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
