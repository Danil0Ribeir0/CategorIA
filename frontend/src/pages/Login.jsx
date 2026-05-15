import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, name } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userName', name);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciais inválidas.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <h2 className="auth-title">
          <LogIn size={28} strokeWidth={2.5} /> 
          CategorIA
        </h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <input 
            type="email" 
            placeholder="Seu E-mail" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="auth-input"
          />
          <input 
            type="password" 
            placeholder="Sua Senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="auth-input"
          />
          <button type="submit" className="auth-button">Entrar</button>
        </form>

        <p className="auth-footer">
          Ainda não tem conta? <Link to="/register">Crie uma aqui</Link>
        </p>
      </div>
    </div>
  );
}