import { Navigate, Outlet } from 'react-router';
import { useAuth } from 'react-oidc-context';
import { Navbar } from '../Navbar/Navbar';

export function ProtectedLayout() {
    const auth = useAuth();

    if (!auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <Navbar />
            <main className="container">
                <Outlet />
            </main>
        </div>
    );
}
