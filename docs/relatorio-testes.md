## Relatório de Testes de Módulo/Sistema
**Responsabilidade do Testador**

**Legenda**
* Teste: Código ou identificação do Teste.
* Descrição: Teste para garantir o funcionamento correto da ordem de serviço, verificando se está inserindo, visualizando, atualizando e apagando os dados da ordem de serviço.
* Especificação: Está de acordo com as especificações do caso de uso.
* Resultado: Todos os testes feitos passaram. Os testes são os básicos para garantir o funcionamento do CRUD, aprofundar os testes para garantir o funcionamento correto da entidade.

### US001 - Ordem de Serviço

| Teste | Descrição | Especificação | Resultado |
| :--- | :--- | :--- | :--- |
| Teste 01: Incluir Ordem de serviço | A1-Cria a base necessária para a ordem de serviço com dados fictício; A1.1. Abrir nova Ordem; A1.2. O ator seleciona o Veículo; Se tiver veículo: A1.3. O sistema salva os dados; A1.4. O sistema exibe uma mensagem de acordo com a [MSG001]; Se nao tiver veículo: A1.5. O sistema devolve um 400 bad request. Exibe a mensagem [MSG002]; A1.6. Fim do fluxo. | [MSG001] "Ordem de Serviço aberta com sucesso!". [MSG002] "Erro: Não é possível abrir a Ordem de Serviço. É necessário selecionar um Veículo." | A ordem de serviço é inserida, contudo a mensagem [MSG001] não foi exibida. A implementação está de acordo com a especificação do User Story. |
| Teste 02: Cancelar Ordem de Serviço | A3-Excluir Ordem de Serviço; A3.1-O ator seleciona a Ordem de Serviço. A3.2-O sistema verifica se tem apenas uma Ordem de Serviço; A3.3-O ator clica no botão Excluir; A3.3 O sistema solicita confirmação para exclusão [MSG05]; A3.4 O ator confirma a exclusão; A3.5 O sistema exclui o registro e exibe uma mensagem de acordo com a [MSG03]; A3.6- Fim do fluxo. (P2) | Especificação OK. [MSG005] "A Ordem de Serviço foi cancelada com sucesso!". | OK. |
| Teste 03: Atualizar Ordem de Serviço | A2-Alterar a Ordem de Serviço; A2.1 - O ator edita os campos e clica no botão Editar; A2.2 O sistema salva os dados alterados no banco de dados; A2.3-O sistema exibe uma mensagem de acordo com a [MSG04]. A2.4 - Fim do fluxo. (P2) | Ok. [MSG004] "Finalizado!". | Ok. |
| Teste 04: Consultar Ordem de Serviço | A4-Consultar a Ordem de Serviço; A4.1-O ator clica na Ordem de Serviço; A4.2-O sistema retorna os dados da ordem de serviço; A4.3 Fim do fluxo. (P2) | Ok. [MSG004] "Finalizado!". | Ok. |

---

### US002-Usuários

| Teste | Descrição | Especificação | Resultado |
| :--- | :--- | :--- | :--- |
| Teste 01: Incluir Usuário | A1-Cria a base necessária para a o usuário com dados fictício; A1.1. Faz a requisição; A1.2. Verifica se retornou um 201; A1.3. O sistema salva os dados; A1.4. Fim do fluxo. | A implementação está de acordo com a especificação do User Story. | Ok |
| Teste 02: Deletar Usuário | A3-Excluir Usuário; A3.1- Autentica o Usuário; A3.2 - Faz requisição; A3.3-Verifica se retornou um 204; A3.3-Verifica se o usuário foi deletado; A3.4- Fim do fluxo. (P2) | Especificação OK. | OK. |
| Teste 03: Atualizar Usuário | A2-Verifica se o usuário está autenticado; A2.1 - Cria os dados para atualizar; A2.2 - Faz a requisição; A2.3 Verifica se retornou 200; A2.4 Atualiza os dados no banco de dados; A2.5 Fim do fluxo. | Ok | Ok. |
| Teste 04: Consultar Usuário | A4-Verifica se o usuário está autenticado; A4.1 Faz a requisição e pega os dados; A4.2 Verifica se retornou um 200; A4.3-Verifica se o username retornado é o correto; A4.4-Verifica se a senha não está sendo retornada; A4.3 Fim do fluxo. | Ok | Ok. |

---

### US003 - Veículos

