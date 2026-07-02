from django.db import models
    
class Cliente(models.Model):
    cpf = models.CharField(max_length=14, primary_key=True) 
    nome = models.CharField(max_length=255)
    data_nascimento = models.DateField()
    endereco = models.TextField()
    telefone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nome
