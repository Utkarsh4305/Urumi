import { Store } from '../types/store';
import { StoreCard } from './StoreCard';

interface StoreListProps {
  stores: Store[];
}

export function StoreList({ stores }: StoreListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
      {stores.map((store, index) => {
        // Every 6th card (starting from index 0) spans 2 columns on desktop for variety
        const isWide = index % 6 === 0;
        return (
          <div key={store.id} className={isWide ? 'lg:col-span-2' : ''}>
            <StoreCard store={store} />
          </div>
        );
      })}
    </div>
  );
}
