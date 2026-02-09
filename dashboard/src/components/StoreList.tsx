import { Store } from '../types/store';
import { StoreCard } from './StoreCard';

interface StoreListProps {
  stores: Store[];
}

export function StoreList({ stores }: StoreListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {stores.map((store, index) => {
        const isWide = index % 6 === 0 && stores.length > 2;

        return (
          <div
            key={store.id}
            className={isWide ? 'xl:col-span-2' : ''}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <StoreCard store={store} />
          </div>
        );
      })}
    </div>
  );
}
