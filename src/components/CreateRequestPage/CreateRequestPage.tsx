import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { createRequest, type CreateServiceRequest } from '../../api/requestsApi';
import './CreateRequestPage.css';

export function CreateRequestPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateServiceRequest>({
        title: '',
        description: '',
        category: 'Access',
        priority: 'MEDIUM',
        requesterName: '',
        requesterEmail: '',
    });

    const mutation = useMutation({
        mutationFn: createRequest,
        onMutate: (variables) => {
            console.log('useMutation: onMutate triggered with:', variables);
        },
        onSuccess: () => {
            console.log('useMutation: onSuccess triggered');
            setErrorMessage(null);
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            navigate('/requests');
        },
        onError: (err: Error) => {
            console.error('useMutation: onError triggered with:', err);
            setErrorMessage(err.message || 'Ocorreu um erro ao criar o pedido.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit: Form submission triggered with data:', formData);
        mutation.mutate(formData);
    };

    return (
        <div className="create-request-page">
            <div className="page-header">
                <h3>Criar Novo Pedido</h3>
            </div>
            {errorMessage && <div className="error-banner" style={{ marginBottom: '1rem' }}>{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="request-form">
                <div className="form-group">
                    <label>Título:</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Categoria:</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Prioridade:</label>
                    <select
                        className="select-field"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Nome do Requerente:</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.requesterName}
                        onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Email do Requerente:</label>
                    <input
                        type="email"
                        required
                        className="input-field"
                        value={formData.requesterEmail}
                        onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>Descrição:</label>
                    <textarea
                        required
                        rows={5}
                        className="input-field"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/requests')}>Cancelar</button>
                    <button type="submit" className="btn-primary" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Enviando...' : 'Criar Pedido'}
                    </button>
                </div>
            </form>
        </div>
    );
}
