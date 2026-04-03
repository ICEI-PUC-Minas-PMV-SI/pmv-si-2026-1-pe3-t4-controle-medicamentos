# 3. DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE

Nesta parte do trabalho você deve detalhar a documentação dos requisitos do sistema proposto de acordo com as seções a seguir. Ressalta-se que aqui é utilizado como exemplo um sistema de gestão de cursos de aperfeiçoamento.

## 3.1 Objetivos deste documento
Descrever e especificar as necessidades das unidades de saúde no controle de medicamentos, definindo os requisitos do sistema proposto para gestão de estoque, movimentações e acompanhamento de medicamentos.

## 3.2 Escopo do produto

### 3.2.1 Nome do produto e seus componentes principais
O produto será denominado SCMU – Sistema de Controle de Medicamentos em Unidades de Saúde.

O sistema será composto pelos seguintes módulos principais:

Cadastro de medicamentos
Controle de estoque
Registro de entradas e saídas
Consulta de disponibilidade
Relatórios e acompanhamento

### 3.2.2 Missão do produto
Gerenciar de forma eficiente o estoque de medicamentos em unidades de saúde, permitindo registrar movimentações, acompanhar quantidades disponíveis, controlar vencimentos e facilitar o acesso às informações pelos profissionais responsáveis.

### 3.2.3 Limites do produto
O sistema não contempla:

Controle financeiro (pagamentos, compras ou orçamento)
Prescrição médica automatizada
Integração com sistemas hospitalares externos

### 3.2.4 Benefícios do produto

| # | Benefício | Valor para o Cliente |
|--------------------|------------------------------------|----------------------------------------|
|1	| Organização do estoque de medicamentos |	Essencial |
|2 | Redução de erros em registros manuais | Essencial | 
|3 | Controle de vencimento dos medicamentos | Essencial | 
|4	| Facilidade de consulta de disponibilidade	| Essencial | 
|5	| Rastreabilidade das movimentações	| Recomendável |

## 3.3 Descrição geral do produto

### 3.3.1 Requisitos Funcionais

| Código | Requisito Funcional (Funcionalidade) | Descrição |
|--------------------|------------------------------------|----------------------------------------|
| RF01 | Cadastrar Medicamentos | O sistema deve permitir cadastrar medicamentos com informações básicas como nome, lote, validade e quantidade. |
| RF02 | Editar Medicamentos | O sistema deve permitir editar os dados dos medicamentos. |
| RF03 | Remover ou Inativar Medicamentos | O sistema deve permitir remover ou inativar medicamentos. |
| RF04 | Listar Medicamentos | O sistema deve permitir listar os medicamentos cadastrados. |
| RF05 | Registrar Entradas de Medicamentos | O sistema deve registrar entradas de medicamentos. |
| RF06 | Registrar Saídas de Medicamentos | O sistema deve registrar saídas de medicamentos. |
| RF07 | Atualizar Quantidade em Estoque | O sistema deve atualizar automaticamente a quantidade em estoque. |
| RF08 | Consultar Quantidade Disponível | O sistema deve permitir consultar a quantidade disponível. |
| RF09 | Armazenar Histórico de Movimentações | O sistema deve armazenar o histórico de entradas e saídas. |
| RF10 | Registrar Detalhes das Movimentações | O sistema deve registrar data, quantidade e responsável por cada movimentação. |
| RF11 | Consultar Histórico por Medicamento | O sistema deve permitir consultar o histórico por medicamento. |
| RF12 | Consultar Disponibilidade de Medicamentos | O sistema deve permitir consultar a disponibilidade de medicamentos. |
| RF13 | Informar Falta de Medicamentos | O sistema deve informar quando um medicamento estiver em falta. |
| RF14 | Consulta Prévia à Utilização | O sistema deve permitir que usuários consultem a disponibilidade antes do uso. |
| RF15 | Interface Simples e de Fácil Uso | O sistema deve possuir interface simples e de fácil uso. |
| RF16 | Navegação entre Funcionalidades | O sistema deve permitir navegação entre as funcionalidades principais. |
| RF17 | Registro Rápido de Saídas | O sistema deve permitir registrar saídas de forma rápida. |

