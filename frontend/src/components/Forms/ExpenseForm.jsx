import { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  input, select {
    padding: 0.8rem 1rem;
    background-color: var(--bg-page);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
`;

const SubmitButton = styled.button`
  margin-top: 1rem;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-hover);
  }
`;

export default function ExpenseForm({ onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    category: initialData?.category || 'Alimentação',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, amount: Number(formData.amount) });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <label htmlFor="description">Descrição</label>
        <input 
          type="text" 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          placeholder="Ex: Almoço no centro"
          required 
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="amount">Valor (R$)</label>
        <input 
          type="number" 
          id="amount" 
          name="amount" 
          value={formData.amount} 
          onChange={handleChange} 
          placeholder="0.00"
          step="0.01"
          min="0"
          required 
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="category">Categoria</label>
        <select id="category" name="category" value={formData.category} onChange={handleChange}>
          <option value="Alimentação">Alimentação</option>
          <option value="Transporte">Transporte</option>
          <option value="Compras">Compras</option>
          <option value="Lazer">Lazer</option>
          <option value="Outros">Outros</option>
        </select>
      </FormGroup>

      <FormGroup>
        <label htmlFor="date">Data</label>
        <input 
          type="date" 
          id="date" 
          name="date" 
          value={formData.date} 
          onChange={handleChange} 
          required 
        />
      </FormGroup>

      <SubmitButton type="submit">
        {initialData ? 'Atualizar Despesa' : 'Salvar Despesa'}
      </SubmitButton>
    </Form>
  );
}