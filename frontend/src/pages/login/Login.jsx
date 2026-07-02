import { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('Autenticando...');

    try {
      // 1. Faz o login e pega os tokens
      const resposta = await api.post('auth/login/', { username, password });
      
      localStorage.setItem('access_token', resposta.data.access);
      localStorage.setItem('refresh_token', resposta.data.refresh);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${resposta.data.access}`;

      // 2. Descriptografa o token para pegar o ID do usuário
      const base64Url = resposta.data.access.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const dadosDoToken = JSON.parse(window.atob(base64));
      
      const idUsuario = dadosDoToken.user_id;
      const dadosUsuario = await api.get(`auth/users/${idUsuario}/`);

      // Salva os dados de permissão e o Nome do Usuário logado
      localStorage.setItem('is_admin', dadosUsuario.data.is_staff);
      
      // Tenta pegar o first_name, se não tiver preenchido usa o username de login
      const nomeExibicao = dadosUsuario.data.first_name || dadosUsuario.data.username || username;
      localStorage.setItem('username', nomeExibicao);
      
      setMensagem('Login realizado com sucesso! Redirecionando...');
      
      setTimeout(() => {
        navigate('/dashboard'); // Redireciona para o painel principal centralizado
      }, 1000);
      
    } catch (erro) {
      setMensagem('Erro ao logar: Usuário ou senha inválidos.');
      console.error(erro);
      localStorage.clear();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2 className="login-title">JS Mecânica</h2>
        <form onSubmit={handleLogin} className="login-form">
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
          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
        {mensagem && <p className="login-message">{mensagem}</p>}
      </div>
    </div>
  );
}

export default Login;