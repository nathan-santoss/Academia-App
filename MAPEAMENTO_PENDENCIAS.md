# Revisão do aplicativo em relação ao projeto da academia

> Continuidade da implementação: consulte [IMPLEMENTACAO_TREINOS.md](IMPLEMENTACAO_TREINOS.md) para o fluxo de treino acrescentado, ativação da equipe, verificações e limitações. O diagnóstico abaixo foi preservado como registro da situação anterior.

**Data:** 14/10/2026  
**Base do código:** pasta atual do projeto, com commit de referência `66c3d1d` e alterações locais de comentários.  
**Objetivo:** registrar o que falta implementar, o que precisa mudar e o que deve sair do foco do aplicativo. Este documento não executa essas alterações.

## 1. Diagnóstico principal

**A percepção de que o aplicativo virou um gerenciador de lembretes corresponde ao que o código oferece hoje.** Depois do login, o menu apresenta somente **Meu perfil**, **Lembretes** e **Sobre**. Não existem telas, rotas de API ou modelos de banco para executar treinos, consultar evolução, administrar assinaturas ou confirmar chegada à academia.

O PDF define como proposta principal a combinação de **cadastro e acesso à academia, assinaturas, prescrição e execução de treinos e histórico de evolução**. Isso está no capítulo 01, página 4. A implementação atual entrega uma base de autenticação e cadastro, acompanhada de lembretes pessoais; ainda não entrega esse núcleo do produto.

O desvio não se resolve apenas trocando textos, cores ou nomes de abas. Também não há, no código analisado, um conjunto completo de telas de academia escondido por alguma configuração do Expo. É necessário implementar os fluxos que estão ausentes no frontend e no backend.

As tecnologias acadêmicas foram parcialmente incorporadas, mas sua presença não significa que as funcionalidades do PDF tenham sido atendidas. Um aviso local demonstra notificação; sozinho, ele não implementa avisos de pagamento, vencimento ou nova ficha de treino.

## 2. Fontes e limites desta revisão

- **Documento funcional consultado:** [Documentacao_Academia.pdf](C:/Users/Nathan/.codex/attachments/6537dd57-8f51-4b4b-a714-dee78b4fc8cd/Documentacao_Academia.pdf), versão 2.0, de 12/10/2026, com 38 páginas. As referências abaixo usam a numeração das páginas desse arquivo.
- **Código consultado:** navegação e telas de `mobile/src`, serviços, contextos, armazenamento, rotas, autorização, regras e modelos de `backend/src`, além das configurações de dependências.
- **Decisões posteriores:** mensagens desta conversa sobre Neon, retirada do SQLite, treino pendente no celular, cadastro individual, sessão de acesso, menu inferior e geolocalização adiada.
- **Conteúdo acadêmico:** lista de tecnologias transcrita pelo usuário na conversa. Os PDFs das aulas da professora não estavam entre os anexos acessíveis nesta revisão; portanto, não foi possível comparar exemplos e exercícios desses materiais diretamente.
- **Distribuição:** a análise identifica o que o código local consegue oferecer. Não houve inspeção do APK instalado no telefone, comparação binária com uma versão do Expo nem verificação do deploy atualmente ativo no Render.

O PDF consultado ainda descreve a criação inicial do projeto e informa que a hospedagem da API não foi escolhida. Esses registros são históricos: a conversa posterior já definiu Render e Expo. Por isso, este levantamento usa o PDF junto das decisões posteriores, sem tratar trechos antigos como ordens para desfazer o que foi aprovado.

## 3. O que está implementado

### Experiência disponível para o aluno

