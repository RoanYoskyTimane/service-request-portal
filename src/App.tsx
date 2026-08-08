import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useAuth } from 'react-oidc-context';
import { ProtectedLayout } from './components/ProtectedLayout/ProtectedLayout';
import { LandingPage } from './components/LandingPage/LandingPage';
import { RequestTable } from './components/RequestTable/RequestTable';
import { CreateRequestPage } from './components/CreateRequestPage/CreateRequestPage';
import { RequestDetailPage } from './components/RequestDetailPage/RequestDetailPage';
import './App.css';

export default function App() {
  const auth = useAuth();

  if (auth.isLoading) return <div className="container">Carregando sessão...</div>;

  if (auth.error) {
    return (
      <div className="container" style={{ padding: '2rem', color: 'red' }}>
        <h2>Erro na Autenticação OIDC</h2>
        <pre>{auth.error.message}</pre>
        <button 
          className="btn-secondary" 
          style={{ marginTop: '1rem' }} 
          onClick={() => window.location.reload()}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/requests" element={<RequestTable />} />
          <Route path="/requests/new" element={<CreateRequestPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}