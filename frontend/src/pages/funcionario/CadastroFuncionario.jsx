import { useState } from 'react';
import api from '../../services/api';

function CadastroFuncionario() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      await api.post('auth/register/', { 
        username, 
        password, 
        is_staff: isStaff 
      });
      setMensagem('Funcionário cadastrado com sucesso!');
      setUsername('');
      setPassword('');
      setIsStaff(false);
    } catch (erro) {
      setMensagem('Erro ao cadastrar. Verifique se você está logada como Admin.');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 260px)', // Pega o espaço que sobra abaixo dos botões e centraliza perfeitamente
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Usando a mesma estrutura estética da caixinha de login */}
      <div className="login-container" style={{ margin: 0, width: '100%', maxWidth: '400px' }}>
        <h2 className="login-title">Cadastro de Funcionário</h2>
        
        <form onSubmit={handleCadastro} className="login-form">
          <div>
            <label>Usuário:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="login-input"
              required 
            />
          </div>
          
          <div>
            <label>Senha:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="login-input"
              required 
            />
          </div>
          
          {/* Caixa de seleção estilizada e bem alinhada */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '5px 0 10px 0' }}>
            <input 
              type="checkbox" 
              id="isStaff"
              checked={isStaff} 
              onChange={(e) => setIsStaff(e.target.checked)} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="isStaff" style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--text)' }}>
              É Administrador?
            </label>
          </div>
          
          {/* Mantive o botão combinando com o estilo do login, mas verde por ser um cadastro */}
          <button type="submit" className="login-button" style={{ backgroundColor: '#5cb85c' }}>
            Cadastrar Funcionário
          </button>
        </form>
        
        {/* Mensagem de sucesso/erro na mesma estética */}
        {mensagem && <div className="login-message">{mensagem}</div>}
      </div>
    </div>
  );
}

export default CadastroFuncionario;