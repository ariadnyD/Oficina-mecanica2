from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Insumos

class InsumoCRUDTests(APITestCase):
  def setUp(self):
    """
    Preparação do ambiente: cria um usuário, faz o login (autenticação)
    e cria um insumo inicial para podermos testar leitura, edição e exclusão.
    """
    # 1. Cria usuário e força a autenticação
    self.user = User.objects.create_user(username='admin_estoque', password='123')
    self.client.force_authenticate(user=self.user)

    # 2. Cria um insumo inicial no banco de dados temporário
    self.insumo = Insumos.objects.create(
        nome="Óleo de Motor 5W30",
        marca="Lubrax",
        descricao="Óleo sintético para motores flex.",
        quantidade=10.0
    )

    # 3. Prepara as URLs geradas pelo DefaultRouter
    self.list_url = reverse('insumo-list') # Para POST (Criar) e GET (Listar)
    self.detail_url = reverse('insumo-detail', kwargs={'pk': self.insumo.id}) # Para GET, PATCH, DELETE

  def test_create_insumo(self):
    """Teste 1: Create (Cadastrar um novo insumo)"""
    novo_insumo = {
      "nome": "Filtro de Ar",
      "marca": "Fram",
      "descricao": "Filtro de ar esportivo",
      "quantidade": 5.0
    }
    
    # Fazendo um POST na url de lista
    response = self.client.post(self.list_url, novo_insumo)
    
    # Verifica se retornou 201 Created
    self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    # Verifica se o banco agora tem 2 insumos (o do setUp + este novo)
    self.assertEqual(Insumos.objects.count(), 2)

  def test_read_insumo(self):
    """Teste 2: Read (Consultar um insumo específico)"""
    # Fazendo um GET na url de detalhes
    response = self.client.get(self.detail_url)
    
    # Verifica se retornou 200 OK
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    # Verifica se o nome retornado na API bate com o que criamos no setUp
    self.assertEqual(response.data['nome'], self.insumo.nome)
    self.assertEqual(response.data['marca'], self.insumo.marca)

  def test_update_insumo(self):
    """Teste 3: Update (Editar a quantidade e a marca do insumo)"""
    dados_atualizados = {
        "marca": "Castrol",
        "quantidade": 15.0
    }
    
    # Fazendo um PATCH (atualização parcial) na url de detalhes
    response = self.client.patch(self.detail_url, dados_atualizados)
    
    # Verifica se retornou 200 OK
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    # Atualiza o objeto self.insumo com os novos dados do banco
    self.insumo.refresh_from_db()
    
    # Verifica se os valores realmente mudaram
    self.assertEqual(self.insumo.marca, "Castrol")
    self.assertEqual(self.insumo.quantidade, 15.0)

  def test_delete_insumo(self):
    """Teste 4: Delete (Excluir um insumo)"""
    response = self.client.delete(self.detail_url)
    
    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    # ADICIONADO: Verifica se o item foi desativado (Exclusão Lógica) em vez de apagado
    self.insumo.refresh_from_db()
    self.assertFalse(self.insumo.is_active)
    
  def test_acesso_negado_sem_autenticacao(self):
    """Teste Extra: Garante que um usuário não logado receba bloqueio"""
    # Removemos a autenticação forçada do cliente
    self.client.logout()
    
    # Tentamos acessar a lista de insumos
    response = self.client.get(self.list_url)
    
    # Deve retornar 401 Unauthorized (Não autorizado)
    self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)