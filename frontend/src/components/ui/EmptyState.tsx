import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    icon?: ReactNode;
}

export function EmptyState({ title, message, actionLabel, actionHref, onAction, icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-16">
            {icon && <div className="mb-4 text-slate-400">{icon}</div>}
            <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    {actionLabel}
                </button>
            )}
            {actionLabel && actionHref && !onAction && (
                <Link
                    to={actionHref}
                    className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
