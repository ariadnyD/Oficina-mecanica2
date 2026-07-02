import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import TelaClientes from './pages/cliente/TelaClientes';
import DetalhesCliente from './pages/cliente/DetalhesCliente';
import TelaVeiculos from './pages/veiculo/TelaVeiculos';
import DetalhesVeiculo from './pages/veiculo/DetalhesVeiculo';
import TelaProcedimentos from './pages/procedimento/TelaProcedimentos';
import Login from './pages/login/Login';
import CadastroFuncionario from './pages/funcionario/CadastroFuncionario';
import GerenciarUsuarios from './pages/funcionario/GerenciarUsuarios';
import TelaInsumos from './pages/insumo/TelaInsumos';
import TelaOrdensServico from './pages/ordem_servico/TelaOrdensServico';
import DetalhesOrdemServico from './pages/ordem_servico/DetalhesOrdemServico';
import api from './services/api';
import './App.css';

function LayoutProtegido({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const ehAdmin = localStorage.getItem('is_admin') === 'true';

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await api.post('auth/logout/', { refresh });
    } catch (erro) {
      console.error("Erro ao fazer logout no backend:", erro);
    } finally {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <div>
    <header className="header-container">
      <span className="header-title">Oficina Mecânica 🚗</span>
      
      <button onClick={handleLogout} className="btn-logout">
        🚪 Sair (Logout)
      </button>
    </header>

    <nav className="nav-container">
      <Link to="/clientes" className="nav-item">
        <span className="nav-icon">👥</span>
        Ver Clientes
      </Link>

      <Link to="/veiculos" className="nav-item">
        <span className="nav-icon">🚗</span>
        Módulo Veículos
      </Link>

      <Link to="/procedimentos" className="nav-item">
        <span className="nav-icon">🛠️</span>
        Gerenciar Procedimentos
      </Link>

      <Link to="/insumos" className="nav-item">
        <span className="nav-icon">📦</span>
        Estoque de Insumos
      </Link>
      
      {ehAdmin && (
      <>
        <Link to="/cadastro-funcionario" className="nav-item btn-admin-add">
          <span className="nav-icon">➕</span>
          Cadastrar Funcionário
        </Link>

        <Link to="/gerenciar-usuarios" className="nav-item btn-admin-manage">
          <span className="nav-icon">⚙️</span>
          Gerenciar Equipe
        </Link>
        <Link to="/procedimentos" style={{ padding: '12px', backgroundColor: 'var(--social-bg)', borderRadius: '8px', fontWeight: 'bold', color: 'var(--accent)', textDecoration: 'none', textAlign: 'center', border: '1px solid var(--border)' }}>
          🛠️ Gerenciar Procedimentos
        </Link>
        <Link to="/insumos" style={{ padding: '12px', backgroundColor: 'var(--social-bg)', borderRadius: '8px', fontWeight: 'bold', color: 'var(--accent)', textDecoration: 'none', textAlign: 'center', border: '1px solid var(--border)' }}>
          📦 Estoque de Insumos
        </Link>
        <Link to="/ordens-servico" style={{ padding: '12px', backgroundColor: 'var(--social-bg)', borderRadius: '8px', fontWeight: 'bold', color: 'var(--accent)', textDecoration: 'none', textAlign: 'center', border: '1px solid var(--border)' }}>
          📋 Ordens de Serviço
        </Link>
        
        {ehAdmin && (
          <>
            <Link to="/cadastro-funcionario" style={{ padding: '12px', backgroundColor: '#5cb85c', borderRadius: '8px', fontWeight: 'bold', color: 'white', textDecoration: 'none', textAlign: 'center', border: '1px solid var(--border)' }}>
                Cadastrar Funcionário (Só ADM)
            </Link>
            <Link to="/gerenciar-usuarios" style={{ padding: '12px', backgroundColor: '#f0ad4e', borderRadius: '8px', fontWeight: 'bold', color: 'white', textDecoration: 'none', textAlign: 'center', border: '1px solid var(--border)' }}>
                Gerenciar Equipe
            </Link>
          </>
        )}
    </nav>

      {/* Conteúdo da página atual */}
      {children}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          {/* Rota inicial é o Login Puro (Sem menu, sem barra superior) */}
          <Route path="/" element={<Login />} />

          {/* Todas as outras rotas agora ficam trancadas dentro do LayoutProtegido */}
          <Route path="/clientes" element={<LayoutProtegido><TelaClientes /></LayoutProtegido>} />
          <Route path="/veiculos" element={<LayoutProtegido><TelaVeiculos /></LayoutProtegido>} />
          <Route path="/veiculos/:id" element={<LayoutProtegido><DetalhesVeiculo /></LayoutProtegido>} />
          <Route path="/clientes/:id" element={<LayoutProtegido><DetalhesCliente /></LayoutProtegido>} />
          <Route path="/procedimentos" element={<LayoutProtegido><TelaProcedimentos /></LayoutProtegido>} />
          <Route path="/cadastro-funcionario" element={<LayoutProtegido><CadastroFuncionario /></LayoutProtegido>} />
          <Route path="/gerenciar-usuarios" element={<LayoutProtegido><GerenciarUsuarios /></LayoutProtegido>} />
          <Route path="/insumos" element={<LayoutProtegido><TelaInsumos /></LayoutProtegido>} />
          <Route path="/ordens-servico" element={<LayoutProtegido><TelaOrdensServico /></LayoutProtegido>} />
          <Route path="/ordens-servico/:id" element={<LayoutProtegido><DetalhesOrdemServico /></LayoutProtegido>} />
          
          {/* Se digitar qualquer rota maluca, manda de volta pro login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;