| Área | O que o código oferece | Limite atual |
| --- | --- | --- |
| Criar conta | Formulário de aluno, dados pessoais, e-mail e senha, validações e gravação pela API. | Não cria assinatura, ficha ou perfil de funcionário. |
| Entrar e sair | Login, credencial protegida no aparelho, consulta do próprio perfil e encerramento da sessão no servidor. | Não há recuperação de senha, biometria ou área funcional. |
| Meu perfil | Nome, matrícula, dados pessoais, foto por URL e contato opcional de emergência. | É uma consulta do cadastro; não é um painel de academia. |
| Lembretes | Criar, listar e excluir anotações com data/hora; agendar aviso local quando permitido. | Os lembretes são criados pela pessoa, sem ligação com assinatura, pagamento ou ficha. |
| Sobre | Informações do aparelho, preferência de vibração e saída da conta. | O texto apresenta o produto como perfil e lembretes pessoais. |
| Navegação | Menu inferior e navegação em pilha, com separação das telas públicas e autenticadas. | A estrutura está pronta para receber áreas úteis, mas essas áreas ainda não existem. |

### Base do backend

Existem os modelos `Pessoa`, `Aluno`, `Conta`, `Sessao`, `Plano`, `Modalidade`, `Lembrete` e `OperacaoRecebida`. O acesso ao banco usa Sequelize e PostgreSQL no Neon.

Três distinções são importantes para não confundir estrutura preparada com funcionalidade entregue:

1. **`Sessao` representa o login.** Guarda resumo do token, conta e validade. Não representa sessão de treino, exercícios ou séries.
2. **`Plano` e `Modalidade` representam itens de catálogo.** Não existe assinatura vinculando um aluno a um período de cobertura, nem registro de pagamento.
3. **`OperacaoRecebida` representa recibos técnicos de operações.** Ajuda a evitar gravações repetidas em operações que já a utilizam; não é histórico de treino, auditoria de publicação de ficha ou fila local de sincronização.

Há uma consulta autenticada de catálogo em `/api/v1/catalogo/:categoria`. A alteração de catálogo e o cadastro/listagem geral de alunos passam por `exigirEquipe`, que atualmente sempre responde com 403. Não existe um funcionário autorizado capaz de concluir esses caminhos pelo aplicativo.

## 4. Decisões posteriores ao PDF que devem ser preservadas

| Decisão aprovada na conversa | Como considerar na continuidade |
| --- | --- |
| Cada pessoa pode criar sua conta de aluno com e-mail e senha. | Manter esse fluxo para a versão da turma. Não restaurar uma credencial temporária obrigatória para esse autocadastro. O acesso de pessoas cadastradas pela recepção ainda precisa ser definido. |
| Sessão de até 30 dias, saída imediata e limite de tentativas. | Preservar o comportamento aprovado. Distinguir esse prazo do bloqueio por inatividade da futura área de funcionários. |
| Usar somente Neon como banco e retirar SQLite. | Não recriar SQLite no mobile ou no backend, nem o antigo banco de contingência. |
| Preservar temporariamente o treino no celular e enviar quando a conexão voltar. | Implementar o rascunho limitado e protegido do treino. Apagar os dados pendentes somente após confirmação do backend. Isso não exige um segundo banco SQL. |
| Aplicativo depende de internet para seu funcionamento normal. | Não criar uma fila offline ampla de pagamentos, autorizações, cadastros ou operações da equipe. |
| Geolocalização fica para depois. | Manter adiada. Também não usar GPS como prova de chegada: o PDF prevê confirmação presencial pela recepção. |
| Menu inferior e uma área Sobre com dados do aparelho. | Manter a estrutura, reorganizando o acesso às funções reais da academia. |
| Código simples em JavaScript/JSX, com responsabilidades separadas. | Manter rotas, controllers, services, repositories, models, config e utils; não acrescentar infraestrutura sem necessidade. |
| API hospedada no Render. | O mobile chama a API HTTPS; somente o backend acessa as credenciais do Neon. |

## 5. O que falta segundo o PDF

**Legenda:** “ausente” significa que não foi encontrado um fluxo correspondente no código analisado. “Parcial” significa que existe uma parte da estrutura, mas não a jornada completa do usuário.

