from rest_framework import serializers
from .models import OrdemServico, ItemProcedimentoOS, ItemInsumoOS

class ItemProcedimentoOSSerializer(serializers.ModelSerializer):
    # Traz o nome do procedimento pro React não precisar ficar buscando
    nome_procedimento = serializers.ReadOnlyField(source='procedimento.nome')

    class Meta:
        model = ItemProcedimentoOS
        fields = ['id', 'procedimento', 'nome_procedimento', 'valor_cobrado']

class ItemInsumoOSSerializer(serializers.ModelSerializer):
    # Traz o nome do insumo pro React
    nome_insumo = serializers.ReadOnlyField(source='insumo.nome')

    class Meta:
        model = ItemInsumoOS
        fields = ['id', 'insumo', 'nome_insumo', 'quantidade_utilizada']

class OrdemServicoSerializer(serializers.ModelSerializer):
    procedimentos = ItemProcedimentoOSSerializer(many=True, required=False)
    insumos = ItemInsumoOSSerializer(many=True, required=False)
    
    # Para o React mostrar bonitinho na tabela
    placa_veiculo = serializers.ReadOnlyField(source='veiculo.placa')
    nome_cliente = serializers.ReadOnlyField(source='veiculo.cliente.nome')

    class Meta:
        model = OrdemServico
        fields = [
            'id', 'veiculo', 'placa_veiculo', 'nome_cliente', 'data_abertura', 
            'data_conclusao', 'status', 'forma_pagamento', 'valor_total', 
            'observacoes', 'procedimentos', 'insumos'
        ]

    # Função que cria a OS e seus Itens juntos
    def create(self, validated_data):
        procedimentos_data = validated_data.pop('procedimentos', [])
        insumos_data = validated_data.pop('insumos', [])
        
        os = OrdemServico.objects.create(**validated_data)

        for proc in procedimentos_data:
            ItemProcedimentoOS.objects.create(ordem_servico=os, **proc)

        for ins in insumos_data:
            ItemInsumoOS.objects.create(ordem_servico=os, **ins)

        return os

    # Função que atualiza a OS e recria os itens
    def update(self, instance, validated_data):
        procedimentos_data = validated_data.pop('procedimentos', None)
        insumos_data = validated_data.pop('insumos', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if procedimentos_data is not None:
            instance.procedimentos.all().delete()
            for proc in procedimentos_data:
                ItemProcedimentoOS.objects.create(ordem_servico=instance, **proc)

        if insumos_data is not None:
            instance.insumos.all().delete()
            for ins in insumos_data:
                ItemInsumoOS.objects.create(ordem_servico=instance, **ins)

        return instance