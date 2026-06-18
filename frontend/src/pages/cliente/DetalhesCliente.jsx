import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import clienteServices from '../../services/clienteServices';

function DetalhesCliente() {
  const { id } = useParams(); 
  const [cliente, setCliente] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDetalhes = async () => {
      try {
        const dados = await clienteServices.getClientePorId(id);
        setCliente(dados);
      } catch (erro) {
        console.error("Erro ao carregar", erro);
      } finally {
        setCarregando(false);
      }
    };

    carregarDetalhes();
  }, [id]);

  if (carregando) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando detalhes do cliente...</p>;
  if (!cliente) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cliente não encontrado.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      
      <Link to="/clientes" style={{ display: 'inline-block', marginBottom: '20px', textDecoration: 'none', color: 'var(--accent)', fontWeight: 'bold' }}>
        ← Voltar para a lista
      </Link>

      <h2>{cliente.nome}</h2>

      <div style={{ backgroundColor: 'var(--social-bg)', padding: '25px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '15px' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Informações do Cliente</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div>
                <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>CPF:</strong></p>
                <p style={{ margin: 0, fontSize: '18px' }}>{cliente.cpf}</p>
            </div>
            
            <div>
                <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Data de Nascimento:</strong></p>
                <p style={{ margin: 0, fontSize: '18px' }}>{cliente.data_nascimento.split('-').reverse().join('/')}</p>
            </div>

            <div>
                <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Telefone:</strong></p>
                <p style={{ margin: 0, fontSize: '18px' }}>{cliente.telefone}</p>
            </div>

            <div>
                <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Status:</strong></p>
                <p style={{ margin: 0, fontSize: '18px', color: cliente.is_active ? '#5cb85c' : '#d9534f', fontWeight: 'bold' }}>
                {cliente.is_active ? 'Ativo' : 'Inativo'}
                </p>
            </div>
            <div style={{ marginTop: '20px' }}>
                <p style={{ margin: '0 0 5px', color: 'var(--text)' }}><strong>Endereço Completo:</strong></p>
                <p style={{ margin: 0, fontSize: '18px', lineHeight: '1.5' }}>{cliente.endereco}</p>
            </div>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
        <Link 
          to={`/veiculos?cliente_id=${cliente.cpf}`} 
          style={{ padding: '10px 20px', backgroundColor: 'var(--accent)', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block' }}
        >
          🚗 Visualizar Veículos Cadastrados
        </Link>
      </div>
    </div>
  );
}

export default DetalhesCliente;