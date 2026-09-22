import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AnimeDetail from './pages/AnimeDetail';

import Dashboard from './pages/Dashboard';
import MyList from './pages/MyList';
import Search from './pages/Search';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

function PrivateRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('access');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Защищённые — все через Layout */}
        <Route path="/"        element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/list"    element={<AppLayout><MyList /></AppLayout>} />
        <Route path="/list/:id" element={<AppLayout><AnimeDetail /></AppLayout>} />
        <Route path="/search"  element={<AppLayout><Search /></AppLayout>} />
        <Route path="/stats"   element={<AppLayout><Stats /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}