import { components } from '../api/schema';

export type ServiceRequest = components['schemas']['ServiceRequest'];

export const mockRequests: ServiceRequest[] = [
    {
        id: 'REQ-1001',
        title: 'Unable to access customer portal',
        description: 'The customer receives "Account locked" after signing in with valid credentials.',
        category: 'Access',
        priority: 'HIGH',
        status: 'OPEN',
        requesterName: 'Example Customer',
        requesterEmail: 'customer@example.com',
        createdAt: '2026-02-10T08:15:00Z',
        updatedAt: '2026-02-10T08:15:00Z',
        version: 1,
    },
    {
        id: 'REQ-1002',
        title: 'Duplicate invoice on February statement',
        description: 'Invoice INV-88213 appears twice on the February billing statement.',
        category: 'Billing',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        requesterName: 'Second Customer',
        requesterEmail: 'second.customer@example.com',
        createdAt: '2026-02-09T13:42:11Z',
        updatedAt: '2026-02-11T09:05:30Z',
        version: 4,
    },
];