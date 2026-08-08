import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRequestById, updateRequestStatus, type ServiceRequestStatus } from '../../api/requestsApi';
import './RequestDetailPage.css';

export function RequestDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState<ServiceRequestStatus | ''>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { data: request, isLoading, isError } = useQuery({
        queryKey: ['request', id],
        queryFn: () => fetchRequestById(id!),
        enabled: !!id,
    });

    const mutation = useMutation({
        mutationFn: ({ status, version }: { status: ServiceRequestStatus; version: number }) =>
            updateRequestStatus(id!, status, version),
        onSuccess: () => {
            setErrorMessage(null);
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            queryClient.invalidateQueries({ queryKey: ['request', id] });
            navigate('/requests');
        },
        onError: (err: Error) => {
            if (err.message === 'CONFLITO_CONCORRENCIA') {
                setErrorMessage('Erro 409: O registo foi alterado por outro utilizador. Atualize a página e tente novamente.');
            } else {
                setErrorMessage('Transição de status inválida para este pedido.');
            }
        },
    });

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando detalhes do pedido...</div>;
    if (isError || !request) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'red' }}>Erro ao carregar ou pedido não encontrado.</p>
                <button className="btn-secondary" onClick={() => navigate('/requests')}>Voltar para Lista</button>
            </div>
        );
    }

    const validTransitions: Record<string, ServiceRequestStatus[]> = {
        OPEN: ['IN_PROGRESS', 'CLOSED'],
        IN_PROGRESS: ['RESOLVED', 'OPEN'],
        RESOLVED: ['CLOSED', 'IN_PROGRESS'],
        CLOSED: [],
    };

    const allowedStatuses = validTransitions[request.status] || [];

    const handleUpdateStatus = () => {
        if (!selectedStatus) return;
        mutation.mutate({ status: selectedStatus, version: request.version });
    };

    return (
        <div className="request-detail-page">
            <div className="page-header">
                <h3>Detalhes do Pedido {request.id}</h3>
                <button className="btn-secondary" onClick={() => navigate('/requests')}>Voltar para Lista</button>
            </div>

            <div className="detail-body">
                <div className="detail-info">
                    <p><strong>Título:</strong> {request.title}</p>
                    <p><strong>Descrição:</strong> {request.description}</p>
                    <p><strong>Categoria:</strong> {request.category}</p>
                    <p><strong>Requerente:</strong> {request.requesterName} ({request.requesterEmail})</p>
                    <p><strong>Versão Atual:</strong> v{request.version}</p>
                    <p><strong>Criado Em:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                </div>

                <div className="status-change-box">
                    <h4>Atualizar Status (Regras OAS3)</h4>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Status Atual: <span className={`badge badge-${request.status.toLowerCase()}`}>{request.status}</span>
                    </p>

                    {allowedStatuses.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <select
                                className="select-field"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as ServiceRequestStatus)}
                            >
                                <option value="">Selecione o novo status...</option>
                                {allowedStatuses.map((st) => (
                                    <option key={st} value={st}>{st}</option>
                                ))}
                            </select>
                            <button
                                className="btn-primary"
                                disabled={!selectedStatus || mutation.isPending}
                                onClick={handleUpdateStatus}
                            >
                                {mutation.isPending ? 'Atualizando...' : 'Atualizar'}
                            </button>
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Este pedido está em estado terminal (CLOSED).</p>
                    )}

                    {errorMessage && <div className="error-banner">{errorMessage}</div>}
                </div>
            </div>
        </div>
    );
}
