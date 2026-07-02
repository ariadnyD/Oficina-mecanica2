import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // 👈 Importado o Link para navegação
import veiculoServices from '../../services/veiculoServices';
import FormVeiculo from './FormVeiculo'; 

function TelaVeiculos() {
  const [searchParams] = useSearchParams();
  const clienteIdNaUrl = searchParams.get('cliente_id');

  const [veiculos, setVeiculos] = useState([]);
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [veiculoEmEdicao, setVeiculoEmEdicao] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');

  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const carregarVeiculos = async () => {
    try {
      const filtros = clienteIdNaUrl ? { cliente_id: clienteIdNaUrl } : {};
      const dados = await veiculoServices.getVeiculos(filtros);
      setVeiculos(dados);
    } catch (erro) {
      console.error("Erro ao carregar os veículos.", erro);
    }
  };

  useEffect(() => {
    carregarVeiculos();
  }, [clienteIdNaUrl]);

  const handleSalvarSucesso = () => {
    setExibirFormulario(false);
    setVeiculoEmEdicao(null);
    carregarVeiculos();
  };

  const handleAbrirEdicao = (veiculo) => {
    setVeiculoEmEdicao(veiculo);
    setExibirFormulario(true);
  };

  const handleExcluir = async (id, placa) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o veículo de placa ${placa}?`);
    if (confirmacao) {
      try {
        await veiculoServices.excluirVeiculo(id);
        carregarVeiculos();
      } catch (erro) {
        console.error("Erro ao excluir veículo", erro);
      }
    }
  };

  const veiculosFiltrados = veiculos.filter(veiculo => 
    veiculo.placa.toLowerCase().includes(termoBusca.toLowerCase()) ||
    veiculo.modelo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gerenciamento de Veículos</h2>
        {!exibirFormulario && (
          <button 
            onClick={() => { setVeiculoEmEdicao(null); setExibirFormulario(true); }}
            style={{ padding: '10px 15px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cadastrar Novo Veículo
          </button>
        )}
      </div>

      {exibirFormulario ? (
        <FormVeiculo 
          aoCancelar={() => { setExibirFormulario(false); setVeiculoEmEdicao(null); }}
          aoSalvarSucesso={handleSalvarSucesso}
          veiculoEmEdicao={veiculoEmEdicao}
        />
      ) : (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="Buscar por placa ou modelo..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              style={{ padding: '8px', width: '300px', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }}
            />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Placa</th>
                <th style={{ padding: '12px' }}>Modelo</th>
                <th style={{ padding: '12px' }}>Proprietário</th>
                {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {veiculosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} style={{ padding: '20px', textAlign: 'center', color: 'var(--text)' }}>Nenhum veículo encontrado.</td>
                </tr>
              ) : (
                veiculosFiltrados.map((veiculo) => (
                  <tr key={veiculo.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {/* 👈 LINK CLICÁVEL NA PLACA */}
                      <Link to={`/veiculos/${veiculo.id}`} style={{ color: '#0275d8', textDecoration: 'none' }}>
                        {veiculo.placa}
                      </Link>
                    </td>
                    <td style={{ padding: '12px' }}>{veiculo.marca} {veiculo.modelo}</td>
                    <td style={{ padding: '12px' }}>{veiculo.cliente_nome || veiculo.cliente?.nome || 'Não informado'}</td>
                    
                    {isAdmin && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleAbrirEdicao(veiculo)} 
                          style={{ marginRight: '8px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f0ad4e', border: 'none', borderRadius: '4px', color: '#fff' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleExcluir(veiculo.id, veiculo.placa)}
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

export default TelaVeiculos;