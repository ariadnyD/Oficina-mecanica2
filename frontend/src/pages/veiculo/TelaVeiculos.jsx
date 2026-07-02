import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
    if (!id) {
      alert("Erro: Não foi possível identificar o ID do veículo para exclusão.");
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja excluir o veículo de placa "${placa}"?`)) {
      try {
        // MUDE ESTA LINHA ABAIXO PARA O NOME EM PORTUGUÊS 
        await veiculoServices.excluirVeiculo(id); 
        
        alert("Veículo excluído com sucesso!");
        carregarVeiculos(); // Atualiza a tabela na hora
      } catch (erro) {
        console.error("Erro completo:", erro);
        alert("Erro ao excluir veículo.");
      }
    }
  };

  const veiculosFiltrados = veiculos.filter(veiculo => {
    const termo = termoBusca.toLowerCase();
    return (
      (veiculo.placa && veiculo.placa.toLowerCase().includes(termo)) ||
      (veiculo.marca && veiculo.marca.toLowerCase().includes(termo)) ||
      (veiculo.modelo && veiculo.modelo.toLowerCase().includes(termo)) ||
      (veiculo.cliente_nome && veiculo.cliente_nome.toLowerCase().includes(termo))
    );
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Módulo de Veículos</h2>
        
        {!exibirFormulario && (
          <button 
            onClick={() => {
              setVeiculoEmEdicao(null);
              setExibirFormulario(true);
            }}
            style={{ padding: '10px 15px', backgroundColor: 'var(--text-h)', color: 'var(--bg)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Cadastrar Novo Veículo
          </button>
        )}
      </div>

      {!exibirFormulario && (
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar veículo por placa, marca, modelo ou proprietário..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 15px', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              backgroundColor: 'var(--social-bg)',
              color: 'var(--text)',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      )}

      {exibirFormulario && (
        <FormVeiculo 
          veiculoEmEdicao={veiculoEmEdicao} 
          onSalvarSucesso={handleSalvarSucesso}
          aoCancelar={() => {
            setExibirFormulario(false);
            setVeiculoEmEdicao(null);
          }}
        />
      )}

      {!exibirFormulario && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--social-bg)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Placa</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Modelo / Marca</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Proprietário</th>
                {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {veiculosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? "4" : "3"} style={{ padding: '20px', textAlign: 'center' }}>
                    {veiculos.length === 0 ? "Nenhum veículo cadastrado." : "Nenhum veículo encontrado na busca."}
                  </td>
                </tr>
              ) : (
                veiculosFiltrados.map((veiculo) => (
                  <tr key={veiculo.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>
                      <Link to={`/veiculos/${veiculo.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>
                        {veiculo.placa ? veiculo.placa.toUpperCase() : 'SEM PLACA'}
                      </Link>
                    </td>
                    <td style={{ padding: '12px' }}>{veiculo.marca} - {veiculo.modelo}</td>
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