### 3.3.2 Requisitos Não Funcionais

#### Segurança e Acesso

| Código | Requisito Não Funcional | Descrição |
|-------|--------------------------|-----------|
| RNF1  | Controle de Acesso (RBAC) | O sistema deve implementar níveis de acesso distintos (por exemplo: administrador, farmacêutico, enfermeiro), garantindo que apenas usuários autorizados realizem alterações no estoque. |
| RNF2  | Auditoria (Logs) | Todas as movimentações devem gerar logs inalteráveis, registrando o ID do usuário, data, hora e a ação realizada para fins de auditoria. |
| RNF3  | Criptografia | Senhas de usuários devem ser armazenadas utilizando bcrypt (custo mínimo 12).<br>Dados sensíveis em repouso devem ser cifrados com AES-256-GCM.<br>A comunicação deve utilizar TLS 1.2 ou superior. |

#### Desempenho e Eficiência

| Código | Requisito Não Funcional | Descrição |
|-------|--------------------------|-----------|
| RNF4  | Tempo de Resposta | As consultas de disponibilidade e o registro de saída não devem levar mais de 2 segundos sob condições normais de rede. |
| RNF5  | Capacidade de Carga | O sistema deve suportar o acesso simultâneo de pelo menos [X] usuários sem degradação de performance. |

#### Disponibilidade e Confiabilidade

| Código | Requisito Não Funcional | Descrição |
|-------|--------------------------|-----------|
| RNF6  | Disponibilidade | Por ser um ambiente crítico, o sistema deve ter uma disponibilidade mínima de 99,9%, operando 24/7. |
| RNF7  | Backup e Recuperação | Devem ser realizados backups automáticos diários da base de dados, com um Plano de Recuperação de Desastres que garanta o retorno da operação em no máximo 1 hora. |
| RNF8  | Integridade de Dados | O sistema deve garantir as propriedades ACID das transações. |

#### Usabilidade

| Código | Requisito Não Funcional | Descrição |
|-------|--------------------------|-----------|
| RNF9  | Facilidade de Aprendizado | A interface deve ser intuitiva o suficiente para que um novo funcionário consiga realizar uma consulta de estoque com no máximo 10 minutos de treinamento. |
| RNF10 | Responsividade | O sistema deve ser acessível e funcional nos navegadores Google Chrome (v120+), Mozilla Firefox (v121+), Microsoft Edge (v120+) e Safari (v17+)|
#### Conformidade e Manutenção

| Código | Requisito Não Funcional | Descrição |
|-------|--------------------------|-----------|
| RNF11 | Conformidade com a LGPD | O tratamento de dados dos responsáveis pelas movimentações deve estar em conformidade com a Lei Geral de Proteção de Dados (LGPD). |
| RNF12 | Padrões de Código | O sistema deve ser desenvolvido seguindo o Airbnb JavaScript Style Guide para o frontend.<br>A arquitetura do backend deve adotar separação em camadas (Apresentação, Serviço e Repositório).<br>O versionamento deve seguir o padrão Conventional Commits e Git Flow. |
### 3.3.3 Usuários 

| Ator | Descrição |
|--------------------|------------------------------------|
| Coordenador |	Usuário gerente do sistema responsável pelo cadastro e manutenção de cursos de aperfeiçoamento. Possui acesso geral ao sistema. |
| Secretaria |	Usuário responsável por registros de alunos, professores, turmas e gerência de matrículas. |
| ... |	... |	... |

## 3.4 Modelagem do Sistema

### 3.4.1 Diagrama de Casos de Uso
Como observado no diagrama de casos de uso da Figura 1, a secretária poderá gerenciar as matrículas e professores no sistema, enquanto o coordenador, além dessas funções, poderá gerenciar os cursos de aperfeiçoamento.

