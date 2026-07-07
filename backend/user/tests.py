from rest_framework import status
from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

# Create your tests here.
class UserCRUDTests(APITestCase):
  def setUp(self):
    self.user_data = { 
      'username': 'mecanico_chefe',
      'email': 'chefe@oficina.com',
      'password': 'senha_segura_123'
    }
    # MUDANÇA AQUI: Trocamos create_user por create_superuser para ter permissão (evitar o 403)
    self.user = User.objects.create_superuser(**self.user_data) 
    
    self.register_url = reverse('register')
    self.user_detail_url = reverse('user_detail', kwargs={'pk': self.user.pk})

    
  def test_create_user(self): # cria e registra novo usuário
    # CORREÇÃO: Faltou colar essa linha de autenticação antes de rodar o teste
    self.client.force_authenticate(user=self.user) 
    
    novo_usuario = {
      'username': 'novo_ajudante',
      'email': 'ajudante@oficina.com',
      'password': 'senha_ajudante_123'
    }
    
    response = self.client.post(self.register_url, novo_usuario)
    self.assertEqual(response.status_code, status.HTTP_201_CREATED) 
    self.assertEqual(User.objects.count(), 2)

  def test_read_user(self):
    self.client.force_authenticate(user=self.user) # Autentica o usuário criado no setUp
    
    response = self.client.get(self.user_detail_url)

    self.assertEqual(response.status_code, status.HTTP_200_OK) # Verifica se retornou 200 OK
    self.assertEqual(response.data['username'], self.user_data['username']) # Verifica se o username retornado é o correto
    self.assertNotIn('password', response.data) # Verifica se a senha não está sendo retornada
  
  def test_update_user(self):
    self.client.force_authenticate(user=self.user) # Autentica o usuário criado no setUp
    
    dados_atualizados = {
      'username': 'mecanico_chefe',
      'email': 'chefe_atualizado@oficina.com',
    }

    response = self.client.patch(self.user_detail_url, dados_atualizados)
    self.assertEqual(response.status_code, status.HTTP_200_OK) # Verifica se retornou 200 OK
    self.user.refresh_from_db() # Atualiza o objeto do banco de dados
    self.assertEqual(self.user.email, dados_atualizados['email']) # Verifica se o email foi atualizado corretamente

  def test_delete_user(self):
    self.client.force_authenticate(user=self.user) # Autentica o usuário criado no setUp
    
    response = self.client.delete(self.user_detail_url)
   
    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT) # Verifica se retornou 204 No Content
    self.assertEqual(User.objects.count(), 0) # Verifica se o usuário foi deletado do banco de testes