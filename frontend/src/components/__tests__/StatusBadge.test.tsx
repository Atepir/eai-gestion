import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../ui/StatusBadge';

describe('StatusBadge', () => {
    it('should render the label', () => {
        render(<StatusBadge variant="success" label="Payée" />);
        expect(screen.getByText('Payée')).toBeInTheDocument();
    });

    it('should apply success (green) styles', () => {
        render(<StatusBadge variant="success" label="Actif" />);
        const badge = screen.getByText('Actif');
        expect(badge.className).toContain('bg-emerald-100');
        expect(badge.className).toContain('text-emerald-700');
    });

    it('should apply danger (red) styles', () => {
        render(<StatusBadge variant="danger" label="En retard" />);
        const badge = screen.getByText('En retard');
        expect(badge.className).toContain('bg-red-100');
        expect(badge.className).toContain('text-red-700');
    });

    it('should apply warning (amber) styles', () => {
        render(<StatusBadge variant="warning" label="Préavis" />);
        const badge = screen.getByText('Préavis');
        expect(badge.className).toContain('bg-amber-100');
        expect(badge.className).toContain('text-amber-700');
    });

    it('should apply neutral (slate) styles', () => {
        render(<StatusBadge variant="neutral" label="Terminé" />);
        const badge = screen.getByText('Terminé');
        expect(badge.className).toContain('bg-slate-100');
        expect(badge.className).toContain('text-slate-600');
    });

    it('should apply info (blue) styles', () => {
        render(<StatusBadge variant="info" label="Occupé" />);
        const badge = screen.getByText('Occupé');
        expect(badge.className).toContain('bg-blue-100');
        expect(badge.className).toContain('text-blue-700');
    });
});
