import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from '../ui/KpiCard';

describe('KpiCard', () => {
    it('should render label and value', () => {
        render(
            <KpiCard
                label="Factures impayées"
                value={12}
                icon={<span data-testid="icon">📄</span>}
                colorClass="bg-red-500"
            />,
        );
        expect(screen.getByText('Factures impayées')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should render with different values', () => {
        render(
            <KpiCard
                label="Biens vacants"
                value={0}
                icon={<span>🏠</span>}
                colorClass="bg-blue-500"
            />,
        );
        expect(screen.getByText('Biens vacants')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
    });
});
