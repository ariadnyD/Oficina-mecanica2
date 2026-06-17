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
  const [procedimentosDisp, setProcedimentosDisp] = useState([]);
  const [insumosDisp, setInsumosDisp] = useState([]);
  const [mensagem, setMensagem] = useState('');

  // Estados temporários para os selects de adição
  const [procSelecionado, setProcSelecionado] = useState('');
  const [insumoSelecionado, setInsumoSelecionado] = useState('');
  const [qtdInsumo, setQtdInsumo] = useState(1);

// Carrega tudo que o formulário precisa de forma independente
  useEffect(() => {
    const carregarDados = async () => {
      // 1. Carrega Veículos
      try {
        const resVeiculos = await api.get('veiculos/');
        setVeiculos(resVeiculos.data);
      } catch (e) { console.error("Erro ao carregar veículos", e); }

      // 2. Carrega Procedimentos
      try {
        const resProc = await api.get('procedimentos/');
        setProcedimentosDisp(resProc.data);
      } catch (e) { console.error("Erro ao carregar procedimentos", e); }

      // 3. Carrega Insumos (O problemático)
      try {
        // Mude para 'insumo/' se no Django estiver no singular!
        const resInsumos = await api.get('core/insumo/'); 
        setInsumosDisp(resInsumos.data);
      } catch (e) { console.error("Erro ao carregar insumos", e); }
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

  // --- LÓGICA DE PROCEDIMENTOS ---
  const adicionarProcedimento = () => {
    if (!procSelecionado) return;
    
    const procCompleto = procedimentosDisp.find(p => p.id === parseInt(procSelecionado));
    if (!procCompleto) return;

    const novoProcedimento = {
      procedimento: procCompleto.id,
      nome_procedimento: procCompleto.nome, // Apenas para exibição visual
      valor_cobrado: procCompleto.valor
    };

    setFormData({ ...formData, procedimentos: [...formData.procedimentos, novoProcedimento] });
    setProcSelecionado('');
  };

  const removerProcedimento = (index) => {
    const novaLista = [...formData.procedimentos];
    novaLista.splice(index, 1);
    setFormData({ ...formData, procedimentos: novaLista });
  };

  // --- LÓGICA DE INSUMOS ---
  const adicionarInsumo = () => {
    if (!insumoSelecionado || qtdInsumo <= 0) return;

    const insumoCompleto = insumosDisp.find(i => i.id === parseInt(insumoSelecionado));
    if (!insumoCompleto) return;

    const novoInsumo = {
      insumo: insumoCompleto.id,
      nome_insumo: insumoCompleto.nome, // Apenas para exibição visual
      quantidade_utilizada: qtdInsumo
    };

    setFormData({ ...formData, insumos: [...formData.insumos, novoInsumo] });
    setInsumoSelecionado('');
    setQtdInsumo(1);
  };

  const removerInsumo = (index) => {
    const novaLista = [...formData.insumos];
    novaLista.splice(index, 1);
    setFormData({ ...formData, insumos: novaLista });
  };

  // --- SALVAR TUDO ---
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
        <p style={{ fontWeight: 'bold', color: '#d9534f', marginBottom: '15px' }}>{mensagem}</p>
      )}

      <form onSubmit={handleSubmit}>
        {/* DADOS BÁSICOS DA OS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Veículo (Placa):</label>
            <select value={formData.veiculo} onChange={(e) => setFormData({...formData, veiculo: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <option value="">Selecione um veículo...</option>
              {veiculos.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Status da OS:</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <option value="ABERTA">Aberta (Em Orçamento)</option>
              <option value="EM_EXECUCAO">Em Execução</option>
              <option value="CONCLUIDA">Concluída (Aguardando Pagamento)</option>
              <option value="FINALIZADA">Finalizada e Paga (Baixa Estoque)</option>
            </select>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

        {/* ÁREA DE PROCEDIMENTOS */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>Serviços / Procedimentos</h4>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <select value={procSelecionado} onChange={(e) => setProcSelecionado(e.target.value)} style={{ flex: 1, padding: '8px', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <option value="">Adicionar procedimento...</option>
              {procedimentosDisp.map(p => <option key={p.id} value={p.id}>{p.nome} - R$ {p.valor}</option>)}
            </select>
            <button type="button" onClick={adicionarProcedimento} style={{ padding: '8px 15px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add</button>
          </div>
          
          {formData.procedimentos.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {formData.procedimentos.map((proc, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <span>{proc.nome_procedimento || 'Serviço Registrado'}</span>
                  <div>
                    <span style={{ marginRight: '15px' }}>R$ {proc.valor_cobrado}</span>
                    <button type="button" onClick={() => removerProcedimento(index)} style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer' }}>❌</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr style={{ borderColor: 'var(--border)', margin: '20px 0' }} />

        {/* ÁREA DE INSUMOS */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>Peças / Insumos Utilizados</h4>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <select value={insumoSelecionado} onChange={(e) => setInsumoSelecionado(e.target.value)} style={{ flex: 2, padding: '8px', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <option value="">Adicionar peça...</option>
              {insumosDisp.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
            <input type="number" min="1" value={qtdInsumo} onChange={(e) => setQtdInsumo(e.target.value)} style={{ flex: 1, padding: '8px', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }} placeholder="Qtd" />
            <button type="button" onClick={adicionarInsumo} style={{ padding: '8px 15px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add</button>
          </div>

          {formData.insumos.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {formData.insumos.map((ins, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <span>{ins.quantidade_utilizada}x {ins.nome_insumo || 'Insumo Registrado'}</span>
                  <button type="button" onClick={() => removerInsumo(index)} style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer' }}>❌</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)' }}>Observações Gerais:</label>
          <textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} rows="3" style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }} />
        </div>

        <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px' }}>
          {osEmEdicao ? "Salvar Alterações da OS" : "Criar Ordem de Serviço"}
        </button>
      </form>
    </div>
  );
}

export default FormOrdemServico;