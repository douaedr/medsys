import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Eye, ArrowLeft, Save, Users2, UserPlus, UserMinus, CheckCircle, XCircle } from 'lucide-react';
import { equipeService, personnelService, infirmierService, medecinService } from '../../services';
import type { EquipeDto, PersonnelDto } from '../../types';
import { Periodicite, PERIODICITE_LABELS } from '../../types';
import {
  PageHeader, LoadingPage, TableSkeleton, ConfirmDialog, EmptyState,
  Pagination, Modal, Badge, FormField, Spinner, SearchInput,
} from '../../components/common';

// ===== LIST =====
export function EquipeList() {
  const navigate = useNavigate();
  const [equipes, setEquipes] = useState<EquipeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, [page]);

  async function load() {
    setLoading(true);
    try {
      const res = await equipeService.getAll({ page, taillePage: 10 });
      setEquipes(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch { setEquipes([]); } finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await equipeService.delete(deleteId);
      toast.success('Équipe supprimée');
      setDeleteId(null);
      load();
    } catch {} finally { setDeleting(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Équipes"
        subtitle={`${total} équipe(s)`}
        actions={
          <button onClick={() => navigate('/equipes/nouveau')} className="btn-primary">
            <Plus size={16} /> Nouvelle équipe
          </button>
        }
      />
      <div className="card">
        {loading ? <TableSkeleton rows={6} cols={5} /> : equipes.length === 0 ? (
          <EmptyState message="Aucune équipe" icon={<Users2 size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Nom</th>
                  <th className="table-th">Périodicité</th>
                  <th className="table-th">Effectif</th>
                  <th className="table-th">Membres</th>
                  <th className="table-th w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {equipes.map(e => {
                  const conforme = e.membreIds.length >= e.effectifMinimum;
                  return (
                    <tr key={e.id} className="table-tr">
                      <td className="table-td font-medium text-slate-800">{e.nom}</td>
                      <td className="table-td">
                        <Badge label={PERIODICITE_LABELS[e.periodicite]} className="bg-slate-100 text-slate-600" />
                      </td>
                      <td className="table-td">
                        <div className="text-xs text-slate-500">
                          Min: {e.effectifMinimum} / Cible: {e.effectifCible}
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-800">{e.membreIds.length}</span>
                          {conforme ? (
                            <CheckCircle size={14} className="text-emerald-500" />
                          ) : (
                            <XCircle size={14} className="text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/equipes/${e.id}`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => navigate(`/equipes/${e.id}/modifier`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-amber-600">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} taillePage={10} onPageChange={setPage} />
      </div>
      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Supprimer l'équipe" message="Voulez-vous vraiment supprimer cette équipe ?" loading={deleting}
      />
    </div>
  );
}

// ===== FORM =====
const equipeSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  periodicite: z.coerce.number(),
  effectifCible: z.coerce.number().min(1),
  effectifMinimum: z.coerce.number().min(1),
  chefEquipeId: z.string().optional(),
  encadrantId: z.string().optional(),
  chefDeServiceId: z.string().optional(),
  membreIds: z.array(z.string()).default([]),
});

type EquipeFormData = z.infer<typeof equipeSchema>;

export function EquipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'nouveau';
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [personnel, setPersonnel] = useState<PersonnelDto[]>([]);
  const [infirmiers, setInfirmiers] = useState<any[]>([]);
  const [medecins, setMedecins] = useState<any[]>([]);
  const [selectedMembres, setSelectedMembres] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EquipeFormData>({
    resolver: zodResolver(equipeSchema),
    defaultValues: { periodicite: Periodicite.HEBDOMADAIRE, effectifCible: 5, effectifMinimum: 3, membreIds: [] },
  });

  useEffect(() => {
    // Load personnel lists for selects
    Promise.allSettled([
      personnelService.getAll({ taillePage: 100 }),
      infirmierService.getAll(),
      medecinService.getAll(),
    ]).then(([pRes, iRes, mRes]) => {
      if (pRes.status === 'fulfilled') setPersonnel(pRes.value.data.items || []);
      if (iRes.status === 'fulfilled') setInfirmiers(Array.isArray(iRes.value.data) ? iRes.value.data : []);
      if (mRes.status === 'fulfilled') setMedecins(Array.isArray(mRes.value.data) ? mRes.value.data : []);
    });

    if (isEdit && id) {
      equipeService.getById(id).then(res => {
        const e = res.data;
        reset({
          nom: e.nom, periodicite: e.periodicite, effectifCible: e.effectifCible,
          effectifMinimum: e.effectifMinimum, chefEquipeId: e.chefEquipeId || '',
          encadrantId: e.encadrantId || '', chefDeServiceId: e.chefDeServiceId || '',
          membreIds: e.membreIds,
        });
        setSelectedMembres(e.membreIds);
      }).catch(() => navigate('/equipes')).finally(() => setLoading(false));
    }
  }, [id]);

  async function onSubmit(data: EquipeFormData) {
    setSaving(true);
    try {
      const payload = { ...data, membreIds: selectedMembres };
      if (isEdit && id) {
        await equipeService.update(id, payload);
        toast.success('Équipe mise à jour');
      } else {
        await equipeService.create(payload);
        toast.success('Équipe créée');
      }
      navigate('/equipes');
    } catch {} finally { setSaving(false); }
  }

  if (loading) return <LoadingPage />;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/equipes" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
        <h1 className="page-title">{isEdit ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <FormField label="Nom de l'équipe" error={errors.nom?.message} required>
          <input {...register('nom')} className="input-field" placeholder="Équipe Chirurgie A" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Périodicité" error={errors.periodicite?.message} required>
            <select {...register('periodicite')} className="select-field">
              {Object.entries(PERIODICITE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
          <FormField label="Effectif cible" error={errors.effectifCible?.message} required>
            <input {...register('effectifCible')} type="number" min="1" className="input-field" />
          </FormField>
          <FormField label="Effectif minimum" error={errors.effectifMinimum?.message} required>
            <input {...register('effectifMinimum')} type="number" min="1" className="input-field" />
          </FormField>
        </div>

        <hr className="border-slate-100" />
        <div className="text-sm font-semibold text-slate-600">Responsables</div>

        <FormField label="Chef d'équipe (Infirmier Majorant)">
          <select {...register('chefEquipeId')} className="select-field">
            <option value="">— Sélectionner —</option>
            {infirmiers.filter((i: any) => i.typeInfirmier === 1).map((i: any) => (
              <option key={i.id} value={i.id}>{i.prenom} {i.nom}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Encadrant (Médecin Sénior / Chef de Service)">
          <select {...register('encadrantId')} className="select-field">
            <option value="">— Sélectionner —</option>
            {medecins.filter((m: any) => m.typeMedecin >= 2).map((m: any) => (
              <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Chef de service">
          <select {...register('chefDeServiceId')} className="select-field">
            <option value="">— Sélectionner —</option>
            {medecins.filter((m: any) => m.typeMedecin === 3).map((m: any) => (
              <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
            ))}
          </select>
        </FormField>

        <hr className="border-slate-100" />
        <div className="text-sm font-semibold text-slate-600">Membres ({selectedMembres.length})</div>
        <div className="border border-slate-100 rounded-lg max-h-48 overflow-y-auto">
          {personnel.length === 0 ? (
            <div className="p-4 text-sm text-slate-400 text-center">Aucun personnel disponible</div>
          ) : (
            personnel.map(p => (
              <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMembres.includes(p.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedMembres(prev => [...prev, p.id]);
                    else setSelectedMembres(prev => prev.filter(id => id !== p.id));
                  }}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">{p.prenom} {p.nom}</span>
                <span className="text-xs text-slate-400 ml-auto">{p.poste}</span>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/equipes" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Save size={15} />{isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ===== DETAILS =====
export function EquipeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipe, setEquipe] = useState<EquipeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [allPersonnel, setAllPersonnel] = useState<PersonnelDto[]>([]);
  const [addingId, setAddingId] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const [effectif, setEffectif] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    load();
    personnelService.getAll({ taillePage: 200 }).then(res => setAllPersonnel(res.data.items || []));
    equipeService.verifierEffectif(id).then(res => setEffectif(res.data)).catch(() => {});
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await equipeService.getById(id!);
      setEquipe(res.data);
    } catch { navigate('/equipes'); } finally { setLoading(false); }
  }

  async function addMembre() {
    if (!addingId || !id) return;
    try {
      await equipeService.addMembre(id, addingId);
      toast.success('Membre ajouté');
      setAddModal(false);
      setAddingId('');
      load();
    } catch {}
  }

  async function removeMembre(personnelId: string) {
    if (!id) return;
    setRemoving(personnelId);
    try {
      await equipeService.removeMembre(id, personnelId);
      toast.success('Membre retiré');
      load();
    } catch {} finally { setRemoving(null); }
  }

  if (loading) return <LoadingPage />;
  if (!equipe) return null;

  const nonMembres = allPersonnel.filter(p => !equipe.membreIds.includes(p.id));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/equipes" className="btn-ghost"><ArrowLeft size={16} /> Retour</Link>
      </div>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>{equipe.nom}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge label={PERIODICITE_LABELS[equipe.periodicite]} className="bg-slate-100 text-slate-600" />
              {equipe.membreIds.length >= equipe.effectifMinimum ? (
                <Badge label="Effectif conforme" className="bg-emerald-100 text-emerald-800" />
              ) : (
                <Badge label="Effectif insuffisant" className="bg-red-100 text-red-800" />
              )}
            </div>
          </div>
          <Link to={`/equipes/${id}/modifier`} className="btn-secondary">
            <Pencil size={15} /> Modifier
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Membres</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{equipe.membreIds.length}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Effectif min</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{equipe.effectifMinimum}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">Effectif cible</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{equipe.effectifCible}</div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">Membres de l'équipe</div>
          <button onClick={() => setAddModal(true)} className="btn-primary">
            <UserPlus size={15} /> Ajouter
          </button>
        </div>

        {equipe.membreIds.length === 0 ? (
          <EmptyState message="Aucun membre dans cette équipe" icon={<Users2 size={32} />} />
        ) : (
          <div className="space-y-2">
            {equipe.membreIds.map(memberId => {
              const membre = allPersonnel.find(p => p.id === memberId);
              if (!membre) return (
                <div key={memberId} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-400 font-mono">{memberId}</span>
                  <button onClick={() => removeMembre(memberId)} disabled={removing === memberId} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                    <UserMinus size={15} />
                  </button>
                </div>
              );
              return (
                <div key={memberId} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                      {membre.prenom[0]}{membre.nom[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{membre.prenom} {membre.nom}</div>
                      <div className="text-xs text-slate-400">{membre.poste}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMembre(memberId)}
                    disabled={removing === memberId}
                    className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    {removing === memberId ? <Spinner size="sm" /> : <UserMinus size={15} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Ajouter un membre">
        <div className="space-y-4">
          <FormField label="Sélectionner un personnel">
            <select value={addingId} onChange={e => setAddingId(e.target.value)} className="select-field">
              <option value="">— Sélectionner —</option>
              {nonMembres.map(p => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom} ({p.poste})</option>
              ))}
            </select>
          </FormField>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAddModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={addMembre} disabled={!addingId} className="btn-primary">
              <UserPlus size={15} /> Ajouter
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
