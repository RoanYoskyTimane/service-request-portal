import { http, HttpResponse } from 'msw';
import { mockRequests, type ServiceRequest } from './data';
import type { components } from '../api/schema';

let requestsStore = [...mockRequests];

export const handlers = [
    // 1. GET /requests (List, Filter, Search, Sort, Paginate)
    http.get('/requests', ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get('search')?.toLowerCase();
        const status = url.searchParams.get('status');
        const priority = url.searchParams.get('priority');
        const sort = url.searchParams.get('sort') || '-createdAt';
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

        let filtered = [...requestsStore];

        if (search) {
            filtered = filtered.filter(
                (r) =>
                    r.title.toLowerCase().includes(search) ||
                    r.requesterName.toLowerCase().includes(search)
            );
        }

        if (status) {
            filtered = filtered.filter((r) => r.status === status);
        }

        if (priority) {
            filtered = filtered.filter((r) => r.priority === priority);
        }

        // Ordenação
        filtered.sort((a, b) => {
            if (sort === '-createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sort === 'createdAt') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            if (sort === '-updatedAt') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            if (sort === 'updatedAt') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            return 0;
        });

        const total = filtered.length;
        const totalPages = Math.ceil(total / pageSize) || 0;
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);

        return HttpResponse.json({
            items,
            page,
            pageSize,
            total,
            totalPages,
        });
    }),

    // 2. GET /requests/:requestId (Detail)
    http.get('/requests/:requestId', ({ params }) => {
        const { requestId } = params;
        const item = requestsStore.find((r) => r.id === requestId);

        if (!item) {
            return HttpResponse.json(
                { title: 'Service request not found', status: 404, detail: `No request with id ${requestId}` },
                { status: 404 }
            );
        }

        return HttpResponse.json(item);
    }),

    // 3. POST /requests (Create)
    http.post('/requests', async ({ request }) => {
        const body = (await request.json()) as components['schemas']['CreateServiceRequest'];

        const newRequest: ServiceRequest = {
            id: `REQ-${1000 + requestsStore.length + 1}`,
            title: body.title,
            description: body.description,
            category: body.category,
            priority: body.priority,
            status: 'OPEN',
            requesterName: body.requesterName,
            requesterEmail: body.requesterEmail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
        };

        requestsStore.unshift(newRequest);

        return HttpResponse.json(newRequest, {
            status: 201,
            headers: { Location: `/api/requests/${newRequest.id}` },
        });
    }),

    // 4. PATCH /requests/:requestId/status (State Machine & Optimistic Concurrency Check)
    http.patch('/requests/:requestId/status', async ({ params, request }) => {
        const { requestId } = params;
        const body = (await request.json()) as components['schemas']['UpdateServiceRequestStatus'];

        const index = requestsStore.findIndex((r) => r.id === requestId);
        if (index === -1) {
            return HttpResponse.json({ title: 'Not Found', status: 404 }, { status: 404 });
        }

        const currentReq = requestsStore[index];

        // Validação de Concorrência Otimista (409 Conflict)
        if (body.version !== currentReq.version) {
            return HttpResponse.json(
                {
                    type: 'https://api.example.test/problems/version-conflict',
                    title: 'Update conflict',
                    status: 409,
                    detail: 'The request was updated by someone else. Refresh and try again.',
                },
                { status: 409 }
            );
        }

        // Regras de Transição de Estado
        const validTransitions: Record<string, string[]> = {
            OPEN: ['IN_PROGRESS', 'CLOSED'],
            IN_PROGRESS: ['RESOLVED', 'OPEN'],
            RESOLVED: ['CLOSED', 'IN_PROGRESS'],
            CLOSED: [],
        };

        if (!validTransitions[currentReq.status]?.includes(body.status)) {
            return HttpResponse.json(
                {
                    type: 'https://api.example.test/problems/validation-error',
                    title: 'Invalid status transition',
                    status: 422,
                    detail: `Transition from ${currentReq.status} to ${body.status} is not allowed.`,
                },
                { status: 422 }
            );
        }

        // Atualização com incremento de versão
        const updatedReq: ServiceRequest = {
            ...currentReq,
            status: body.status,
            version: currentReq.version + 1,
            updatedAt: new Date().toISOString(),
        };

        requestsStore[index] = updatedReq;
        return HttpResponse.json(updatedReq);
    }),
];