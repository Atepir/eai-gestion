import clsx from 'clsx';

const variants = {
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    neutral: 'bg-slate-100 text-slate-600',
    info: 'bg-blue-100 text-blue-700',
};

interface StatusBadgeProps {
    variant: keyof typeof variants;
    label: string;
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variants[variant],
            )}
        >
            {label}
        </span>
    );
}
