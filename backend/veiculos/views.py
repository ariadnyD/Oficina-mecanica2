from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.http import Http404
from .models import Veiculo
from clientes.models import Cliente
from .serializers import VeiculoSerializer

class VeiculoViewSet(viewsets.ModelViewSet):
    serializer_class = VeiculoSerializer

    # 1. Transformamos o queryset em uma função dinâmica
    def get_queryset(self):
        queryset = Veiculo.objects.all()
        
        # MÁGICA 1: Se o React mandar '?cliente_id=X' (Vindo do detalhamento do cliente)
        cliente_id = self.request.query_params.get('cliente_id')
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
            
        # MÁGICA 2: Se o React mandar '?cpf=Y' (Vindo da barra de pesquisa com a lupinha)
        cpf = self.request.query_params.get('cpf')
        if cpf:
            # O 'cliente__cpf' entra na tabela de clientes e busca pelo campo 'cpf' lá dentro
            queryset = queryset.filter(cliente__cpf=cpf)
            
        return queryset

    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            raise Http404("Erro: O veículo informado não está cadastrado ou encontra-se suspenso.")
        
    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Http404 as e:
            return Response({"erro": str(e)}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Cria uma cópia dos dados para podermos modificar com segurança
        dados = request.data.copy() if hasattr(request.data, 'copy') else request.data

        # MÁGICA: O tradutor de CPF para ID
        cpf_informado = dados.get('cpf_dono')
        if cpf_informado:
            from clientes.models import Cliente # Puxa o modelo de Cliente para pesquisar
            cliente = Cliente.objects.filter(cpf=cpf_informado, is_active=True).first()
            
            if not cliente:
                return Response({
                    "erro": f"Erro: Nenhum cliente ativo encontrado com o CPF {cpf_informado}."
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Achou o cliente? Troca o CPF pelo ID real para o banco de dados salvar!
            dados['cliente'] = cliente.cpf

        # Verifica se pelo menos o ID final chegou
        if 'cliente' not in dados or not dados.get('cliente'):
            return Response(
                {"erro": "Erro: Não é possível cadastrar o veículo. É necessário selecionar um cliente válido ou informar um CPF."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = self.get_serializer(data=dados)
        
        if not serializer.is_valid():
            return Response({
                "erro": "Erro: Informações inválidas detectadas. Por favor, corrija os campos destacados e tente novamente.",
                "detalhes": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        
        return Response({
            "mensagem": "Veículo cadastrado com sucesso!", 
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
        
        self.perform_update(serializer)
        
        return Response({
            "mensagem": "Dados do veículo atualizados com sucesso!", 
            "dados": serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Http404 as e:
            return Response({"erro": str(e)}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            self.perform_destroy(instance)
            return Response({"mensagem": "O veículo foi desativado com sucesso!"}, status=status.HTTP_200_OK)
        except Exception:
            return Response(
                {"erro": "Erro: Não foi possível excluir o veículo devido a uma instabilidade no sistema. Tente novamente."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )