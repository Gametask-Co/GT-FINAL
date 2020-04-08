import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';
import authMiddleware from './app/middlewares/auth';

import UserController from './app/controllers/UserController';
import FriendshipController from './app/controllers/FriendshipController';
import TaskController from './app/controllers/TaskController';
import TodoController from './app/controllers/TodoController';
import FileController from './app/controllers/FileController';
import SessionController from './app/controllers/SessionController';

const routes = new Router();
const upload = multer(multerConfig);

// -------- USER ROUTES --------

// POST
routes.post('/sessions', SessionController.store);
routes.post('/user', UserController.store);

// -------- AUTH ROUTES --------
routes.use(authMiddleware);

// GET
routes.get('/user', UserController.index);

// PUT
routes.put('/user', UserController.update);

// DELETE
routes.delete('/user', UserController.delete);

// -------- FRIENDSHIP ROUTES --------

// GET
routes.get('/friend', FriendshipController.index);

// POST
routes.post('/friend', FriendshipController.store);

// DELETE
routes.delete('/friend', FriendshipController.delete);

// -------- TASK ROUTES --------

// GET
routes.get('/task', TaskController.index);

// POST
routes.post('/task', TaskController.store);

// DELETE
routes.delete('/task', TaskController.delete);

// PUT
routes.put('/task', TaskController.update);

// -------- TO DO ROUTES --------

routes.post('/todo', TodoController.store);
routes.get('/todo', TodoController.index);
routes.delete('/todo', TodoController.delete);
routes.put('/todo', TodoController.update);

// rota principal ( Em breve )
routes.get('/', (req, res) => {
  res.sendFile('views/index.html', { root: __dirname });
});

// Rota de upload
routes.post('/files', upload.single('file'), FileController.store);

// Rota de teste para erros
routes.get('/debug', () => {
  throw new Error('My first Sentry error!');
});

export default routes;
