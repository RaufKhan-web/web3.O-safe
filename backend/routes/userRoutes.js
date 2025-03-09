import { createUser, checkUser, checkOwner } from '../controllers/userController.js';
import express from 'express';
const userRouter = express.Router();
const checkUserRouter = express.Router();
const pruposedOwnerAddressRouter = express.Router();

userRouter.post('/', createUser);
checkUserRouter.post('/', checkUser);
pruposedOwnerAddressRouter.post('/', checkOwner);

export { userRouter, checkUserRouter, pruposedOwnerAddressRouter };