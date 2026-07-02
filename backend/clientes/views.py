from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission, SAFE_METHODS
from django.http import Http404
from .models import Cliente
from .serializers import ClienteSerializer

class PodeCadastrarMasNaoEditar(BasePermission):
    def has_permission(self, request, view):
        if request.method in ['GET', 'POST']:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_staff

class ClienteViewSet(viewsets.ModelViewSet):
    serializer_class = ClienteSerializer
    permission_classes = [PodeCadastrarMasNaoEditar]

    def get_queryset(self):
        # Filtra apenas clientes ativos (não deletados logicamente)
        return Cliente.objects.filter(is_active=True)

    def get_object(self):
        try:
            # RN04 - Consulta prévia garantida pelo DRF ao buscar a instância
            return super().get_object()
        except Http404:
            # RN05 / MS05 - Cliente Inexistente
            raise Http404("Erro: O cliente informado não está cadastrado ou encontra-se suspenso.")

    def create(self, request, *args, **kwargs):
        cpf_informado = request.data.get('cpf')

        # Intercepta o CPF antes do Serializer validar
        from .models import Cliente 
        cliente_existente = Cliente.objects.filter(cpf=cpf_informado).first()

        if cliente_existente:
            if not cliente_existente.is_active:
                # O cliente existe e está "deletado". Mandamos o CPF correto para o React reativar
                return Response({
                    "mensagem": "Este CPF pertence a um cliente inativo. Deseja reativar o cadastro?",
                    "inativo": True, 
                    "cliente_id": cliente_existente.cpf  # CORRIGIDO: Agora envia o CPF em vez de ID inexistente
                }, status=status.HTTP_409_CONFLICT) 
            else:
                # O cliente existe e já tá ativo, dá erro normal.
                return Response({
                    "mensagem": "Erro: Já existe um cliente ativo cadastrado com este CPF."
                }, status=status.HTTP_400_BAD_REQUEST)

        # Cadastro normal se não houver duplicidade
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                "mensagem": "Cliente cadastrado com sucesso!", 
                "dados": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "mensagem": "Erro: Informações inválidas detectadas. Por favor, corrija os campos.",
            "detalhes": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        
        try:
            instance = self.get_object()
        except Http404 as e:
            return Response({"erro": str(e)}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            # MS02 - Sucesso na Edição
            return Response({
                "mensagem": "Dados do cliente atualizados com sucesso!", 
                "dados": serializer.data
            }, status=status.HTTP_200_OK)
            
        # RN03 / MS04 - Dados Inválidos
        return Response({
            "mensagem": "Erro: Informações inválidas detectadas. Por favor, corrija os campos destacados e tente novamente.",
            "detalhes": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            cliente = self.get_object()
            cliente.is_active = False
            cliente.save()
            return Response({"mensagem": "O cliente foi desativado com sucesso!"}, status=status.HTTP_200_OK)
        except Http404 as e:
            return Response({"erro": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({"erro": "Erro: Não foi possível excluir o cliente."}, status=status.HTTP_400_BAD_REQUEST)

    # Rota Especial para Reativar o cliente
    @action(detail=True, methods=['patch'])
    def reativar(self, request, pk=None):
        from .models import Cliente
        try:
            # Busca direto no banco porque get_object ignora os inativos
            cliente = Cliente.objects.get(pk=pk)
            cliente.is_active = True
            
            # Atualiza dados vindos do formulário se existirem
            if 'nome' in request.data: cliente.nome = request.data['nome']
            if 'telefone' in request.data: cliente.telefone = request.data['telefone']
            if 'endereco' in request.data: cliente.endereco = request.data['endereco']
            
            cliente.save()
            return Response({"mensagem": "O cadastro foi reativado com sucesso!"}, status=status.HTTP_200_OK)
        except Cliente.DoesNotExist:
            return Response({"erro": "Cliente inativo não encontrado no banco de dados."}, status=status.HTTP_404_NOT_FOUND)