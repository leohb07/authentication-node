import express from 'express';
import { validate } from '../middlewares/validate';
import { createUserSchema, loginUserSchema } from '../schemas/user.schema';
import { loginHandler, registerHandler } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', validate(createUserSchema), registerHandler);
router.post('/login', validate(loginUserSchema), loginHandler);

export default router;
