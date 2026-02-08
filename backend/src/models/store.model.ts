export type StoreType = 'woocommerce' | 'medusa';

export type StoreStatus = 'Provisioning' | 'Ready' | 'Failed' | 'Deleting';

export interface Store {
  id: string;
  type: StoreType;
  namespace: string;
  status: StoreStatus;
  url: string | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStoreInput {
  id: string;
  type: StoreType;
  namespace: string;
  status: StoreStatus;
  url: string | null;
}

export interface UpdateStoreInput {
  status?: StoreStatus;
  url?: string | null;
  error_message?: string | null;
}
