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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = __importDefault(require("../confg/config"));
const database_1 = require("../database");
//=======================
// Verificar Token
//=======================
exports.verificaToken = (req, res, next) => {
    const token = req.get("Authorization");
    let jwtPayload;
    //Try to validate the token and get data
    try {
        jwtPayload = jwt.verify(token, config_1.default.jwtSecret);
        // console.log('jwtPayload', jwtPayload.usuario);
        res.locals.jwtPayload = jwtPayload;
    }
    catch (error) {
        //If token is not valid, respond with 401 (unauthorized)
        // res.status(401).send();
        return res.status(401).json({
            ok: false,
            err: {
                message: 'Token no válido'
            },
            err2: error
        });
        // return;
    }
    //Call the next middleware or controller
    next();
};
exports.checkRole = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        //Get the user ID from previous midleware
        const user_id = res.locals.jwtPayload.usuario.id;
        var rolesDB = [];
        try {
            console.log(user_id);
            const response = yield database_1.pool.query('SELECT ro.name FROM role_user ru, roles ro ' +
                'WHERE ru.user_id = $1 ' +
                'AND ru.role_id = ro.id', [user_id]);
            rolesDB = response.rows;
        }
        catch (id) {
            res.status(401).send();
        }
        //Check if array of authorized roles includes the user's role
        rolesDB.forEach(rol => {
            if (roles.indexOf(rol.name) > -1) {
                next();
            }
            else {
                return res.status(401).json({
                    ok: false,
                    err: {
                        message: 'El usuario no tiene permisos'
                    }
                });
            }
        });
    });
};
