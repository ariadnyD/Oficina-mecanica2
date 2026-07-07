# Contagem de Pontos de Função

## Contagem Indicativa

Na contagem indicativa (Ci) só é necessário conhecer e analisar as **Funções de Dados**. Desta forma, 
os **ALI**s (Arquivos Lógicos Internos) com o valor de *35 PF* cada e os **AIE**s (Arquivos de Interface Externa) com o valor de *15 PF* cada.

### Contagem Indicativa

| Função de Dado  | Entidades Relacionadas | Tamanho em PF |
| --------------- | ---------------------- | :-----------: |
| ALI Usuário     | Usuario         | 13 PF         |
| ALI Veículo     | Usuario e ordem de serviço                | 13 PF         |
| ALI Ordem de Serviço | Veículo e Insumos            | 35 PF         |
| ALI Insumos    | Ordem de serviço               | 15 PF         |
| ALI Procedimentos    | Ordem de serviço, carro e insumos               | 15 PF         |
| **Total**       | **Ci**                 | **120 PF**    |

### Contagem Detalhada (Cd)

|     Descrição      |   Tipo   |   RLR   |   DER   |   Complexidade   |   Tamanho em PF   |
| ------------------ | -------- | ------- | ------- | ---------------- | :---------------: |
|  ALI Usuário       |   ALI    |        |    4   |       Baixa      | 7 PF               |
|  Veículo      |   ALI    |         |    7     |       Baixa           |  PF               |
|  Ordem de serviço   |   ALI    |         |     9   |       Médio           |  PF               |
|  Insumos       |   ALI    |         |    5     |       Baixa           |  PF               |
|  Procedimento       |   ALI    |         |    5     |       Baixa           |  PF               |
|  **Descrição**     | **Tipo** | **ALR** | **DER** | **Complexidade** | **Tamanho em PF** |
|  Inserir Usuário     |    EE    |    1    |    2    |      Baixa       | 3 PF              |
|  Atualizar Usuário   |    EE    |    1    |    2    |      Baixa       | 3 PF              |
|  Consultar Usuário   |    CE    |    1    |    2    |      Baixa       | 3 PF              |
|  Deletar Usuário   |    EE    |    2    |    9    |      Média       | 4 PF              |
|  Inserir Veículo     |    EE    |    1    |    2    |      Baixa       | 3 PF              |
|  Atualizar Veículo   |    EE    |    1    |    2    |      Baixa       | 3 PF              |
|  Consultar Veículo   |    CE    |    1    |    2    |      Baixa       | 3 PF              |
|  Deletar Veículo   |    EE    |    2    |    9    |      Média       | 4 PF              |
|  Inserir Ordem de serviço     |    EE    |    1    |    2    |      Baixa       | 6 PF              |
|  Atualizar Ordem de serviço   |    EE    |    1    |    2    |      Baixa       | 6 PF              |
|  Consultar Ordem de serviço   |    CE    |    1    |    2    |      Baixa       | 6 PF              |
|  Deletar Ordem de serviço   |    EE    |    2    |    9    |      Média       | 8 PF              |
|  Inserir Insumo     |    EE    |    1    |    2    |      Baixa       | 2 PF              |
|  Atualizar Insumo   |    EE    |    1    |    2    |      Baixa       | 2 PF              |
|  Consultar Insumo   |    CE    |    1    |    2    |      Baixa       | 2 PF              |
|  Deletar Insumo   |    EE    |    2    |    9    |      Média       | 3 PF              |
|  Inserir Procedimento     |    EE    |    1    |    2    |      Baixa       | 3 PF              |
|  Atualizar Procedimento   |    EE    |    1    |    2    |      Baixa       | 3 PF              |
|  Consultar Procedimento   |    CE    |    1    |    2    |      Baixa           | 3 PF              |
|  Deletar Procedimento   |    EE    |    2    |    9    |      Média       | 4 PF              |
|   **Total**        |          |         |         |     **Cd**       | **74 PF**         |


### Duração e custo considerando produtividade 8h/PF e Ci = 205 PF

A produtividade de Python é de **1h/PF**.
Com uma carga de trabalho de **133 horas** e um desenvolvedor trabalhando **8h por dia**, temos uma duração de **17 dias** (16,625 dias arredondados para cima).

* **Esforço total:** 133 horas
* **Duração:** 17 dias
* **Custo por hora:** R$ 17,00
* **Custo total:** R$ 2.261,00

## Contagem Estimativa (Ce)

Na Ce todas as funções de dados são classificados como baixa complexidade.

| ALI/AIE          | Entidades Relacionadas    |  PF  |
|------------------|---------------------------|------|
| ALI Cliente      | Language                  |   5  |
| ALI Veículos     | Genre                     |   5  |
| ALI User         | User e Group              |   7  |
| ALI Ordem de serviço      | Library                   |   7  |
| ALI Insumos       | Author                    |   7  |
|                  | **Total de Dados**        |**31**|

Na Ce todas as operações elementares são classificadas como de média complexidade: 
**EE** tem 4 PF, **CE** tem 4 PF e **SE** tem 5 PF. 

| Operação                | Tipo | Complexidade    |  PF  |
|-------------------------|------|-----------------|------|
| Inserir Usuário             |  EE  |      Baixa      |   3  |
| Atualizar Usuário          |  EE  |      Baixa      |   3  |
| Consultar Usuário          |  CE  |      Baixa      |   3  |
| Deletar Usuário             |  EE  |      Baixa      |   4  |
| Inserir Veículos         |  SE  |      Baixa      |   3  |
| Atualizar Veículos           |  EE  |      Baixa      |   3  |
| Consultar Veículos          |  EE  |      Baixa      |   3  |
| Deletar Veículos        |  CE  |      Baixa      |   4  |
| Inserir Ordem de serviço          |  EE  |      Baixa      |   6  |
| Atualizar Ordem de serviço            |  EE  |      Baixa      |   6  |
| Deletar Ordem de serviço              |  EE  |      Baixa      |   6  |
| Consultar Ordem de serviço         |  CE  |      Baixa      |   8  |
| Inserir Procedimento           |  EE  |      Baixa      |   3  |
| Atualizar Procedimento     |  EE  |      Baixa      |   3  |
| Consultar Procedimento       |  CE  |      Baixa      |   3  |
| Remover Procedimento   |  CE  |      Baixa      |   4  |
| Inserir Insumo          |  EE  |      Baixa      |   2  |
| Atualizar Insumo       |  EE  |      Baixa      |   2  |
| Consultar Insumo       |  CE  |      Baixa      |   2  |
| Deletar Insumo         |  EE  |      Baixa      |   3  |
|                         |      |**Total de Dados**|**74**|

