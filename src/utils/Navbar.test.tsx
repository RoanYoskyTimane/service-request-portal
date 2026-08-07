import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../components/Navbar/Navbar.tsx';
import { useAuth } from 'react-oidc-context';

vi.mock('react-oidc-context', () => ({
    useAuth: vi.fn(),
}));

describe('Navbar Component', () => {
    it('Deve renderizar o nome do utilizador autenticado', () => {
        vi.mocked(useAuth).mockReturnValue({
            isAuthenticated: true,
            user: {
                profile: { name: 'Avaliador Teste', email: 'teste@sdo.co.mz' },
            },
            removeUser: vi.fn(),
        } as any);

        render(<Navbar />);

        expect(screen.getByText('Customer Support Portal')).toBeInTheDocument();
        expect(screen.getByText('Avaliador Teste')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });
});