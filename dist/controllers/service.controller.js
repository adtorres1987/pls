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
exports.getServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM services');
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name } = req.body;
        const responseVerify = yield database_1.pool.query('SELECT * FROM services WHERE UPPER(name) = $1', [name.toUpperCase()]);
        if (responseVerify.rowCount > 0) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ya existe el servicio ' + name
                }
            });
        }
        else {
            const nowDate = new Date();
            database_1.pool.query('INSERT INTO services (name, active, created_at, updated_at) VALUES ($1, $2, $3, $4)', [name, true, nowDate, nowDate]);
            return res.json({
                ok: true,
                servicio: {
                    name
                }
            });
        }
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        let { name, active } = req.body;
        const nowDate = new Date();
        if (name) {
            const responseVerify = yield database_1.pool.query('SELECT * FROM services WHERE UPPER(name) = $1 AND id != $2', [name.toUpperCase(), id]);
            if (responseVerify.rowCount > 0) {
                return res.json({
                    ok: true,
                    message: 'Ya existe otro servicio con este nombre: ' + name
                });
            }
        }
        database_1.pool.query('UPDATE services SET name = COALESCE($1, name), active = COALESCE($2, active), updated_at = $3 WHERE id = $4', [name, active, nowDate, id]);
        return res.json({
            ok: true,
            message: 'Servicio actualizado'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.deleteService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const nowDate = new Date();
        database_1.pool.query('UPDATE services SET active = $1, updated_at = $2 WHERE id = $3', [false, nowDate, id]);
        return res.json({
            ok: true,
            message: 'Servicio eliminado'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
