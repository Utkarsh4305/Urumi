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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background with floating shapes */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-slate-50 to-sky-50" />

        {/* Floating orbs for visual interest */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl animate-float animation-delay-200" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-fuchsia-200/30 rounded-full blur-3xl animate-float animation-delay-400" style={{ animationDuration: '10s' }} />
        <div className="absolute -bottom-10 right-10 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl animate-float" style={{ animationDuration: '7s' }} />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <Header stores={stores || []} onCreateStore={() => setIsModalOpen(true)} />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Alert */}
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
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Your Stores</h2>
                    <p className="text-slate-500">Manage and monitor your provisioned stores</p>
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
      </div>

      {/* Modal */}
      <CreateStoreModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;
