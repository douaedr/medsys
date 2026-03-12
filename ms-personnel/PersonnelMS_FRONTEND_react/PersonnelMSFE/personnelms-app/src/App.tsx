import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

import { Sidebar } from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import PersonnelList from './pages/Personnel/PersonnelList';
import PersonnelForm from './pages/Personnel/PersonnelForm';
import PersonnelDetails from './pages/Personnel/PersonnelDetails';
import { MedecinList, MedecinForm } from './pages/Medecins';
import {
  InfirmierList, InfirmierForm,
  AideSoignantList, AideSoignantForm,
  BrancardierList, BrancardierForm,
  SecretaireList, SecretaireForm,
  DirecteurList, DirecteurForm,
} from './pages/OtherPersonnel';
import { EquipeList, EquipeForm, EquipeDetails } from './pages/Equipes';
import { PlanningList, PlanningForm, PlanningDetails } from './pages/Plannings';
import { CreneauList, CreneauForm } from './pages/Creneaux';
import { AbsenceList, DemandeList } from './pages/Demandes';
import Rapports from './pages/Rapports';

import { Menu } from 'lucide-react';

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - occupies space in flex row on lg+ */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area - takes remaining width */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar - mobile only */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <span className="font-bold text-slate-900" style={{ fontFamily: 'Syne, sans-serif' }}>
            PersonnelMS
          </span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/personnel" element={<PersonnelList />} />
          <Route path="/personnel/nouveau" element={<PersonnelForm />} />
          <Route path="/personnel/:id" element={<PersonnelDetails />} />
          <Route path="/personnel/:id/modifier" element={<PersonnelForm />} />
          <Route path="/medecins" element={<MedecinList />} />
          <Route path="/medecins/nouveau" element={<MedecinForm />} />
          <Route path="/medecins/:id/modifier" element={<MedecinForm />} />
          <Route path="/infirmiers" element={<InfirmierList />} />
          <Route path="/infirmiers/nouveau" element={<InfirmierForm />} />
          <Route path="/infirmiers/:id/modifier" element={<InfirmierForm />} />
          <Route path="/aides-soignants" element={<AideSoignantList />} />
          <Route path="/aides-soignants/nouveau" element={<AideSoignantForm />} />
          <Route path="/aides-soignants/:id/modifier" element={<AideSoignantForm />} />
          <Route path="/brancardiers" element={<BrancardierList />} />
          <Route path="/brancardiers/nouveau" element={<BrancardierForm />} />
          <Route path="/brancardiers/:id/modifier" element={<BrancardierForm />} />
          <Route path="/secretaires" element={<SecretaireList />} />
          <Route path="/secretaires/nouveau" element={<SecretaireForm />} />
          <Route path="/secretaires/:id/modifier" element={<SecretaireForm />} />
          <Route path="/directeurs" element={<DirecteurList />} />
          <Route path="/directeurs/nouveau" element={<DirecteurForm />} />
          <Route path="/directeurs/:id/modifier" element={<DirecteurForm />} />
          <Route path="/equipes" element={<EquipeList />} />
          <Route path="/equipes/nouveau" element={<EquipeForm />} />
          <Route path="/equipes/:id" element={<EquipeDetails />} />
          <Route path="/equipes/:id/modifier" element={<EquipeForm />} />
          <Route path="/plannings" element={<PlanningList />} />
          <Route path="/plannings/nouveau" element={<PlanningForm />} />
          <Route path="/plannings/:id" element={<PlanningDetails />} />
          <Route path="/plannings/:id/modifier" element={<PlanningForm />} />
          <Route path="/creneaux" element={<CreneauList />} />
          <Route path="/creneaux/nouveau" element={<CreneauForm />} />
          <Route path="/absences" element={<AbsenceList />} />
          <Route path="/demandes-modification" element={<DemandeList />} />
          <Route path="/rapports" element={<Rapports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        toastClassName="text-sm"
      />
    </BrowserRouter>
  );
}