#### Figura 1: Diagrama de Casos de Uso do Sistema.

![Image](https://github.com/user-attachments/assets/f507dcef-a171-4599-b0c7-7c250027be8b)
 
### 3.4.2 Descrições de Casos de Uso

Abaixo estão detalhadas as descrições dos principais casos de uso do sistema de gestão de medicamentos

#### Gerenciamento de Cadastro de Medicamentos (CSU01)

Sumário: Permite ao farmacêutico realizar o cadastro, atualização e remoção de informações de medicamentos no sistema, garantindo a integridade e a acurácia dos dados.

Ator Primário: Farmacêutico

Pré-condições: Usuário autenticado.

Pós-condições: Dados do medicamento cadastrados, atualizados ou removidos no sistema.

Fluxo Principal:

	1.	O Farmacêutico inicia a operação de cadastro, atualização ou remoção de um medicamento.
	
	2.	O sistema solicita o identificador único (código de barras ou ID) do medicamento.
	
	3.	O Farmacêutico informa o identificador.
	
	4.	Para Cadastro:
	a. O sistema valida se o medicamento já está cadastrado. Se sim, informa o farmacêutico e cancela a operação.
	b. O sistema apresenta um formulário para preenchimento dos dados (Nome, Tipo, Nível de Criticidade, Lote, Data de Fabricação, Data de Vencimento).
	c. O Farmacêutico preenche os dados.
	d. O sistema valida as informações e registra o novo medicamento.

	5.	Para Atualização:
	a. O sistema recupera os dados do medicamento correspondente ao identificador.
	b. O sistema apresenta os dados para edição.
	c. O Farmacêutico altera as informações desejadas.
	d. O sistema valida os dados e salva as alterações.

	6.	Para Remoção:
	a. O sistema apresenta os dados do medicamento para confirmação.
	b. O sistema solicita confirmação da exclusão.
	c. O Farmacêutico confirma a operação.
	d. O sistema remove o medicamento do banco de dados.

Fluxos Alternativos:

	•	Medicamento já cadastrado (Cadastro): O sistema identifica que o medicamento já existe, informa ao usuário e cancela o cadastro.
	•	Cancelamento (Remoção): O Farmacêutico cancela a operação, e o sistema encerra o caso de uso sem alterações

 #### Gerenciamento de Estoque de Medicamentos (CSU02)
 
 Sumário: Permite registrar a entrada e saída de medicamentos do estoque, atualizando as quantidades disponíveis e mantendo um histórico de movimentações.

Atores Primários: Farmacêutico (Entrada), Enfermeiro/Técnico, Auxiliar de Farmácia (Saída)

Pré-condições: Usuário autenticado; Medicamento previamente cadastrado no sistema.

Pós-condições: Quantidade em estoque atualizada; Registro de entrada/saída armazenado.

Fluxo Principal:

	1.	O usuário (Farmacêutico para entrada, Enfermeiro/Técnico/Auxiliar para saída) solicita registrar uma movimentação de estoque.
	
	2.	O sistema solicita o identificador do medicamento e a quantidade a ser movimentada.
	
	3.	O usuário informa os dados.
	
	4.	Para Entrada:
	a. O sistema valida as informações.
	b. O sistema registra a entrada com data e hora.
	c. O sistema atualiza o estoque.

	5.	Para Saída:
	a. O sistema valida a disponibilidade do medicamento e a data de vencimento.
	b. O sistema registra a saída com data, hora e usuário responsável.
	c. O sistema atualiza o estoque.

Fluxos Alternativos:

	•	Estoque insuficiente (Saída): O sistema detecta quantidade insuficiente, informa o erro ao usuário, que pode ajustar a quantidade ou cancelar a operação.
	•	Medicamento vencido (Saída): O sistema identifica medicamento vencido, bloqueia a operação e notifica o usuário.

### Consulta e Monitoramento de Medicamentos (CSU03)

Sumário: Permite aos usuários consultar a disponibilidade de medicamentos em estoque e monitorar aqueles próximos ao vencimento, facilitando a gestão e evitando perdas.

Atores Primários: Farmacêutico, Enfermeiro/Técnico, Gestor/Coordenador

Pré-condições: Usuário autenticado.

Pós-condições: Informações de disponibilidade ou lista de vencimentos exibidas ao usuário.

Fluxo Principal:

	1.	O usuário solicita a consulta de medicamentos ou o acompanhamento de vencimentos.
	
	2.	Para Consulta de Disponibilidade:
	a. O sistema solicita critérios de busca (nome, código ou tipo).
	b. O usuário informa os critérios.
	c. O sistema busca os medicamentos e exibe: Quantidade disponível, Lote, Data de Vencimento, Nível de Criticidade.
	
 	3.	Para Acompanhamento de Vencimentos:  
	a. O sistema busca medicamentos com vencimento próximo.
	b. O sistema exibe uma lista com alertas de vencimento.

### Geração de Relatórios de Auditoria (CSU04)

Sumário: Permite a geração de relatórios detalhados sobre as movimentações de medicamentos, alertas e criticidade, fornecendo dados essenciais para análise e controle gerencial.

Atores Primários: Gestor/Coordenador, Farmacêutico

Pré-condições: Usuário autenticado com permissão de acesso a relatórios.

Pós-condições: Relatório exibido ou exportado.

Fluxo Principal:

	1.	O usuário solicita a geração de um relatório.
	
	2.	O sistema apresenta opções de filtros (período, usuário, tipo de movimentação, etc.).
	
	3.	O usuário define os filtros desejados.
	
	4.	O sistema processa os dados conforme os filtros aplicados.
	
	5.	O sistema exibe o relatório contendo informações sobre: Entradas, Saídas, Alertas (ex: vencimentos), Medicamentos críticos, entre outros dados relevantes para auditoria.
 

### 3.4.3 Diagrama de Classes 

A Figura 2 mostra o diagrama de classes do sistema. O modelo destaca a classe **Medicamento**, que gerencia as informações gerais e se relaciona com Lote para controle de fabricação e validade. A classe **Estoque** mantém a quantidade atual e é atualizada por meio de instâncias de **Movimentacao** (controladas por **TipoMovimentacao**). Cada movimentação é realizada por um **Usuario**, que possui um **PerfilUsuario** associado definindo seu nível de acesso. Por fim, a classe **Relatorio** compila essas informações para auditoria e controle gerencial.

#### Figura 2: Diagrama de Classes do Sistema.
 

<p align="center">
  <img src="https://shorturl.at/e0FIA" alt="Diagrama do sistema">
</p>


### 3.4.4 Descrições das Classes

| # | Nome | Descrição |
|---|------|-----------|
| 1 | Medicamento | Cadastro geral de medicamentos disponíveis no sistema, contendo nome e categoria. |
| 2 | Lote | Registro de lotes de um medicamento, contendo número, data de fabricação e data de validade. |
| 3 | Estoque | Controle da quantidade atual e mínima de um medicamento, vinculado a um ou mais lotes. |
| 4 | Movimentacao | Registro de entradas, saídas, descartes, ajustes e transferências de medicamentos no estoque. |
| 5 | Usuario | Cadastro dos profissionais de saúde com acesso ao sistema, contendo nome e perfil de permissão. |
| 6 | Relatorio | Geração de relatórios de movimentações, estoque e vencimentos em um período determinado. |
| 7 | TipoMovimentacao | Enumeração dos tipos possíveis de movimentação: ENTRADA, SAIDA, DESCARTE, AJUSTE e TRANSFERENCIA. |
| 8 | PerfilUsuario | Enumeração dos perfis de acesso: ADMINISTRADOR, FARMACEUTICO, ENFERMEIRO e CONSULTOR. |