| Módulo e referência | Situação | Trabalho necessário |
| --- | --- | --- |
| **Painel inicial da academia** — caps. 01, 02 e 28; págs. 4, 5 e 31 | Ausente | Apresentar contexto do aluno, situação de acesso, chegada do dia, rotina disponível, treino em andamento e avisos relevantes. Não inventar números quando ainda não houver dados. |
| **Identidade e perfis** — cap. 03; pág. 6 | Parcial | Preservar pessoa/CPF único e matrícula A; acrescentar perfil funcionário, matrícula F e vínculo com a mesma identidade. Definir uma vinculação segura para cadastros existentes. |
| **Papéis e área da equipe** — cap. 04; pág. 7 | Ausente | Implementar Recepção, Instrutor, Gestão e Administrador do Sistema, com autorização real na API, separação de contextos e revogação do acesso funcional. |
| **Acesso completo** — cap. 05; pág. 8 | Parcial | Acrescentar recuperação de senha por código de uso único enviado ao e-mail, verificação nativa quando disponível e proteção da área funcional. Prazos de inatividade continuam pendentes. |
| **Catálogo de planos e modalidades** — cap. 06; pág. 9 | Parcial | Criar telas de consulta e gestão; permitir edição apenas à equipe autorizada, com preços configuráveis e ativação/desativação. As regras de produtos combinados não estão fechadas. |
| **Assinaturas e cobertura** — cap. 07; pág. 10 | Ausente | Vincular aluno e plano, controlar vigência, vencimento, cancelamento e os estados vigente, em tolerância e suspenso. Implementar os cinco dias gratuitos somente para planos elegíveis. |
| **Pagamentos manuais** — cap. 08; pág. 11 | Ausente | Registrar valor, método, aluno/assinatura, responsável, data e confirmação autorizada. Atualizar a cobertura sem aceitar comprovante ou pedido pendente como pagamento confirmado. |
| **Benefícios e cortesias** — cap. 09; pág. 12 | Ausente | Concessão pela Gestão com motivo, vigência e histórico, distinguindo benefício funcional de cortesia e de pagamento. Preservar cobertura paga antes de ativar benefício quando aplicável. |
| **Chegada diária** — cap. 10; pág. 13 | Ausente | Solicitação pelo aluno, fila da recepção, confirmação presencial e registro em nome de aluno sem celular. Conferir cobertura atual e impedir duplicidade no mesmo dia. |
| **Exceção de entrada** — cap. 11; pág. 14 | Ausente | Autorização da Gestão para dia específico, motivo e auditoria; confirmação presencial separada. Não transformar exceção em plano pago ou assinatura ativa. |
| **Notificações de negócio** — cap. 12; pág. 15 | Ausente | Criar central interna com lidas/não lidas, eventos persistidos, pendências administrativas e push para eventos relevantes. Os avisos locais atuais não cumprem esse fluxo. |
| **Catálogo de exercícios** — cap. 13; pág. 16 | Ausente | Exercícios oficiais e locais, busca por nomes/termos, equipamento, descrição, imagem opcional e links de vídeo revisados. Preservar referências do histórico. |
| **Modelos de treino** — cap. 14; pág. 17 | Ausente | Estruturas-base revisadas e modelos privados do instrutor, copiáveis para rascunho. Não entregar automaticamente uma ficha genérica ao novo aluno. |
| **Rotina recomendada** — cap. 15; pág. 18 | Ausente | Instrutor busca aluno, prepara rascunho, organiza divisões/exercícios, define parâmetros e publica explicitamente. Mostrar a ficha publicada ao aluno. |
| **Versões e auditoria de ficha** — cap. 16; pág. 19 | Ausente | Guardar autor, data, versões e diferenças; tratar edições concorrentes e restauração como nova publicação. Preservar a ficha usada por treinos anteriores. |
| **Rotina pessoal do aluno** — cap. 17; pág. 20 | Ausente | Permitir uma rotina pessoal atual, criada do zero ou copiada da recomendada, com edição independente, aviso inicial e confirmação antes de substituí-la. |
| **Início do treino** — cap. 18; pág. 21 | Ausente | Exigir chegada confirmada, escolher rotina/divisão e manter somente um treino ativo por aluno. Fixar a versão e os parâmetros usados no início. |
| **Modo guiado e lista completa** — cap. 19; pág. 22 | Ausente | Duas formas de visualizar a mesma sessão; alternar sem perder ou duplicar séries. Separar prescrição e execução real. |
| **Séries, descanso e conclusão** — cap. 20; pág. 23 | Ausente | Registrar carga, repetições ou duração, marcar/corrigir séries e usar temporizador de descanso. Encerrar treino completo ou parcial sem preencher séries não realizadas. |
| **Rascunho e reconexão do treino** — cap. 21; pág. 24 | Ausente | Salvar incrementalmente no aparelho, retomar após fechamento, distinguir pendência de confirmação, reenviar sem duplicar e limpar somente o que o servidor confirmou. |
| **Consulta limitada sem internet** — cap. 22; pág. 25 | Ausente | O PDF prevê uma cópia da rotina atual com data de atualização, sem biblioteca antiga ou vídeos offline. Conciliar esse limite com a decisão posterior de priorizar o treino em andamento; não ampliar para um banco local completo. |
| **Minha Evolução** — cap. 23; pág. 26 | Ausente | Exibir desempenho por exercício, gráficos simples, histórico detalhado e frequência de sessões completas/parciais. Não contar chegada como treino realizado. |
| **Peso, altura e privacidade** — cap. 24; pág. 27 | Ausente | Registros opcionais, datados e corrigíveis; aluno controla compartilhamento com instrutores. Recepção não pode consultar essas medidas. |
| **Persistência dos módulos de academia** — caps. 25–27; págs. 28–30 | Parcial | Reaproveitar Node, Express, Sequelize e Neon; acrescentar entidades, relacionamentos e regras dos módulos ausentes. Não considerar os oito modelos existentes como banco completo do projeto. |
| **Jornadas e aceitação** — caps. 28–30; págs. 31–33 | Parcial | Manter estados de espera/erro já usados e acrescentar estados de chegada, publicação, conflito e sincronização. Validar os cenários AC-01 a AC-23 quando seus módulos existirem. |

