import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

function DetalhesVeiculo() {
  const { id } = useParams();
  const [veiculo, setVeiculo] = useState(null);
  const [procedimentosRealizados, setProcedimentosRealizados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDadosDoVeiculo = async () => {
      try {
        // 1. Busca a Ficha do Veículo
        const resVeiculo = await api.get(`veiculos/${id}/`);
        setVeiculo(resVeiculo.data);

        // 2. Busca todas as Ordens de Serviço para minerar o histórico do veículo
        const resOS = await api.get('ordens-servico/');
        
        // Filtra apenas as ordens de serviço deste veículo específico
        const osDoVeiculo = resOS.data.filter(os => os.veiculo === parseInt(id));

        // Extrai os procedimentos de dentro de cada Ordem de Serviço encontrada
        let historico = [];
        osDoVeiculo.forEach(os => {
          if (os.procedimentos && os.procedimentos.length > 0) {
            os.procedimentos.forEach(proc => {
              historico.push({
                id: proc.id,
                nome: proc.nome_procedimento,
                valor: proc.valor_cobrado,
                data_conclusao: os.data_conclusao,
                status_os: os.status
              });
            });
          }
        });

        setProcedimentosRealizados(historico);
      } catch (erro) {
        console.error("Erro ao carregar detalhes e histórico do veículo", erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosDoVeiculo();
  }, [id]);

  if (carregando) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text)' }}>Carregando detalhes do veículo...</p>;
  if (!veiculo) return <p style={{ textAlign: 'center', marginTop: '50px', color: '#d9534f', fontWeight: 'bold' }}>Veículo não encontrado.</p>;

  const formatarData = (dataString) => {
    if (!dataString) return 'Em andamento (OS aberta)';
    return new Date(dataString).toLocaleString('pt-BR');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', color: 'var(--text)' }}>
      
      {/* Botão de Voltar */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/veiculos" style={{ textDecoration: 'none', color: '#0275d8', fontWeight: 'bold' }}>
          ← Voltar para Lista de Veículos
        </Link>
      </div>

      {/* CARD 1: Informações Técnicas e Proprietário */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '25px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '25px' }}>
        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--border)', paddingBottom: '10px', color: 'var(--accent)' }}>
          Ficha Técnica do Veículo — {veiculo.placa}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div><p style={{ margin: '5px 0' }}><strong>Placa:</strong> {veiculo.placa}</p></div>
          <div><p style={{ margin: '5px 0' }}><strong>Tipo:</strong> {veiculo.tipo}</p></div>
          <div><p style={{ margin: '5px 0' }}><strong>Marca:</strong> {veiculo.marca}</p></div>
          <div><p style={{ margin: '5px 0' }}><strong>Modelo:</strong> {veiculo.modelo}</p></div>
          <div><p style={{ margin: '5px 0' }}><strong>Cor:</strong> {veiculo.cor}</p></div>
          <div><p style={{ margin: '5px 0' }}><strong>Ano:</strong> {veiculo.ano || '-'}</p></div>
        </div>

        <h4 style={{ marginTop: '25px', borderBottom: '1px solid var(--border)', paddingBottom: '5px', color: 'var(--text)' }}>
          Dados do Proprietário
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
          <div><p style={{ margin: '5px 0' }}><strong>Nome do Cliente:</strong> {veiculo.cliente_nome || veiculo.cliente?.nome || 'Não informado'}</p></div>
          <div><p style={{ margin: '5px 0' }}><strong>CPF do Cliente:</strong> {veiculo.cliente_cpf || veiculo.cliente?.cpf || 'Não informado'}</p></div>
        </div>
      </div>

      {/* CARD 2: Histórico de Manutenções do Veículo */}
      <div style={{ backgroundColor: 'var(--bg-card)', padding: '25px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginTop: 0, borderBottom: '2px solid var(--border)', paddingBottom: '10px', color: 'var(--accent)' }}>
          Histórico de Procedimentos Realizados
        </h3>

        {procedimentosRealizados.length === 0 ? (
          <p style={{ color: 'var(--text)', fontStyle: 'italic', marginTop: '15px' }}>
            Nenhum procedimento foi realizado neste veículo até o momento.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Procedimento</th>
                <th style={{ padding: '10px' }}>Valor Cobrado</th>
                <th style={{ padding: '10px' }}>Data de Conclusão</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Status da OS</th>
              </tr>
            </thead>
            <tbody>
              {procedimentosRealizados.map((proc, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px' }}>{proc.nome}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>R$ {parseFloat(proc.valor).toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>{formatarData(proc.data_conclusao)}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: proc.status_os === 'FINALIZADA' ? '#5cb85c' : '#f0ad4e',
                      color: '#fff',
                      fontWeight: 'bold'
                    }}>
                      {proc.status_os}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default DetalhesVeiculo;