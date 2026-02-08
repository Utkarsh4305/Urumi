import { Router } from 'express';
import storeController from '../controllers/store.controller';

const router = Router();

// Create a new store
router.post('/', (req, res, next) => storeController.createStore(req, res, next));

// Get all stores
router.get('/', (req, res, next) => storeController.getAllStores(req, res, next));

// Get a specific store
router.get('/:id', (req, res, next) => storeController.getStore(req, res, next));

// Get store status (for polling)
router.get('/:id/status', (req, res, next) => storeController.getStoreStatus(req, res, next));

// Delete a store
router.delete('/:id', (req, res, next) => storeController.deleteStore(req, res, next));

export default router;
