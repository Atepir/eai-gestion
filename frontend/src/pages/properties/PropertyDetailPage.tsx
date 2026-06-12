import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { getProperty } from '../../api/properties.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

const typeLabels: Record<string, string> = {
    APARTMENT: 'Appartement',
    HOUSE: 'Maison',
    COMMERCIAL: 'Local commercial',
    LAND: 'Terrain',
};

export function PropertyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: property, isLoading } = useQuery({
        queryKey: ['property', id],
        queryFn: () => getProperty(id!),
        enabled: Boolean(id),
    });

    if (isLoading) return <div className="animate-pulse h-40 rounded-xl bg-slate-200" />;
    if (!property) return <p>Bien introuvable</p>;

    return (
        <div>
            <PageHeader
                title={property.designation}
                action={
                    <div className="flex gap-2">
                        <Link
                            to={`/properties/${property.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <Pencil className="h-4 w-4" /> Modifier
                        </Link>
                    </div>
                }
            />
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <dl className="grid grid-cols-2 gap-4">
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Type</dt>
                        <dd className="text-sm text-slate-900">{typeLabels[property.type]}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Statut</dt>
                        <dd>
                            <StatusBadge
                                variant={property.status === 'OCCUPIED' ? 'info' : 'neutral'}
                                label={property.status === 'OCCUPIED' ? 'Occupé' : 'Vacant'}
                            />
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium text-slate-500">Adresse</dt>
                        <dd className="text-sm text-slate-900">
                            {property.address.street}, {property.address.zip} {property.address.city}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
