import { describe, it, expect } from 'vitest';
import type { ServiceRequestStatus } from '../api/requestsApi';

function getValidTransitions(currentStatus: ServiceRequestStatus): ServiceRequestStatus[] {
    const transitions: Record<string, ServiceRequestStatus[]> = {
        OPEN: ['IN_PROGRESS', 'CLOSED'],
        IN_PROGRESS: ['RESOLVED', 'OPEN'],
        RESOLVED: ['CLOSED', 'IN_PROGRESS'],
        CLOSED: [],
    };
    return transitions[currentStatus] || [];
}

describe('Regras de Transição de Status', () => {
    it('Deve permitir transitar de OPEN para IN_PROGRESS ou CLOSED', () => {
        expect(getValidTransitions('OPEN')).toEqual(['IN_PROGRESS', 'CLOSED']);
    });

    it('Deve permitir transitar de IN_PROGRESS para RESOLVED ou OPEN', () => {
        expect(getValidTransitions('IN_PROGRESS')).toEqual(['RESOLVED', 'OPEN']);
    });

    it('Deve permitir transitar de RESOLVED para CLOSED ou IN_PROGRESS', () => {
        expect(getValidTransitions('RESOLVED')).toEqual(['CLOSED', 'IN_PROGRESS']);
    });

    it('Não deve permitir nenhuma transição a partir do estado CLOSED (terminal)', () => {
        expect(getValidTransitions('CLOSED')).toEqual([]);
    });
});