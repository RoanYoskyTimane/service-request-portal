import { useAuth } from 'react-oidc-context';
import './Navbar.css';

export function Navbar() {
    const auth = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-brand">Customer Support Portal</div>
            <div className="user-info">
                {auth.user?.profile.picture && (
                    <img src={auth.user.profile.picture} alt="Avatar" className="avatar" />
                )}
                <span>{auth.user?.profile.name || auth.user?.profile.email}</span>
                <button className="btn-secondary" onClick={() => void auth.removeUser()}>
                    Sign Out
                </button>
            </div>
        </nav>
    );
}