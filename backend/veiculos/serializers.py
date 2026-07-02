from rest_framework import serializers
from .models import Veiculo
from clientes.models import Cliente

class VeiculoSerializer(serializers.ModelSerializer):
    # O PrimaryKeyRelatedField entende que a PK de Cliente é o CPF
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    cliente_nome = serializers.ReadOnlyField(source='cliente.nome')
    cliente_cpf = serializers.ReadOnlyField(source='cliente.cpf')
    
    class Meta:
        model = Veiculo
        fields = ['id', 'marca', 'modelo', 'tipo', 'cor', 'placa', 'cliente', 'ano', 'cliente_nome', 'cliente_cpf']