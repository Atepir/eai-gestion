import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createProperty, updateProperty, getProperty } from '../../api/properties.api';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/ui/PageHeader';

const schema = z.object({
    designation: z.string().min(1, 'Requis'),
    street: z.string().min(1, 'Requis'),
    city: z.string().min(1, 'Requis'),
    zip: z.string().min(1, 'Requis'),
    type: z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND']),
});

type FormData = z.infer<typeof schema>;

const typeOptions = [
    { value: 'APARTMENT', label: 'Appartement' },
    { value: 'HOUSE', label: 'Maison' },
    { value: 'COMMERCIAL', label: 'Local commercial' },
    { value: 'LAND', label: 'Terrain' },
];

export function PropertyFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: existing } = useQuery({
        queryKey: ['property', id],
        queryFn: () => getProperty(id!),
        enabled: isEdit,
    });

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        values: existing ? {
            designation: existing.designation,
            street: existing.address.street,
            city: existing.address.city,
            zip: existing.address.zip,
            type: existing.type,
        } : undefined,
    });

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            isEdit ? updateProperty(id!, data) : createProperty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            navigate('/properties');
        },
    });

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';
    const errorClass = 'mt-1 text-xs text-red-600';

    return (
        <div>
            <PageHeader title={isEdit ? 'Modifier le bien' : 'Nouveau bien'} />
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-xl rounded-xl bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Désignation</label>
                        <input {...register('designation')} className={inputClass} placeholder="Ex: Appartement 3B" />
                        {errors.designation && <p className={errorClass}>{errors.designation.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Rue</label>
                        <input {...register('street')} className={inputClass} />
                        {errors.street && <p className={errorClass}>{errors.street.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Ville</label>
                            <input {...register('city')} className={inputClass} />
                            {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Code postal</label>
                            <input {...register('zip')} className={inputClass} />
                            {errors.zip && <p className={errorClass}>{errors.zip.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Type</label>
                        <select {...register('type')} className={inputClass}>
                            {typeOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        {errors.type && <p className={errorClass}>{errors.type.message}</p>}
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/properties')}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
