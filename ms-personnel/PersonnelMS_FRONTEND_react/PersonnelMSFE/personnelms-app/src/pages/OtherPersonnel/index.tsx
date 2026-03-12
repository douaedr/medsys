import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';
import { infirmierService, aideSoignantService, brancardierService, secretaireService, directeurService } from '../../services';
import { Statut, STATUT_LABELS, TypeInfirmier, TYPE_INFIRMIER_LABELS } from '../../types';
import { FormField, LoadingPage, Spinner, Badge } from '../../components/common';
import { GenericPersonnelList } from '../../components/common/GenericList';

// ===== Base schema =====
const baseSchema = {
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  courriel: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  matricule: z.string().min(1, 'Matricule requis'),
  statut: z.coerce.number(),
  dateEmbauche: z.string().min(1, 'Date requise'),
  poste: z.string().min(1, 'Poste requis'),
};

function BasePersonnelFields({ register, errors }: { register: any; errors: any }) {
  return (
    <>
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
    </>
  );
}

// ========== INFIRMIERS ==========
export function InfirmierList() {
  return (
    <GenericPersonnelList
      title="Infirmiers"
      fetchAll={() => infirmierService.getAll()}
      deleteOne={(id) => infirmierService.delete(id)}
      extraColumns={[
        {
          key: 'typeInfirmier',
          label: 'Type',
          render: (p) => <Badge label={TYPE_INFIRMIER_LABELS[p.typeInfirmier as TypeInfirmier] || '—'} className="bg-emerald-50 text-emerald-700" />,
        },
        { key: 'service', label: 'Service' },
      ]}
      createPath="/infirmiers/nouveau"
      editPath={(id) => `/infirmiers/${id}/modifier`}
    />
  );
}

const infirmierSchema = z.object({ ...baseSchema, type: z.coerce.number(), service: z.string().optional(), uniteSoins: z.string().optional() });
type InfirmierFormData = z.infer<typeof infirmierSchema>;

