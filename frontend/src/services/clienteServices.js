import api from './api';

const clienteServices = {
  getClientes: async () => {
    try {
      const resposta = await api.get('clientes/');
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
      return [];
    }
  },

  cadastrarCliente: async (dadosCliente) => {
    try {
      const resposta = await api.post('clientes/', dadosCliente);
      // Retorna exatamente a resposta do Django (que tem o campo "mensagem")
      return resposta.data; 
    } catch (erro) {
      // Se o erro veio do Django, nós repassamos os dados exatos do erro!
      if (erro.response && erro.response.data) {
        throw erro.response.data; 
      }
      throw erro; // Se for erro de internet/servidor fora do ar
    }
  },

  excluirCliente: async (cpf) => {
    try {
      // O axios manda um DELETE para a URL específica do cliente usando o CPF
      const resposta = await api.delete(`clientes/${cpf}/`);
      return resposta.data;
    } catch (erro) {
      if (erro.response && erro.response.data) {
        throw erro.response.data;
      }
      throw erro;
    }
  },
  
  reativarCliente: async (cpf, dadosAtualizados) => {
    try {
      // Mandamos os dados novos para atualizar o endereço/telefone caso a pessoa tenha mudado
      const resposta = await api.patch(`clientes/${cpf}/reativar/`, dadosAtualizados);
      return resposta.data;
    } catch (erro) {
      if (erro.response && erro.response.data) throw erro.response.data;
      throw erro;
    }
  },

  editarCliente: async (cpf, dadosAtualizados) => {
    try {
      // Usamos o PATCH para dizer ao Django: "Atualize apenas esses dados deste CPF"
      const resposta = await api.patch(`clientes/${cpf}/`, dadosAtualizados);
      return resposta.data;
    } catch (erro) {
      if (erro.response && erro.response.data) throw erro.response.data;
      throw erro;
    }
  },

  getClientePorId: async (cpf) => {
    try {
      const resposta = await api.get(`clientes/${cpf}/`);
      return resposta.data;
    } catch (erro) {
      console.error("Erro ao buscar detalhes do cliente:", erro);
      throw erro;
    }
  },
};

export default clienteServices;