import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/Layout/MainLayout';
import { PrivateRoute } from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const Expenses = () => <div style={{ color: 'white' }}>Página de Despesas (Em breve)</div>;
const AIAssistant = () => <div style={{ color: 'white' }}>Assistente IA (Em breve)</div>;
const Reports = () => <div style={{ color: 'white' }}>Relatórios (Em breve)</div>;
const Settings = () => <div style={{ color: 'white' }}>Configurações (Em breve)</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}