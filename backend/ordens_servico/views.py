from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.http import Http404
from django.db import transaction # 👇 ADICIONADO PARA A MÁGICA DO ESTOQUE
from .models import OrdemServico
from .serializers import OrdemServicoSerializer

class OrdemServicoViewSet(viewsets.ModelViewSet):
    # 👇 Adicionei o order_by para as OS mais recentes aparecerem primeiro
    queryset = OrdemServico.objects.all().order_by('-data_abertura')
    serializer_class = OrdemServicoSerializer

    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            raise Http404("Erro: A Ordem de Serviço informada não está cadastrada ou encontra-se suspensa.")
        
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Http404 as e:
            return Response({"erro": str(e)}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        if 'veiculo' not in request.data or not request.data.get('veiculo'):
            return Response(
                {"erro": "Erro: Não é possível abrir a Ordem de Serviço. É necessário selecionar um veículo válido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                "erro": "Erro: Informações inválidas detectadas. Por favor, corrija os campos destacados e tente novamente.",
                "detalhes": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        
        return Response({
            "mensagem": "Ordem de Serviço aberta com sucesso!", 
            "dados": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        
        try:
            instance = self.get_object()
        except Http404 as e:
            return Response({"erro": str(e)}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            return Response({
                "erro": "Erro: Informações inválidas detectadas. Por favor, corrija os campos destacados e tente novamente.",
                "detalhes": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Aqui o seu código já chama o perform_update, então a mágica do estoque vai rodar!
        self.perform_update(serializer)
        
        return Response({
            "mensagem": "Dados da Ordem de Serviço atualizados com sucesso!", 
            "dados": serializer.data
        }, status=status.HTTP_200_OK)
    
    # -------------------------------------------------------------
    # 👇 A MÁGICA DO ESTOQUE (Inserida no seu código!)
    # -------------------------------------------------------------
    def perform_update(self, serializer):
        os_antiga = self.get_object()
        status_antigo = os_antiga.status

        nova_os = serializer.save()

        # Se mudou para FINALIZADA, debita do estoque
        if status_antigo != 'FINALIZADA' and nova_os.status == 'FINALIZADA':
            with transaction.atomic():
                for item in nova_os.insumos.all():
                    insumo = item.insumo
                    insumo.quantidade -= item.quantidade_utilizada
                    insumo.save()
    # -------------------------------------------------------------