import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import { medecinService } from '../../services';
import { Statut, STATUT_LABELS, TypeMedecin, TYPE_MEDECIN_LABELS } from '../../types';
import { FormField, LoadingPage, Spinner } from '../../components/common';
import { GenericPersonnelList } from '../../components/common/GenericList';
import { useState } from 'react';
import { Badge } from '../../components/common';

// ===== List =====
export function MedecinList() {
  return (
    <GenericPersonnelList
      title="Médecins"
      fetchAll={() => medecinService.getAll()}
      deleteOne={(id) => medecinService.delete(id)}
      extraColumns={[
        {
          key: 'typeMedecin',
          label: 'Type',
          render: (p) => <Badge label={TYPE_MEDECIN_LABELS[p.typeMedecin as TypeMedecin] || p.type || '—'} className="bg-blue-50 text-blue-700" />,
        },
        { key: 'specialite', label: 'Spécialité' },
        { key: 'numeroOrdre', label: 'N° Ordre' },
      ]}
      createPath="/medecins/nouveau"
      editPath={(id) => `/medecins/${id}/modifier`}
    />
  );
}

// ===== Form =====
const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  courriel: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  matricule: z.string().min(1, 'Matricule requis'),
  statut: z.coerce.number(),
  dateEmbauche: z.string().min(1, 'Date requise'),
  poste: z.string().min(1, 'Poste requis'),
  type: z.coerce.number(),
  specialite: z.string().min(1, 'Spécialité requise'),
  numeroOrdre: z.string().min(1, 'Numéro ordre requis'),
  anneeExperience: z.coerce.number().optional(),
  departement: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function MedecinForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { statut: Statut.ACTIF, type: TypeMedecin.MEDECIN },
  });

  useEffect(() => {
    if (isEdit && id) {
      medecinService.getById(id).then(res => {
        const p = res.data;
        reset({
          nom: p.nom, prenom: p.prenom, courriel: p.courriel, telephone: p.telephone || '',
          matricule: p.matricule, statut: p.statut, dateEmbauche: p.dateEmbauche.substring(0, 10),
          poste: p.poste, type: p.typeMedecin, specialite: p.specialite || '',
          numeroOrdre: p.numeroOrdre || '', anneeExperience: p.anneeExperience,
          departement: p.departement || '',
        });
      }).catch(() => navigate('/medecins')).finally(() => setLoading(false));
    }
  }, [id]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      if (isEdit && id) {
        await medecinService.update(id, data);
        toast.success('Médecin mis à jour');
      } else {
        await medecinService.create(data);
        toast.success('Médecin créé');
      }
      navigate('/medecins');
    } catch {
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/medecins" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier le médecin' : 'Nouveau médecin'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Prénom" error={errors.prenom?.message} required>
            <input {...register('prenom')} className="input-field" />
          </FormField>
          <FormField label="Nom" error={errors.nom?.message} required>
            <input {...register('nom')} className="input-field" />
          </FormField>
        </div>
        <FormField label="Courriel" error={errors.courriel?.message} required>
          <input {...register('courriel')} type="email" className="input-field" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Téléphone" error={errors.telephone?.message}>
            <input {...register('telephone')} className="input-field" />
          </FormField>
          <FormField label="Matricule" error={errors.matricule?.message} required>
            <input {...register('matricule')} className="input-field" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Poste" error={errors.poste?.message} required>
            <input {...register('poste')} className="input-field" />
          </FormField>
          <FormField label="Statut" error={errors.statut?.message} required>
            <select {...register('statut')} className="select-field">
              {Object.entries(STATUT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Date d'embauche" error={errors.dateEmbauche?.message} required>
          <input {...register('dateEmbauche')} type="date" className="input-field" />
        </FormField>

        <hr className="border-slate-100" />
        <div className="text-sm font-semibold text-slate-600">Informations médicales</div>

        <FormField label="Type de médecin" error={errors.type?.message} required>
          <select {...register('type')} className="select-field" disabled={isEdit}>
            {Object.entries(TYPE_MEDECIN_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Spécialité" error={errors.specialite?.message} required>
            <input {...register('specialite')} className="input-field" placeholder="Cardiologie" />
          </FormField>
          <FormField label="Numéro d'ordre" error={errors.numeroOrdre?.message} required>
            <input {...register('numeroOrdre')} className="input-field" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Années d'expérience" error={errors.anneeExperience?.message}>
            <input {...register('anneeExperience')} type="number" min="0" className="input-field" />
          </FormField>
          <FormField label="Département" error={errors.departement?.message}>
            <input {...register('departement')} className="input-field" />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/medecins" className="btn-secondary">Annuler</Link>
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
