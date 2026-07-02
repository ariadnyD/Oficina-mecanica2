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
      setMensagem("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const dadosCliente = { nome, cpf, data_nascimento: dataNascimento, endereco, telefone };
      
      // AQUI ESTÁ A CORREÇÃO: Usamos o CPF como identificador para a edição
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
      } else {
        setMensagem(erro.mensagem || "Erro ao salvar.");
      }
    }
  };

  const handleReativar = async () => {
    try {
      const dadosAtualizados = { nome, telefone, endereco };
      await clienteServices.reativarCliente(clienteInativoId, dadosAtualizados);
      aoSalvarSucesso();
    } catch (erro) {
      setMensagem("Erro ao reativar.");
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--social-bg)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{clienteEmEdicao ? "Editar Cliente" : "Novo Cliente"}</h3>
        <button type="button" onClick={aoCancelar} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>❌ Fechar</button>
      </div>
      
      {mensagem && <p style={{ fontWeight: 'bold', color: '#d9534f' }}>{mensagem}</p>}

      <form onSubmit={handleSubmeter}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label>Nome:</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>CPF:</label>
            <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={!!clienteEmEdicao} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Data Nasc.:</label>
            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} disabled={!!clienteEmEdicao} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Telefone:</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Endereço:</label>
          <textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} rows="2" style={{ width: '100%', padding: '8px' }} />
        </div>
        {clienteInativoId ? (
          <button type="button" onClick={handleReativar} style={{ width: '100%', padding: '10px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px' }}>Reativar Cadastro</button>
        ) : (
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px' }}>Salvar</button>
        )}
      </form>
    </div>
  );
}

export default FormCliente;