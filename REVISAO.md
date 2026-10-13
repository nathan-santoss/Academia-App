# Revisão do projeto — 13/10/2026

## Resultado

O projeto atende ao recorte implementado de cadastro, listagem e consulta de alunos e contém os recursos acadêmicos adicionados nesta etapa. **Ainda não atende ao MVP inteiro descrito no PDF.** A adaptação local não substituiu o PostgreSQL nem passou regras administrativas para o celular.

Comparei o código próprio de `backend` e `mobile`, suas configurações e dependências com o documento mestre versão 2.0, de 12/10/2026, e com a lista de tecnologias enviada pelo usuário. O único PDF disponível nos anexos desta conversa é `Documentacao_Academia.pdf`; os PDFs das aulas da professora não estão disponíveis. Por isso, a comparação acadêmica é com a lista informada, sem afirmar equivalência com exemplos de aula não consultados.

## Redundâncias corrigidas

| Ponto | Ajuste |
| --- | --- |
| Consulta de CPF antes de cadastrar | Removida. A gravação já possui restrição única no banco e tratamento de conflito. Isso também protege pedidos simultâneos. |
| Dados completos carregados na listagem | A consulta de alunos agora seleciona somente as colunas do resumo exibido. O detalhe mantém os demais dados. |
| Limite de vinte alunos repetido no mobile | O aplicativo passou a usar o padrão do backend e continua recebendo `totalPaginas`. |
| Máscara de data repetida em dois formulários | Centralizada em `mobile/src/utils/formatar-data.js`, junto da formatação de horário. A validação de lembretes ficou separada da apresentação. |
| Recriação do objeto salvo de lembrete | O serviço agora aproveita o objeto devolvido pelo ORM, incluindo o ID gerado. |
| SQL manual de lembretes | Substituído por modelo e operações do TypeORM. A estrutura da tabela não é mais repetida em uma instrução CREATE TABLE própria. |
| Regras de Git repetidas | Reunidas no `.gitignore` da raiz, preservando a exclusão de segredos, dependências e pastas nativas geradas. |

Não removi as verificações do backend por também existir um formulário: o mobile orienta o preenchimento, enquanto a API valida qualquer cliente que a acesse. CPF válido, idade mínima, normalização e unicidade continuam sendo responsabilidade do servidor. As restrições do banco e a transação também são necessárias; não são duplicações dispensáveis da validação da API.

Mantive os arquivos de rota do Expo Router, mesmo quando apenas encaminham uma tela: eles definem os endereços de navegação. Mantive serviços, controllers, repositories, models e utils pela organização solicitada. Botões de ação e links têm funções distintas. Também evitei criar uma camada compartilhada entre Node e React Native apenas para reduzir poucas linhas, pois isso aumentaria a configuração do projeto.

## Responsabilidade dos dados

| Informação | Origem oficial | Acesso |
| --- | --- | --- |
| Pessoa e aluno | PostgreSQL no Neon | API Express → Sequelize. |
| Matrícula e IDs de alunos | Backend e banco | O mobile recebe os valores confirmados, sem calcular matrícula. |
| Lembretes pessoais | SQLite neste aparelho | Service → repository → modelo TypeORM. |
| Preferência de vibração | AsyncStorage | Context API compartilha a escolha entre telas. |
| Agendamento de aviso local | Sistema operacional | Serviço de notificações consulta/cancela pelo ID do lembrete. |
| Dados do dispositivo | Sistema operacional | Consulta somente para exibição em Preferências. |

O SQLite local não recebe cópias dos alunos ou credenciais do Neon. O ORM local preserva `academia-local.db`, a tabela `lembretes`, as colunas e os identificadores anteriores. A criação pelo modelo ocorre apenas quando a tabela está ausente; alterações futuras de estrutura exigirão uma decisão própria. Os horários continuam armazenados como texto ISO e apresentados no fuso do aparelho.

## Comparação com o PDF

