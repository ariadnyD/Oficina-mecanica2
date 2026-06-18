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

    # CRIAR OS COM ITENS
    def create(self, validated_data):
        # 👇 AQUI ESTÁ A CORREÇÃO: Arranca as listas do validated_data para o Django não surtar!
        validated_data.pop('procedimentos', None)
        validated_data.pop('insumos', None)

        # MÁGICA: Pega os dados brutos (initial_data)
        procedimentos_data = self.initial_data.get('procedimentos', [])
        insumos_data = self.initial_data.get('insumos', [])
        
        # Cria a OS limpinha
        os = OrdemServico.objects.create(**validated_data)

        # Associa os procedimentos
        for proc in procedimentos_data:
            ItemProcedimentoOS.objects.create(
                ordem_servico=os, 
                procedimento_id=proc.get('procedimento'), 
                valor_cobrado=proc.get('valor_cobrado')
            )

        # Associa os insumos
        for ins in insumos_data:
            ItemInsumoOS.objects.create(
                ordem_servico=os, 
                insumo_id=ins.get('insumo'), 
                quantidade_utilizada=ins.get('quantidade_utilizada')
            )

        return os

    # ATUALIZAR OS SEM PERDER OS ITENS
    def update(self, instance, validated_data):
        # 👇 CORREÇÃO AQUI TAMBÉM: Arranca as listas
        validated_data.pop('procedimentos', None)
        validated_data.pop('insumos', None)

        procedimentos_data = self.initial_data.get('procedimentos', None)
        insumos_data = self.initial_data.get('insumos', None)

        # Salva as atualizações dos campos básicos da OS (status, valor, etc)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Recria os procedimentos forçadamente
        if procedimentos_data is not None:
            instance.procedimentos.all().delete()
            for proc in procedimentos_data:
                ItemProcedimentoOS.objects.create(
                    ordem_servico=instance, 
                    procedimento_id=proc.get('procedimento'), 
                    valor_cobrado=proc.get('valor_cobrado')
                )

        # Recria os insumos forçadamente
        if insumos_data is not None:
            instance.insumos.all().delete()
            for ins in insumos_data:
                ItemInsumoOS.objects.create(
                    ordem_servico=instance, 
                    insumo_id=ins.get('insumo'), 
                    quantidade_utilizada=ins.get('quantidade_utilizada')
                )

        return instance