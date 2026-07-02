from rest_framework import serializers
from .models import OrdemServico, ItemProcedimentoOS, ItemInsumoOS

class ItemProcedimentoOSSerializer(serializers.ModelSerializer):
    nome_procedimento = serializers.ReadOnlyField(source='procedimento.nome')

    class Meta:
        model = ItemProcedimentoOS
        fields = ['id', 'procedimento', 'nome_procedimento', 'valor_cobrado']

class ItemInsumoOSSerializer(serializers.ModelSerializer):
    nome_insumo = serializers.ReadOnlyField(source='insumo.nome')

    class Meta:
        model = ItemInsumoOS
        fields = ['id', 'insumo', 'nome_insumo', 'quantidade_utilizada']

class OrdemServicoSerializer(serializers.ModelSerializer):
    procedimentos = ItemProcedimentoOSSerializer(many=True, required=False)
    insumos = ItemInsumoOSSerializer(many=True, required=False)
    
    placa_veiculo = serializers.ReadOnlyField(source='veiculo.placa')
    nome_cliente = serializers.ReadOnlyField(source='veiculo.cliente.nome')

    # 👈 GARANTE QUE O DRF ACEITE O VALOR VINDO DO FRONTEND SEM REGRAS ENGESSADAS
    valor_total = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = OrdemServico
        fields = [
            'id', 'veiculo', 'placa_veiculo', 'nome_cliente', 'data_abertura', 
            'data_conclusao', 'status', 'forma_pagamento', 'valor_total', 
            'observacoes', 'procedimentos', 'insumos'
        ]

    def create(self, validated_data):
        # 1. Arrancamos as listas para o Django não tentar salvá-las no veiculo/OS
        validated_data.pop('procedimentos', None)
        validated_data.pop('insumos', None)

        procedimentos_data = self.initial_data.get('procedimentos', [])
        insumos_data = self.initial_data.get('insumos', [])
        
        # Cria a OS respeitando o valor_total digitado pelo usuário no React
        os = OrdemServico.objects.create(**validated_data)

        for proc in procedimentos_data:
            ItemProcedimentoOS.objects.create(
                ordem_servico=os,
                procedimento_id=proc.get('procedimento'), 
                valor_cobrado=proc.get('valor_cobrado', 0)
            )

        for ins in insumos_data:
            ItemInsumoOS.objects.create(
                ordem_servico=os, 
                insumo_id=ins.get('insumo'), 
                quantidade_utilizada=ins.get('quantidade_utilizada', 1)
            )

        return os

    def update(self, instance, validated_data):
        # 1. Arrancamos as listas do validated_data para o setattr não surtar
        validated_data.pop('procedimentos', None)
        validated_data.pop('insumos', None)

        procedimentos_data = self.initial_data.get('procedimentos', None)
        insumos_data = self.initial_data.get('insumos', None)

        # 2. Atualizamos os campos normais (incluindo o valor_total digitado manualmente)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 3. Refazemos os procedimentos manualmente
        if procedimentos_data is not None:
            instance.procedimentos.all().delete()
            for proc in procedimentos_data:
                ItemProcedimentoOS.objects.create(
                    ordem_servico=instance, 
                    procedimento_id=proc.get('procedimento'), 
                    valor_cobrado=proc.get('valor_cobrado', 0)
                )

        # 4. Refazemos os insumos manualmente
        if insumos_data is not None:
            instance.insumos.all().delete()
            for ins in insumos_data:
                ItemInsumoOS.objects.create(
                    ordem_servico=instance, 
                    insumo_id=ins.get('insumo'), 
                    quantidade_utilizada=ins.get('quantidade_utilizada', 1)
                )

        return instance