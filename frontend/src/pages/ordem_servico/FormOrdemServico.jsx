import { useState, useEffect } from 'react';
import api from '../../services/api';

function FormOrdemServico({ aoCancelar, aoSalvarSucesso, osEmEdicao }) {
  const [formData, setFormData] = useState({
    veiculo: '', 
    status: 'ABERTA', 
    observacoes: '', 
    procedimentos: [], 
    insumos: []
  });
  const [veiculos, setVeiculos] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // Carrega lista de veículos e preenche form em caso de edição
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await api.get('veiculos/');
        setVeiculos(res.data);
      } catch (error) {
        console.error("Erro ao carregar veículos", error);
      }
    };
    
    carregarDados();

    if (osEmEdicao) {
      setFormData({
        veiculo: osEmEdicao.veiculo || '',
        status: osEmEdicao.status || 'ABERTA',
        observacoes: osEmEdicao.observacoes || '',
        procedimentos: osEmEdicao.procedimentos || [],
        insumos: osEmEdicao.insumos || []
      });
    }
  }, [osEmEdicao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.veiculo) {
      setMensagem("Por favor, selecione um veículo válido.");
      return;
    }

    try {
      if (osEmEdicao) {
        await api.put(`ordens-servico/${osEmEdicao.id}/`, formData);
      } else {
        await api.post('ordens-servico/', formData);
      }
      aoSalvarSucesso();
    } catch (erro) {
      setMensagem("Erro ao salvar. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--social-bg)', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>{osEmEdicao ? `Editar OS #${osEmEdicao.id}` : "Nova Ordem de Serviço"}</h3>
        <button type="button" onClick={aoCancelar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text)' }}>
          ❌ Fechar
        </button>
      </div>
      
      {mensagem && (
        <p style={{ fontWeight: 'bold', color: '#d9534f', marginBottom: '15px' }}>
          {mensagem}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Veículo (Placa):</label>
            <select 
              value={formData.veiculo} 
              onChange={(e) => setFormData({...formData, veiculo: e.target.value})}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }}
            >
              <option value="">Selecione um veículo...</option>
              {veiculos.map(v => (
                <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Status da OS:</label>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }}
            >
              <option value="ABERTA">Aberta (Em Orçamento)</option>
              <option value="EM_EXECUCAO">Em Execução</option>
              <option value="CONCLUIDA">Concluída (Aguardando Pagamento)</option>
              <option value="FINALIZADA">Finalizada e Paga (Baixa Estoque)</option>
            </select>
          </div>

        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Observações Gerais:</label>
          <textarea 
            value={formData.observacoes} 
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})} 
            rows="3" 
            placeholder="Detalhes sobre o serviço ou estado do veículo..."
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }} 
          />
        </div>

        <button type="submit" style={{ padding: '10px 15px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>
          {osEmEdicao ? "Salvar Alterações da OS" : "Criar Ordem de Serviço"}
        </button>
      </form>
    </div>
  );
}

export default FormOrdemServico;