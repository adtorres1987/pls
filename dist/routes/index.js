"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
const user_controller_1 = require("../controllers/user.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const service_controller_1 = require("../controllers/service.controller");
const menuCategory_controller_1 = require("../controllers/menuCategory.controller");
const localCategory_controller_1 = require("../controllers/localCategory.controller");
const local_controller_1 = require("../controllers/local.controller");
const upload_controller_1 = require("../controllers/upload.controller");
const imagenes_controller_1 = require("../controllers/imagenes.controller");
const autenticacion_1 = require("../middlewares/autenticacion");
// Usuarios
router.get('/user', user_controller_1.getUsers);
router.get('/user/:id', [autenticacion_1.verificaToken, autenticacion_1.checkRole(['admin'])], user_controller_1.getUserById);
router.post('/user', user_controller_1.createUser);
router.put('/user/:id', user_controller_1.updateUser);
router.delete('/user/:id', user_controller_1.deleteUser);
// Autenticación
router.post('/login', auth_controller_1.login);
router.post('/login_social', auth_controller_1.loginSocial);
router.post('/register', auth_controller_1.register);
// Servicios
router.get('/service', service_controller_1.getServices);
router.post('/service', service_controller_1.createService);
router.put('/service/:id', service_controller_1.updateService);
router.delete('/service/:id', service_controller_1.deleteService);
// Menu Categoria
router.get('/menu_categoria', menuCategory_controller_1.getMenuCategories);
router.post('/menu_categoria', menuCategory_controller_1.createMenuCategory);
router.put('/menu_categoria/:id', menuCategory_controller_1.updateMenuCategory);
router.delete('/menu_categoria/:id', menuCategory_controller_1.deleteMenuCategory);
// Local Categoria
router.get('/local_categoria', localCategory_controller_1.getLocalCategories);
router.post('/local_categoria', localCategory_controller_1.createLocalCategory);
router.put('/local_categoria/:id', localCategory_controller_1.updateLocalCategory);
router.delete('/local_categoria/:id', localCategory_controller_1.deleteLocalCategory);
// Local
router.get('/local/:desde/:limite', local_controller_1.getLocal);
router.get('/local_by_category/:id', local_controller_1.getLocalByCategory);
router.post('/local', local_controller_1.createLocal);
router.post('/like', local_controller_1.addLike);
router.post('/qualification', local_controller_1.addQualification);
// Upload
router.post('/upload/:tipo/:id', upload_controller_1.upload);
// Imagen
router.get('/:tipo/:img', imagenes_controller_1.getImage);
// Buscador
router.get('/coleccion/local_categoria/:termino/:desde?/:limite?', local_controller_1.buscarLocal);
exports.default = router;
