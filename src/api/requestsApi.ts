import type { components } from './schema';

export type ServiceRequest = components['schemas']['ServiceRequest'];
export type ServiceRequestPage = components['schemas']['ServiceRequestPage'];
export type CreateServiceRequest = components['schemas']['CreateServiceRequest'];
export type ServiceRequestStatus = components['schemas']['ServiceRequestStatus'];

export async function fetchRequests(params: Record<string, string>): Promise<ServiceRequestPage> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/requests?${query}`);
    if (!res.ok) throw new Error('Falha ao carregar os pedidos');
    return res.json();
}

export async function createRequest(payload: CreateServiceRequest): Promise<ServiceRequest> {
    const res = await fetch('/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Erro ao criar pedido');
    return res.json();
}

export async function updateRequestStatus(
    requestId: string,
    status: ServiceRequestStatus,
    version: number
): Promise<ServiceRequest> {
    const res = await fetch(`/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, version }),
    });

    if (res.status === 409) {
        throw new Error('CONFLITO_CONCORRENCIA');
    }
    if (!res.ok) {
        throw new Error('TRANSICAO_INVALIDA');
    }

    return res.json();
}

export async function fetchRequestById(requestId: string): Promise<ServiceRequest> {
    const res = await fetch(`/requests/${requestId}`);
    if (!res.ok) throw new Error('Pedido não encontrado');
    return res.json();
}