import { useState, useEffect } from 'react';
import veiculoServices from '../../services/veiculoServices'; 

function FormVeiculo({ aoCancelar, onSalvarSucesso, clientePreSelecionado, veiculoEmEdicao }) {
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [tipo, setTipo] = useState('');
  const [cor, setCor] = useState('');
  const [ano, setAno] = useState('');
  const [cpfDono, setCpfDono] = useState('');
  
  // Para garantir que o ID do cliente da edição seja mantido
  const [idClienteEdicao, setIdClienteEdicao] = useState(null);
  
  const [mensagem, setMensagem] = useState('');
  const [errosCampos, setErrosCampos] = useState({}); 

  useEffect(() => {
    if (veiculoEmEdicao) {
      setPlaca(veiculoEmEdicao.placa || '');
      setMarca(veiculoEmEdicao.marca || '');
      setModelo(veiculoEmEdicao.modelo || '');
      setTipo(veiculoEmEdicao.tipo || '');
      setCor(veiculoEmEdicao.cor || '');
      setAno(veiculoEmEdicao.ano || '');
      setIdClienteEdicao(veiculoEmEdicao.cliente || null);
    }
  }, [veiculoEmEdicao]);

  const handleSubmeter = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErrosCampos({});

    // Arranca tudo que não for número (pontos, traços, espaços) do CPF digitado
    const cpfLimpo = cpfDono ? cpfDono.replace(/\D/g, '') : '';
    
    // Agora usamos o cpfLimpo em vez do cpfDono puro
    const idClienteFinal = clientePreSelecionado || idClienteEdicao || cpfLimpo;

    if (!placa || !marca || !modelo || !tipo || !cor || !ano || !idClienteFinal) {
      setMensagem("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const dadosVeiculo = { 
        placa, 
        marca, 
        modelo, 
        tipo, 
        cor, 
        ano,
        cliente: idClienteFinal 
      };
      
      if (veiculoEmEdicao) {
        await veiculoServices.editarVeiculo(veiculoEmEdicao.id, dadosVeiculo);
      } else {
        await veiculoServices.cadastrarVeiculo(dadosVeiculo);
      }
      
      onSalvarSucesso(); 
      
    } catch (erro) {
      console.error("Erro completo do backend:", erro);
      
      // Captura e exibe o erro exato que o Django devolveu
      if (erro.response && erro.response.data) {
        const msgs = Object.entries(erro.response.data)
          .map(([campo, msg]) => `${campo.toUpperCase()}: ${msg}`)
          .join(' | ');
        setMensagem(`Erro do Servidor ➔ ${msgs}`);
      } 
      else if (erro.detalhes && typeof erro.detalhes === 'object') {
        const msgs = Object.entries(erro.detalhes)
          .map(([campo, msg]) => `${campo.toUpperCase()}: ${msg}`)
          .join(' | ');
        setMensagem(`Erro ➔ ${msgs}`);
      } 
      else {
        setMensagem(erro.erro || erro.message || "Erro desconhecido ao guardar veículo.");
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--social-bg)', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{veiculoEmEdicao ? "Editar Veículo" : "Novo Veículo"}</h3>
        <button type="button" onClick={aoCancelar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❌ Fechar</button>
      </div>
      
      {mensagem && <p style={{ fontWeight: 'bold', color: '#d9534f' }}>{mensagem}</p>}

      <form onSubmit={handleSubmeter}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          
          {!clientePreSelecionado && !veiculoEmEdicao && (
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>CPF do Cliente:</label>
              <input type="text" value={cpfDono} onChange={(e) => setCpfDono(e.target.value)} placeholder="000.111.222-33" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Placa:</label>
            <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} disabled={!!veiculoEmEdicao} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tipo:</label>
            <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Marca:</label>
            <input type="text" value={marca} onChange={(e) => setMarca(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Modelo:</label>
            <input type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Cor:</label>
            <input type="text" value={cor} onChange={(e) => setCor(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Ano:</label>
            <input type="number" value={ano} onChange={(e) => setAno(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
          </div>
        </div>

        <button type="submit" style={{ padding: '10px 15px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
          {veiculoEmEdicao ? "Guardar Alterações" : "Guardar Veículo"}
        </button>
      </form>
    </div>
  );
}

export default FormVeiculo;