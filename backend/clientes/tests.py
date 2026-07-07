from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Cliente

class ClienteViewSetTestCase(APITestCase):
    
    def setUp(self):
        self.client = APIClient()
        
        self.admin_user = User.objects.create_superuser(
            username='admin_teste', 
            password='senha_teste', 
            email='admin@teste.com'
        )
        
        self.client.force_authenticate(user=self.admin_user)
        
        self.url_lista = '/api/clientes/'
        
        self.cliente_teste = Cliente.objects.create(
            nome="Cliente de Teste",
            cpf="00000000000",
            data_nascimento="1990-01-01",
            endereco="Rua Teste, 123",
            telefone="(00) 00000-0000"
        )
        
        self.url_detalhe = f'/api/clientes/{self.cliente_teste.cpf}/'

    def test_cadastrar_cliente(self):
        """Testa a operação de INSERIR (POST) - TA01.02"""
        dados_novo_cliente = {
            "nome": "Novo Cliente",
            "cpf": "111.111.111-11",
            "data_nascimento": "1995-05-05",
            "endereco": "Avenida Nova, 456",
            "telefone": "(11) 11111-1111"
        }
        
        response = self.client.post(self.url_lista, dados_novo_cliente, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Cliente.objects.count(), 2) 

    def test_consultar_cliente(self):
        """Testa a operação de CONSULTAR (GET) - TA01.03"""
        response = self.client.get(self.url_detalhe)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nome'], self.cliente_teste.nome)

    def test_atualizar_cliente(self):
        """Testa a operação de ATUALIZAR (PUT) - TA01.04"""
        dados_atualizados = {
            "nome": "Nome Atualizado",
            "cpf": self.cliente_teste.cpf, 
            "data_nascimento": "1990-01-01",
            "endereco": "Rua Atualizada, 999",
            "telefone": "(22) 22222-2222"
        }
        
        response = self.client.put(self.url_detalhe, dados_atualizados, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.cliente_teste.refresh_from_db()
        self.assertEqual(self.cliente_teste.nome, "Nome Atualizado")

    def test_deletar_cliente_logico(self):
        """Testa a operação de DELETAR (Exclusão Lógica via DELETE) - TA01.05"""
        response = self.client.delete(self.url_detalhe)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.cliente_teste.refresh_from_db()
        self.assertFalse(self.cliente_teste.is_active)