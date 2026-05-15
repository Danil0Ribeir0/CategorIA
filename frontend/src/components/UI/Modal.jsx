import styled from 'styled-components';
import { X } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.75); /* Fundo semi-transparente escuro */
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50; /* Garante que fica por cima de tudo */
`;

const ModalContainer = styled.div`
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  
  /* Animação suave ao abrir */
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    color: var(--text-main);
  }

  button {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background-color: var(--border-color);
      color: var(--danger, #ef4444);
    }
  }
`;

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={24} />
          </button>
        </ModalHeader>
        
        <div>{children}</div>
      </ModalContainer>
    </Overlay>
  );
}