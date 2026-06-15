// PURPOSE: Maps HTTP methods + URLs to controller functions
// WHY SEPARATE FROM CONTROLLER: Routes are the API contract
// Controllers are the business logic

import express from 'express';
import { register, login, logout, refreshAccessToken } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshAccessToken);

export default router;