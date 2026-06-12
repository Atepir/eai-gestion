import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface DataTableColumn<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    rowLink?: (item: T) => string;
    loading?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
}

export function DataTable<T extends { id: string }>({
    columns,
    data,
    rowLink,
    loading,
    searchable = false,
    searchPlaceholder = 'Rechercher...',
}: DataTableProps<T>) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const filteredData = searchable && search
        ? data.filter((item) =>
            columns.some((col) => {
                const val = (item as Record<string, unknown>)[col.key];
                return String(val ?? '').toLowerCase().includes(search.toLowerCase());
            }),
        )
        : data;

    if (loading) {
        return (
            <div className="rounded-xl bg-white p-8">
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 rounded bg-slate-200" />
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {searchable && (
                <div className="border-b border-slate-200 px-4 py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>
            )}
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 ${col.className ?? ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item) => (
                        <tr
                            key={item.id}
                            className={`border-b border-slate-100 transition-colors ${rowLink ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                            onClick={() => rowLink && navigate(rowLink(item))}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className={`px-4 py-3 text-sm text-slate-700 ${col.className ?? ''}`}>
                                    {col.render
                                        ? col.render(item)
                                        : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
