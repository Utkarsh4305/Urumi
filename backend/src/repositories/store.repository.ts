import knex from 'knex';
import dbConfig from '../config/database';
import { Store, CreateStoreInput, UpdateStoreInput, StoreStatus } from '../models/store.model';
import logger from '../utils/logger';

const db = knex(dbConfig[process.env.NODE_ENV || 'development']);

export class StoreRepository {
  /**
   * Create a new store record
   */
  async create(input: CreateStoreInput): Promise<Store> {
    try {
      const [store] = await db('stores')
        .insert({
          ...input,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      logger.info('Store created in database', { storeId: store.id });
      return store;
    } catch (error: any) {
      logger.error('Failed to create store in database', {
        error: error.message,
        input
      });
      throw error;
    }
  }

  /**
   * Get all stores
   */
  async findAll(): Promise<Store[]> {
    try {
      const stores = await db('stores')
        .select('*')
        .orderBy('created_at', 'desc');

      return stores;
    } catch (error: any) {
      logger.error('Failed to retrieve stores', { error: error.message });
      throw error;
    }
  }

  /**
   * Get a store by ID
   */
  async findById(id: string): Promise<Store | null> {
    try {
      const store = await db('stores')
        .where({ id })
        .first();

      return store || null;
    } catch (error: any) {
      logger.error('Failed to retrieve store', { error: error.message, storeId: id });
      throw error;
    }
  }

  /**
   * Update a store
   */
  async update(id: string, input: UpdateStoreInput): Promise<Store | null> {
    try {
      const [store] = await db('stores')
        .where({ id })
        .update({
          ...input,
          updated_at: new Date()
        })
        .returning('*');

      logger.info('Store updated in database', { storeId: id, updates: input });
      return store || null;
    } catch (error: any) {
      logger.error('Failed to update store', {
        error: error.message,
        storeId: id,
        input
      });
      throw error;
    }
  }

  /**
   * Update store status
   */
  async updateStatus(
    id: string,
    status: StoreStatus,
    errorMessage: string | null = null,
    url: string | null = null
  ): Promise<Store | null> {
    const updates: UpdateStoreInput = { status };

    if (errorMessage !== undefined) {
      updates.error_message = errorMessage;
    }

    if (url !== undefined) {
      updates.url = url;
    }

    return this.update(id, updates);
  }

  /**
   * Delete a store
   */
  async delete(id: string): Promise<boolean> {
    try {
      const deleted = await db('stores')
        .where({ id })
        .delete();

      logger.info('Store deleted from database', { storeId: id });
      return deleted > 0;
    } catch (error: any) {
      logger.error('Failed to delete store', { error: error.message, storeId: id });
      throw error;
    }
  }

  /**
   * Count stores by status
   */
  async countByStatus(status: StoreStatus): Promise<number> {
    try {
      const result = await db('stores')
        .where({ status })
        .count('* as count')
        .first();

      return parseInt(result?.count as string) || 0;
    } catch (error: any) {
      logger.error('Failed to count stores', { error: error.message, status });
      throw error;
    }
  }

  /**
   * Get total store count
   */
  async count(): Promise<number> {
    try {
      const result = await db('stores')
        .count('* as count')
        .first();

      return parseInt(result?.count as string) || 0;
    } catch (error: any) {
      logger.error('Failed to count stores', { error: error.message });
      throw error;
    }
  }
}

export default new StoreRepository();
