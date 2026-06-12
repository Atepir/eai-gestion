import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, Building2, Contact2, FileText,
    Receipt, CreditCard, Gauge, AlertTriangle, X,
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Propriétaires', href: '/owners', icon: Users },
    { label: 'Biens', href: '/properties', icon: Building2 },
    { label: 'Locataires', href: '/tenants', icon: Contact2 },
    { label: 'Contrats', href: '/contracts', icon: FileText },
    { label: 'Factures', href: '/invoices', icon: Receipt },
    { label: 'Paiements', href: '/payments', icon: CreditCard },
    { label: 'Compteurs', href: '/meters', icon: Gauge },
    { label: 'Résiliations', href: '/terminations', icon: AlertTriangle },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const linkClass = ({ isActive }: { isActive: boolean }) =>
        clsx(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
            isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white',
        );

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
            )}

            <aside
                className={clsx(
                    'fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
                    open ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="flex h-16 items-center justify-between border-b border-slate-700 px-6">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-400" />
                        <span className="text-lg font-semibold">EAI Gestion</span>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white lg:hidden">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                    {navigation.map((item) => (
                        <NavLink key={item.href} to={item.href} className={linkClass} onClick={onClose}>
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}
