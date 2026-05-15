import styled from 'styled-components';
import { Plus } from 'lucide-react';
import ExpenseCard from '../components/Cards/ExpenseCard';

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
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-hover);
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const mockExpenses = [
  { id: 1, description: 'Almoço Restaurante', category: 'Alimentação', date: '2024-05-15', amount: 45.90 },
  { id: 2, description: 'Uber para o trabalho', category: 'Transporte', date: '2024-05-14', amount: 22.50 },
  { id: 3, description: 'Supermercado', category: 'Compras', date: '2024-05-13', amount: 350.00 },
];

export default function Expenses() {
  return (
    <div>
      <PageHeader>
        <h1>Minhas Despesas</h1>
        <AddButton>
          <Plus size={20} />
          Nova Despesa
        </AddButton>
      </PageHeader>

      <CardsGrid>
        {mockExpenses.map(expense => (
          <ExpenseCard 
            key={expense.id}
            description={expense.description}
            category={expense.category}
            date={expense.date}
            amount={expense.amount}
          />
        ))}
      </CardsGrid>
    </div>
  );
}