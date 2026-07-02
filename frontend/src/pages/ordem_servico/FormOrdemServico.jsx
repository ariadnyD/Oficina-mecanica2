import { useState, useEffect } from 'react';
import api from '../../services/api';

function FormOrdemServico({ aoCancelar, aoSalvarSucesso, osEmEdicao }) {
  const [formData, setFormData] = useState({
    veiculo: '', 
    status: 'ABERTA', 
    forma_pagamento: '', 
    valor_total: 0,      
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
      try {
        const resVeiculos = await api.get('veiculos/');
        setVeiculos(resVeiculos.data);
      } catch (e) { console.error("Erro ao carregar veículos", e); }

      try {
        const resProc = await api.get('procedimentos/');
        setProcedimentosDisp(resProc.data);
      } catch (e) { console.error("Erro ao carregar procedimentos", e); }

      try {
        const resInsumos = await api.get('core/insumo/');
        setInsumosDisp(resInsumos.data);
      } catch (e) { console.error("Erro ao carregar insumos", e); }
    };

    carregarDados();
  }, []);

  // Preenche o formulário quando vamos EDITAR uma OS existente
  useEffect(() => {
    if (osEmEdicao) {
      setFormData({
        veiculo: osEmEdicao.veiculo || '',
        status: osEmEdicao.status || 'ABERTA',
        forma_pagamento: osEmEdicao.forma_pagamento || '',
        valor_total: osEmEdicao.valor_total || 0,
        observacoes: osEmEdicao.observacoes || '',
        // Mapeia para garantir que a estrutura enviada ao back mantenha o id do relacionamento correto
        procedimentos: osEmEdicao.procedimentos ? osEmEdicao.procedimentos.map(p => ({
          procedimento: p.procedimento,
          nome_procedimento: p.nome_procedimento,
          valor_cobrado: p.valor_cobrado
        })) : [],
        insumos: osEmEdicao.insumos ? osEmEdicao.insumos.map(i => ({
          insumo: i.insumo,
          nome_insumo: i.nome_insumo,
          quantidade_utilizada: i.quantidade_utilizada
        })) : []
      });
    }
  }, [osEmEdicao]);

  // Mágica do cálculo automático do Valor Total baseado nos Procedimentos
  useEffect(() => {
    const total = formData.procedimentos.reduce((soma, item) => soma + parseFloat(item.valor_cobrado || 0), 0);
    setFormData(prev => ({ ...prev, valor_total: total.toFixed(2) }));
  }, [formData.procedimentos]);

  const adicionarProcedimento = () => {
    if (!procSelecionado) return;
    const proc = procedimentosDisp.find(p => p.id === parseInt(procSelecionado));
    if (proc) {
      setFormData(prev => ({
        ...prev,
        procedimentos: [...prev.procedimentos, {
          procedimento: proc.id,
          nome_procedimento: proc.nome,
          valor_cobrado: proc.valor
        }]
      }));
      setProcSelecionado('');
    }
  };

  const removerProcedimento = (index) => {
    setFormData(prev => ({
      ...prev,
      procedimentos: prev.procedimentos.filter((_, i) => i !== index)
    }));
  };

  const adicionarInsumo = () => {
    if (!insumoSelecionado) return;
    const ins = insumosDisp.find(i => i.id === parseInt(insumoSelecionado));
    if (ins) {
      setFormData(prev => ({
        ...prev,
        insumos: [...prev.insumos, {
          insumo: ins.id,
          nome_insumo: ins.nome,
          quantidade_utilizada: parseFloat(qtdInsumo)
        }]
      }));
      setInsumoSelecionado('');
      setQtdInsumo(1);
    }
  };

  const removerInsumo = (index) => {
    setFormData(prev => ({
      ...prev,
      insumos: prev.insumos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmeter = async (e) => {
    e.preventDefault();
    if (!formData.veiculo) {
      setMensagem("Por favor, selecione um veículo.");
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
      console.error("Erro ao salvar ordem de serviço", erro);
      setMensagem("Ocorreu um erro ao salvar a Ordem de Serviço. Verifique os dados.");
    }
  };

  return (
    <form onSubmit={handleSubmeter} style={{ maxWidth: '700px', margin: '0 auto', padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'left' }}>
      <h2 style={{ marginTop: 0, borderBottom: '2px solid var(--accent)', paddingBottom: '10px' }}>
        {osEmEdicao ? `Editar OS #${osEmEdicao.id}` : 'Nova Ordem de Serviço'}
      </h2>

      {mensagem && <p style={{ backgroundColor: '#d9534f', color: 'white', padding: '10px', borderRadius: '4px', fontWeight: 'bold' }}>{mensagem}</p>}

      {/* Grid Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Veículo Target:*</label>
          <select value={formData.veiculo} onChange={(e) => setFormData({...formData, veiculo: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
            <option value="">Selecione o veículo...</option>
            {veiculos.map(v => (
              <option key={v.id} value={v.id}>{v.placa} - {v.marca} {v.modelo}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Status Atual:*</label>
          <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
            <option value="ABERTA">Aberta (Em Orçamento)</option>
            <option value="EM_EXECUCAO">Em Execução</option>
            <option value="CONCLUIDA">Concluída (Aguardando Pagamento)</option>
            <option value="FINALIZADA">Finalizada e Paga</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Área de Procedimentos */}
      <div style={{ border: '1px solid var(--border)', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, fontSize: '16px' }}>Adicionar Procedimentos</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select value={procSelecionado} onChange={(e) => setProcSelecionado(e.target.value)} style={{ flex: 1, padding: '8px' }}>
            <option value="">Escolha um procedimento...</option>
            {procedimentosDisp.map(p => (
              <option key={p.id} value={p.id}>{p.nome} - R$ {parseFloat(p.valor).toFixed(2)}</option>
            ))}
          </select>
          <button type="button" onClick={adicionarProcedimento} style={{ padding: '8px 15px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
        </div>
        
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          {formData.procedimentos.map((proc, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>{proc.nome_procedimento || 'Procedimento Selecionado'} - <strong>R$ {parseFloat(proc.valor_cobrado).toFixed(2)}</strong></span>
              <button type="button" onClick={() => removerProcedimento(index)} style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer' }}>❌</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Área de Insumos */}
      <div style={{ border: '1px solid var(--border)', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3 style={{ marginTop: 0, fontSize: '16px' }}>Peças e Insumos</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select value={insumoSelecionado} onChange={(e) => setInsumoSelecionado(e.target.value)} style={{ flex: 2, padding: '8px' }}>
            <option value="">Escolha um insumo...</option>
            {insumosDisp.map(i => (
              <option key={i.id} value={i.id}>{i.nome} ({i.marca}) - Qtd: {i.quantidade}</option>
            ))}
          </select>
          <input type="number" min="1" value={qtdInsumo} onChange={(e) => setQtdInsumo(e.target.value)} style={{ flex: '0.5', padding: '8px', textAlign: 'center' }} />
          <button type="button" onClick={adicionarInsumo} style={{ padding: '8px 15px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
        </div>

        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          {formData.insumos.map((ins, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <span>{ins.quantidade_utilizada}x {ins.nome_insumo || 'Insumo Cadastrado'}</span>
              <button type="button" onClick={() => removerInsumo(index)} style={{ background: 'none', border: 'none', color: '#d9534f', cursor: 'pointer' }}>❌</button>
            </li>
          ))}
        </ul>
      </div>

      
      {/* SEÇÃO FINANCEIRA: FORMA DE PAGAMENTO + VALOR TOTAL EDITÁVEL */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
  
        {/* Campo: Forma de Pagamento */}
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)', fontWeight: 'bold' }}>
            Forma de Pagamento:
          </label>
          <select 
            value={formData.forma_pagamento || ''} 
            onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})} 
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box', 
              backgroundColor: 'var(--bg)', 
              color: 'var(--text)', 
              border: '1px solid var(--border)', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          >
            <option value="">Ainda não pago / Pendente</option>
            <option value="PIX">Pix</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="CARTAO_CREDITO">Cartão de Crédito</option>
            <option value="CARTAO_DEBITO">Cartão de Débito</option>
          </select>
        </div>

        {/* Campo: Valor Total Manual */}
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text)', fontWeight: 'bold' }}>
            Valor Total (R$):
          </label>
          <input 
            type="number" 
            step="0.01" 
            min="0"
            placeholder="0.00"
            value={formData.valor_total} 
            onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })} 
            style={{ 
              width: '100%', 
              padding: '8px', 
              boxSizing: 'border-box', 
              backgroundColor: 'var(--bg)', 
              color: 'var(--text)', 
              border: '1px solid var(--border)', 
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold'
            }} 
          />
        </div>

    </div>

      {/* Observações */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Observações Gerais:</label>
        <textarea value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} rows="3" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>

      {/* Botões de Ação */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <button type="button" onClick={aoCancelar} style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
        <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Ordem de Serviço</button>
      </div>
    </form>
  );
}

export default FormOrdemServico;