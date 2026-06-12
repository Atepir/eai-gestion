import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createContract } from '../../api/contracts.api';
import { getProperties, type PropertyDto } from '../../api/properties.api';
import { getTenants, type TenantDto } from '../../api/tenants.api';
import { PageHeader } from '../../components/ui/PageHeader';

const schema = z.object({
    propertyId: z.string().min(1, 'Requis'),
    tenantId: z.string().min(1, 'Requis'),
    monthlyRent: z.coerce.number().min(1, 'Requis'),
    startDate: z.string().min(1, 'Requis'),
    endDate: z.string().min(1, 'Requis'),
}).refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
});

type FormData = z.infer<typeof schema>;

export function ContractFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: properties } = useQuery({
        queryKey: ['properties'],
        queryFn: getProperties,
    });
    const { data: tenants } = useQuery({
        queryKey: ['tenants'],
        queryFn: getTenants,
    });

    const vacantProperties = properties?.filter((p: PropertyDto) => p.status === 'VACANT') ?? [];

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { monthlyRent: undefined as unknown as number },
    });

    const mutation = useMutation({
        mutationFn: (data: FormData) => createContract(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            navigate('/contracts');
        },
    });

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';
    const errorClass = 'mt-1 text-xs text-red-600';

    return (
        <div>
            <PageHeader title="Nouveau contrat" />
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-xl rounded-xl bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Bien</label>
                        <select {...register('propertyId')} className={inputClass}>
                            <option value="">Sélectionner un bien vacant...</option>
                            {vacantProperties.map((p: PropertyDto) => (
                                <option key={p.id} value={p.id}>
                                    {p.designation} — {p.address.street}, {p.address.city}
                                </option>
                            ))}
                        </select>
                        {errors.propertyId && <p className={errorClass}>{errors.propertyId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Locataire</label>
                        <select {...register('tenantId')} className={inputClass}>
                            <option value="">Sélectionner un locataire...</option>
                            {tenants?.map((t: TenantDto) => (
                                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                            ))}
                        </select>
                        {errors.tenantId && <p className={errorClass}>{errors.tenantId.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Loyer mensuel (XOF)</label>
                        <input type="number" {...register('monthlyRent')} className={inputClass} placeholder="Ex: 150000" />
                        {errors.monthlyRent && <p className={errorClass}>{errors.monthlyRent.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Date de début</label>
                            <input type="date" {...register('startDate')} className={inputClass} />
                            {errors.startDate && <p className={errorClass}>{errors.startDate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Date de fin</label>
                            <input type="date" {...register('endDate')} className={inputClass} />
                            {errors.endDate && <p className={errorClass}>{errors.endDate.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={isSubmitting}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                        {isSubmitting ? 'Création...' : 'Créer le contrat'}
                    </button>
                    <button type="button" onClick={() => navigate('/contracts')}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
