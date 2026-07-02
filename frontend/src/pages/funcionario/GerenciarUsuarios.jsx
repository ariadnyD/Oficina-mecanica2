import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom'; // certifique-se de importar o Link no topo do arquivo

function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [mensagem, setMensagem] = useState('');

  const carregarUsuarios = async () => {
    try {
      const resposta = await api.get('auth/users/');
      setUsuarios(resposta.data);
    } catch (erro) {
      setMensagem('Erro ao carregar os usuários.');
      console.error(erro);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const alternarPermissao = async (id, isStaffAtual) => {
    try {
      // Usamos PATCH para atualizar apenas um campo específico no backend
      await api.patch(`auth/users/${id}/`, { is_staff: !isStaffAtual });
      setMensagem('Permissão atualizada com sucesso!');
      carregarUsuarios(); // Recarrega a lista para mostrar o novo status
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMensagem(''), 3000);
    } catch (erro) {
      setMensagem('Erro ao atualizar a permissão.');
      console.error(erro);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', backgroundColor: 'var(--social-bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
      
      {/* Cabeçalho da página com Título e Botão lado a lado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h2>👥 Gerenciar Equipe</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Aqui você pode promover ou rebaixar usuários do sistema.</p>
        </div>
        
        {/* Aqui está o botão de cadastrar que trouxemos para cá! */}
        <Link 
          to="/cadastro-funcionario" 
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#5cb85c', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '6px', 
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Novo Funcionário
        </Link>
      </div>
      
      {mensagem && <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#d9edf7', color: '#31708f', borderRadius: '4px' }}>{mensagem}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Usuário</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Nível de Acesso</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px' }}>{user.id}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.username}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {user.is_staff ? (
                  <span style={{ backgroundColor: '#5cb85c', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>Administrador</span>
                ) : (
                  <span style={{ backgroundColor: '#f0ad4e', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>Funcionário</span>
                )}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button 
                  onClick={() => alternarPermissao(user.id, user.is_staff)}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: 'var(--accent)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer' 
                  }}
                >
                  {user.is_staff ? 'Tornar Funcionário' : 'Tornar Administrador'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GerenciarUsuarios;