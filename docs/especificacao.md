# 3. DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE

Nesta parte do trabalho você deve detalhar a documentação dos requisitos do sistema proposto de acordo com as seções a seguir. Ressalta-se que aqui é utilizado como exemplo um sistema de gestão de cursos de aperfeiçoamento.

## 3.1 Objetivos deste documento
Descrever e especificar as necessidades da Coordenação do Curso de Sistemas de Informação da PUC Minas que devem ser atendidas pelo projeto SCCA – Sistema de Cadastro de Cursos de Aperfeiçoamento.

## 3.2 Escopo do produto

### 3.2.1 Nome do produto e seus componentes principais
O produto será denominado SCCA – Sistema de Cadastro de Cursos de Aperfeiçoamento. Ele terá somente um componente (módulo) com os devidos elementos necessários à gestão de cursos.

### 3.2.2 Missão do produto
Gerenciar informações sobre a oferta de cursos de aperfeiçoamento, gerenciar a composição das turmas, alunos, professores e matrículas. 

### 3.2.3 Limites do produto
O SCCA não fornece nenhuma forma de avaliação de alunos, pagamento de parcelas do curso, pagamento a professore e agendamentos. O SCCA não contempla o atendimento a vários cursos de Sistemas de Informação de outras unidades da PUC Minas.

### 3.2.4 Benefícios do produto

| # | Benefício | Valor para o Cliente |
|--------------------|------------------------------------|----------------------------------------|
|1	| Facilidade no cadastro de dados |	Essencial |
|2 | Facilidade na recuperação de informações | Essencial | 
|3 | Segurança no cadastro de matrículas | Essencial | 
|4	| Melhoria na comunicação com os alunos	| Recomendável | 

## 3.3 Descrição geral do produto

### 3.3.1 Requisitos Funcionais

| Código | Requisito Funcional (Funcionalidade) | Descrição |
|--------------------|------------------------------------|----------------------------------------|
| RF1 | Gerenciar Curso de Aperfeiçoamento |	Processamento de Inclusão, Alteração, Exclusão e Consulta de Cursos de Aperfeiçoamento |
| RF2 |	Gerenciar Professor	| Processamento de Inclusão, Alteração, Exclusão e Consulta de professores |
| RF3	| Gerenciar Matrícula |	Processamento de Inclusão, Alteração, Exclusão e Consulta de Matrículas de alunos em Cursos de Aperfeiçoamento |
| ... |	...	| ... |

### 3.3.2 Requisitos Não Funcionais

| Código | Requisito Não Funcional (Restrição) |
|--------------------|------------------------------------|
| RNF1 | O ambiente operacional a ser utilizado é o Windows XP. |
| RNF2 | O sistema deverá executar em um computador configurado com uma impressora de tecnologia laser ou de jato de tinta, a ser usada para impressão dos relatórios. |
| RNF3 |	Segurança	O produto deve restringir o acesso por meio de senhas individuais para o usuário. |
| ... |	... |	... |

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

A Figura 2 mostra o diagrama de classes do sistema. A Matrícula deve conter a identificação do funcionário responsável pelo registro, bem com os dados do aluno e turmas. Para uma disciplina podemos ter diversas turmas, mas apenas um professor responsável por ela.

#### Figura 2: Diagrama de Classes do Sistema.
 
![image](https://github.com/user-attachments/assets/abc7591a-b46f-4ea2-b8f0-c116b60eb24e)


### 3.4.4 Descrições das Classes 

| # | Nome | Descrição |
|--------------------|------------------------------------|----------------------------------------|
| 1	|	Aluno |	Cadastro de informações relativas aos alunos. |
| 2	| Curso |	Cadastro geral de cursos de aperfeiçoamento. |
| 3 |	Matrícula |	Cadastro de Matrículas de alunos nos cursos. |
| 4 |	Turma |	Cadastro de turmas.
| 5	|	Professor |	Cadastro geral de professores que ministram as disciplinas. |
| ... |	... |	... |
