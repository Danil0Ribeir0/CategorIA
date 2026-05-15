import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Settings, Bot } from 'lucide-react';

const SidebarContainer = styled.aside`
  width: 260px;
  background-color: var(--card-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 3rem;
  padding-left: 1rem;
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--card-hover);
    color: var(--text-main);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }
`;

export default function Sidebar() {
  return (
    <SidebarContainer>
      <Logo>CategorIA</Logo>
      <NavMenu>
        <StyledNavLink to="/dashboard">
          <LayoutDashboard size={20} /> Dashboard
        </StyledNavLink>
        <StyledNavLink to="/expenses">
          <Receipt size={20} /> Despesas
        </StyledNavLink>
        <StyledNavLink to="/ai-assistant">
          <Bot size={20} /> Assistente IA
        </StyledNavLink>
        <StyledNavLink to="/reports">
          <PieChart size={20} /> Relatórios
        </StyledNavLink>
        <StyledNavLink to="/settings">
          <Settings size={20} /> Configurações
        </StyledNavLink>
      </NavMenu>
    </SidebarContainer>
  );
}