### Regras já definidas que não podem se perder na implementação

- A tolerância é de **cinco dias gratuitos** para Mensal, Trimestral, Semestral e Anual. Diário e Quinzenal não recebem essa tolerância automaticamente.
- Renovação durante a tolerância usa o vencimento anterior como referência; retorno após suspensão inicia novo período. Não criar dívida automática pelos dias gratuitos.
- Recepção confirma chegada; Gestão autoriza exceções. Nenhuma dessas ações é um pagamento ou uma série realizada.
- Qualquer instrutor ativo e autorizado pode atualizar a ficha. Não criar professor exclusivo obrigatório ou aprovação entre professores.
- Aluno não edita a ficha publicada pelo professor. A rotina pessoal é separada e sua cópia não acompanha futuras alterações da recomendada.
- Publicar uma ficha durante um treino não muda a sessão que já começou.
- Histórico e gráficos usam execução confirmada pelo servidor. Séries pendentes e sessões parciais precisam ser identificadas corretamente.
- Cadastro de aluno não concede automaticamente plano, chegada confirmada, ficha genérica ou papel de funcionário.

## 6. O que retirar do foco e o que mudar

As ações abaixo são recomendações para a implementação seguinte. Nenhum arquivo ou dado do aplicativo foi excluído nesta revisão.

