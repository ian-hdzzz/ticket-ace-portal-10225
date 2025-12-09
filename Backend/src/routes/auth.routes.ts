import express from 'express'
import AuthController from '../controllers/auth.controller.js';

const router = express.Router();

// Authentication routes
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refreshToken);

export default router