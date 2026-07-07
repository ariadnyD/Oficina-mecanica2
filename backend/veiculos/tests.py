from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch
from veiculos.models import Veiculo
from clientes.models import Cliente

class VeiculoViewSetTest(APITestCase):

    def setUp(self):
        # Preparação (Arrange): Cria um cliente real no banco de testes para satisfazer o vínculo
        self.cliente = Cliente.objects.create(
            nome="Cliente Teste",
            cpf="123.456.789-00", # <-- ADICIONE O CPF AQUI (É obrigatório agora)
            data_nascimento="1990-01-01"
        )
        
        self.veiculo_dados_validos = {
            "marca": "Toyota",
            "modelo": "Corolla",
            "tipo": "Carro",
            "cor": "Prata",
            "placa": "ABC-1234",
            "cliente": self.cliente.cpf # <-- TROQUE .id POR .cpf AQUI
        }

    # 1. Teste de INSERIR (Create)
    def test_cadastrar_veiculo_com_sucesso(self):
        url = reverse('veiculo-list') # Rota gerada pelo DefaultRouter
        response = self.client.post(url, self.veiculo_dados_validos, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mensagem'], "Veículo cadastrado com sucesso!")

    # 2. Teste de CONSULTAR (Read)
    def test_consultar_veiculo_inexistente(self):
        # Tenta buscar o veículo de ID 999 (que não existe) para testar a MS05
        url = reverse('veiculo-detail', args=[999])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['erro'], "Erro: O veículo informado não está cadastrado ou encontra-se suspenso.")

    # 3. Teste de ATUALIZAR (Update)
    def test_atualizar_dados_do_veiculo(self):
        # Cria um veículo primeiro
        veiculo = Veiculo.objects.create(
            marca="Toyota", 
            modelo="Corolla", 
            tipo="Carro", 
            cor="Prata", 
            placa="ABC-1234", 
            cliente=self.cliente
        )
        url = reverse('veiculo-detail', args=[veiculo.id])
        
        # Muda apenas a cor
        novos_dados = {"cor": "Preto"}
        response = self.client.patch(url, novos_dados, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mensagem'], "Dados do veículo atualizados com sucesso!")

    # 4. Teste de DELETAR com MOCK OBJECTS (Delete)
    # Aqui usamos o @patch para "sequestrar" a função perform_destroy e forçar um erro
    @patch('veiculos.views.VeiculoViewSet.perform_destroy')
    def test_deletar_veiculo_falha_instabilidade(self, mock_destroy):
        # Dizemos ao Mock para explodir com uma Exception quando for chamado
        mock_destroy.side_effect = Exception("Simulação de queda do banco de dados")
        
        veiculo = Veiculo.objects.create(marca="Honda", modelo="Civic", tipo="Carro", cor="Preto", placa="XYZ-9999", cliente=self.cliente)
        url = reverse('veiculo-detail', args=[veiculo.id])
        
        response = self.client.delete(url)
        
        # Verifica se o sistema capturou o erro e retornou a MS06 corretamente
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data['erro'], "Erro: Não foi possível excluir o veículo devido a uma instabilidade no sistema. Tente novamente.")
