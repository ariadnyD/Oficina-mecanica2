import { useState, useEffect } from 'react';
import api from '../../services/api';
import FormOrdemServico from './FormOrdemServico';
import { Link } from 'react-router-dom';

function TelaOrdensServico() {
  const [ordens, setOrdens] = useState([]);
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [osEmEdicao, setOsEmEdicao] = useState(null);

  // Trava de segurança para ver botões de ação
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const carregarOrdens = async () => {
    try {
      const { data } = await api.get('ordens-servico/');
      setOrdens(data);
    } catch (e) { 
      console.error("Erro ao carregar ordens", e); 
    }
  };

  useEffect(() => { 
    carregarOrdens(); 
  }, []);

  const handleSalvarSucesso = () => {
    setExibirFormulario(false);
    setOsEmEdicao(null);
    carregarOrdens();
  };

  const handleExcluir = async (id) => {
    const confirmacao = window.confirm(`Tem certeza que deseja cancelar a OS #${id}?`);
    if (confirmacao) {
      try {
        await api.delete(`ordens-servico/${id}/`);
        alert("Ordem de Serviço cancelada com sucesso!");
        carregarOrdens();
      } catch (erro) {
        alert("Erro ao cancelar a Ordem de Serviço.");
      }
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Módulo de Ordens de Serviço</h2>
        
        {!exibirFormulario && (
          <button 
            onClick={() => {
              setOsEmEdicao(null);
              setExibirFormulario(true);
            }}
            style={{ padding: '10px 15px', backgroundColor: 'var(--text-h)', color: 'var(--bg)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Nova Ordem de Serviço
          </button>
        )}
      </div>

      {exibirFormulario && (
        <FormOrdemServico 
          osEmEdicao={osEmEdicao} 
          aoCancelar={() => {
            setExibirFormulario(false);
            setOsEmEdicao(null);
          }} 
          aoSalvarSucesso={handleSalvarSucesso} 
        />
      )}

      {!exibirFormulario && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--social-bg)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Código</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Placa do veículo</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Situação</th>
                {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {ordens.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? "4" : "3"} style={{ padding: '20px', textAlign: 'center' }}>
                    Nenhuma Ordem de Serviço registrada.
                  </td>
                </tr>
              ) : (
                ordens.map(os => (
                  <tr key={os.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      <Link to={`/ordens-servico/${os.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        #{os.id}
                      </Link>
                    </td>
                    <td style={{ padding: '12px' }}>{os.placa_veiculo}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        backgroundColor: os.status === 'FINALIZADA' ? '#5cb85c' : os.status === 'CANCELADA' ? '#d9534f' : '#f0ad4e',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        {os.status}
                      </span>
                    </td>
                    
                    {isAdmin && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => { setOsEmEdicao(os); setExibirFormulario(true); }}
                          style={{ marginRight: '8px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f0ad4e', border: 'none', borderRadius: '4px', color: '#fff' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleExcluir(os.id)}
                          style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#d9534f', border: 'none', borderRadius: '4px', color: '#fff' }}
                        >
                          Excluir
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TelaOrdensServico;