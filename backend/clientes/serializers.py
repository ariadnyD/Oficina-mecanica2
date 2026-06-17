from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        # Remova o 'id' da lista de campos
        fields = ['nome', 'cpf', 'data_nascimento', 'endereco', 'telefone', 'is_active']
        # Remova o 'id' daqui também
        read_only_fields = ['is_active']