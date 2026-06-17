import { useState, useEffect } from 'react';
import clienteServices from '../../services/clienteServices'; 

function FormCliente({ aoCancelar, aoSalvarSucesso, clienteEmEdicao }) { 
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [clienteInativoId, setClienteInativoId] = useState(null);

  // MÁGICA DO EDITAR: Preenche as caixinhas automaticamente
  useEffect(() => {
    if (clienteEmEdicao) {
      setNome(clienteEmEdicao.nome || '');
      setCpf(clienteEmEdicao.cpf || '');
      setDataNascimento(clienteEmEdicao.data_nascimento || '');
      setEndereco(clienteEmEdicao.endereco || '');
      setTelefone(clienteEmEdicao.telefone || '');
    }
  }, [clienteEmEdicao]);

  const handleSubmeter = async (e) => {
    e.preventDefault();

    if (!nome || !cpf || !dataNascimento || !endereco || !telefone) {
      setMensagem("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const dadosCliente = { nome, cpf, data_nascimento: dataNascimento, endereco, telefone };
      
      if (clienteEmEdicao) {
        await clienteServices.editarCliente(clienteEmEdicao.cpf, dadosCliente);
      } else {
        await clienteServices.cadastrarCliente(dadosCliente);
      }
      
      aoSalvarSucesso(); 
      
    } catch (erro) {
      if (erro.inativo) {
        setMensagem(erro.mensagem); 
        setClienteInativoId(erro.cliente_id); 
      } else if (erro.mensagem) {
        setMensagem(erro.mensagem);
      } else {
        setMensagem("Erro de conexão com o servidor.");
      }
    }
  };

  const handleReativar = async () => {
    try {
      const dadosAtualizados = { nome, telefone, endereco };
      await clienteServices.reativarCliente(clienteInativoId, dadosAtualizados);
      aoSalvarSucesso();
    } catch (erro) {
      setMensagem(erro.erro || "Erro ao tentar reativar o cliente.");
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--social-bg)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{clienteEmEdicao ? "Editar Cliente" : "Novo Cliente"}</h3>
        <button type="button" onClick={aoCancelar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❌ Fechar</button>
      </div>
      
      {mensagem && (
        <p style={{ fontWeight: 'bold', color: clienteInativoId ? '#f0ad4e' : '#d9534f' }}>
          {mensagem}
        </p>
      )}

      <form onSubmit={handleSubmeter}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nome:</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>CPF:</label>
            {/* CPF bloqueado se for edição ou reativação */}
            <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={clienteInativoId !== null || clienteEmEdicao !== null} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Data Nasc.:</label>
            {/* Data bloqueada se for edição ou reativação */}
            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={clienteInativoId !== null || clienteEmEdicao !== null} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Telefone:</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Endereço:</label>
          <textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        {clienteInativoId ? (
          <button type="button" onClick={handleReativar} style={{ padding: '10px 15px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
            Sim, Reativar Cadastro!
          </button>
        ) : (
          <button type="submit" style={{ padding: '10px 15px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
            {clienteEmEdicao ? "Salvar Alterações" : "Salvar Cliente"}
          </button>
        )}
      </form>
    </div>
  );
}

export default FormCliente;