import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrivateRoute } from './utils/PrivateRoute';
import { Layout } from './layout/Layout';
import LoginPage from './pages/auth/LoginPage/LoginPage';
import AccueilPatient from './pages/AccueilPatient/AccueilPatient';
import RechercheDossier from './pages/RechercheDossier/RechercheDossier';
import ProfilPage from './pages/ProfilPage/ProfilPage';
import ConfidentialitePage from './pages/ConfidentialitePage/ConfidentialitePage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<AccueilPatient />} />
              <Route path="accueil" element={<AccueilPatient />} />
              <Route path="recherche" element={<RechercheDossier />} />
              <Route path="file" element={<div style={{ padding: 24 }}><p style={{ fontSize: 18, color: 'var(--c-t0)' }}>File d'attente — En développement</p></div>} />
              <Route path="registre" element={<div style={{ padding: 24 }}><p style={{ fontSize: 18, color: 'var(--c-t0)' }}>Registre du jour — En développement</p></div>} />
              <Route path="statistiques" element={<div style={{ padding: 24 }}><p style={{ fontSize: 18, color: 'var(--c-t0)' }}>Statistiques — En développement</p></div>} />
              <Route path="notifications"   element={<NotificationsPage />}   />
              <Route path="profil"          element={<ProfilPage />}          />
              <Route path="confidentialite" element={<ConfidentialitePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
