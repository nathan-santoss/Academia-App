# Mobile da Academia

Aplicativo Android e iOS em React Native com JavaScript/JSX. O menu inferior reúne **Alunos**, **Lembretes** e **Preferências**. O visual usa fundo escuro, branco e laranja, conforme a documentação.

## Organização

As rotas abrem telas; as telas chamam serviços. Os serviços de alunos acessam a API e os de lembretes usam o repository local, que consulta o modelo pelo TypeORM.

| Pasta | Responsabilidade |
| --- | --- |
| `src/app` | Navegação Stack, menu Tab e rotas. |
| `src/screens` | Telas, formulários e carregamento dos dados. |
| `src/components` | Botões, links, campos e avisos reutilizáveis. |
| `src/contexts` | Preferência de vibração compartilhada entre as telas. |
| `src/services` | API, preferências, informações do aparelho e notificações. |
| `src/repositories` | Consultas e gravações dos lembretes pelo TypeORM. |
| `src/models` | Modelo JavaScript que descreve a tabela local de lembretes. |
| `src/config` | Abertura do banco local e criação da tabela de lembretes. |
| `src/utils` | Validações, formatação e função de vibração. |
| `src/theme` | Cores e estilos compartilhados. |

Comece em `src/app/_layout.jsx`, que fornece o contexto e a navegação Stack. `src/app/(menu)/_layout.jsx` define as três abas. Os formulários e detalhes abrem sobre o menu, com botão de voltar no cabeçalho.

Para acompanhar um cadastro de aluno, leia `screens/CadastroAluno.jsx`, `utils/validar-cadastro-aluno.js` e `services/aluno-servico.js`. Para um lembrete, siga `screens/CadastroLembrete.jsx`, `services/lembrete-servico.js` e `repositories/lembrete-repositorio.js`.

Cada arquivo de código começa com um comentário resumindo sua função em primeira pessoa. Os demais comentários explicam a intenção dos trechos. O código próprio não usa ternários, `for`, `forEach`, `?.` ou `??`. `usePreferencias` mantém o prefixo `use` porque o React precisa reconhecer que essa função é um hook.

Os arquivos JSON seguem o formato padrão, que não aceita comentários: `package.json` declara pacotes e comandos; `package-lock.json` fixa as versões instaladas; `app.json` configura nome, plataformas, imagens e plugins do Expo; `jsconfig.json` permite conferir os tipos do JavaScript sem gerar código. Não foi acrescentada uma configuração alternativa só para inserir comentários.

## Executar

1. No backend, crie seu `.env` a partir do exemplo e configure a conexão do Neon. Para acessar pelo celular, use `HOST=0.0.0.0` e mantenha `NODE_ENV=development`.
2. Execute `npm run dev` dentro de `backend`.
3. Crie `mobile/.env` copiando `mobile/.env.example`. Substitua o IP ilustrativo em `EXPO_PUBLIC_API_URL` pelo IP local do computador, mantendo a porta e `/api/v1`.
4. Dentro de `mobile`, execute `npm start` e abra com um ambiente compatível com o Expo SDK 57.

As dependências foram instaladas nas versões indicadas pelo Expo. Em uma nova cópia, execute `npm ci`. As bibliotecas nativas usadas estão disponíveis no Expo Go compatível; para uma compilação de desenvolvimento própria, gere uma nova compilação após adicionar os módulos e plugins nativos. Os plugins estão declarados em `app.json`, sem pastas nativas criadas manualmente.

O celular e o computador devem estar na mesma rede, com acesso à porta do backend. `localhost` no celular aponta para o próprio aparelho. No emulador Android padrão, o computador costuma ser acessível por `http://10.0.2.2:3000/api/v1`. Se alterar o ambiente, recarregue completamente o aplicativo.

Só `.env.example` acompanha o projeto. A variável pública contém apenas o endereço da API, sem senha. A conexão privada com o Neon permanece no backend.

## Recursos desta etapa

### Alunos

- Listagem de vinte alunos por página, busca por nome ou matrícula e atualização ao voltar à tela.
- Cadastro de nome, CPF, nascimento, e-mail e telefone; foto por URL HTTPS e contato de emergência opcionais.
- Data digitada como `DD/MM/AAAA` e enviada à API como `AAAA-MM-DD`.
- Validação de CPF, idade mínima e duplicidade pelo backend; matrícula confirmada somente após a resposta do servidor.
- Detalhes do cadastro, sem criar planos ou treinos automaticamente.

Os dados de alunos ficam no PostgreSQL do backend. O aplicativo não salva esses cadastros no SQLite ou no Storage e não faz reenvio automático. Em uma resposta incerta ao cadastrar, consulte a lista antes de reenviar.

### Lembretes

- Cadastro de título, data e horário futuros no fuso do aparelho.
- Criação automática da tabela `lembretes` em `academia-local.db`, usando TypeORM sobre SQLite. As anotações funcionam sem internet.
- Escolha de receber um aviso local, silencioso, com permissão solicitada ao salvar.
- Gravação preservada mesmo quando a permissão é negada ou o agendamento falha. A confirmação informa se houve agendamento.
- Lista com o estado do agendamento consultado no sistema. “Horário passado” não comprova que uma notificação foi entregue.
- Exclusão com confirmação e cancelamento do aviso antes de remover o registro.

