# Entrega local do MVP demonstrativo

Data: 14/10/2026. Branch: `implementacao/mvp-treino-demonstrativo`. Base anterior: `6595b39d7f1b0ec2312885836e451a4e5ea7d073`.

## Resultado e fronteira da entrega

Implementado no código: senha de 8+ caracteres com bcrypt e compatibilidade scrypt; JWT com revogação no banco; provisionamento controlado de Administrador/Gestor; catálogo textual persistido por Sequelize; seletor no editor; início demonstrativo independente de chegada; identificação no histórico; navegação organizada e preservação de Sobre/logout/rascunhos.

As verificações locais passaram. A entrega ainda requer configuração e homologação do ambiente real: não houve push, commit, deploy Render, acesso administrativo ao Neon, EAS Build ou instalação em celular. A árvore de trabalho está disponível para revisão na branch indicada. A resposta pública de saúde apenas confirmou que o serviço existente estava acessível.

Detalhes dos contratos e regras: [IMPLEMENTACAO_TREINOS.md](IMPLEMENTACAO_TREINOS.md).

## Configuração privada do backend

Configurar pelo ambiente do processo ou pelo painel privado da hospedagem. Não criar `.env` versionado; nesta execução nenhum `.env` foi criado. `.env.example` contém os nomes, sem credenciais.

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | URL privada da branch Neon de demonstração; TLS validado pelo backend. |
| `JWT_SEGREDO` | Segredo aleatório estável, pelo menos 32 bytes; manter exclusivamente no backend. |
| `SESSAO_DIAS` | 30 por padrão; inteiro entre 1 e 365. |
| `TOKEN_LEGADO_ATE` | Opcional: data ISO com fuso para encerrar a aceitação de tokens opacos anteriores. Vazio exige novo login. |
| `DEMO_TREINOS_HABILITADO` | `true` libera novos treinos demonstrativos. Padrão desligado. |
| `DEMO_CATALOGO_HABILITADO` | `true` prepara os 21 exemplos ausentes. Padrão desligado. |
| `DEMO_CONTAS_HABILITADO` | `true` solicita provisionamento privilegiado. Padrão desligado. |
| `AMBIENTE_DEMONSTRACAO` | Deve ser `true` para provisionar contas, somente em ambiente controlado com dados fictícios. |
| `DEMO_ADMIN_*`, `DEMO_GESTOR_*` | Para cada prefixo, informar `EMAIL`, `SENHA`, `NOME`, `CPF`, `NASCIMENTO` (`AAAA-MM-DD`) e `TELEFONE`. Usar identidades de teste distintas e válidas para as validações existentes. |
| `PORT`, `HOST`, `NODE_ENV` | Manter a configuração existente; Render fornece `PORT`. |

Sem a identidade completa de qualquer uma das duas contas, nenhuma conta privilegiada é criada. Uma conta normal com e-mail coincidente provoca conflito em vez de promoção. Um vínculo funcional existente compatível é preservado, incluindo senha e estado ativo/inativo. Credenciais iniciais alteradas no ambiente não redefinem contas existentes.

Gerar o segredo em um terminal privado, guardar no gerenciador de segredos e manter o mesmo valor entre reinícios. Exemplo de geração, a executar pelo responsável, sem publicar o resultado:

```powershell
node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))"
```

A aplicação cria apenas a tabela nova `exercicios` por `sync()` sem `force`/`alter`, seguindo a preparação existente. JWT reutiliza `sessoes`; o modo do treino e a referência de catálogo usam os JSONB existentes. Não foi necessária coluna adicional ou migração destrutiva. Validar primeiro em branch Neon isolada e conferir unicidade de `exercicios.codigo` e o índice parcial de treino ativo. O provisionamento não produz presença, rotina ou assinatura.

## Iniciar a partir da raiz atual

Com as variáveis privadas já configuradas no terminal/serviço, executar na raiz `Academia-App`:

