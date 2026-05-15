import styled from 'styled-components';
import { User, Bell } from 'lucide-react';

const HeaderContainer = styled.header`
  height: 70px;
  background-color: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: var(--text-muted);

  .icon-button {
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: var(--primary-color); }
  }
`;

export default function Header() {
  return (
    <HeaderContainer>
      <h3>CategorIA</h3>
      <UserSection>
        <Bell size={20} className="icon-button" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} />
          <span>Usuário</span>
        </div>
      </UserSection>
    </HeaderContainer>
  );
}