import express from 'express';
import { Container } from 'typedi';
import AuthenticateController from '../controllers/auth/AuthenticateController';

const router = express.Router();

const authController = Container.get(AuthenticateController);

router.post('/auth/signin', (req, res) => authController.signin(req, res));
router.post('/auth/register', (req, res) => authController.register(req, res));

export default router;
