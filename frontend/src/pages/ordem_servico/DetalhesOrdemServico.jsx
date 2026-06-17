import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

function DetalhesOrdemServico() {
  const { id } = useParams(); 
  const [os, setOs] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDetalhes = async () => {
      try {
        const resposta = await api.get(`ordens-servico/${id}/`);
        setOs(resposta.data);
      } catch (erro) {
        console.error("Erro ao carregar detalhes da OS", erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarDetalhes();
  }, [id]);

  if (carregando) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando detalhes da Ordem de Serviço...</p>;
  if (!os) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Ordem de Serviço não encontrada.</p>;

  // Funções auxiliares para formatação
  const formatarData = (dataString) => {
    if (!dataString) return '-';
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status) => {
    if (status === 'FINALIZADA') return '#5cb85c';
    if (status === 'CANCELADA') return '#d9534f';
    return '#f0ad4e';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      
      {/* Botão de Voltar padrão do seu sistema */}
      <Link to="/ordens-servico" style={{ display: 'inline-block', marginBottom: '20px', textDecoration: 'none', color: 'var(--accent)', fontWeight: 'bold' }}>
        &larr; Voltar para a lista
      </Link>

      <div style={{ backgroundColor: 'var(--social-bg)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-h)' }}>Ordem de Serviço #{os.id}</h2>
          <span style={{ 
            padding: '6px 12px', 
            borderRadius: '4px', 
            fontSize: '14px',
            backgroundColor: getStatusColor(os.status),
            color: '#fff',
            fontWeight: 'bold'
          }}>
            {os.status}
          </span>
        </div>

        {/* Informações Principais (Grid igual de Clientes) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Veículo (Placa):</strong></p>
            <p style={{ margin: 0, fontSize: '18px' }}>{os.placa_veiculo || 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Cliente:</strong></p>
            <p style={{ margin: 0, fontSize: '18px' }}>{os.nome_cliente || 'N/A'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Data de Abertura:</strong></p>
            <p style={{ margin: 0, fontSize: '18px' }}>{formatarData(os.data_abertura)}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Data de Conclusão:</strong></p>
            <p style={{ margin: 0, fontSize: '18px' }}>{formatarData(os.data_conclusao)}</p>
          </div>
        </div>

        {/* Lista de Procedimentos */}
        {os.procedimentos && os.procedimentos.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', color: 'var(--text-h)' }}>Serviços Realizados</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {os.procedimentos.map((proc, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text)' }}>{proc.nome_procedimento}</span>
                        <strong style={{ color: 'var(--text-h)' }}>R$ {proc.valor_cobrado}</strong>
                    </li>
                ))}
              </ul>
            </div>
        )}

        {/* Lista de Insumos */}
        {os.insumos && os.insumos.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', color: 'var(--text-h)' }}>Peças / Insumos Utilizados</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {os.insumos.map((ins, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text)' }}>{ins.quantidade_utilizada}x {ins.nome_insumo}</span>
                    </li>
                ))}
              </ul>
            </div>
        )}

        {/* Observações */}
        {os.observacoes && (
          <div style={{ marginTop: '30px' }}>
              <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Observações Gerais:</strong></p>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.5', backgroundColor: 'var(--bg)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}>{os.observacoes}</p>
          </div>
        )}

        {/* Rodapé com Total */}
        <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '2px solid var(--border)', paddingTop: '20px' }}>
          <p style={{ margin: '0 0 5px', color: 'var(--text)', fontSize: '16px' }}><strong>Forma de Pagamento:</strong> {os.forma_pagamento || 'Não definida'}</p>
          <h2 style={{ margin: 0, color: 'var(--accent)', fontSize: '28px' }}>Total: R$ {os.valor_total}</h2>
        </div>

      </div>
    </div>
  );
}

export default DetalhesOrdemServico;