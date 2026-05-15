import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: var(--bg-gradient);
  color: var(--text-main);
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  /* Garante que o conteúdo não "empurre" a sidebar para fora */
  overflow-x: hidden;
`;

const PageContent = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  
  /* Scrollbar customizada para combinar com o Dark Mode */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: var(--bg-page);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
  }
`;

export default function MainLayout() {
  return (
    <LayoutContainer>
      <Sidebar />
      <ContentWrapper>
        <Header />
        <PageContent>
          <Outlet />
        </PageContent>
      </ContentWrapper>
    </LayoutContainer>
  );
}