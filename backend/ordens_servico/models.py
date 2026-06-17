from django.db import models

class OrdemServico(models.Model):
    STATUS_CHOICES = [
        ('ABERTA', 'Aberta (Em Orçamento)'),
        ('EM_EXECUCAO', 'Em Execução'),
        ('CONCLUIDA', 'Concluída (Aguardando Pagamento)'),
        ('FINALIZADA', 'Finalizada e Paga'),
        ('CANCELADA', 'Cancelada'),
    ]

    PAGAMENTO_CHOICES = [
        ('PIX', 'Pix'),
        ('DINHEIRO', 'Dinheiro'),
        ('CARTAO_CREDITO', 'Cartão de Crédito'),
        ('CARTAO_DEBITO', 'Cartão de Débito'),
    ]

    # O app de veículos se chama 'veiculos' e a classe 'Veiculo'
    veiculo = models.ForeignKey('veiculos.Veiculo', on_delete=models.PROTECT, related_name='ordens_servico')
    
    data_abertura = models.DateTimeField(auto_now_add=True)
    data_conclusao = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ABERTA')
    forma_pagamento = models.CharField(max_length=20, choices=PAGAMENTO_CHOICES, null=True, blank=True)
    
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    observacoes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"OS #{self.id} - {self.veiculo.placa} ({self.get_status_display()})"


class ItemProcedimentoOS(models.Model):
    ordem_servico = models.ForeignKey(OrdemServico, on_delete=models.CASCADE, related_name='procedimentos')
    # 👇 CORRIGIDO: O Procedimento mora dentro do app 'core'
    procedimento = models.ForeignKey('core.Procedimento', on_delete=models.PROTECT)
    valor_cobrado = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.procedimento.nome} (OS #{self.ordem_servico.id})"


class ItemInsumoOS(models.Model):
    ordem_servico = models.ForeignKey(OrdemServico, on_delete=models.CASCADE, related_name='insumos')
    # 👇 CORRIGIDO: O Insumo mora no app 'core' e a classe se chama 'Insumos' (com s)
    insumo = models.ForeignKey('core.Insumos', on_delete=models.PROTECT)
    quantidade_utilizada = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantidade_utilizada}x {self.insumo.nome} (OS #{self.ordem_servico.id})"