| Capítulos do documento | Situação observada |
| --- | --- |
| 1–2: produto, plataformas e experiência | Parcial. Android/iOS em React Native e identidade escura/branca/laranja presentes. As jornadas completas ainda não existem. |
| 3: identidade, alunos e matrículas | Parcial. Pessoa separada de aluno, CPF único, UUID, matrícula A gerada pelo banco, idade mínima e campos obrigatórios/opcionais implementados. Perfil funcionário, matrícula F e vinculação validada entre perfis ainda não existem. |
| 4–5: papéis, login, recuperação e sessões | Pendente. Sem autenticação de usuários, recuperação, biometria ou autorização por papel. O bloqueio de alunos em produção é uma proteção temporária, não login. |
| 6–9: planos, modalidades, assinaturas, pagamentos e benefícios | Pendente. Não há contratos, preços configuráveis, tolerância de cinco dias, confirmação financeira, benefícios ou cortesias. |
| 10–11: chegada e exceções | Pendente. Não há confirmação presencial pela Recepção nem liberação excepcional da Gestão. GPS não é usado como prova de presença. |
| 12: notificações internas, push e pendências | Pendente como fluxo de negócio. Lembretes locais demonstram a tecnologia de notificação, mas não substituem central de lidas/não lidas, push de eventos ou painel administrativo. |
| 13–17: exercícios, modelos e rotinas | Pendente. Não há catálogo, curadoria de mídia, modelos de professor, publicação, versões, auditoria ou rotina pessoal. Alunos novos continuam sem ficha automática. |
| 18–20: sessão, execução guiada/lista e séries | Pendente. Não há sessão oficial, descanso, registro de séries ou encerramento parcial/completo. |
| 21–22: rascunho de treino, sincronização e cache | Pendente. SQLite de lembretes não representa cache protegido de treino nem envio idempotente de séries. |
| 23–24: evolução e medidas privadas | Pendente. Sem gráficos, histórico de execução, peso/altura ou consentimento de compartilhamento. |
| 25–26: arquitetura e camadas | Base atendida: JavaScript/JSX → Express → Sequelize → PostgreSQL. TypeORM/SQLite foi acrescentado somente para a adaptação local solicitada. Hospedagem, autenticação e arquitetura final de produção continuam pendentes. |
| 27: modelo lógico completo | Parcial. Apenas Pessoa e Aluno do núcleo de negócio estão modelados. Lembrete é uma entidade local adicional do recorte acadêmico. |
| 28–30: jornadas, aceitação e riscos | Parcial. Cadastro/lista/detalhe e estados de carregamento/erro/sucesso presentes; cenários AC-01 e AC-02 conferidos com persistência simulada. Os cenários dependentes dos demais módulos continuam pendentes. |
| 31: demonstração | Protótipo parcial. Não foi confirmada a conexão real ao Neon nem a execução da interface e dos recursos nativos no aparelho. |
| 32: itens retirados | Preservados. Sem chat, caixa completo, catraca, prescrição automática, preço fixo de modalidade ou GPS obrigatório para entrada. |
| 33–35: decisões abertas e evolução | Mantidas em aberto. Não foram inventadas regras de vencimento em meses curtos, cadência de push, segunda entrada, correção de pagamento ou credenciais iniciais. |

Os lembretes pessoais e as preferências foram acrescentados para exercitar os conteúdos acadêmicos solicitados posteriormente. Eles não constam como módulos de negócio concluídos no PDF original. Nenhuma regra de pagamento, entrada ou treino foi substituída por esses recursos.

## Lista acadêmica informada

| Requisito | Presença no código |
| --- | --- |
| Componentes nativos | Text, View, TextInput, Pressable, FlatList, ScrollView, Switch e Alert. |
| useState e useEffect | Formulários, preferências e consulta do dispositivo. |
| Stack e Tab Navigation | Layout principal e menu inferior com três abas. |
| Link | Navegação para cadastrar alunos e lembretes. |
| Context API | Preferência de vibração. |
| Storage | Persistência da preferência no AsyncStorage. |
| SQLite | Lembretes locais com ORM TypeORM e modelo em JavaScript. |
| Notificação | Agendamento local opcional; depende da permissão do aparelho. |
| Vibração | Confirmação ao salvar, conforme preferência. |
| Informações do dispositivo | Sistema, versão, marca, modelo e tipo. |
| Geolocalização | Adiada explicitamente pelo usuário; sem instalação ou implementação. |
| Comunicação com API | Cadastro, lista e detalhe de alunos. |

A professora não informou uma quantidade mínima ou um subconjunto obrigatório. Os itens acima representam presença na implementação, e não aprovação acadêmica ou validação completa em Android/iOS.

## Comentários e configurações

Todos os arquivos JavaScript/JSX próprios começam com uma explicação curta em primeira pessoa. Os arquivos `.env.example` e `.gitignore` também têm um comentário de finalidade. Imports não recebem comentários individuais. Arquivos JSON e lockfiles permanecem válidos, sem comentários não suportados; suas finalidades estão explicadas nos READMEs. Bibliotecas instaladas, imagens e o arquivo de licença não foram modificados para adicionar comentários.

## Verificações e limites

- Análise de estilo do backend e análise de estilo/tipos do mobile.
- Empacotamento JavaScript para Android e iOS.
- TypeORM real com SQLite em memória: banco novo, tabela legada preservada, manutenção da sequência de IDs após exclusões, abertura concorrente, nova tentativa após falha e operações de lembretes. A interface nativa do Expo e as notificações foram simuladas.
- Serviços reais do mobile contra o Express local: formato dos campos, matrícula, paginação padrão, detalhes, conflito de CPF, idade mínima, reversão de cadastro incompleto e bloqueio em produção. A persistência PostgreSQL foi simulada; não houve conexão ao Neon.
- Nenhum `.env`, script gerador, arquivo de teste permanente ou `.gitkeep` foi criado.

Ainda é necessário conferir em aparelho a interface, a persistência após reabrir, permissões, notificações e vibração, além de testar o backend com a conexão real do Neon. A revisão não altera as decisões pendentes nem declara o produto pronto para produção.
