import { useState, useEffect } from 'react';
import api from '../../services/api';
import FormInsumo from './FormInsumo';

function TelaInsumos() {
  const [insumos, setInsumos] = useState([]);
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [insumoEmEdicao, setInsumoEmEdicao] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');

  // 👇 CHAVE DE SEGURANÇA: Funcionário não edita nem exclui
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const carregarInsumos = async () => {
    try {
      const resposta = await api.get('core/insumo/');
      setInsumos(resposta.data);
    } catch (erro) {
      console.error("Erro ao carregar insumos", erro);
    }
  };

  useEffect(() => {
    carregarInsumos();
  }, []);

  const handleSalvarSucesso = () => {
    setExibirFormulario(false);
    setInsumoEmEdicao(null);
    carregarInsumos();
  };

  const handleAbrirEdicao = (insumo) => {
    setInsumoEmEdicao(insumo);
    setExibirFormulario(true);
  };

  const handleExcluir = async (id, nome) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o insumo ${nome}?`);
    if (confirmacao) {
      try {
        await api.delete(`core/insumo/${id}/`);
        carregarInsumos();
      } catch (erro) {
        alert("Erro ao excluir. Tente novamente.");
        console.error(erro);
      }
    }
  };

  const insumosFiltrados = insumos.filter((insumo) => {
    const termo = termoBusca.toLowerCase();
    return (
      insumo.nome.toLowerCase().includes(termo) ||
      insumo.marca.toLowerCase().includes(termo)
    );
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Módulo de Insumos</h2>
        
        {!exibirFormulario && (
          <button 
            onClick={() => {
              setInsumoEmEdicao(null);
              setExibirFormulario(true);
            }}
            style={{ padding: '10px 15px', backgroundColor: 'var(--text-h)', color: 'var(--bg)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Cadastrar Novo Insumo
          </button>
        )}
      </div>

      {/* Barra de Pesquisa Padronizada */}
      {!exibirFormulario && (
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar insumo por nome ou marca..." 
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
        <FormInsumo 
          aoCancelar={() => {
            setExibirFormulario(false);
            setInsumoEmEdicao(null);
          }} 
          aoSalvarSucesso={handleSalvarSucesso}
          insumoEmEdicao={insumoEmEdicao}
        />
      )}

      {!exibirFormulario && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--social-bg)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Marca</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Quantidade</th>
                {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {insumosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? "4" : "3"} style={{ padding: '20px', textAlign: 'center' }}>
                    {insumos.length === 0 ? "Nenhum insumo cadastrado." : "Nenhum insumo encontrado na busca."}
                  </td>
                </tr>
              ) : (
                insumosFiltrados.map((insumo) => (
                  <tr key={insumo.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{insumo.nome}</td>
                    <td style={{ padding: '12px' }}>{insumo.marca}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ backgroundColor: insumo.quantidade > 0 ? '#5cb85c' : '#d9534f', color: 'white', padding: '4px 8px', borderRadius: '12px' }}>
                        {insumo.quantidade}
                      </span>
                    </td>
                    
                    {/* 👇 Só exibe os botões se for admin */}
                    {isAdmin && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleAbrirEdicao(insumo)} 
                          style={{ marginRight: '8px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f0ad4e', border: 'none', borderRadius: '4px', color: '#fff' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleExcluir(insumo.id, insumo.nome)}
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

export default TelaInsumos;