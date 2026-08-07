import { AuthProvider as OidcProvider, type AuthProviderProps } from 'react-oidc-context';
import { type ReactNode } from 'react';

const oidcConfig: AuthProviderProps = {
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin,
    scope: 'openid profile email',
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
    },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    return <OidcProvider {...oidcConfig}>{children}</OidcProvider>;
};