| Elemento atual | Mudança recomendada | Cuidado necessário |
| --- | --- | --- |
| Aba principal **Lembretes** | Retirar seu papel de função central e priorizar treino e evolução na navegação. | Não apenas renomear a aba: um lembrete não vira uma sessão de treino. |
| Cadastro genérico de lembretes pessoais | Retirar do recorte principal. Só manter como função secundária se houver uma escolha explícita de mantê-lo. | Não é substituto das notificações do cap. 12. Caso seja retirado, planejar o destino de eventuais dados já cadastrados. |
| Textos “consultar seu cadastro e organizar seus lembretes” e “Meu perfil e lembretes pessoais” | Reescrever apresentação e estados das telas em torno dos recursos reais da academia conforme forem entregues. | Não anunciar treinos e evolução como disponíveis antes de implementá-los. |
| Entrada do menu em **Meu perfil** | Transformar a abertura em um painel útil da academia; manter o perfil numa área de conta. | Mostrar ausência de plano/ficha quando for o caso, sem criar dados fictícios silenciosamente. |
| `exigirEquipe` bloqueando tudo | Substituir o bloqueio provisório por conferência dos papéis e do vínculo funcional quando esses recursos forem implementados. | Não remover o bloqueio antes da autorização real, nem usar um seletor de perfil como prova de permissão. |
| Conta ligada obrigatoriamente a `Aluno` | Adaptar a identidade de acesso para também atender funcionário que não seja aluno e pessoa com os dois perfis. | Planejar a alteração preservando contas existentes; o desenho físico final não está sendo fixado neste levantamento. |
| Nome genérico `Sessao` no modelo de login | Diferenciar claramente sessão de acesso e sessão de treino no futuro código e na documentação. | Não reaproveitar a tabela de tokens como tabela de treino. Uma renomeação física exige cuidado com dados existentes. |
| Notificações restritas ao agendamento manual | Reaproveitar permissão, apresentação e cancelamento, mas criar eventos da academia, central interna e envio remoto quando cabível. | Push e aviso agendado no próprio aparelho são mecanismos diferentes. |
| Persistência e controlador compartilhados entre catálogo e lembretes | Separar responsabilidades por assunto conforme entrarem os módulos da academia. | Evitar tanto um arquivo central com todas as regras quanto uma reorganização grande sem benefício. |
| Ícone, textos e composição visual | Revisar a identidade do produto. A paleta escura/branca/laranja já existe; a configuração de ícone adaptativo ainda usa fundo azul claro. | O desenho final e o nome comercial continuam abertos; não tratar uma proposta visual como já aprovada. |

### Arquivos envolvidos na retirada dos lembretes genéricos

Se essa recomendação for executada, o ajuste precisa alcançar o fluxo inteiro:

- Rotas mobile: `mobile/src/app/(menu)/lembretes.jsx` e `mobile/src/app/lembretes/novo.jsx`.
- Telas: `mobile/src/screens/ListaLembretes.jsx` e `mobile/src/screens/CadastroLembrete.jsx`.
- Serviço e validação: `mobile/src/services/lembrete-servico.js` e `mobile/src/utils/validar-lembrete.js`.
- Backend: `backend/src/services/lembrete-servico.js`, `backend/src/models/lembrete.js` e os handlers/rotas desse assunto em `academia-controlador.js` e `academia-rotas.js`.
- Referências de preparação e persistência: `backend/src/config/criar-tabelas.js` e `backend/src/repositories/operacao-online.js`.
- Menu, Stack e textos de apresentação nas telas de entrada e Sobre.

Não excluir automaticamente o serviço de notificações, o serviço de preferências, a vibração, o recibo de operações ou componentes compartilhados. Eles têm uso no projeto corrigido. Também não apagar a tabela de lembretes no Neon como parte de uma simples limpeza de arquivos.

## 7. O que deve ser aproveitado

- Autocadastro aprovado para a turma, login, proteção da credencial e consulta dos próprios dados.
- Validações de CPF, maioridade, dados obrigatórios e matrícula gerada pelo banco.
- Base de identidade em Pessoa e Aluno, adaptada depois para os perfis funcionais.
- Express, Sequelize, Neon e organização em camadas.
- Modelos de plano e modalidade como início do catálogo, sem confundi-los com assinatura.
- Navegação Stack/Tab, contextos e componentes reutilizáveis de botão, campo, informação e aviso.
- Paleta visual compartilhada e área Sobre com informações do aparelho.
- Preferência de vibração e integração com notificações, aplicadas a fluxos do produto.
- Transações e reconhecimento de pedidos repetidos onde já existem; ampliar com regras específicas para séries, pagamentos e chegada, sem presumir que esses casos já estejam cobertos.

## 8. Proposta de navegação para corrigir o foco

