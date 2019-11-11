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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const database_1 = require("../database");
exports.upload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let tipo = req.params.tipo;
    let id = parseInt(req.params.id);
    var nombreArchivo = "";
    try {
        if (!req.files) {
            return res.status(400)
                .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningun archivo'
                }
            });
        }
        // Valida tipo
        let tiposValidos = ['users', 'locals', 'menus', 'promos', 'publicities'];
        if (tiposValidos.indexOf(tipo) < 0) {
            return res.status(400)
                .json({
                ok: false,
                err: {
                    message: 'Los tipos permitidos son: ' + tiposValidos.join(', ')
                }
            });
        }
        let archivo = req.files.archivo;
        let nombreCortado = archivo.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];
        // Extensiones permitidas
        let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg',];
        if (extensionesValidas.indexOf(extension) < 0) {
            return res.status(400)
                .json({
                ok: false,
                err: {
                    message: 'Las extensiones permitidas para la imagen son: ' + extensionesValidas.join(', ')
                }
            });
        }
        // Cambiar nombre del archivo
        nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
        let path = `uploads/${tipo}/${nombreArchivo}`;
        archivo.mv(path);
        // Imagen Cargada
        subirPorTipo(tipo, id, nombreArchivo)
            .then(value => {
            if (!value) {
                return res.json({
                    ok: false,
                    message: 'Error subiendo la imagen, intente mas tarde'
                });
            }
        }).catch(err => {
            console.log('Error Nro 1:', err);
            borraArchivo(nombreArchivo, tipo);
            return res.json({
                ok: false,
                message: 'Error subiendo la imagen, intente mas tarde'
            });
        });
        return res.json({
            ok: true,
            message: 'Imagen subida correctamente',
            photo: nombreArchivo
        });
    }
    catch (error) {
        console.log("error upload", error);
        borraArchivo(nombreArchivo, tipo);
        return res.status(500).json('Internal server error');
    }
});
var subirPorTipo = (tipo, id, nombreArchivo) => __awaiter(void 0, void 0, void 0, function* () {
    if (tipo === 'locals') {
        // imagenLocal(id, res, nombreArchivo);
        return yield imagenLocal(id, nombreArchivo);
    }
    if (tipo === 'menus') {
        // imagenMenu(id, res, nombreArchivo);
        console.log('Subir menus');
    }
    if (tipo === 'promos') {
        // imagenPromocion(id, res, nombreArchivo);
        console.log('Subir promos');
    }
    if (tipo === 'publicities') {
        // imagenPublicidad(id, res, nombreArchivo);
        console.log('Subir publicities');
    }
    if (tipo === 'users') {
        return yield imagenUsuario(id, nombreArchivo);
    }
    else {
        return false;
    }
});
var imagenUsuario = (id, nombreArchivo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resUser = yield database_1.pool.query('SELECT * FROM users WHERE id = $1 ', [id]);
        if (resUser.rowCount > 0) {
            var user = resUser.rows[0];
            const nowDate = new Date();
            if (user.photo) {
                borraArchivo(user.photo, 'users');
            }
            yield database_1.pool.query('UPDATE users SET photo = $1, updated_at = $2 WHERE id = $3', [nombreArchivo, nowDate, id]);
            return true;
        }
        else {
            borraArchivo(nombreArchivo, 'users');
            return false;
        }
    }
    catch (error) {
        console.log('error2', error);
        return false;
    }
});
var imagenLocal = (id, nombreArchivo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resLocal = yield database_1.pool.query('SELECT * FROM locals WHERE id = $1 ', [id]);
        if (resLocal.rowCount > 0) {
            var local = resLocal.rows[0];
            const nowDate = new Date();
            if (local.logo) {
                borraArchivo(local.logo, 'locals');
            }
            yield database_1.pool.query('UPDATE locals SET logo = $1, updated_at = $2 WHERE id = $3', [nombreArchivo, nowDate, id]);
            return true;
        }
        else {
            borraArchivo(nombreArchivo, 'locals');
            return false;
        }
    }
    catch (error) {
        console.log('error2', error);
        return false;
    }
});
var borraArchivo = (nombreImagen, tipo) => {
    try {
        // Eliminar imagen que se reemplaza en la base
        let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen);
        }
    }
    catch (error) {
        console.log("Hubo un problema al intentar eliminar la imagen", nombreImagen);
    }
};
