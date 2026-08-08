import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { fetchRequests } from '../../api/requestsApi';
import './RequestTable.css';

export function RequestTable() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [page, setPage] = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['requests', { search, status, priority, sort, page }],
        queryFn: () =>
            fetchRequests({
                ...(search && { search }),
                ...(status && { status }),
                ...(priority && { priority }),
                sort,
                page: page.toString(),
                pageSize: '10',
            }),
    });

    return (
        <div className="request-table-wrapper">
            <div className="toolbar">
                <div className="filters-group">
                    <input
                        type="text"
                        placeholder="Buscar por título ou requerente..."
                        className="input-field"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    <select className="select-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                        <option value="">Todos os Status</option>
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                    </select>

                    <select className="select-field" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
                        <option value="">Todas as Prioridades</option>
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                    </select>

                    <select className="select-field" value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="-createdAt">Mais Recentes</option>
                        <option value="createdAt">Mais Antigos</option>
                    </select>
                </div>

                <button className="btn-primary" onClick={() => navigate('/requests/new')}>+ Criar Pedido</button>
            </div>

            <div className="table-container">
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando pedidos...</div>
                ) : isError ? (
                    <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>Erro ao carregar os pedidos.</div>
                ) : data?.items.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Nenhum pedido encontrado.</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título / Categoria</th>
                                <th>Requerente</th>
                                <th>Prioridade</th>
                                <th>Status</th>
                                <th>Criado Em</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.items.map((item) => (
                                <tr key={item.id}>
                                    <td><code>{item.id}</code></td>
                                    <td>
                                        <strong>{item.title}</strong><br />
                                        <small style={{ color: '#64748b' }}>{item.category}</small>
                                    </td>
                                    <td>
                                        {item.requesterName}<br />
                                        <small style={{ color: '#64748b' }}>{item.requesterEmail}</small>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${item.priority.toLowerCase()}`}>{item.priority}</span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                                    </td>
                                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => navigate(`/requests/${item.id}`)}>
                                            Ver Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {data && data.totalPages > 1 && (
                <div className="pagination">
                    <span>Página {data.page} de {data.totalPages} ({data.total} total)</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
                        <button className="btn-secondary" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</button>
                    </div>
                </div>
            )}
        </div>
    );
}