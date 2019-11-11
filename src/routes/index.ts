import { Router } from 'express';
const router = Router();

import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { login, loginSocial, register } from '../controllers/auth.controller';
import { getServices, createService, updateService, deleteService } from '../controllers/service.controller';
import { createMenuCategory, getMenuCategories, updateMenuCategory, deleteMenuCategory } from '../controllers/menuCategory.controller';
import { createLocalCategory, getLocalCategories, updateLocalCategory, deleteLocalCategory } from '../controllers/localCategory.controller';
import { getLocal, createLocal, getLocalByCategory, addLike, addQualification, buscarLocal } from '../controllers/local.controller';

import { upload } from '../controllers/upload.controller';
import { getImage } from '../controllers/imagenes.controller';

import { verificaToken, checkRole } from "../middlewares/autenticacion";

// Usuarios
router.get('/user', getUsers);
router.get('/user/:id', [ verificaToken, checkRole(['admin']) ], getUserById);
router.post('/user', createUser);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

// Autenticación
router.post('/login', login);
router.post('/login_social', loginSocial);
router.post('/register', register);

// Servicios
router.get('/service', getServices);
router.post('/service', createService);
router.put('/service/:id', updateService);
router.delete('/service/:id', deleteService);

// Menu Categoria
router.get('/menu_categoria', getMenuCategories);
router.post('/menu_categoria', createMenuCategory);
router.put('/menu_categoria/:id', updateMenuCategory);
router.delete('/menu_categoria/:id', deleteMenuCategory);

// Local Categoria
router.get('/local_categoria', getLocalCategories);
router.post('/local_categoria', createLocalCategory);
router.put('/local_categoria/:id', updateLocalCategory);
router.delete('/local_categoria/:id', deleteLocalCategory);

// Local
router.get('/local/:desde/:limite', getLocal);
router.get('/local_by_category/:id', getLocalByCategory);
router.post('/local', createLocal);
router.post('/like', addLike);
router.post('/qualification', addQualification);

// Upload
router.post('/upload/:tipo/:id', upload);

// Imagen
router.get('/:tipo/:img', getImage);

// Buscador
router.get('/coleccion/local_categoria/:termino/:desde?/:limite?', buscarLocal);

export default router;