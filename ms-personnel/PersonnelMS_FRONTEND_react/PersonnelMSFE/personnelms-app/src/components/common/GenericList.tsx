import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  STATUT_LABELS, STATUT_COLORS, TYPE_MEDECIN_LABELS, TYPE_INFIRMIER_LABELS,
  TypeMedecin, TypeInfirmier, Statut,
} from '../../types';
import {
  PageHeader, SearchInput, Badge, LoadingPage, TableSkeleton,
  ConfirmDialog, EmptyState,
} from '../../components/common';

interface GenericListProps {
  title: string;
  fetchAll: () => Promise<any>;
  deleteOne: (id: string) => Promise<any>;
  extraColumns?: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  createPath: string;
  editPath: (id: string) => string;
  detailPath?: (id: string) => string;
}

export function GenericPersonnelList({
  title, fetchAll, deleteOne, extraColumns = [], createPath, editPath, detailPath,
}: GenericListProps) {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAll();
      const data = res.data;
      setItems(Array.isArray(data) ? data : (data.items || []));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteOne(deleteId);
      toast.success(`${title.replace(/s$/, '')} supprimé(e)`);
      setDeleteId(null);
      load();
    } catch {
      // handled
    } finally {
      setDeleting(false);
    }
  }

  const filtered = items.filter(p =>
    search === '' ||
    `${p.nom} ${p.prenom} ${p.matricule} ${p.courriel}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={title}
        subtitle={`${items.length} enregistrement(s)`}
        actions={
          <button onClick={() => navigate(createPath)} className="btn-primary">
            <Plus size={16} /> Nouveau
          </button>
        }
      />

      <div className="card">
        <div className="p-4 border-b border-slate-100 flex gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Nom, matricule..." />
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={4 + extraColumns.length} />
        ) : filtered.length === 0 ? (
          <EmptyState message={`Aucun(e) ${title.toLowerCase()} trouvé(e)`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Nom</th>
                  <th className="table-th">Matricule</th>
                  {extraColumns.map(col => (
                    <th key={col.key} className="table-th">{col.label}</th>
                  ))}
                  <th className="table-th">Statut</th>
                  <th className="table-th w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filtered.map(p => (
                  <tr key={p.id} className="table-tr">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                          {p.prenom?.[0]}{p.nom?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{p.prenom} {p.nom}</div>
                          <div className="text-xs text-slate-400">{p.courriel}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td font-mono text-xs">{p.matricule}</td>
                    {extraColumns.map(col => (
                      <td key={col.key} className="table-td text-slate-600">
                        {col.render ? col.render(p) : (p[col.key] ?? '—')}
                      </td>
                    ))}
                    <td className="table-td">
                      <Badge label={STATUT_LABELS[p.statut as Statut]} className={STATUT_COLORS[p.statut as Statut]} />
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {detailPath && (
                          <button
                            onClick={() => navigate(detailPath(p.id))}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(editPath(p.id))}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-amber-600"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600"
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message="Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible."
        loading={deleting}
      />
    </div>
  );
}