| Teste | Descrição | Especificação | Resultado |
| :--- | :--- | :--- | :--- |
| Teste 01: Cadastrar Veículo | A1 Cria a base necessária para o veículo com dados válidos; A1.1. Faz requisição POST; A1.2. Verifica se retornou 201; A1.3. O sistema exibe a mensagem de sucesso. | "Veículo cadastrado com sucesso!" | OK. |
| Teste 02: Consultar Veículo | A2 Tenta consultar um veículo inexistente; A2.1. Faz requisição GET com ID inexistente; A2.2. Verifica se retornou 404; A2.3. O sistema exibe mensagem de erro. | "Erro: O veículo informado não está cadastrado ou encontra-se suspenso." | OK. |
| Teste 03: Atualizar Veículo | A3-Atualizar dados do veículo; A3.1. Cria veículo; A3.2. Faz requisição PATCH; A3.3. Verifica se retornou 200; A3.4. O sistema exibe mensagem de sucesso. | "Dados do veículo atualizados com sucesso!" | OK. |
| Teste 04: Excluir Veículo | A4 Excluir veículo com erro de instabilidade; A4.1. Simula erro no banco de dados; A4.2. Faz requisição DELETE; A4.3. Verifica se retornou 500; A4.4. O sistema exibe a mensagem de erro tratada. | "Erro: Não foi possível excluir o veículo devido a uma instabilidade no sistema. Tente novamente." | OK (Tratamento de exceção validado). |

---

### US004-Insumos

| Teste | Descrição | Especificação | Resultado |
| :--- | :--- | :--- | :--- |
| Teste 01: Cadastrar Insumo | A1 Cria usuário, autentica, cria base para insumo; A1.1. Faz requisição POST; A1.2. Verifica se retornou 201; A1.3. Conta se total aumentou. | Cadastro realizado com sucesso (201). | OK. |
| Teste 02: Consultar Insumo | A2 Consulta insumo por ID; A2.1. Faz requisição GET; A2.2. Verifica se retornou 200; A2.3. Compara campos com os originais. | Retorno dos dados do insumo. | OK. |
| Teste 03: Atualizar Insumo | A3 - Atualizar dados do insumo; A3.1. Faz requisição PATCH; A3.2. Verifica se retornou 200; A3.3. Verifica se os valores foram alterados no banco. | Dados do insumo atualizados. | OK. |
| Teste 04: Excluir Insumo | A4 Excluir insumo; A4.1. Faz requisição DELETE; A4.2. Verifica se retornou 204; A4.3. Verifica se conta de registros diminuiu. | Insumo excluído. | OK. |
| Teste 05: Acesso Negado | A5 Tenta acessar sem login; A5.1. Remove autenticação; A5.2. Faz requisição GET; A5.3. Verifica se retornou 401. | Acesso bloqueado (Não autorizado). | OK. |

---

### US005-Clientes

| Teste | Descrição | Especificação | Resultado |
| :--- | :--- | :--- | :--- |
| Teste 01: Cadastrar Cliente | A1 Cria superuser, autentica; A1.1. Faz requisição POST; A1.2. Verifica retorno 201; A1.3. Conta se total aumentou. | Cadastro realizado com sucesso (201). | OK. |
| Teste 02: Consultar Cliente | A2 - Consulta cliente por ID; A2.1. Faz requisição GET; A2.2. Verifica retorno 200; A2.3. Compara o nome retornado. | Retorno dos dados do cliente. | OK. |
| Teste 03: Atualizar Cliente | A3-Atualizar dados do cliente; A3.1. Faz requisição PUT; A3.2. Verifica retorno 200; A3.3. Verifica se nome foi atualizado. | Dados do cliente atualizados. | OK. |
| Teste 04: Excluir Cliente | A4 - Excluir cliente (lógico); A4.1. Faz requisição DELETE; A4.2. Verifica retorno 200; A4.3. Verifica campo is_active. | Cliente desativado (Exclusão lógica). | OK. |

---

### Relatório de Bugs e Providências
**Responsabilidade do Gerente**

| Teste | Providência | Tarefas/Tipo |
| :--- | :--- | :--- |
| Teste 01 - Alterar estoque Produto | Corrigir a implementação do fluxo. | Tarefa: Bug para diminuir a quantidade de produto no estoque. |
| Teste 03-Alterar Produto | Corrigir a especificação do fluxo do US e sua implementação. | Tarefa: Corrigir a análise do US. Tarefa: Bug de Implementação. |
| Teste 04 - Manter sistema logado | Corrigir o fato de o sistema não se manter logado, em alguns minutos ele não carrega as informações, nem aceita fazer ações. Tem que sair e entrar de novo. | Tarefa: corrigir erro de tempo logado. |

---

### Funcionalidade não implementadas:
* Caixa de seleção com campo de busca integrado para clientes dono do veículo;
* Caixa de seleção com campo de busca integrado para selecionar veículo em ordem de serviço;
* Caixa de seleção com campo de busca integrado para adicionar procedimento(s) em ordem de serviço;
* Caixa de seleção com campo de busca integrado para adicionar insumo(s) em ordem de serviço;
* Salvar o nome de quem fez alterações no sistema. Como por exemplo: quem cadastrou determinada ordem de serviço?
* Foi um funcionário? Qual? Ou um administrador? Qual?

### Relatórios não implementados:
* Todas as OS por Cliente
* Todas as OS por Veículo

### Buscas implementadas:
* Todos os veículos de determinado cliente basta digitar o nome do cliente no campo de busca
* Todas as OS por Cliente
* Todas as OS por Veículo
