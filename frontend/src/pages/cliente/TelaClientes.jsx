import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clienteServices from '../../services/clienteServices';
import FormCliente from './FormCliente'; 

function TelaClientes() {
  const [clientes, setClientes] = useState([]);
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null); 
  const [termoBusca, setTermoBusca] = useState('');

  const isAdmin = localStorage.getItem('is_admin') === 'true';

  const carregarClientes = async () => {
    const dadosVindosDoDjango = await clienteServices.getClientes();
    setClientes(dadosVindosDoDjango);
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const handleSalvarSucesso = () => {
    setExibirFormulario(false);
    setClienteEmEdicao(null);
    carregarClientes();
  };

  const handleAbrirEdicao = (cliente) => {
    setClienteEmEdicao(cliente);
    setExibirFormulario(true);
  };

  const handleExcluir = async (cpf, nome) => {
    // Verifica se o CPF existe antes de avançar
    if (!cpf) {
      alert("Erro: Não foi possível identificar o CPF do cliente para exclusão.");
      return;
    }

    const confirmacao = window.confirm(`Tem certeza que deseja excluir o cliente ${nome}?`);
    if (confirmacao) {
      try {
        // Certifique-se de que o clienteServices.excluirCliente aceita o cpf como argumento
        const resposta = await clienteServices.excluirCliente(cpf);
        alert(resposta.mensagem || "Cliente desativado com sucesso!");
        carregarClientes();
      } catch (erro) {
        alert(erro.erro || "Erro ao excluir o cliente.");
      }
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = termoBusca.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.cpf.includes(termo) 
    );
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Módulo de Clientes</h2>
        
        {!exibirFormulario && (
          <button 
            onClick={() => {
              setClienteEmEdicao(null);
              setExibirFormulario(true);
            }}
            style={{ padding: '10px 15px', backgroundColor: 'var(--text-h)', color: 'var(--bg)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Cadastrar Novo Cliente
          </button>
        )}
      </div>

      {!exibirFormulario && (
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar cliente por nome ou CPF..." 
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
        <FormCliente 
          clienteEmEdicao={clienteEmEdicao}
          aoCancelar={() => {
            setExibirFormulario(false);
            setClienteEmEdicao(null);
          }} 
          aoSalvarSucesso={handleSalvarSucesso} 
        />
      )}

      {!exibirFormulario && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--social-bg)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>CPF</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Telefone</th>
                {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? "4" : "3"} style={{ padding: '20px', textAlign: 'center' }}>
                    {clientes.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum cliente encontrado na busca."}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.cpf} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>
                      <Link to={`/clientes/${cliente.cpf}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>
                        {cliente.nome}
                      </Link>
                    </td>
                    <td style={{ padding: '12px' }}>{cliente.cpf}</td>
                    <td style={{ padding: '12px' }}>{cliente.telefone}</td>
                    
                    {isAdmin && (
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleAbrirEdicao(cliente)} 
                          style={{ marginRight: '8px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f0ad4e', border: 'none', borderRadius: '4px', color: '#fff' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleExcluir(cliente.cpf, cliente.nome)}
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

export default TelaClientes;