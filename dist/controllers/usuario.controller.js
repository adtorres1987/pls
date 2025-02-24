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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcrypt"));
const database_1 = require("../database");
exports.getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT us.id, us.name, us.identification, us.birth_date, us.photo, us.email, us.social_network, us.active, ro.name rol ' +
            'FROM users us, role_user ru, roles ro ' +
            'WHERE us.id = ru.user_id ' +
            'AND ru.role_id = ro.id ');
        return res.status(200).json(response.rows);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const response = yield database_1.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        var usuarioDB = response.rows[0];
        if (usuarioDB) {
            const responseRole = yield database_1.pool.query('SELECT ro.name FROM role_user ru, roles ro ' +
                'WHERE ru.user_id = $1 ' +
                'AND ru.role_id = ro.id', [usuarioDB.id]);
            var rolesDB = responseRole.rows;
            var usuario = {
                id: usuarioDB.id,
                name: usuarioDB.name,
                email: usuarioDB.email,
                active: usuarioDB.active,
                identification: usuarioDB.identification,
                birth_date: usuarioDB.birth_date,
                photo: usuarioDB.photo,
                social_network: usuarioDB.social_network,
                rol: rolesDB
            };
            return res.json(usuario);
        }
        else {
            return res.status(400).json({
                ok: false,
                err: {
                    'message': 'usuario no encontrado'
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json('Internal server error');
    }
});
exports.createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, email, password, social_network, rol_id } = req.body;
        const responseVerify = yield database_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (responseVerify.rowCount > 0) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ya existe un usuario con este correo ' + email
                }
            });
        }
        else {
            const nowDate = new Date();
            database_1.pool.query('INSERT INTO users (name, email, password, social_network, active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [name, email, bcrypt.hashSync(password, 10), social_network, true, nowDate, nowDate]);
            const response = yield database_1.pool.query('SELECT * FROM users WHERE email = $1 ', [email]);
            database_1.pool.query('INSERT INTO role_user (role_id, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4)', [rol_id, response.rows[0].id, nowDate, nowDate]);
            return res.json({
                ok: true,
                usuario: {
                    name,
                    email,
                    social_network,
                    active: true,
                    created_at: nowDate,
                    updated_at: nowDate
                }
            });
        }
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        let { name, identification, birth_date } = req.body;
        var cumple = new Date(birth_date);
        const nowDate = new Date();
        database_1.pool.query('UPDATE users SET name = $1, identification = COALESCE($2, identification), birth_date = COALESCE($3, birth_date), updated_at = $4 WHERE id = $5', [name, identification, cumple, nowDate, id]);
        return res.json({
            ok: true,
            message: 'Usuario actualizado'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
exports.deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const nowDate = new Date();
        database_1.pool.query('UPDATE users SET active = $1 WHERE id = $2', [false, id]);
        return res.json({
            ok: true,
            message: 'Usuario eliminado'
        });
    }
    catch (error) {
        return res.status(500).json('Internal server error');
    }
});
