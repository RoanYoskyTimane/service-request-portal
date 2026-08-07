import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Navbar } from './components/Navbar/Navbar';
import { RequestTable } from './components/RequestTable/RequestTable';
import { CreateRequestModal } from './components/CreateRequestModal/CreateRequestModal';
import { RequestDetailModal } from './components/RequestDetailModal/RequestDetailModal';
import type { ServiceRequest } from './api/requestsApi';
import './App.css';

export default function App() {
  const auth = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (auth.isLoading) return <div className="container">Carregando sessão...</div>;

  if (!auth.isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1>Customer Service Request Portal</h1>
        <p style={{ margin: '1rem 0' }}>Autentique-se para aceder ao sistema.</p>
        <button className="btn-primary" onClick={() => void auth.signinRedirect()}>
          Sign In with OIDC
        </button>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="container">
        <RequestTable
          onSelectRequest={(req) => setSelectedRequest(req)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      </main>

      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}