```powershell
npm --prefix backend ci
npm --prefix backend run verificar
npm --prefix backend start
```

Em outro terminal na mesma raiz, para o mobile apontar para a API compatível já implantada:

```powershell
npm --prefix mobile ci
npm --prefix mobile run verificar
$env:EXPO_PUBLIC_API_URL = 'https://academia-app-ehs7.onrender.com/api/v1'
npm --prefix mobile start
```

A URL acima é a existente em `mobile/.env.example`; confirmar o deploy desta branch antes de usar o novo fluxo. Para API local em telefone, usar a URL acessível da máquina na mesma rede, terminada em `/api/v1`; `localhost` no telefone não aponta para o computador. Não transportar `DATABASE_URL`, JWT ou senhas para `EXPO_PUBLIC_*`.

## Distribuição e implantação

1. Fazer backup/snapshot ou usar branch isolada do Neon. Configurar os segredos e flags do backend, com dados fictícios para as duas contas funcionais.
2. Implantar a versão revisada do backend. Conferir logs de preparação, saúde e, com login real, `/treinos/configuracao`, `/exercicios` e o cadastro/login. Reiniciar e conferir que não duplicou contas nem exercícios.
3. Configurar `EXPO_PUBLIC_API_URL` no ambiente `preview` do EAS com a API atualizada. A exportação local não configura variáveis no EAS.
4. Para distribuição Android, o `mobile/eas.json` existente já define `preview`, distribuição interna, `android.buildType=apk` e incremento automático. Da raiz: `npm --prefix mobile run apk`. Esse comando faz as verificações e solicita um build remoto; exige acesso ao projeto Expo e credenciais de assinatura. Não foi executado nesta entrega.
5. Instalar o APK produzido pelo EAS e executar o roteiro abaixo. Um APK instala diretamente em Android; o bundle Hermes local não é instalável. [Documentação oficial de APK](https://docs.expo.dev/build-reference/apk/).
6. Expo Go é uma alternativa somente com versão compatível com o SDK 57 e os módulos usados. Verificar SecureStore, AES, notificações e dispositivo no aparelho. Não há perfil development configurado; seria necessário prepará-lo e incluir expo-dev-client caso se escolha development build.
7. EAS Update distribui JavaScript/assets a runtimes compatíveis, não substitui EAS Build nem implanta a API. Este projeto não recebeu configuração de expo-updates nesta entrega. [Documentação do EAS Update](https://docs.expo.dev/eas-update/introduction/).

A revisão de `app.json`, `eas.json` e `package.json` preservou os identificadores existentes e alinhou as dependências recomendadas pelo SDK. GitHub, Render e aplicativo instalado têm ciclos separados de publicação.

## Testes executados

| Evidência | Resultado e limite |
| --- | --- |
| Baseline backend | ESLint aprovado antes das alterações. |
| Baseline mobile | Faltava expo-secure-store no node_modules; instalação declarada restaurada. |
| `npm run verificar`, backend | Aprovado. |
| `npm run verificar`, mobile | ESLint e `tsc --noEmit` aprovados, mantendo código JS/JSX. |
| `expo install --check` | Dependências alinhadas após correções do SDK 57. |
| `expo-doctor` | 21/21 verificações aprovadas. |
| Exportação Android | Metro/Hermes concluídos, 1.381 módulos, artefato ignorado pelo Git em `mobile/dist/demonstracao`. |
| 19 grupos de serviços e HTTP | Aprovados com persistência simulada, criptografia e Express reais. |
| Migração de senha, casos adicionais | Login preservado diante de erro de atualização; comparação do hash evita sobrescrever alteração concorrente; formato desconhecido recusado. |
| Hook/utils mobile | Rede, React e armazenamento simulados; fluxo de perda de resposta, pendências e confirmação aprovado. |
| Saúde pública Render | Resposta `API disponível.`; sem identificação da versão implantada. |
| Neon/Render novo/celular | Não homologados. Sem credenciais privadas ou dispositivo nesta sessão. |

Os 19 grupos cobriram: cadastro de 8 caracteres/bcrypt/sem promoção; senha curta e bytes Unicode; JWT íntegro/adulterado/expirado/algoritmo; erro uniforme de login; logout/novo login/conta desativada; migração scrypt/senha legada longa; janela de token opaco; catálogo/pesquisa/filtros/paginação/idempotência; rotina AB/reabertura/conflito; início oficial bloqueado/demo habilitada; snapshot após edição; séries/reenvio/correção/desmarcação; finalização parcial com demo desligada; tentativas simultâneas serializadas na simulação e conclusão completa; isolamento e papel; provisionamento desligado/incompleto; Admin/Gestor/reinício/login; recusa de promoção de conta comum; HTTP local autenticado.

Essas simulações não comprovam os locks/DDL reais do PostgreSQL, o armazenamento nativo, o comportamento visual e o botão voltar. Nenhum teste escreveu dados no Neon e nenhum arquivo de teste foi adicionado.

`npm audit` também encontrou alertas transitivos: backend, 2 moderados na cadeia Sequelize/uuid; mobile, 28 (18 altos e 10 moderados) na árvore instalada. Não foi usado `audit fix --force`, que sugeria mudanças incompatíveis como downgrade de Expo/React Native/Sequelize. A revisão e correção compatível desses alertas continua pendente; Expo Doctor aprovado não equivale a auditoria de segurança limpa.

## Roteiro de apresentação e homologação real

1. Com API/catalogo configurados, criar aluno com CPF e maioridade válidos, senha de 8+ caracteres; conferir que 7 caracteres são recusados. Entrar e observar ausência de rotina automática.
2. Criar “Minha rotina semanal”, divisões A e B. Buscar supino, crucifixo e remada, selecionar itens, configurar séries/meta/carga/descanso e salvar após confirmar a ciência. Sair da tela e reabrir para conferir persistência.
3. Iniciar a divisão A em demonstração, sem qualquer chegada ou plano. Conferir o rótulo. Tentar iniciar outra sessão e confirmar que a retomada é oferecida.
4. Marcar série real, corrigir carga/repetições, desmarcar, alternar guiado/lista e usar descanso. Testar também exercício por duração.
5. Desconectar a rede durante a execução, registrar série, fechar/reabrir e reconectar. Conferir que o rascunho ficou pendente e só foi confirmado após sincronização, sem duplicação.
6. Encerrar parcialmente, consultar Histórico e conferir séries reais/rótulo. Fazer outra sessão integral e conferir estado completo. Alterar a rotina e confirmar que o histórico anterior não mudou.
7. Sair, entrar novamente e conferir histórico persistido. Entrar com outra conta e verificar ausência de dados da primeira. Conferir botão voltar e todas as quatro abas.
8. Abrir Sobre, conferir dispositivo/vibração e logout. Rascunhos pendentes permanecem protegidos e só devem ser retomados na conta correspondente.
9. Em teste interno separado, entrar como Admin/Gestor. Admin consulta o vínculo e vê o painel ainda indisponível; Gestor usa apenas as operações de Gestão existentes. Não exibir suas credenciais à plateia.

## Desativação, retorno e próximas versões

- Após provisionar, definir `DEMO_CONTAS_HABILITADO=false` e retirar as senhas iniciais do ambiente. Isso impede criação futura; não revoga automaticamente contas já existentes. Para encerrar o acesso, desativar a conta ou o vínculo funcional pelo procedimento administrativo controlado. A API relê esses estados.
- Definir `DEMO_CATALOGO_HABILITADO=false` impede novas inserções automáticas; não apaga o catálogo nem seus snapshots.
- Definir `DEMO_TREINOS_HABILITADO=false` bloqueia novos treinos demonstrativos. Sessões existentes continuam podendo ser finalizadas e consultadas. Não apagar rascunhos para desligar o modo.
- Encerrar `TOKEN_LEGADO_ATE` quando terminar a transição. Trocar `JWT_SEGREDO` invalida JWTs anteriores; planejar novo login.
- Em caso de problema, desabilitar flags e corrigir/reimplantar esta linha compatível. O backend antigo não verifica bcrypt: voltar diretamente ao commit-base depois de cadastrar ou migrar senhas bloquearia essas contas. Nunca restaurar hashes antigos nem resetar senhas em massa como rollback. Preservar tabela e históricos; alinhar o mobile à versão compatível da API.
- Permanecem pendentes: testes reais Neon/Render/aparelhos, auditoria de dependências, refresh/recuperação de senha, conta funcional independente de Aluno, painel/concessão de papéis, modelos opcionais AB/ABC, pagamentos/assinaturas, gráficos/medidas, mídia e notificações de negócio.

## Arquivos e limpeza

Nenhum arquivo versionado foi removido. A limpeza ficou restrita a trechos substituídos na tela principal e ajustes de import/estado. Serviços oficiais agora ocultos continuam disponíveis para o desenvolvimento futuro. O bundle de verificação foi guardado em diretório ignorado. Não foram criados `.env`, `.gitkeep`, SQLite, scripts de migração ou dados de teste remotos.

### Adicionados

- `RELATORIO_MVP.md`
- `backend/src/config/exercicios-iniciais.js`
- `backend/src/config/preparar-demonstracao.js`
- `backend/src/controllers/exercicio-controlador.js`
- `backend/src/models/exercicio.js`
- `backend/src/repositories/exercicio-repositorio.js`
- `backend/src/repositories/provisionamento-repositorio.js`
- `backend/src/routes/exercicio-rotas.js`
- `backend/src/services/exercicio-servico.js`
- `backend/src/services/provisionamento-servico.js`
- `backend/src/utils/jwt.js`
- `backend/src/utils/validar-demonstracao.js`
- `backend/src/utils/validar-exercicio.js`
- `mobile/src/components/SelecionarExercicio.jsx`
- `mobile/src/navigation/destinos.js`
- `mobile/src/services/exercicio-servico.js`
- `mobile/src/utils/validar-senha.js`

### Modificados

- `IMPLEMENTACAO_TREINOS.md`
- `backend/.env.example`
- `backend/package-lock.json`
- `backend/package.json`
- `backend/src/aplicacao.js`
- `backend/src/config/criar-tabelas.js`
- `backend/src/controllers/treino-controlador.js`
- `backend/src/middlewares/limitar-acesso.js`
- `backend/src/repositories/acesso-repositorio.js`
- `backend/src/routes/acesso-rotas.js`
- `backend/src/routes/treino-rotas.js`
- `backend/src/services/acesso-servico.js`
- `backend/src/services/inicio-treino-servico.js`
- `backend/src/services/rotina-servico.js`
- `backend/src/servidor.js`
- `backend/src/utils/senha.js`
- `backend/src/utils/validar-rotina.js`
- `mobile/package-lock.json`
- `mobile/package.json`
- `mobile/src/app/(menu)/_layout.jsx`
- `mobile/src/app/_layout.jsx`
- `mobile/src/components/EditorRotina.jsx`
- `mobile/src/components/HistoricoTreinos.jsx`
- `mobile/src/components/ResumoRotina.jsx`
- `mobile/src/contexts/AcessoContext.jsx`
- `mobile/src/screens/CadastroAluno.jsx`
- `mobile/src/screens/Equipe.jsx`
- `mobile/src/screens/Evolucao.jsx`
- `mobile/src/screens/ExecutarTreino.jsx`
- `mobile/src/screens/Preferencias.jsx`
- `mobile/src/screens/Treinos.jsx`
- `mobile/src/services/treino-servico.js`
- `mobile/src/utils/editar-rotina.js`
