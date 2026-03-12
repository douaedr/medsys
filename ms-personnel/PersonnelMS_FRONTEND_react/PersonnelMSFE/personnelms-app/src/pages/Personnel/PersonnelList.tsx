import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { personnelService } from '../../services';
import type { PersonnelDto } from '../../types';
import { STATUT_LABELS, STATUT_COLORS, Statut } from '../../types';
import {
  PageHeader, SearchInput, Badge, Pagination, LoadingPage,
  TableSkeleton, ConfirmDialog, EmptyState,
} from '../../components/common';

export default function PersonnelList() {
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState<PersonnelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const taillePage = 10;

  useEffect(() => {
    load();
  }, [page, statutFilter]);

  async function load() {
    setLoading(true);
    try {
      const params: any = { page, taillePage };
      if (statutFilter !== '') params.statut = parseInt(statutFilter);
      const res = await personnelService.getAll(params);
      setPersonnel(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      setPersonnel([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await personnelService.delete(deleteId);
      toast.success('Personnel supprimé');
      setDeleteId(null);
      load();
    } catch {
      // error handled by interceptor
    } finally {
      setDeleting(false);
    }
  }

  const filtered = personnel.filter(p =>
    search === '' ||
    `${p.nom} ${p.prenom} ${p.matricule}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Personnel"
        subtitle={`${total} membres au total`}
        actions={
          <Link to="/personnel/nouveau" className="btn-primary">
            <Plus size={16} />
            Nouveau personnel
          </Link>
        }
      />

      <div className="card">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Nom, matricule..." />
          <select
            value={statutFilter}
            onChange={e => { setStatutFilter(e.target.value); setPage(1); }}
            className="select-field w-40"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUT_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : filtered.length === 0 ? (
          <EmptyState message="Aucun personnel trouvé" icon={<Users size={40} />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Nom</th>
                  <th className="table-th">Matricule</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Poste</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th">Embauche</th>
                  <th className="table-th w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filtered.map(p => (
                  <tr key={p.id} className="table-tr">
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                          {p.prenom[0]}{p.nom[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">{p.prenom} {p.nom}</div>
                          <div className="text-xs text-slate-400">{p.courriel}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td font-mono text-xs">{p.matricule}</td>
                    <td className="table-td">
                      <Badge label={p.type} className="bg-slate-100 text-slate-700" />
                    </td>
                    <td className="table-td text-slate-500">{p.poste}</td>
                    <td className="table-td">
                      <Badge label={STATUT_LABELS[p.statut]} className={STATUT_COLORS[p.statut]} />
                    </td>
                    <td className="table-td text-slate-500">
                      {new Date(p.dateEmbauche).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/personnel/${p.id}`)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                          title="Voir"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/personnel/${p.id}/modifier`)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
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

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          taillePage={taillePage}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer le personnel"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce membre du personnel ?"
        confirmLabel="Supprimer"
        loading={deleting}
      />
    </div>
  );
}
