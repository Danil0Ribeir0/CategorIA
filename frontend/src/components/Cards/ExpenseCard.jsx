import styled from 'styled-components';
import { Coffee, ShoppingCart, Car, DollarSign } from 'lucide-react';

const CardContainer = styled.div`
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background-color: var(--card-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconWrapper = styled.div`
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong {
    color: var(--text-main);
    font-size: 1.1rem;
  }

  span {
    color: var(--text-muted);
    font-size: 0.85rem;
  }
`;

const AmountSection = styled.div`
  text-align: right;
  
  strong {
    color: var(--text-main);
    font-size: 1.2rem;
  }
`;

const getCategoryIcon = (category) => {
  switch (category.toLowerCase()) {
    case 'alimentação': return <Coffee size={24} />;
    case 'transporte': return <Car size={24} />;
    case 'compras': return <ShoppingCart size={24} />;
    default: return <DollarSign size={24} />;
  }
};

export default function ExpenseCard({ description, category, date, amount }) {
  return (
    <CardContainer>
      <InfoSection>
        <IconWrapper>
          {getCategoryIcon(category)}
        </IconWrapper>
        <TextDetails>
          <strong>{description}</strong>
          <span>{category} • {date}</span>
        </TextDetails>
      </InfoSection>
      <AmountSection>
        <strong>R$ {amount.toFixed(2)}</strong>
      </AmountSection>
    </CardContainer>
  );
}