São lembretes pessoais deste aparelho, sem ligação automática com alunos, treinos ou pagamentos. Não são enviados para o backend, nem sincronizados entre celulares. A notificação usa uma mensagem genérica, sem expor o título digitado na tela bloqueada. Tocá-la abre o aplicativo; o lembrete pode ser consultado na aba Lembretes.

`models/lembrete.js` define as colunas usando `EntitySchema`, sem decorators ou TypeScript. `config/banco-local.js` abre a conexão e solicita a criação pelo ORM somente se a tabela estiver ausente. A adaptação mantém o mesmo banco, as colunas, os IDs e a sequência anteriores; tabelas existentes não são sincronizadas ou reconstruídas automaticamente. Mudanças futuras nas colunas precisarão ser planejadas separadamente. O repository usa `find`, `save` e `delete`, sem SQL manual no código do aplicativo.

O backend continua usando Sequelize com PostgreSQL, como previsto no PDF. O TypeORM serve apenas ao SQLite do aparelho e usa o driver `expo-sqlite` já instalado. Não há geradores ou scripts de migração nesta etapa.

A entrega depende das permissões, dos ajustes de notificações e da economia de bateria do sistema. No Android, o sistema pode ajustar o horário, pois não solicitamos acesso especial a alarmes exatos. Se a permissão estiver bloqueada, ela deve ser liberada nos ajustes do aparelho; isso não agenda retroativamente um lembrete salvo sem aviso. Não há notificação remota, token push ou servidor de envio.

### Preferências

O Context API compartilha a escolha de vibração. O AsyncStorage guarda apenas essa escolha para a próxima abertura. A vibração ocorre após salvar um aluno ou lembrete, quando ativada. A tela também mostra sistema operacional, versão, marca, modelo e tipo do aparelho, sem enviar essas informações à API.

## Conteúdos da professora atendidos

| Conteúdo | Onde aparece |
| --- | --- |
| Componentes nativos | Text, View, TextInput, Pressable, FlatList, ScrollView, Switch e Alert. |
| useState e useEffect | Formulários, carregamentos e preferências. |
| Stack e Tab Navigation | Layout principal e menu inferior. |
| Link | Botão de navegação para novos alunos e lembretes. |
| Context API | Preferência de vibração compartilhada. |
| Storage | AsyncStorage para manter a preferência. |
| SQLite | Lembretes locais acessados pelo ORM TypeORM. |
| Notificação | Aviso local opcional de um lembrete. |
| Vibração | Confirmação ao salvar, conforme preferência. |
| Informações do dispositivo | Tela Preferências. |
| Comunicação com API | Cadastro, listagem e detalhes de alunos no backend. |
| Geolocalização | Adiada a pedido do usuário; depende dos detalhes que serão fornecidos. |

Esta tabela acompanha a lista de tecnologias fornecida na conversa; não significa que todas as funcionalidades de negócio do PDF estejam prontas. Login, planos, pagamentos, treinos e edição de alunos continuam fora desta etapa. As rotas de alunos permanecem bloqueadas em produção até existir autenticação real.

O resultado completo da comparação, incluindo diferenças entre lembretes locais e notificações de negócio, está em [Revisão do projeto](../REVISAO.md).

## Verificação

Execute `npm run verificar` para conferir estilo, hooks, operadores proibidos e tipos do JavaScript/JSX. TypeScript serve apenas como ferramenta de análise via `jsconfig.json`; o aplicativo está escrito em JavaScript/JSX. Não são mantidos arquivos de teste locais.

Para conferir no celular:

1. Abra as três abas e use os links de cadastro; volte pelo cabeçalho.
2. Ative a vibração, feche e reabra o aplicativo, e confirme que a escolha foi mantida.
3. Salve um lembrete para alguns minutos à frente, permita notificações e coloque o aplicativo em segundo plano para conferir o aviso.
4. Salve outro sem aviso; feche e reabra para conferir a persistência local.
5. Exclua um lembrete ainda agendado e confira que seu aviso não aparece depois.
6. Confira os dados do aparelho e o cadastro de aluno com seu backend configurado.

A análise estática e o empacotamento JavaScript não substituem a conferência da interface, vibração e notificações em aparelho. A conexão real com o Neon depende do ambiente preenchido pelo usuário.

Nesta etapa, `npm run verificar` passou no mobile e no backend, e os pacotes JavaScript de Android e iOS foram gerados com sucesso. A conferência temporária em memória cobriu validação de datas, consultas SQLite, cadastro/listagem/exclusão, preferência persistida e falhas de permissão, agendamento e cancelamento. As APIs nativas foram simuladas nessa conferência; nenhum arquivo de teste foi mantido.

A adaptação para ORM foi conferida com TypeORM real e SQLite em memória, substituindo apenas a interface nativa do Expo. Foram verificadas criação em banco vazio, preservação da tabela anterior, manutenção dos IDs e da sequência, operações do repositório, abertura concorrente e nova tentativa após falha. Os serviços do mobile também foram executados contra a API Express local com a persistência do backend simulada.

Referências: [abas do Expo Router](https://docs.expo.dev/router/advanced/tabs/), [SQLite no SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/), [notificações no SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/), [modelos EntitySchema](https://typeorm.io/docs/entity/separating-entity-definition/) e [driver Expo do TypeORM](https://typeorm.io/docs/drivers/sqlite/#expo-data-source-options).
