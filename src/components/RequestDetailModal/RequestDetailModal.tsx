import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRequestStatus, type ServiceRequest, type ServiceRequestStatus } from '../../api/requestsApi';
import './RequestDetailModal.css';

interface RequestDetailModalProps {
    request: ServiceRequest | null;
    onClose: () => void;
}

export function RequestDetailModal({ request, onClose }: RequestDetailModalProps) {
    const queryClient = useQueryClient();
    const [selectedStatus, setSelectedStatus] = useState<ServiceRequestStatus | ''>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: ({ id, status, version }: { id: string; status: ServiceRequestStatus; version: number }) =>
            updateRequestStatus(id, status, version),
        onSuccess: () => {
            setErrorMessage(null);
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            onClose();
        },
        onError: (err: Error) => {
            if (err.message === 'CONFLITO_CONCORRENCIA') {
                setErrorMessage('Erro 409: O registo foi alterado por outro utilizador. Atualize a página e tente novamente.');
            } else {
                setErrorMessage('Transição de status inválida para este pedido.');
            }
        },
    });

    if (!request) return null;

    const validTransitions: Record<string, ServiceRequestStatus[]> = {
        OPEN: ['IN_PROGRESS', 'CLOSED'],
        IN_PROGRESS: ['RESOLVED', 'OPEN'],
        RESOLVED: ['CLOSED', 'IN_PROGRESS'],
        CLOSED: [],
    };

    const allowedStatuses = validTransitions[request.status] || [];

    const handleUpdateStatus = () => {
        if (!selectedStatus) return;
        mutation.mutate({ id: request.id, status: selectedStatus, version: request.version });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Detalhes de {request.id}</h3>
                    <button className="btn-secondary" onClick={onClose}>X</button>
                </div>

                <div className="detail-modal-body">
                    <p><strong>Título:</strong> {request.title}</p>
                    <p><strong>Descrição:</strong> {request.description}</p>
                    <p><strong>Requerente:</strong> {request.requesterName} ({request.requesterEmail})</p>
                    <p><strong>Versão Atual:</strong> v{request.version}</p>

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
        </div>
    );
}