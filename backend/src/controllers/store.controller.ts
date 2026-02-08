import { Request, Response, NextFunction } from 'express';
import storeService from '../services/store.service';
import { createStoreSchema } from '../validators/store.validator';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class StoreController {
  /**
   * Create a new store
   * POST /api/stores
   */
  async createStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validation = createStoreSchema.safeParse(req.body);
      if (!validation.success) {
        throw validation.error;
      }

      const { type } = validation.data;

      // Create store
      const store = await storeService.createStore(type);

      logger.info('Store creation request accepted', { storeId: store.id });

      res.status(202).json({
        message: 'Store provisioning started',
        store: {
          id: store.id,
          type: store.type,
          status: store.status,
          namespace: store.namespace,
          created_at: store.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all stores
   * GET /api/stores
   */
  async getAllStores(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stores = await storeService.getAllStores();

      res.json({
        stores: stores.map(store => ({
          id: store.id,
          type: store.type,
          status: store.status,
          url: store.url,
          error_message: store.error_message,
          created_at: store.created_at,
          updated_at: store.updated_at
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific store
   * GET /api/stores/:id
   */
  async getStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const store = await storeService.getStoreById(id);

      if (!store) {
        throw new AppError('Store not found', 404);
      }

      res.json({
        store: {
          id: store.id,
          type: store.type,
          status: store.status,
          url: store.url,
          namespace: store.namespace,
          error_message: store.error_message,
          created_at: store.created_at,
          updated_at: store.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get store status (for polling)
   * GET /api/stores/:id/status
   */
  async getStoreStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const status = await storeService.getStoreStatus(id);

      if (!status) {
        throw new AppError('Store not found', 404);
      }

      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a store
   * DELETE /api/stores/:id
   */
  async deleteStore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await storeService.deleteStore(id);

      logger.info('Store deletion completed', { storeId: id });

      res.json({
        message: 'Store deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StoreController();
