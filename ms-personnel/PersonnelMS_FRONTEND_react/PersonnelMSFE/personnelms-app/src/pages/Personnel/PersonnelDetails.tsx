import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pencil, ArrowLeft, Calendar, Clock, UserX, ClipboardEdit, Clock3 } from 'lucide-react';
import { personnelService, absenceService, creneauService, disponibiliteService, demandeService } from '../../services';
import type { PersonnelDto, AbsenceDto, CreneauDto, DisponibiliteDto, DemandeModificationDto } from '../../types';
import {
  STATUT_LABELS, STATUT_COLORS, STATUT_ABSENCE_LABELS, STATUT_ABSENCE_COLORS,
  TYPE_ABSENCE_LABELS, STATUT_CRENEAU_LABELS, STATUT_CRENEAU_COLORS,
  TYPE_CRENEAU_LABELS, JOURS_SEMAINE, STATUT_DEMANDE_LABELS, STATUT_DEMANDE_COLORS,
} from '../../types';
import { LoadingPage, Tabs, Badge, EmptyState } from '../../components/common';

const TABS = [
  { id: 'info', label: 'Informations', icon: <Clock3 size={14} /> },
  { id: 'creneaux', label: 'Créneaux', icon: <Clock size={14} /> },
  { id: 'absences', label: 'Absences', icon: <UserX size={14} /> },
  { id: 'dispos', label: 'Disponibilités', icon: <Calendar size={14} /> },
  { id: 'demandes', label: 'Demandes', icon: <ClipboardEdit size={14} /> },
];

export default function PersonnelDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [personnel, setPersonnel] = useState<PersonnelDto | null>(null);
  const [absences, setAbsences] = useState<AbsenceDto[]>([]);
  const [creneaux, setCreneaux] = useState<CreneauDto[]>([]);
  const [dispos, setDispos] = useState<DisponibiliteDto[]>([]);
  const [demandes, setDemandes] = useState<DemandeModificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.allSettled([
      personnelService.getById(id),
      absenceService.getByPersonnel(id),
      creneauService.getAll({ personnelId: id }),
      disponibiliteService.getByPersonnel(id),
      demandeService.getByPersonnel(id),
    ]).then(([pRes, aRes, cRes, dRes, dmRes]) => {
      if (pRes.status === 'fulfilled') setPersonnel(pRes.value.data);
      else navigate('/personnel');
      if (aRes.status === 'fulfilled') setAbsences(aRes.value.data);
      if (cRes.status === 'fulfilled') setCreneaux(Array.isArray(cRes.value.data) ? cRes.value.data : []);
      if (dRes.status === 'fulfilled') setDispos(Array.isArray(dRes.value.data) ? dRes.value.data : []);
      if (dmRes.status === 'fulfilled') setDemandes(Array.isArray(dmRes.value.data) ? dmRes.value.data : []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (!personnel) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/personnel" className="btn-ghost">
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
              {personnel.prenom[0]}{personnel.nom[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
                {personnel.prenom} {personnel.nom}
              </h2>
              <div className="text-sm text-slate-500 mt-0.5">{personnel.poste}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge label={STATUT_LABELS[personnel.statut]} className={STATUT_COLORS[personnel.statut]} />
                <Badge label={personnel.type} className="bg-slate-100 text-slate-700" />
              </div>
            </div>
          </div>
          <Link to={`/personnel/${id}/modifier`} className="btn-secondary">
            <Pencil size={15} /> Modifier
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="px-6 pt-4">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>

        <div className="px-6 pb-6">
          {tab === 'info' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Courriel', value: personnel.courriel },
                { label: 'Téléphone', value: personnel.telephone || '—' },
                { label: 'Matricule', value: personnel.matricule },
                { label: 'Date d\'embauche', value: new Date(personnel.dateEmbauche).toLocaleDateString('fr-FR') },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
                  <div className="text-sm text-slate-800 mt-1">{value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'creneaux' && (
            creneaux.length === 0 ? <EmptyState message="Aucun créneau" icon={<Clock size={32} />} /> :
            <div className="space-y-2">
              {creneaux.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {TYPE_CRENEAU_LABELS[c.type]} — {c.lieu || 'Sans lieu'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(c.debut).toLocaleString('fr-FR')} → {new Date(c.fin).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <Badge label={STATUT_CRENEAU_LABELS[c.statut]} className={STATUT_CRENEAU_COLORS[c.statut]} />
                </div>
              ))}
            </div>
          )}

          {tab === 'absences' && (
            absences.length === 0 ? <EmptyState message="Aucune absence" icon={<UserX size={32} />} /> :
            <div className="space-y-2">
              {absences.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{TYPE_ABSENCE_LABELS[a.type]}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.dateDebut).toLocaleDateString('fr-FR')} → {new Date(a.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                    {a.motif && <div className="text-xs text-slate-500 mt-0.5">{a.motif}</div>}
                  </div>
                  <Badge label={STATUT_ABSENCE_LABELS[a.statut]} className={STATUT_ABSENCE_COLORS[a.statut]} />
                </div>
              ))}
            </div>
          )}

          {tab === 'dispos' && (
            dispos.length === 0 ? <EmptyState message="Aucune disponibilité" icon={<Calendar size={32} />} /> :
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dispos.map(d => (
                <div key={d.id} className="p-3 rounded-lg border border-slate-100">
                  <div className="text-sm font-medium text-slate-800">{JOURS_SEMAINE[d.jour]}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {d.heureDebut} — {d.heureFin} · Priorité {d.priorite}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'demandes' && (
            demandes.length === 0 ? <EmptyState message="Aucune demande" icon={<ClipboardEdit size={32} />} /> :
            <div className="space-y-2">
              {demandes.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{d.motif}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Type: {d.type}</div>
                  </div>
                  <Badge label={STATUT_DEMANDE_LABELS[d.statut]} className={STATUT_DEMANDE_COLORS[d.statut]} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
