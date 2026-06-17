import { useState, useEffect } from 'react';
import procedimentoServices from '../../services/procedimentoServices';
import FormProcedimento from './FormProcedimento';

function TelaProcedimentos() {
  const [procedimentos, setProcedimentos] = useState([]);
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [procedimentoEmEdicao, setProcedimentoEmEdicao] = useState(null);
  const [termoBusca, setTermoBusca] = useState('');
  const [mensagem, setMensagem] = useState('');

  // 👇 NOSSA CHAVE MÁGICA DE ADMIN (A mesma que usamos nas outras telas)
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const carregarProcedimentos = async () => {
    try {
      const dados = await procedimentoServices.getProcedimentos();
      setProcedimentos(dados);
    } catch (erro) {
      setMensagem("Erro ao carregar a lista de procedimentos.");
    }
  };

  useEffect(() => {
    carregarProcedimentos();
  }, []);

  const handleSalvarSucesso = () => {
    setExibirFormulario(false);
    setProcedimentoEmEdicao(null);
    carregarProcedimentos();
  };

  const handleAbrirEdicao = (procedimento) => {
    setProcedimentoEmEdicao(procedimento);
    setExibirFormulario(true);
  };

  const handleExcluir = async (id, nome) => {
    // MS07: Mensagem de confirmação exigida na especificação
    const confirmacao = window.confirm(`Deseja realmente suspender o cadastro deste procedimento (${nome}) no sistema?`);
    
    if (confirmacao) {
      try {
        await procedimentoServices.excluirProcedimento(id);
        alert("O procedimento foi desativado com sucesso!"); // MS03
        carregarProcedimentos();
      } catch (erro) {
        alert("Erro: O sistema apresentou instabilidade e não registrou a desativação do procedimento. Tente novamente."); // MS06
      }
    }
  };

  // Filtro em tempo real por nome
  const procedimentosFiltrados = procedimentos.filter((proc) => 
    proc.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Módulo de Procedimentos</h2>
        
        {!exibirFormulario && (
          <button 
            onClick={() => {
              setProcedimentoEmEdicao(null);
              setExibirFormulario(true);
            }}
            style={{ padding: '10px 15px', backgroundColor: 'var(--text-h)', color: 'var(--bg)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Cadastrar Novo Procedimento
          </button>
        )}
      </div>

      {/* Barra de Pesquisa */}
      {!exibirFormulario && (
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar procedimento por nome..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 15px', borderRadius: '8px', 
              border: '1px solid var(--border)', backgroundColor: 'var(--social-bg)',
              color: 'var(--text)', fontSize: '16px', boxSizing: 'border-box'
            }}
          />
        </div>
      )}

      {mensagem && <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>{mensagem}</p>}

      {exibirFormulario && (
        <FormProcedimento 
          procedimentoEmEdicao={procedimentoEmEdicao}
          aoCancelar={() => {
            setExibirFormulario(false);
            setProcedimentoEmEdicao(null);
          }}
          aoSalvarSucesso={handleSalvarSucesso}
        />
      )}

      {!exibirFormulario && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--social-bg)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Procedimento</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Tempo Médio</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Valor</th>
                {/* 👇 Esconde o cabeçalho se não for Admin */}
                {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {procedimentosFiltrados.length === 0 ? (
                <tr>
                  {/* 👇 Ajusta a quantidade de colunas que a mensagem ocupa */}
                  <td colSpan={isAdmin ? "4" : "3"} style={{ padding: '20px', textAlign: 'center' }}>
                    {procedimentos.length === 0 ? "Nenhum procedimento cadastrado." : "Nenhum procedimento encontrado."}
                  </td>
                </tr>
              ) : (
                procedimentosFiltrados.map((proc) => (
                  <tr key={proc.id} style={{ borderBottom: '1px solid var(--border)', opacity: proc.is_active ? 1 : 0.5 }}>
                    <td style={{ padding: '12px' }}>
                      <strong>{proc.nome}</strong>
                      <div style={{ fontSize: '12px', color: 'gray', marginTop: '4px' }}>{proc.descricao}</div>
                    </td>
                    <td style={{ padding: '12px' }}>{proc.tempo_medio}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      R$ {parseFloat(proc.valor).toFixed(2)}
                    </td>
                    
                    {/* 👇 Só renderiza a coluna e os botões se for Admin */}
                    {isAdmin && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleAbrirEdicao(proc)} 
                          style={{ marginRight: '8px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f0ad4e', border: 'none', borderRadius: '4px', color: '#fff' }}
                        >
                          Editar
                        </button>
                        {proc.is_active && (
                          <button 
                            onClick={() => handleExcluir(proc.id, proc.nome)}
                            style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#d9534f', border: 'none', borderRadius: '4px', color: '#fff' }}
                          >
                            Suspender
                          </button>
                        )}
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

export default TelaProcedimentos;