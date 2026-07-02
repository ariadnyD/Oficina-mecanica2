import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const token = localStorage.getItem('access_token');
  const ehAdmin = localStorage.getItem('is_admin') === 'true';
  const nomeUsuario = localStorage.getItem('username') || 'Usuário';

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

  // Verifica se está na rota de dashboard (ignora maiúsculas ou minúsculas na URL)
  const isDashboard = location.pathname.toLowerCase() === '/dashboard';

  const botoesMenu = (
    <>
      <Link to="/clientes" className="nav-item">
        <span className="nav-icon">👥</span>
        Clientes
      </Link>

      <Link to="/veiculos" className="nav-item">
        <span className="nav-icon">🚗</span>
        Veículos
      </Link>

      <Link to="/ordens-servico" className="nav-item">
        <span className="nav-icon">📋</span>
        Ordens de Serviço
      </Link>

      <Link to="/procedimentos" className="nav-item">
        <span className="nav-icon">🛠️</span>
        Procedimentos
      </Link>

      <Link to="/insumos" className="nav-item">
        <span className="nav-icon">📦</span>
        Insumos
      </Link>
      
      {ehAdmin && (
        <>
          <Link to="/gerenciar-usuarios" className="nav-item btn-admin-manage">
            <span className="nav-icon">⚙️</span>
            Gerenciar Equipe
          </Link>
        </>
      )}
    </>
  );

  return (
    <div>
      <header className="header-container">
        <Link to="/dashboard" className="header-logo-link">
          <span className="header-title">JS Mecânica</span>
        </Link>
        
        <button onClick={handleLogout} className="btn-logout">
          Sair
        </button>
      </header>

      {isDashboard ? (
        /* SE FOR O DASHBOARD: Mensagem no Topo, Botões logo Abaixo, tudo Centralizado no meio da tela */
        <div>
          <div className="dashboard-centered-container">
            <div className="dashboard-welcome-box">
              <h2>Olá, {nomeUsuario}!</h2>
              <p>Clicando nesses botões navegue entre os módulos</p>
            </div>
            <nav className="nav-container">
              {botoesMenu}
            </nav>
          </div>
        </div>
      ) : (
        /* SE FOR OUTRA TELA: Mantém botões no topo padrão e abre espaço para as tabelas embaixo */
        <>
          <nav className="nav-container">
            {botoesMenu}
          </nav>
          <div className="conteudo-principal">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Rota explícita para o Dashboard */}
          <Route path="/dashboard" element={<LayoutProtegido><></></LayoutProtegido>} />

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
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;