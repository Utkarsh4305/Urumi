import { supabase } from '../config/supabase';
import { Store, CreateStoreInput, UpdateStoreInput, StoreStatus } from '../models/store.model';
import logger from '../utils/logger';

export class StoreRepository {
  /**
   * Create a new store record
   */
  async create(input: CreateStoreInput): Promise<Store> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('stores')
        .insert({
          ...input,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      logger.info('Store created in database', { storeId: data.id });
      return this.mapToStore(data);
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
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(this.mapToStore);
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
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(error.message);
      }

      return data ? this.mapToStore(data) : null;
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
      const { data, error } = await supabase
        .from('stores')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(error.message);
      }

      logger.info('Store updated in database', { storeId: id, updates: input });
      return data ? this.mapToStore(data) : null;
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
      const { error, count } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      logger.info('Store deleted from database', { storeId: id });
      return (count ?? 1) > 0;
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
      const { count, error } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);

      if (error) {
        throw new Error(error.message);
      }

      return count || 0;
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
      const { count, error } = await supabase
        .from('stores')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(error.message);
      }

      return count || 0;
    } catch (error: any) {
      logger.error('Failed to count stores', { error: error.message });
      throw error;
    }
  }

  /**
   * Map database record to Store interface
   */
  private mapToStore(record: any): Store {
    return {
      id: record.id,
      type: record.type,
      namespace: record.namespace,
      status: record.status,
      url: record.url,
      error_message: record.error_message,
      created_at: new Date(record.created_at),
      updated_at: new Date(record.updated_at)
    };
  }
}

export default new StoreRepository();
