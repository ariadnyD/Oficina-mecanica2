from rest_framework import serializers
from .models import Veiculo
from clientes.models import Cliente

class VeiculoSerializer(serializers.ModelSerializer):
    # O PrimaryKeyRelatedField entende que a PK de Cliente é o CPF
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    
    class Meta:
        model = Veiculo
        fields = ['id', 'marca', 'modelo', 'tipo', 'cor', 'placa', 'cliente', 'ano']