Esta é uma **proposta de organização**, não um desenho final aprovado pelo PDF. O objetivo é manter o menu inferior já solicitado e dar acesso direto ao uso da academia.

| Aba proposta | Conteúdo |
| --- | --- |
| **Início** | Situação atual na academia, solicitação/estado de chegada, atalho para retomar treino e acesso à central de notificações. |
| **Treinos** | Rotina recomendada, rotina pessoal, divisões e acesso à execução. |
| **Evolução** | Histórico de sessões, desempenho por exercício, frequência, peso e altura opcionais. |
| **Minha conta** | Cadastro, plano/assinatura, histórico de pagamentos confirmados e troca de contexto quando autorizada. |
| **Sobre** | Informações do aplicativo e dispositivo, preferências e saída da conta. |

Formulários, detalhes e execução podem abrir pelo Stack. Durante a execução do treino, pode ser útil esconder o menu para reduzir distrações, mantendo uma forma clara de voltar e retomar a sessão.

A área funcional deve apresentar as ações permitidas ao papel vigente: fila e atendimento para Recepção, fichas para Instrutor, gestão operacional para Gestão e funções superiores para Administrador do Sistema. Não criar contas administrativas por autocadastro público.

## 9. Ordem recomendada de produção

### Etapa 1 — Preparar as dependências dos fluxos reais

1. Fechar somente as decisões que bloqueiam o próximo fluxo, especialmente criação/acesso da equipe e ativação da cobertura usada na demonstração.
2. Implementar identidade funcional, papéis e autorização no backend, preservando o acesso atual do aluno.
3. Disponibilizar as telas de alunos e catálogo para os papéis autorizados.
4. Implementar o caminho mínimo de cobertura e confirmação presencial necessário ao início de treino. Não burlar a regra de chegada para fazer um botão funcionar.

Para uma demonstração parcial, o PDF permite dados fictícios identificados. Eles precisam ser separados da operação real; não transformar um perfil fictício em autorização de produção nem inventar uma assinatura paga.

### Etapa 2 — Entregar uma jornada de treino de ponta a ponta

1. Criar catálogo de exercícios e estrutura da rotina recomendada.
2. Permitir ao instrutor preparar e publicar uma ficha para um aluno identificado.
3. Mostrar a ficha no aplicativo e permitir iniciar uma sessão após a chegada confirmada.
4. Registrar séries reais, descanso e conclusão parcial/completa.
5. Mostrar o treino confirmado no histórico.
6. Preservar o rascunho em interrupções e sincronizar sem duplicar, apagando apenas pendências confirmadas.

Essa etapa é a mudança que faz o produto começar a cumprir sua finalidade de academia. Uma lista estática de exercícios ou um lembrete com o nome “treino” não atende essa jornada.

### Etapa 3 — Completar a experiência do aluno e do instrutor

Acrescentar rotina pessoal independente, modelos privados do professor, os dois modos de execução, versionamento completo, restauração e auditoria, evolução com gráficos e medidas opcionais com privacidade.

### Etapa 4 — Completar a operação da academia

Concluir assinaturas, tolerância, renovação, cancelamento, pagamentos manuais, benefícios, cortesias, exceções e painéis de equipe. As partes mínimas usadas nas etapas anteriores precisam evoluir para todas as regras já decididas no PDF.

### Etapa 5 — Notificações de negócio e distribuição

Conectar os eventos reais à central interna e ao push, validar as jornadas e publicar uma nova versão do aplicativo com o backend compatível. Até isso acontecer, uma nova compilação do mesmo código continuará oferecendo o mesmo recorte de perfil e lembretes.

## 10. Requisitos acadêmicos sem desviar o produto

O usuário informou que não recebeu uma quantidade mínima definida de tecnologias obrigatórias. Esta tabela registra o que está no código e o que foi excluído ou adiado por decisão do projeto; não declara dispensa concedida pela professora.

