import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/register', { name, email, password });
      alert('Conta criada com sucesso!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta.');
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">
        <UserPlus size={28} strokeWidth={2.5} /> 
        Criar Conta
      </h2>
      
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleRegister} className="auth-form">
        <input 
          type="text" 
          placeholder="Seu Nome" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="auth-input"
        />
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
        <button type="submit" className="auth-button">Registar</button>
      </form>

      <p className="auth-footer">
        Já tem conta? <Link to="/login">Faça Login</Link>
      </p>
    </div>
  );
}