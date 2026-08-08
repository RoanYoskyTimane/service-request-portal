import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router';

export function LandingPage() {
    const auth = useAuth();

    if (auth.isAuthenticated) {
        return <Navigate to="/requests" replace />;
    }

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
