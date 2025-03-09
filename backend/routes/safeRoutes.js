import { createSafe, removeOwner, addOwner } from '../controllers/safeController.js';
import express from 'express';
const safeRouter = express.Router();
const removeOwnerRouter = express.Router();
const addOwnerRouter = express.Router();

safeRouter.post('/', createSafe);
removeOwnerRouter.post('/', removeOwner);
addOwnerRouter.post('/', addOwner);


export { safeRouter, removeOwnerRouter, addOwnerRouter };