import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router = Router();

router.get('/', (req, res) => menuController.getAll(req, res));

router.get('/:id', (req, res) => menuController.getById(req, res));

export default router;