| Tecnologia apresentada | Situação atual | Como manter alinhada à academia |
| --- | --- | --- |
| Componentes nativos | Presentes: textos, entradas, listas, botões, imagens, rolagem e controles. | Reutilizar nas telas dos módulos reais. |
| `useState` e `useEffect` | Presentes em telas e contextos. | Usar no estado da interface e nos carregamentos necessários. |
| Stack e Tab Navigation | Presentes com Expo Router. | Reorganizar as abas em torno da academia e abrir detalhes/formulários pelo Stack. |
| Link | Presente no componente de navegação `BotaoLink`. | Manter a navegação e, no catálogo futuro, tratar os links de mídia revisados. |
| Context API | Presente para acesso e preferências. | Compartilhar contexto de usuário e preferências sem colocar todas as regras de negócio nele. |
| Storage | AsyncStorage guarda a preferência de vibração; SecureStore guarda a credencial. | Acrescentar a preservação protegida e limitada do treino pendente com mecanismo adequado. O armazenamento atual ainda não faz isso. |
| SQLite | Ausente por decisão explícita do usuário. | Não reintroduzir. Neon/Sequelize não deve ser apresentado como se fosse SQLite. |
| Notificação | Avisos locais de lembretes pessoais estão implementados. | Preservar o recurso acadêmico dentro dos eventos reais da academia; completar central interna e push previstos no PDF. |
| Vibração | Presente como confirmação, com preferência. | Manter retorno breve em ações concluídas; não exige um módulo separado de lembretes. |
| Informações do dispositivo | Presentes em Sobre. | Manter nessa área secundária, como solicitado. |
| Geolocalização | Adiada por decisão explícita. | Aguardar os detalhes do usuário; não usar como autorização de entrada. |
| Comunicação com API | Presente entre mobile e backend. | Continuar mobile → Express → Sequelize → Neon. Não é necessário acrescentar uma API pública só para demonstrar comunicação. |

## 11. Decisões que continuam em aberto

Estas lacunas não autorizam inventar regras. Também não justificam tratar todos os demais módulos já definidos como opcionais.

| Tema | Decisão necessária |
| --- | --- |
| Calendário de vencimento | Exemplos aprovados para dias 29, 30 e 31 e meses curtos. Não fixar todo mês como 30 dias. |
| Modalidades combinadas | Cobertura, períodos, restrições e combinação com musculação; não criar turmas/vagas/agenda de aulas por suposição. |
| Correção de pagamento | Quem pode corrigir/anular uma confirmação e quais efeitos ficam registrados. |
| Segunda entrada física no mesmo dia | Tratamento operacional sem criar presença duplicada indevida. |
| Cadência de notificações | Quantidade e antecedência dos avisos; o PDF não aprovou “três dias antes” como regra fixa. |
| Acesso de cadastros criados pela equipe | Procedimento seguro para a pessoa obter acesso e para provisionar a equipe. O autocadastro da turma já foi decidido. |
| Bloqueio por inatividade | Tempos e revalidação para contexto funcional e uso de biometria/credencial nativa. |
| Mídia e exercícios de referência | Seleção e revisão de exercícios, imagens e URLs de vídeo. |
| Persistência temporária do treino | Proteção dos dados, limites, retomada, conflito e limpeza após confirmação; a finalidade já foi aprovada, o mecanismo ainda não foi implementado. |
| Rotina para consulta offline | Confirmar o recorte final entre o cache limitado do cap. 22 e a prioridade posterior de guardar o treino em andamento. |
| Identidade visual e telas finais | Nome comercial, ícones e desenho detalhado. A paleta e o menu inferior já têm direção definida. |
| Uso real e privacidade | Termos, retenção, consentimentos e procedimentos operacionais; não declarar conformidade completa apenas por existir login. |

Render como hospedagem, Neon como banco, retirada de SQLite, autocadastro da turma e sessão de 30 dias **não devem voltar a ser tratados como decisões inteiramente abertas**. São pontos já resolvidos na conversa posterior ao PDF.

## 12. O que não acrescentar ao tentar corrigir o projeto

