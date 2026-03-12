import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Eye, ArrowLeft, Save, Calendar, AlertTriangle } from 'lucide-react';
import { planningService, equipeService } from '../../services';
import type { PlanningDto, EquipeDto } from '../../types';
import { StatutPlanning, STATUT_PLANNING_LABELS, STATUT_PLANNING_COLORS } from '../../types';
import {
  PageHeader, LoadingPage, TableSkeleton, ConfirmDialog, EmptyState,
  Pagination, Badge, FormField, Spinner,
} from '../../components/common';

// ===== LIST =====
export function PlanningList() {
  const navigate = useNavigate();
  const [plannings, setPlannings] = useState<PlanningDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statutFilter, setStatutFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, [page, statutFilter]);

  async function load() {
    setLoading(true);
    try {
      const params: any = { page, taillePage: 10 };
      if (statutFilter !== '') params.statut = parseInt(statutFilter);
      const res = await planningService.getAll(params);
      setPlannings(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch { setPlannings([]); } finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await planningService.delete(deleteId);
      toast.success('Planning supprimé');
      setDeleteId(null);
      load();
    } catch {} finally { setDeleting(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Plannings"
        subtitle={`${total} planning(s)`}
        actions={
          <button onClick={() => navigate('/plannings/nouveau')} className="btn-primary">
            <Plus size={16} /> Nouveau planning
          </button>
        }
      />
      <div className="card">
        <div className="p-4 border-b border-slate-100 flex gap-3">
          <select value={statutFilter} onChange={e => { setStatutFilter(e.target.value); setPage(1); }} className="select-field w-48">
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_PLANNING_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {loading ? <TableSkeleton rows={6} cols={5} /> : plannings.length === 0 ? (
          <EmptyState message="Aucun planning" icon={<Calendar size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Nom</th>
                  <th className="table-th">Période</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th">Équipe</th>
                  <th className="table-th w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {plannings.map(p => (
                  <tr key={p.id} className="table-tr">
                    <td className="table-td font-medium text-slate-800">{p.nom}</td>
                    <td className="table-td text-slate-500 text-xs">
                      {new Date(p.dateDebut).toLocaleDateString('fr-FR')} → {new Date(p.dateFin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="table-td">
                      <Badge label={STATUT_PLANNING_LABELS[p.statut]} className={STATUT_PLANNING_COLORS[p.statut]} />
                    </td>
                    <td className="table-td text-slate-500 text-xs font-mono">{p.equipeId}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/plannings/${p.id}`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600">
                          <Eye size={15} />
                        </button>
                        <button onClick={() => navigate(`/plannings/${p.id}/modifier`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-amber-600">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} taillePage={10} onPageChange={setPage} />
      </div>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Supprimer le planning" message="Voulez-vous vraiment supprimer ce planning ?" loading={deleting} />
    </div>
  );
}

// ===== FORM =====
const schema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  dateDebut: z.string().min(1, 'Date de début requise'),
  dateFin: z.string().min(1, 'Date de fin requise'),
  statut: z.coerce.number(),
  equipeId: z.string().min(1, 'Équipe requise'),
});
type FormData = z.infer<typeof schema>;

export function PlanningForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [equipes, setEquipes] = useState<EquipeDto[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { statut: StatutPlanning.BROUILLON },
  });

  useEffect(() => {
    equipeService.getAll({ taillePage: 100 }).then(res => setEquipes(res.data.items || [])).catch(() => {});
    if (isEdit && id) {
      planningService.getById(id).then(res => {
        const p = res.data;
        reset({
          nom: p.nom, dateDebut: p.dateDebut.substring(0, 10),
          dateFin: p.dateFin.substring(0, 10), statut: p.statut, equipeId: p.equipeId,
        });
      }).catch(() => navigate('/plannings')).finally(() => setLoading(false));
    }
  }, [id]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      if (isEdit && id) { await planningService.update(id, data); toast.success('Planning mis à jour'); }
      else { await planningService.create(data); toast.success('Planning créé'); }
      navigate('/plannings');
    } catch {} finally { setSaving(false); }
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/plannings" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier le planning' : 'Nouveau planning'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <FormField label="Nom du planning" error={errors.nom?.message} required>
          <input {...register('nom')} className="input-field" placeholder="Planning Semaine 24" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Date de début" error={errors.dateDebut?.message} required>
            <input {...register('dateDebut')} type="date" className="input-field" />
          </FormField>
          <FormField label="Date de fin" error={errors.dateFin?.message} required>
            <input {...register('dateFin')} type="date" className="input-field" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Statut" error={errors.statut?.message} required>
            <select {...register('statut')} className="select-field">
              {Object.entries(STATUT_PLANNING_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
          <FormField label="Équipe" error={errors.equipeId?.message} required>
            <select {...register('equipeId')} className="select-field">
              <option value="">— Sélectionner —</option>
              {equipes.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </FormField>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/plannings" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Save size={15} />{isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== DETAILS =====
export function PlanningDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [planning, setPlanning] = useState<PlanningDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [conflits, setConflits] = useState<any[]>([]);
  const [actioning, setActioning] = useState('');
  const utilisateurId = localStorage.getItem('utilisateurId') || 'admin';

  useEffect(() => {
    if (!id) return;
    load();
    planningService.getConflits(id).then(res => setConflits(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await planningService.getById(id!);
      setPlanning(res.data);
    } catch { navigate('/plannings'); } finally { setLoading(false); }
  }

  async function action(fn: () => Promise<any>, label: string) {
    setActioning(label);
    try {
      await fn();
      toast.success(`Planning ${label}`);
      load();
    } catch {} finally { setActioning(''); }
  }

  if (loading) return <LoadingPage />;
  if (!planning) return null;

  const canEnValidation = planning.statut === StatutPlanning.BROUILLON;
  const canValider = planning.statut === StatutPlanning.EN_VALIDATION;
  const canPublier = planning.statut === StatutPlanning.VALIDE;
  const canArchiver = planning.statut === StatutPlanning.PUBLIE;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/plannings" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>{planning.nom}</h2>
            <div className="text-sm text-slate-500 mt-1">
              {new Date(planning.dateDebut).toLocaleDateString('fr-FR')} → {new Date(planning.dateFin).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge label={STATUT_PLANNING_LABELS[planning.statut]} className={STATUT_PLANNING_COLORS[planning.statut]} />
            </div>
          </div>
          <Link to={`/plannings/${id}/modifier`} className="btn-secondary">
            <Pencil size={15} /> Modifier
          </Link>
        </div>

        {/* Workflow actions */}
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100">
          {canEnValidation && (
            <button
              onClick={() => action(() => planningService.enValidation(id!, utilisateurId), 'soumis en validation')}
              disabled={!!actioning}
              className="btn-secondary"
            >
              {actioning === 'soumis en validation' && <Spinner size="sm" />}
              Soumettre en validation
            </button>
          )}
          {canValider && (
            <button
              onClick={() => action(() => planningService.valider(id!), 'validé')}
              disabled={!!actioning}
              className="btn-success"
            >
              {actioning === 'validé' && <Spinner size="sm" />}
              ✓ Valider
            </button>
          )}
          {canPublier && (
            <button
              onClick={() => action(() => planningService.publier(id!), 'publié')}
              disabled={!!actioning}
              className="btn-primary"
            >
              {actioning === 'publié' && <Spinner size="sm" />}
              Publier
            </button>
          )}
          {canArchiver && (
            <button
              onClick={() => action(() => planningService.archiver(id!), 'archivé')}
              disabled={!!actioning}
              className="btn-ghost"
            >
              {actioning === 'archivé' && <Spinner size="sm" />}
              Archiver
            </button>
          )}
        </div>
      </div>

      {conflits.length > 0 && (
        <div className="card p-5 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 text-amber-700 font-semibold mb-3">
            <AlertTriangle size={18} /> {conflits.length} conflit(s) détecté(s)
          </div>
          <div className="space-y-1">
            {conflits.map((c: any, i) => (
              <div key={i} className="text-sm text-amber-700">{c.message || JSON.stringify(c)}</div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">Créneaux du planning</div>
          <Link to={`/creneaux?planningId=${id}`} className="btn-secondary text-xs">
            Voir les créneaux
          </Link>
        </div>
        <div className="text-sm text-slate-500">
          Équipe: <span className="font-mono text-xs">{planning.equipeId}</span>
        </div>
      </div>
    </div>
  );
}
