import { useState } from 'react';
import { useStores } from './hooks/useStores';
import { StoreList } from './components/StoreList';
import { CreateStoreModal } from './components/CreateStoreModal';
import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { LoadingState } from './components/LoadingState';
import { ErrorAlert } from './components/ErrorAlert';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: stores, isLoading, error } = useStores();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Header */}
      <Header stores={stores || []} onCreateStore={() => setIsModalOpen(true)} />

      {/* Main Content with max-width and better spacing */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Alert - Enhanced styling */}
        {error && (
          <ErrorAlert
            error={error instanceof Error ? error.message : 'Unknown error occurred'}
          />
        )}

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Content */}
        {!isLoading && stores && (
          <>
            {stores.length > 0 ? (
              <>
                {/* Section Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Stores</h2>
                  <p className="text-gray-600">Manage all your provisioned stores</p>
                </div>

                {/* Store Grid */}
                <StoreList stores={stores} />
              </>
            ) : (
              <EmptyState onCreateStore={() => setIsModalOpen(true)} />
            )}
          </>
        )}
      </main>

      {/* Modal */}
      <CreateStoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;
