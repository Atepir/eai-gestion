import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="text-sm text-slate-500">
                    {user?.role === 'ADMIN' ? 'Administrateur' : 'Propriétaire'}
                </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user?.email}</span>
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user?.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}
                >
                    {user?.role === 'ADMIN' ? 'Admin' : 'Owner'}
                </span>
                <button
                    onClick={logout}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Déconnexion"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
