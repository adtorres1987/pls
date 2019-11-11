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
exports.getMenuCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM menu_categories');
        return res.status(200).json(response.rows);
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.createMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, type } = req.body;
        const responseVerify = yield database_1.pool.query('SELECT * FROM menu_categories WHERE UPPER(name) = UPPER($1)', [name]);
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
            yield database_1.pool.query('INSERT INTO menu_categories (active, name, type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id', [true, name, type, nowDate, nowDate]);
            return res.json({
                ok: true,
                categoria: {
                    name,
                    active: true,
                    type
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.updateMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        let { name, type, active } = req.body;
        const nowDate = new Date();
        yield database_1.pool.query('UPDATE menu_categories SET name = COALESCE($1, name), active = COALESCE($2, active), type = COALESCE($3, type), created_at = $4 WHERE id = $5', [name, active, type, nowDate, id]);
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
exports.deleteMenuCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const nowDate = new Date();
        database_1.pool.query('UPDATE menu_categories SET active = $1, updated_at = $2 WHERE id = $3', [false, nowDate, id]);
        return res.json({
            ok: true,
            message: 'Categoria eliminada'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
