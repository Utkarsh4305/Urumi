import { apiClient } from './client';
import {
  Store,
  CreateStoreRequest,
  StoresResponse,
  StoreResponse,
  CreateStoreResponse,
  DeleteStoreResponse,
} from '../types/store';

export const storesApi = {
  /**
   * Get all stores
   */
  getAll: async (): Promise<Store[]> => {
    const response = await apiClient.get<StoresResponse>('/stores');
    return response.data.stores;
  },

  /**
   * Get a specific store
   */
  getById: async (id: string): Promise<Store> => {
    const response = await apiClient.get<StoreResponse>(`/stores/${id}`);
    return response.data.store;
  },

  /**
   * Get store status
   */
  getStatus: async (id: string): Promise<Store> => {
    const response = await apiClient.get<Store>(`/stores/${id}/status`);
    return response.data;
  },

  /**
   * Create a new store
   */
  create: async (data: CreateStoreRequest): Promise<Store> => {
    const response = await apiClient.post<CreateStoreResponse>('/stores', data);
    return response.data.store;
  },

  /**
   * Delete a store
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<DeleteStoreResponse>(`/stores/${id}`);
  },
};
