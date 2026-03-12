import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Eye, ArrowLeft, Save, Clock } from 'lucide-react';
import { creneauService, planningService, personnelService } from '../../services';
import type { CreneauDto, PlanningDto, PersonnelDto } from '../../types';
import { TypeCreneau, StatutCreneau, TYPE_CRENEAU_LABELS, STATUT_CRENEAU_LABELS, STATUT_CRENEAU_COLORS } from '../../types';
import {
  PageHeader, LoadingPage, TableSkeleton, ConfirmDialog, EmptyState,
  Badge, FormField, Spinner, Modal,
} from '../../components/common';

export function CreneauList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [creneaux, setCreneaux] = useState<CreneauDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [planningFilter, setPlanningFilter] = useState(searchParams.get('planningId') || '');
  const [plannings, setPlannings] = useState<PlanningDto[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    planningService.getAll({ taillePage: 100 }).then(res => setPlannings(res.data.items || []));
    load();
  }, [planningFilter]);

  async function load() {
    setLoading(true);
    try {
      const params: any = {};
      if (planningFilter) params.planningId = planningFilter;
      const res = await creneauService.getAll(params);
      setCreneaux(Array.isArray(res.data) ? res.data : []);
    } catch { setCreneaux([]); } finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await creneauService.delete(deleteId);
      toast.success('Créneau supprimé');
      setDeleteId(null);
      load();
    } catch {} finally { setDeleting(false); }
  }

  async function handleAction(id: string, action: string) {
    try {
      if (action === 'confirmer') await creneauService.confirmer(id);
      if (action === 'commencer') await creneauService.commencer(id);
      if (action === 'terminer') await creneauService.terminer(id);
      if (action === 'annuler') await creneauService.annuler(id);
      toast.success('Action effectuée');
      load();
    } catch {}
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Créneaux"
        subtitle={`${creneaux.length} créneau(x)`}
        actions={
          <button onClick={() => navigate('/creneaux/nouveau')} className="btn-primary">
            <Plus size={16} /> Nouveau créneau
          </button>
        }
      />
      <div className="card">
        <div className="p-4 border-b border-slate-100 flex gap-3 flex-wrap">
          <select value={planningFilter} onChange={e => setPlanningFilter(e.target.value)} className="select-field w-64">
            <option value="">Tous les plannings</option>
            {plannings.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
          </select>
        </div>
        {loading ? <TableSkeleton rows={6} cols={5} /> : creneaux.length === 0 ? (
          <EmptyState message="Aucun créneau" icon={<Clock size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Type</th>
                  <th className="table-th">Début</th>
                  <th className="table-th">Fin</th>
                  <th className="table-th">Lieu</th>
                  <th className="table-th">Personnel</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {creneaux.map(c => (
                  <tr key={c.id} className="table-tr">
                    <td className="table-td">
                      <Badge label={TYPE_CRENEAU_LABELS[c.type]} className="bg-violet-50 text-violet-700" />
                    </td>
                    <td className="table-td text-xs text-slate-500">{new Date(c.debut).toLocaleString('fr-FR')}</td>
                    <td className="table-td text-xs text-slate-500">{new Date(c.fin).toLocaleString('fr-FR')}</td>
                    <td className="table-td text-slate-600">{c.lieu || '—'}</td>
                    <td className="table-td">
                      <span className="text-sm font-semibold">{c.personnelIds.length}</span>
                    </td>
                    <td className="table-td">
                      <Badge label={STATUT_CRENEAU_LABELS[c.statut]} className={STATUT_CRENEAU_COLORS[c.statut]} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 flex-wrap">
                        {c.statut === StatutCreneau.PLANIFIE && (
                          <button onClick={() => handleAction(c.id, 'confirmer')} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Confirmer</button>
                        )}
                        {c.statut === StatutCreneau.CONFIRME && (
                          <button onClick={() => handleAction(c.id, 'commencer')} className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100">Démarrer</button>
                        )}
                        {c.statut === StatutCreneau.EN_COURS && (
                          <button onClick={() => handleAction(c.id, 'terminer')} className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Terminer</button>
                        )}
                        <button onClick={() => navigate(`/creneaux/${c.id}/modifier`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-amber-600">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Supprimer le créneau" message="Voulez-vous supprimer ce créneau ?" loading={deleting} />
    </div>
  );
}

// ===== FORM =====
const schema = z.object({
  debut: z.string().min(1, 'Requis'),
  fin: z.string().min(1, 'Requis'),
  type: z.coerce.number(),
  statut: z.coerce.number(),
  lieu: z.string().optional(),
  planningId: z.string().min(1, 'Planning requis'),
});
type FormData = z.infer<typeof schema>;

export function CreneauForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [plannings, setPlannings] = useState<PlanningDto[]>([]);
  const [allPersonnel, setAllPersonnel] = useState<PersonnelDto[]>([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: TypeCreneau.MATIN, statut: StatutCreneau.PLANIFIE },
  });

  useEffect(() => {
    planningService.getAll({ taillePage: 100 }).then(res => setPlannings(res.data.items || []));
    personnelService.getAll({ taillePage: 200 }).then(res => setAllPersonnel(res.data.items || []));
    if (isEdit && id) {
      creneauService.getById(id).then(res => {
        const c = res.data;
        reset({
          debut: c.debut.substring(0, 16), fin: c.fin.substring(0, 16),
          type: c.type, statut: c.statut, lieu: c.lieu || '', planningId: c.planningId,
        });
        setSelectedPersonnel(c.personnelIds);
      }).catch(() => navigate('/creneaux')).finally(() => setLoading(false));
    }
  }, [id]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const payload = { ...data, personnelIds: selectedPersonnel };
      if (isEdit && id) { await creneauService.update(id, payload); toast.success('Créneau mis à jour'); }
      else { await creneauService.create(payload); toast.success('Créneau créé'); }
      navigate('/creneaux');
    } catch {} finally { setSaving(false); }
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/creneaux" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier le créneau' : 'Nouveau créneau'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Début" error={errors.debut?.message} required>
            <input {...register('debut')} type="datetime-local" className="input-field" />
          </FormField>
          <FormField label="Fin" error={errors.fin?.message} required>
            <input {...register('fin')} type="datetime-local" className="input-field" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Type" error={errors.type?.message} required>
            <select {...register('type')} className="select-field">
              {Object.entries(TYPE_CRENEAU_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
          <FormField label="Statut" error={errors.statut?.message} required>
            <select {...register('statut')} className="select-field">
              {Object.entries(STATUT_CRENEAU_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Lieu" error={errors.lieu?.message}>
            <input {...register('lieu')} className="input-field" placeholder="Salle 3B" />
          </FormField>
          <FormField label="Planning" error={errors.planningId?.message} required>
            <select {...register('planningId')} className="select-field">
              <option value="">— Sélectionner —</option>
              {plannings.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label={`Personnel assigné (${selectedPersonnel.length})`}>
          <div className="border border-slate-100 rounded-lg max-h-40 overflow-y-auto">
            {allPersonnel.map(p => (
              <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPersonnel.includes(p.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedPersonnel(prev => [...prev, p.id]);
                    else setSelectedPersonnel(prev => prev.filter(x => x !== p.id));
                  }}
                  className="rounded"
                />
                <span className="text-sm">{p.prenom} {p.nom}</span>
                <span className="text-xs text-slate-400 ml-auto">{p.poste}</span>
              </label>
            ))}
          </div>
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/creneaux" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Save size={15} />{isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
