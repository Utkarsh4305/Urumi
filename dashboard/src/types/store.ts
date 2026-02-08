export type StoreType = 'woocommerce' | 'medusa';

export type StoreStatus = 'Provisioning' | 'Ready' | 'Failed' | 'Deleting';

export interface Store {
  id: string;
  type: StoreType;
  status: StoreStatus;
  url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreRequest {
  type: StoreType;
}

export interface StoresResponse {
  stores: Store[];
}

export interface StoreResponse {
  store: Store;
}

export interface CreateStoreResponse {
  message: string;
  store: Store;
}

export interface DeleteStoreResponse {
  message: string;
}
