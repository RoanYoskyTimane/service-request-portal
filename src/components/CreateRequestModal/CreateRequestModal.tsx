import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRequest, type CreateServiceRequest } from '../../api/requestsApi';
import './CreateRequestModal.css';

interface CreateRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateRequestModal({ isOpen, onClose }: CreateRequestModalProps) {
    const queryClient = useQueryClient();
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            onClose();
        },
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Criar Novo Pedido</h3>
                    <button className="btn-secondary" onClick={onClose}>X</button>
                </div>

                <form onSubmit={handleSubmit}>
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
                            rows={3}
                            className="input-field"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Enviando...' : 'Criar Pedido'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}