Conforme os caps. 01 e 32, págs. 4 e 35, manter fora do MVP: caixa/ERP completo, folha e ponto de funcionários, gateway bancário, conciliação automática de Pix, chat com professor, rede social, rankings, prescrições por IA, fotos corporais de evolução, bioimpedância, diagnóstico, vídeos baixados, animação 3D e integração obrigatória com catraca.

Também não criar professor exclusivo obrigatório, aprovação entre professores, ficha automática para todo aluno, múltiplas rotinas pessoais atuais ou cobrança pelos dias de tolerância. Não transformar a recuperação do foco em uma expansão além do PDF.

## 13. Como verificar que a correção realmente entregou o projeto

### Primeira jornada funcional de academia

- [ ] O aluno entra e entende sua situação na academia, sem receber lembretes genéricos como principal atividade.
- [ ] O funcionário autorizado encontra o aluno correto e consegue cumprir sua função real.
- [ ] A recepção confirma a chegada usando dados atuais de cobertura; aluno não consegue confirmar sozinho.
- [ ] O instrutor publica uma ficha e o aluno consulta essa ficha na própria conta.
- [ ] O aluno inicia um único treino, registra séries reais e encerra como completo ou parcial.
- [ ] O histórico mostra somente o que foi efetivamente realizado e confirmado.
- [ ] Ao perder a rede ou fechar o app, o treino pendente pode ser retomado; reconexão não duplica registros.
- [ ] A cópia pendente só é apagada depois de o backend confirmar o recebimento.
- [ ] Outra conta não consegue consultar esses dados.

### Conclusão do escopo, além dessa primeira jornada

- [ ] Rotina pessoal independente, versões, modelos e dois modos de execução seguem as regras do PDF.
- [ ] Planos, assinaturas, pagamentos, benefícios e exceções funcionam com permissões próprias.
- [ ] Evolução, frequência e medidas opcionais têm origem correta e respeitam privacidade.
- [ ] Notificações representam eventos reais, com central interna utilizável mesmo sem push.
- [ ] Os cenários AC-01 a AC-23 da página 32 são verificados com resultados registrados durante a implementação.
- [ ] Android e iOS são testados nos fluxos aplicáveis; sucesso de lint ou geração de APK não é usado como prova de completude funcional.

## 14. Evidências principais no código

| Evidência | Local |
| --- | --- |
| Menu limitado a perfil, lembretes e Sobre | `mobile/src/app/(menu)/_layout.jsx` |
| Stack possui cadastro, login, menu e formulário de lembrete | `mobile/src/app/_layout.jsx` |
| Apresentação do produto como cadastro/lembretes | `mobile/src/screens/Entrar.jsx` e `mobile/src/screens/Preferencias.jsx` |
| Chamadas mobile de acesso e lembretes | `mobile/src/services/acesso-servico.js` e `mobile/src/services/lembrete-servico.js` |
| Preferência local não contém rascunho de treino | `mobile/src/services/preferencias-servico.js` |
| Credencial local protegida | `mobile/src/services/token-servico.js` |
| Agendamento local, sem fluxo de push de negócio | `mobile/src/services/notificacao-servico.js` |
| Rotas existentes de acesso, alunos, catálogo e lembretes | `backend/src/routes/acesso-rotas.js`, `aluno-rotas.js` e `academia-rotas.js` |
| Equipe sempre bloqueada | `backend/src/middlewares/autenticacao.js`, função `exigirEquipe` |
| Conta depende do perfil aluno | `backend/src/models/conta.js` |
| Sessão existente é de autenticação | `backend/src/models/sessao.js` |
| Catálogo sem vínculo de assinatura | `backend/src/models/plano.js` e `backend/src/models/modalidade.js` |
| Recibos de operações, sem histórico de treino | `backend/src/models/operacao-recebida.js` e `backend/src/repositories/operacao-online.js` |

**Conclusão da revisão:** existe uma base técnica aproveitável, mas o núcleo funcional da academia continua ausente. A próxima produção deve entregar jornadas reais de academia, preservando os requisitos acadêmicos como parte dessas jornadas. O módulo genérico de lembretes não deve continuar sendo tratado como a realização do projeto documentado.