export function InfirmierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InfirmierFormData>({
    resolver: zodResolver(infirmierSchema),
    defaultValues: { statut: Statut.ACTIF, type: TypeInfirmier.INFIRMIER },
  });
  useEffect(() => {
    if (isEdit && id) {
      infirmierService.getById(id).then(res => {
        const p = res.data;
        reset({ ...p, type: p.typeInfirmier, dateEmbauche: p.dateEmbauche.substring(0, 10) });
      }).catch(() => navigate('/infirmiers')).finally(() => setLoading(false));
    }
  }, [id]);
  async function onSubmit(data: InfirmierFormData) {
    setSaving(true);
    try {
      if (isEdit && id) { await infirmierService.update(id, data); toast.success('Infirmier mis à jour'); }
      else { await infirmierService.create(data); toast.success('Infirmier créé'); }
      navigate('/infirmiers');
    } catch {} finally { setSaving(false); }
  }
  if (loading) return <LoadingPage />;
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/infirmiers" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier' : 'Nouvel infirmier'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <BasePersonnelFields register={register} errors={errors} />
        <hr className="border-slate-100" />
        <FormField label="Type" error={(errors as any).type?.message} required>
          <select {...register('type')} className="select-field" disabled={isEdit}>
            {Object.entries(TYPE_INFIRMIER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Service" error={(errors as any).service?.message}>
            <input {...register('service')} className="input-field" />
          </FormField>
          <FormField label="Unité de soins" error={(errors as any).uniteSoins?.message}>
            <input {...register('uniteSoins')} className="input-field" />
          </FormField>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/infirmiers" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Save size={15} />{isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ========== AIDES-SOIGNANTS ==========
export function AideSoignantList() {
  return (
    <GenericPersonnelList
      title="Aides-soignants"
      fetchAll={() => aideSoignantService.getAll()}
      deleteOne={(id) => aideSoignantService.delete(id)}
      extraColumns={[{ key: 'unite', label: 'Unité' }]}
      createPath="/aides-soignants/nouveau"
      editPath={(id) => `/aides-soignants/${id}/modifier`}
    />
  );
}

const aideSoignantSchema = z.object({ ...baseSchema, unite: z.string().min(1, 'Unité requise') });
type AideSoignantFormData = z.infer<typeof aideSoignantSchema>;

export function AideSoignantForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AideSoignantFormData>({
    resolver: zodResolver(aideSoignantSchema),
    defaultValues: { statut: Statut.ACTIF },
  });
  useEffect(() => {
    if (isEdit && id) {
      aideSoignantService.getById(id).then(res => {
        const p = res.data;
        reset({ ...p, dateEmbauche: p.dateEmbauche.substring(0, 10) });
      }).catch(() => navigate('/aides-soignants')).finally(() => setLoading(false));
    }
  }, [id]);
  async function onSubmit(data: AideSoignantFormData) {
    setSaving(true);
    try {
      if (isEdit && id) { await aideSoignantService.update(id, data); toast.success('Mise à jour réussie'); }
      else { await aideSoignantService.create(data); toast.success('Aide-soignant créé'); }
      navigate('/aides-soignants');
    } catch {} finally { setSaving(false); }
  }
  if (loading) return <LoadingPage />;
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/aides-soignants" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier' : 'Nouvel aide-soignant'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <BasePersonnelFields register={register} errors={errors} />
        <hr className="border-slate-100" />
        <FormField label="Unité" error={(errors as any).unite?.message} required>
          <input {...register('unite')} className="input-field" placeholder="Soins intensifs" />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/aides-soignants" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Save size={15} />{isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ========== BRANCARDIERS ==========
export function BrancardierList() {
  return (
    <GenericPersonnelList
      title="Brancardiers"
      fetchAll={() => brancardierService.getAll()}
      deleteOne={(id) => brancardierService.delete(id)}
      extraColumns={[{ key: 'zoneCouverture', label: 'Zone de couverture' }]}
      createPath="/brancardiers/nouveau"
      editPath={(id) => `/brancardiers/${id}/modifier`}
    />
  );
}

const brancardierSchema = z.object({ ...baseSchema, zoneCouverture: z.string().min(1, 'Zone requise') });
type BrancardierFormData = z.infer<typeof brancardierSchema>;

export function BrancardierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BrancardierFormData>({
    resolver: zodResolver(brancardierSchema),
    defaultValues: { statut: Statut.ACTIF },
  });
  useEffect(() => {
    if (isEdit && id) {
      brancardierService.getById(id).then(res => {
        reset({ ...res.data, dateEmbauche: res.data.dateEmbauche.substring(0, 10) });
      }).catch(() => navigate('/brancardiers')).finally(() => setLoading(false));
    }
  }, [id]);
  async function onSubmit(data: BrancardierFormData) {
    setSaving(true);
    try {
      if (isEdit && id) { await brancardierService.update(id, data); toast.success('Mise à jour réussie'); }
      else { await brancardierService.create(data); toast.success('Brancardier créé'); }
      navigate('/brancardiers');
    } catch {} finally { setSaving(false); }
  }
  if (loading) return <LoadingPage />;
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/brancardiers" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier' : 'Nouveau brancardier'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <BasePersonnelFields register={register} errors={errors} />
        <hr className="border-slate-100" />
        <FormField label="Zone de couverture" error={(errors as any).zoneCouverture?.message} required>
          <input {...register('zoneCouverture')} className="input-field" placeholder="Bâtiment A, Urgences" />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/brancardiers" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Save size={15} />{isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ========== SECRÉTAIRES ==========
export function SecretaireList() {
  return (
    <GenericPersonnelList
      title="Secrétaires"
      fetchAll={() => secretaireService.getAll()}
      deleteOne={(id) => secretaireService.delete(id)}
      createPath="/secretaires/nouveau"
      editPath={(id) => `/secretaires/${id}/modifier`}
    />
  );
}

const secretaireSchema = z.object(baseSchema);
type SecretaireFormData = z.infer<typeof secretaireSchema>;

export function SecretaireForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SecretaireFormData>({
    resolver: zodResolver(secretaireSchema),
    defaultValues: { statut: Statut.ACTIF },
  });
  useEffect(() => {
    if (isEdit && id) {
      secretaireService.getById(id).then(res => {
        reset({ ...res.data, dateEmbauche: res.data.dateEmbauche.substring(0, 10) });
      }).catch(() => navigate('/secretaires')).finally(() => setLoading(false));
    }
  }, [id]);
  async function onSubmit(data: SecretaireFormData) {
    setSaving(true);
    try {
      if (isEdit && id) { await secretaireService.update(id, data); toast.success('Mise à jour réussie'); }
      else { await secretaireService.create(data); toast.success('Secrétaire créé(e)'); }
      navigate('/secretaires');
    } catch {} finally { setSaving(false); }
  }
  if (loading) return <LoadingPage />;
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/secretaires" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier' : 'Nouveau(elle) secrétaire'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <BasePersonnelFields register={register} errors={errors} />
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/secretaires" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Save size={15} />{isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ========== DIRECTEURS ==========
export function DirecteurList() {
  return (
    <GenericPersonnelList
      title="Directeurs"
      fetchAll={() => directeurService.getAll()}
      deleteOne={(id) => directeurService.delete(id)}
      createPath="/directeurs/nouveau"
      editPath={(id) => `/directeurs/${id}/modifier`}
    />
  );
}

const directeurSchema = z.object(baseSchema);
type DirecteurFormData = z.infer<typeof directeurSchema>;

export function DirecteurForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DirecteurFormData>({
    resolver: zodResolver(directeurSchema),
    defaultValues: { statut: Statut.ACTIF },
  });
  useEffect(() => {
    if (isEdit && id) {
      directeurService.getById(id).then(res => {
        reset({ ...res.data, dateEmbauche: res.data.dateEmbauche.substring(0, 10) });
      }).catch(() => navigate('/directeurs')).finally(() => setLoading(false));
    }
  }, [id]);
  async function onSubmit(data: DirecteurFormData) {
    setSaving(true);
    try {
      if (isEdit && id) { await directeurService.update(id, data); toast.success('Mise à jour réussie'); }
      else { await directeurService.create(data); toast.success('Directeur créé'); }
      navigate('/directeurs');
    } catch {} finally { setSaving(false); }
  }
  if (loading) return <LoadingPage />;
  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/directeurs" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier' : 'Nouveau directeur'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <BasePersonnelFields register={register} errors={errors} />
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/directeurs" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Save size={15} />{isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
