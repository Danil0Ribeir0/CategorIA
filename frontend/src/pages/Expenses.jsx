import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus } from 'lucide-react';

import ExpenseCard from '../components/Cards/ExpenseCard';
import Modal from '../components/UI/Modal';
import ExpenseForm from '../components/Forms/ExpenseForm';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.8rem;
    font-weight: 600;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExpenses([
        { id: 1, description: 'Almoço', category: 'Alimentação', date: '2024-05-15', amount: 45.90 },
        { id: 2, description: 'Uber', category: 'Transporte', date: '2024-05-14', amount: 22.50 }
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAddExpense = (newExpenseData) => {
    const newExpense = {
      id: Date.now(),
      ...newExpenseData
    };

    setExpenses(prev => [newExpense, ...prev]);
    setIsModalOpen(false);
    
    console.log("Nova despesa adicionada:", newExpense);
  };

  return (
    <div>
      <PageHeader>
        <h1>Minhas Despesas</h1>
        <AddButton onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Nova Despesa
        </AddButton>
      </PageHeader>

      <CardsGrid>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
        ) : expenses.length > 0 ? (
          expenses.map(expense => (
            <ExpenseCard key={expense.id} {...expense} />
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Nenhuma despesa encontrada.</p>
        )}
      </CardsGrid>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Adicionar Despesa"
      >
        <ExpenseForm onSubmit={handleAddExpense} />
      </Modal>
    </div>
  );
}