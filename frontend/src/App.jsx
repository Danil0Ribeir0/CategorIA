import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/Layout/MainLayout';
import { PrivateRoute } from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import Expenses from './pages/Expenses';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 2. Agora o 'element' aponta para o componente real que importamos */}
          <Route path="/expenses" element={<Expenses />} />
          
          {/* Mantenha os outros mocks até criarmos as páginas */}
          <Route path="/ai-assistant" element={<div style={{color: 'white'}}>Assistente IA</div>} />
          <Route path="/reports" element={<div style={{color: 'white'}}>Relatórios</div>} />
          <Route path="/settings" element={<div style={{color: 'white'}}>Configurações</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}