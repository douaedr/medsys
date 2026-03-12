import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import { personnelService } from '../../services';
import { Statut, STATUT_LABELS } from '../../types';
import { FormField, LoadingPage, Spinner } from '../../components/common';
import { useState } from 'react';

const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  courriel: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  matricule: z.string().min(1, 'Matricule requis'),
  statut: z.coerce.number(),
  dateEmbauche: z.string().min(1, 'Date requise'),
  poste: z.string().min(1, 'Poste requis'),
});

type FormData = z.infer<typeof schema>;

export default function PersonnelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { statut: Statut.ACTIF },
  });

  useEffect(() => {
    if (isEdit && id) {
      personnelService.getById(id).then(res => {
        const p = res.data;
        reset({
          nom: p.nom,
          prenom: p.prenom,
          courriel: p.courriel,
          telephone: p.telephone || '',
          matricule: p.matricule,
          statut: p.statut,
          dateEmbauche: p.dateEmbauche.substring(0, 10),
          poste: p.poste,
        });
      }).catch(() => navigate('/personnel'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      if (isEdit && id) {
        await personnelService.update(id, data);
        toast.success('Personnel mis à jour');
      } else {
        await personnelService.create(data);
        toast.success('Personnel créé');
      }
      navigate('/personnel');
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/personnel" className="btn-ghost">
          <ArrowLeft size={16} /> Retour
        </Link>
        <div>
          <h1 className="page-title">{isEdit ? 'Modifier le personnel' : 'Nouveau personnel'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Prénom" error={errors.prenom?.message} required>
            <input {...register('prenom')} className="input-field" placeholder="Jean" />
          </FormField>
          <FormField label="Nom" error={errors.nom?.message} required>
            <input {...register('nom')} className="input-field" placeholder="Dupont" />
          </FormField>
        </div>

        <FormField label="Courriel" error={errors.courriel?.message} required>
          <input {...register('courriel')} type="email" className="input-field" placeholder="jean.dupont@hopital.fr" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Téléphone" error={errors.telephone?.message}>
            <input {...register('telephone')} className="input-field" placeholder="+33 6 12 34 56 78" />
          </FormField>
          <FormField label="Matricule" error={errors.matricule?.message} required>
            <input {...register('matricule')} className="input-field" placeholder="MAT-001" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Poste" error={errors.poste?.message} required>
            <input {...register('poste')} className="input-field" placeholder="Infirmier chef" />
          </FormField>
          <FormField label="Statut" error={errors.statut?.message} required>
            <select {...register('statut')} className="select-field">
              {Object.entries(STATUT_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Date d'embauche" error={errors.dateEmbauche?.message} required>
          <input {...register('dateEmbauche')} type="date" className="input-field" />
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/personnel" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}
            <Save size={15} />
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
