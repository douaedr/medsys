import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Plus, Trash2, Check, X, UserX, ClipboardEdit, AlertCircle } from 'lucide-react';
import { absenceService, demandeService, personnelService, creneauService } from '../../services';
import type { AbsenceDto, DemandeModificationDto, PersonnelDto, CreneauDto } from '../../types';
import {
  TypeAbsence, StatutAbsence, TYPE_ABSENCE_LABELS, STATUT_ABSENCE_LABELS, STATUT_ABSENCE_COLORS,
  TypeDemande, StatutDemande, TYPE_DEMANDE_LABELS, STATUT_DEMANDE_LABELS, STATUT_DEMANDE_COLORS,
  Statut,
} from '../../types';
import {
  PageHeader, LoadingPage, TableSkeleton, ConfirmDialog, EmptyState,
  Badge, FormField, Spinner, Modal, Tabs,
} from '../../components/common';

// ========== ABSENCES ==========
export function AbsenceList() {
  const [absences, setAbsences] = useState<AbsenceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [approveModal, setApproveModal] = useState<string | null>(null);
  const [refuseId, setRefuseId] = useState<string | null>(null);
  const [actioning, setActioning] = useState('');
  const utilisateurId = localStorage.getItem('utilisateurId') || 'admin';

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try {
      const res = tab === 'pending'
        ? await absenceService.getEnAttente()
        : await absenceService.getAll();
      setAbsences(Array.isArray(res.data) ? res.data : []);
    } catch { setAbsences([]); } finally { setLoading(false); }
  }

  async function handleApprove(commentaire: string) {
    if (!approveModal) return;
    setActioning('approve');
    try {
      await absenceService.approuver(approveModal, utilisateurId, commentaire);
      toast.success('Absence approuvée');
      setApproveModal(null);
      load();
    } catch {} finally { setActioning(''); }
  }

  async function handleRefuse() {
    if (!refuseId) return;
    setActioning('refuse');
    try {
      await absenceService.refuser(refuseId);
      toast.success('Absence refusée');
      setRefuseId(null);
      load();
    } catch {} finally { setActioning(''); }
  }

  async function handleDelete(id: string) {
    try {
      await absenceService.delete(id);
      toast.success('Absence supprimée');
      load();
    } catch {}
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Absences"
        subtitle={`${absences.length} absence(s)`}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} /> Nouvelle absence
          </button>
        }
      />
      <div className="card">
        <div className="px-5 pt-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'Toutes' },
              { id: 'pending', label: 'En attente', icon: <AlertCircle size={14} /> },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
        {loading ? <TableSkeleton rows={6} cols={5} /> : absences.length === 0 ? (
          <div className="pb-6">
            <EmptyState message="Aucune absence" icon={<UserX size={40} />} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Personnel</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Période</th>
                  <th className="table-th">Motif</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {absences.map(a => (
                  <tr key={a.id} className="table-tr">
                    <td className="table-td font-mono text-xs text-slate-500">{a.personnelId}</td>
                    <td className="table-td">
                      <Badge label={TYPE_ABSENCE_LABELS[a.type]} className="bg-slate-100 text-slate-700" />
                    </td>
                    <td className="table-td text-xs text-slate-500">
                      {new Date(a.dateDebut).toLocaleDateString('fr-FR')} → {new Date(a.dateFin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="table-td text-slate-600 max-w-xs truncate">{a.motif}</td>
                    <td className="table-td">
                      <Badge label={STATUT_ABSENCE_LABELS[a.statut]} className={STATUT_ABSENCE_COLORS[a.statut]} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {a.statut === StatutAbsence.EN_ATTENTE && (
                          <>
                            <button
                              onClick={() => setApproveModal(a.id)}
                              className="p-1.5 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                              title="Approuver"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => setRefuseId(a.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                              title="Refuser"
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600"
                          title="Supprimer"
                        >
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
      </div>

      {/* Create Modal */}
      <AbsenceCreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); load(); }}
      />

      {/* Approve Modal */}
      <ApproveModal
        open={!!approveModal}
        onClose={() => setApproveModal(null)}
        onConfirm={handleApprove}
        loading={actioning === 'approve'}
        title="Approuver l'absence"
      />

      <ConfirmDialog
        open={!!refuseId}
        onClose={() => setRefuseId(null)}
        onConfirm={handleRefuse}
        title="Refuser l'absence"
        message="Voulez-vous refuser cette demande d'absence ?"
        confirmLabel="Refuser"
        variant="warning"
        loading={actioning === 'refuse'}
      />
    </div>
  );
}

// ===== Absence Create Modal =====
function AbsenceCreateModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [personnel, setPersonnel] = useState<PersonnelDto[]>([]);
  const schema = z.object({
    personnelId: z.string().min(1, 'Personnel requis'),
    type: z.coerce.number(),
    dateDebut: z.string().min(1, 'Date requise'),
    dateFin: z.string().min(1, 'Date requise'),
    motif: z.string().min(1, 'Motif requis'),
    justificatif: z.string().optional(),
  });
  type FD = z.infer<typeof schema>;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FD>({
    resolver: zodResolver(schema),
    defaultValues: { type: TypeAbsence.CONGE_ANNUEL },
  });

  useEffect(() => {
    if (open) personnelService.getAll({ taillePage: 200 }).then(res => setPersonnel(res.data.items || []));
  }, [open]);

  async function onSubmit(data: FD) {
    setSaving(true);
    try {
      await absenceService.create(data);
      toast.success('Absence créée');
      reset();
      onCreated();
    } catch {} finally { setSaving(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle absence">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Personnel" error={errors.personnelId?.message} required>
          <select {...register('personnelId')} className="select-field">
            <option value="">— Sélectionner —</option>
            {personnel.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
          </select>
        </FormField>
        <FormField label="Type" error={errors.type?.message} required>
          <select {...register('type')} className="select-field">
            {Object.entries(TYPE_ABSENCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Début" error={errors.dateDebut?.message} required>
            <input {...register('dateDebut')} type="date" className="input-field" />
          </FormField>
          <FormField label="Fin" error={errors.dateFin?.message} required>
            <input {...register('dateFin')} type="date" className="input-field" />
          </FormField>
        </div>
        <FormField label="Motif" error={errors.motif?.message} required>
          <textarea {...register('motif')} className="input-field" rows={2} />
        </FormField>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Plus size={15} />Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ===== Approve Modal =====
function ApproveModal({ open, onClose, onConfirm, loading, title }: {
  open: boolean; onClose: () => void; onConfirm: (commentaire: string) => void; loading: boolean; title: string;
}) {
  const [commentaire, setCommentaire] = useState('');
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <FormField label="Commentaire (optionnel)">
          <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} className="input-field" rows={3} />
        </FormField>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Annuler</button>
          <button onClick={() => onConfirm(commentaire)} disabled={loading} className="btn-success">
            {loading && <Spinner size="sm" />}<Check size={15} />Approuver
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ========== DEMANDES DE MODIFICATION ==========
export function DemandeList() {
  const [demandes, setDemandes] = useState<DemandeModificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [approveModal, setApproveModal] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [actioning, setActioning] = useState('');
  const utilisateurId = localStorage.getItem('utilisateurId') || 'admin';

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try {
      const res = tab === 'pending' ? await demandeService.getEnAttente() : await demandeService.getAll();
      setDemandes(Array.isArray(res.data) ? res.data : []);
    } catch { setDemandes([]); } finally { setLoading(false); }
  }

  async function handleApprove(commentaire: string) {
    if (!approveModal) return;
    setActioning('approve');
    try {
      await demandeService.approuver(approveModal, utilisateurId, commentaire);
      toast.success('Demande approuvée');
      setApproveModal(null);
      load();
    } catch {} finally { setActioning(''); }
  }

  async function handleReject() {
    if (!rejectId) return;
    setActioning('reject');
    try {
      await demandeService.rejeter(rejectId);
      toast.success('Demande rejetée');
      setRejectId(null);
      load();
    } catch {} finally { setActioning(''); }
  }

  async function handleDelete(id: string) {
    try {
      await demandeService.delete(id);
      toast.success('Demande supprimée');
      load();
    } catch {}
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Demandes de modification"
        subtitle={`${demandes.length} demande(s)`}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} /> Nouvelle demande
          </button>
        }
      />
      <div className="card">
        <div className="px-5 pt-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'Toutes' },
              { id: 'pending', label: 'En attente', icon: <AlertCircle size={14} /> },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
        {loading ? <TableSkeleton rows={6} cols={4} /> : demandes.length === 0 ? (
          <div className="pb-6">
            <EmptyState message="Aucune demande" icon={<ClipboardEdit size={40} />} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Personnel</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Motif</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {demandes.map(d => (
                  <tr key={d.id} className="table-tr">
                    <td className="table-td font-mono text-xs text-slate-500">{d.personnelId}</td>
                    <td className="table-td">
                      <Badge label={TYPE_DEMANDE_LABELS[d.type]} className="bg-slate-100 text-slate-700" />
                    </td>
                    <td className="table-td text-slate-600 max-w-xs truncate">{d.motif}</td>
                    <td className="table-td">
                      <Badge label={STATUT_DEMANDE_LABELS[d.statut]} className={STATUT_DEMANDE_COLORS[d.statut]} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {d.statut === StatutDemande.EN_ATTENTE && (
                          <>
                            <button onClick={() => setApproveModal(d.id)} className="p-1.5 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600">
                              <Check size={15} />
                            </button>
                            <button onClick={() => setRejectId(d.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600">
                              <X size={15} />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600">
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
      </div>

      <DemandeCreateModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      <ApproveModal open={!!approveModal} onClose={() => setApproveModal(null)} onConfirm={handleApprove} loading={actioning === 'approve'} title="Approuver la demande" />
      <ConfirmDialog open={!!rejectId} onClose={() => setRejectId(null)} onConfirm={handleReject}
        title="Rejeter la demande" message="Voulez-vous rejeter cette demande ?" confirmLabel="Rejeter" variant="warning" loading={actioning === 'reject'} />
    </div>
  );
}

function DemandeCreateModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [saving, setSaving] = useState(false);
  const [personnel, setPersonnel] = useState<PersonnelDto[]>([]);
  const [creneaux, setCreneaux] = useState<CreneauDto[]>([]);
  const [selectedCreneaux, setSelectedCreneaux] = useState<string[]>([]);

  const schema = z.object({
    personnelId: z.string().min(1, 'Requis'),
    type: z.coerce.number(),
    motif: z.string().min(1, 'Requis'),
  });
  type FD = z.infer<typeof schema>;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FD>({
    resolver: zodResolver(schema),
    defaultValues: { type: TypeDemande.MODIFICATION },
  });

  useEffect(() => {
    if (open) {
      personnelService.getAll({ taillePage: 200 }).then(res => setPersonnel(res.data.items || []));
      creneauService.getAll().then(res => setCreneaux(Array.isArray(res.data) ? res.data : []));
    }
  }, [open]);

  async function onSubmit(data: FD) {
    setSaving(true);
    try {
      await demandeService.create({ ...data, creneauIds: selectedCreneaux });
      toast.success('Demande créée');
      reset();
      setSelectedCreneaux([]);
      onCreated();
    } catch {} finally { setSaving(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle demande de modification" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Personnel" error={errors.personnelId?.message} required>
            <select {...register('personnelId')} className="select-field">
              <option value="">— Sélectionner —</option>
              {personnel.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </FormField>
          <FormField label="Type" error={errors.type?.message} required>
            <select {...register('type')} className="select-field">
              {Object.entries(TYPE_DEMANDE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Motif" error={errors.motif?.message} required>
          <textarea {...register('motif')} className="input-field" rows={2} />
        </FormField>
        <FormField label={`Créneaux concernés (${selectedCreneaux.length})`}>
          <div className="border border-slate-100 rounded-lg max-h-36 overflow-y-auto">
            {creneaux.slice(0, 20).map(c => (
              <label key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCreneaux.includes(c.id)}
                  onChange={e => {
                    if (e.target.checked) setSelectedCreneaux(prev => [...prev, c.id]);
                    else setSelectedCreneaux(prev => prev.filter(x => x !== c.id));
                  }}
                  className="rounded"
                />
                <span className="text-xs">{new Date(c.debut).toLocaleString('fr-FR')} — {c.lieu || 'Sans lieu'}</span>
              </label>
            ))}
          </div>
        </FormField>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Spinner size="sm" />}<Plus size={15} />Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}
