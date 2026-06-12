import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTenant, updateTenant, getTenant } from '../../api/tenants.api';
import { PageHeader } from '../../components/ui/PageHeader';

const schema = z.object({
    firstName: z.string().min(1, 'Requis'),
    lastName: z.string().min(1, 'Requis'),
    idDocumentType: z.string().min(1, 'Requis'),
    idDocumentNumber: z.string().min(1, 'Requis'),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    profession: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function TenantFormPage() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: existing } = useQuery({
        queryKey: ['tenant', id],
        queryFn: () => getTenant(id!),
        enabled: isEdit,
    });

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        values: existing ? {
            firstName: existing.firstName,
            lastName: existing.lastName,
            idDocumentType: existing.idDocumentType,
            idDocumentNumber: existing.idDocumentNumber,
            phone: existing.phone ?? '',
            email: existing.email ?? '',
            profession: existing.profession ?? '',
        } : undefined,
    });

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            isEdit ? updateTenant(id!, data) : createTenant(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            navigate('/tenants');
        },
    });

    const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none';
    const errorClass = 'mt-1 text-xs text-red-600';

    return (
        <div>
            <PageHeader title={isEdit ? 'Modifier le locataire' : 'Nouveau locataire'} />
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-xl rounded-xl bg-white p-6 shadow-sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Prénom</label>
                            <input {...register('firstName')} className={inputClass} />
                            {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nom</label>
                            <input {...register('lastName')} className={inputClass} />
                            {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Type pièce</label>
                        <input {...register('idDocumentType')} className={inputClass} placeholder="CNI, Passeport..." />
                        {errors.idDocumentType && <p className={errorClass}>{errors.idDocumentType.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">N° pièce</label>
                        <input {...register('idDocumentNumber')} className={inputClass} />
                        {errors.idDocumentNumber && <p className={errorClass}>{errors.idDocumentNumber.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                        <input {...register('phone')} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input {...register('email')} className={inputClass} />
                        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Profession</label>
                        <input {...register('profession')} className={inputClass} />
                    </div>
                </div>
                <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                        {isSubmitting ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
                    </button>
                    <button type="button" onClick={() => navigate('/tenants')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}
