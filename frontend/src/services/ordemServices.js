import api from './api';

const ordemServices = {
  getOrdens: () => api.get('ordens-servico/').then(res => res.data),

  criarOrdem: (dados) => api.post('ordens-servico/', dados).then(res => res.data),

  atualizarOrdem: (id, dados) => api.put(`ordens-servico/${id}/`, dados).then(res => res.data),
  
  cancelarOrdem: (id) => api.delete(`ordens-servico/${id}/`).then(res => res.data)
};

export default ordemServices;