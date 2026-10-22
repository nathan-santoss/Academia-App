# Contratos da API

Base: /api/v1. Corpo JSON em UTF-8, limite de 1 MB. Rotas protegidas usam Authorization: Bearer <token do usuário>. Não existe senha/chave de desenvolvimento nas requisições.

## Convenções

- IDs são UUIDs. Valores monetários são inteiros em centavos.
- Datas de negócio: AAAA-MM-DD, academia em America/Sao_Paulo. Horários: ISO 8601.
- pagina começa em 0. Listas novas retornam arrays de até 30 itens; histórico de treino usa 20. Catálogo de exercícios admite limite de 1 a 50.
- Gravações financeiras, benefícios, medidas, privacidade e correção de treino exigem Idempotency-Key com UUID. Reenvie a mesma chave e o mesmo conteúdo para recuperar o resultado; conteúdo diferente retorna 409.
- Rotinas usam versaoAnterior; rascunhos usam revisao e versaoBase; modelos e exercícios usam revisao. Após conflito, consulte a versão atual antes de salvar.
- GETs não devem ser tratados como confirmação de pagamento, chegada ou publicação.
- Erros retornam { "mensagem": "..." }: 400 JSON inválido; 401 sessão ausente/inválida; 403 sem permissão; 404 registro ausente; 409 conflito; 413 corpo grande; 415 codificação inválida; 422 validação; 429 limite de acesso; 503 indisponibilidade/configuração pendente.
- Resposta de gravação perdida não significa falha. Preserve o rascunho e consulte/reenvie com a mesma chave quando o contrato oferecer idempotência.
- Não há isolamento entre várias academias: o produto implementado é uma única academia.

## Acesso e alunos

| Método / caminho | Corpo ou consulta | Resultado / acesso |
| --- | --- | --- |
| GET /saude | — | Confere conexão com banco, público |
| POST /acesso/contas | nome, cpf, dataNascimento, email, telefone, senha; opcionais fotoUrl/contatoEmergencia | 201, autocadastro de aluno adulto |
| POST /acesso/entrar | email, senha | token, expiraEm |
| GET /acesso/perfil | — | Cadastro próprio em dados |
| POST /acesso/sair | — | 204, revoga sessão |
| POST /acesso/recuperacao | email | Mensagem genérica; depende de SMTP/política |
| POST /acesso/recuperacao/confirmar | email, codigo de seis dígitos, senha nova | Uso único, revoga sessões existentes |
| POST /alunos | Dados cadastrais e Idempotency-Key | Recepção/Gestão; não cria credencial |
| GET /alunos | pagina e filtros do cadastro | Recepção/Gestão |
| GET /alunos/:id | — | Apenas o próprio aluno |
| GET /equipe/papeis | — | Array de papéis ativos |
| GET /equipe/alunos | busca por nome/matrícula, mínimo 2 caracteres | Instrutor/Recepção/Gestão, até 30 resultados |
| GET /funcionarios | pagina | Gestão/Admin, vínculos existentes, incluindo identidade com nome/matrícula |
| GET /funcionarios/contas | busca por nome/matrícula, mínimo 2 caracteres | Gestão/Admin, até 30 contas ativas existentes; identidade e vínculo atual, sem credenciais/CPF/e-mail |
| PUT /funcionarios/:contaId | ativo, papeis, motivo | Gestão atribui funções operacionais; somente Admin administra Gestão/Admin. Proibido alterar a própria função. Exige conta existente. |

Os papéis não herdam automaticamente funções operacionais. Um administrador não vira instrutor/recepcionista por ser administrador.

## Catálogo comercial e financeiro

| Método / caminho | Entrada | Resultado / acesso |
| --- | --- | --- |
| GET /catalogo/:categoria | categoria: plano ou modalidade | { dados: [...] }, autenticado |
| PUT /catalogo/:categoria/:id | nome, precoCentavos, ativo, periodo quando plano, versaoAnterior quando edição; Idempotency-Key | Gestão; resultado em dados |
| GET /financeiro/situacao | — | Cobertura própria: permitida, estado, assinatura, beneficio |
| GET /financeiro/pagamentos | pagina | Pagamentos próprios |
| GET /financeiro/alunos/:alunoId/situacao | — | Próprio aluno ou Recepção/Gestão |
| GET /financeiro/alunos/:alunoId/pagamentos | pagina | Próprio aluno ou Recepção/Gestão |
| POST /financeiro/alunos/:alunoId/pagamentos | planoId, valorCentavos, metodo; comprovante opcional | 201 pendente, Recepção/Gestão |
| POST /financeiro/alunos/:alunoId/pagamentos/:id/confirmar | Idempotency-Key | Confirma manualmente e cria cobertura na mesma transação |
| POST /financeiro/alunos/:alunoId/cancelar-renovacao | Idempotency-Key | Recepção/Gestão; preserva vigência e histórico |
| GET /financeiro/alunos/:alunoId/beneficios | pagina | Próprio aluno/Gestão; inclui estado calculado |
| POST /financeiro/alunos/:alunoId/beneficios | origem, inicio, fim, motivo | 201, Gestão |
| POST /financeiro/alunos/:alunoId/beneficios/:id/revogar | motivo | Gestão; preserva histórico |
| GET /financeiro/pendencias | — | Recepção/Gestão; até 100 pagamentos pendentes e 100 assinaturas em tolerância |

Períodos: diario, quinzenal, mensal, trimestral, semestral, anual. Métodos: dinheiro, pix, debito, credito. Origem de benefício: funcional ou cortesia. Comprovante é uma referência textual, não upload nem prova automática de recebimento.

O preço é congelado no registro do pagamento; editar catálogo não reescreve pagamentos/coberturas antigas. A confirmação exige valor integral, não aceita pagamento parcial, misto ou parcelamento interno. Uma segunda confirmação do mesmo pagamento devolve o resultado existente. Confirmações concorrentes são serializadas por aluno.

Início é inclusivo e vencimento é exclusivo. Exemplo: mensal de 19/09/2026 vence em 19/10/2026; acesso pago até 18/10 e tolerância gratuita de 19/10 a 23/10. Retorno a partir de 24/10 começa período novo. Não são criadas dívidas automáticas.

## Chegada

| Método / caminho | Entrada | Regra |
| --- | --- | --- |
| GET /treinos/chegada | — | Chegada própria de hoje ou null |
| POST /treinos/chegada | — | Solicita chegada; repetir não duplica |
| GET /equipe/chegadas | pagina | Recepção; fila de hoje ainda não confirmada, incluindo aluno com id, nome e matrícula |
| GET /equipe/alunos/:alunoId/chegada | — | Recepção |
| POST /equipe/alunos/:alunoId/chegada | — | Recepção confirma presença física, consultando cobertura atual |
| POST /equipe/alunos/:alunoId/excecao | motivo | Gestão autoriza somente hoje; não confirma presença |

Sem cobertura válida, a entrada depende de exceção da Gestão. Aluno inativo continua bloqueado. Confirmação não registra séries nem cria pagamento.

## Exercícios e modelos

| Método / caminho | Entrada | Regra |
| --- | --- | --- |
| GET /exercicios | busca, grupo, pagina, limite | { dados, total, pagina, limite }, exercícios ativos |
| GET /exercicios/:id | — | Exercício ativo, incluindo detalhes quando cadastrados |
| PUT /exercicios/:id | nome, grupoMuscular, equipamento, tipo, ativo, origem, revisao; descricao/termosBusca/imagemUrl/videoUrl opcionais | Instrutor: local. Admin: oficial. Para vídeo, midiaRevisada: true |
| GET /modelos-treino | pagina | Instrutor/Admin: modelos próprios e oficiais ativos |
| PUT /modelos-treino/:id | oficial, ativo, revisao, conteudo | Modelo privado do autor ou oficial do administrador |

Criação usa UUID escolhido pelo cliente e revisao: 0. Atualização usa a revisão recebida. Arquivar utiliza ativo: false; não apaga snapshots de treinos anteriores. O modelo é copiado para o corpo do rascunho; alterações posteriores não sincronizam cópias.

## Rotinas e fichas

| Método / caminho | Entrada | Regra |
| --- | --- | --- |
| GET /treinos/rotinas | — | { pessoal, recomendada }, cada uma pode ser null |
| PUT /treinos/rotinas/pessoal | Conteúdo, versaoAnterior, ciente: true, substituir: true quando já existe | Salva versão pessoal própria |
| GET /equipe/alunos/:alunoId/ficha | — | Instrutor: { publicada, rascunho } do próprio editor |
| PUT /equipe/alunos/:alunoId/ficha/rascunho | Conteúdo, revisao, versaoBase | Instrutor, sem publicar |
| POST /equipe/alunos/:alunoId/ficha/publicar | confirmarAlunoId, revisao | Publicação explícita; preserva treino ativo e rotina pessoal |
| GET /equipe/alunos/:alunoId/ficha/versoes | pagina | Instrutor/Gestão, versões imutáveis |
| POST /equipe/alunos/:alunoId/ficha/versoes/:id/restaurar | revisao do rascunho e versaoBase atual | Instrutor; cria/atualiza rascunho, exige publicação posterior |

Conteúdo de rotina:

```json
{
    "nome": "Rotina pessoal",
    "divisoes": [{
        "id": "<uuid da divisão>",
        "nome": "A",
        "exercicios": [{
            "id": "<uuid da posição de exercício>",
            "nome": "Exercício escolhido",
            "equipamento": "Peso corporal",
            "referenciaCarga": "total em kg",
            "tipo": "repeticoes",
            "series": 3,
            "meta": 10,
            "carga": null,
            "descanso": 60,
            "observacoes": ""
        }]
    }]
}
```

IDs do exemplo são placeholders, devem ser UUIDs reais. exercicioCatalogoId é opcional. A ordem dos arrays determina a ordem; reordenar não troca IDs. Limites: 1–10 divisões, 1–30 exercícios por divisão, 1–20 séries, meta 1–36000, descanso 0–3600 segundos. tipo também pode ser duracao; nesse caso meta/realizado são segundos. Cargas são opcionais na prescrição, entre 0 e 2000 kg quando informadas.

## Execução e evolução

| Método / caminho | Entrada | Regra |
| --- | --- | --- |
| POST /treinos | id, origem, rotinaId, divisaoId | 200; exige chegada confirmada e uma única sessão ativa |
| GET /treinos/ativo | — | Sessão própria ativa ou null |
| GET /treinos/:id | — | Sessão própria com referência imutável |
| PUT /treinos/:id | operacaoId, revisao, encerrar, series | Idempotência pelo UUID no corpo; sessão ativa |
| PUT /treinos/:id/correcao | revisao, motivo, series; Idempotency-Key | Corrige sessão encerrada, com auditoria |
| GET /treinos/historico | pagina | Sessões próprias encerradas, completas/parciais |
| GET /equipe/alunos/:alunoId/treinos | pagina | Instrutor |
| GET /treinos/evolucao | inicio, fim | Evolução própria |
| GET /equipe/alunos/:alunoId/evolucao | inicio, fim | Instrutor |
| GET /treinos/configuracao | — | Indica disponibilidade de demonstração |
| POST /treinos/demonstracao | Mesmo corpo de início; origem pessoal | Apenas se flag de demonstração habilitada |

Cada série contém exercicioId, numero, carga e realizado. Envie somente séries realizadas. Ao encerrar, o servidor classifica completo/parcial e não inventa séries. OperacaoId não deve mudar em uma repetição do mesmo envio.

Evolução consulta até 366 dias e exige intervalo menor se alcançar 1000 sessões. Não inclui demonstrações nem rascunhos, mantém carga/repetições ou duração juntas e separa equipamento e referência da carga.

## Medidas, notificações e auditoria

| Método / caminho | Entrada | Regra |
| --- | --- | --- |
| GET /medidas | pagina | Medidas próprias |
| POST /medidas | tipo: peso/altura, valor, dia; Idempotency-Key | 201; kg ou cm, sem data futura |
| PUT /medidas/:id | tipo, valor, dia, revisao, motivo; Idempotency-Key | Correção própria rastreada |
| GET /medidas/privacidade | — | Compartilhamento desativado por padrão |
| PUT /medidas/privacidade | compartilharMedidas booleano; Idempotency-Key | Escolha do aluno |
| GET /medidas/alunos/:alunoId | pagina | Próprio aluno ou instrutor com consentimento atual; nunca recepção |
| GET /notificacoes | pagina | Somente a conta atual |
| PUT /notificacoes/:id/lida | — | Marca leitura somente se pertence à conta |
| PUT /notificacoes/dispositivo | token Expo | Associa dispositivo à conta e à sessão atual |
| DELETE /notificacoes/dispositivo | token Expo | Remove associação própria |
| GET /auditoria | alunoId opcional, pagina | Gestão; omite correções privadas de medidas e execução |

Push usa conteúdo genérico; dados privados são consultados somente após autenticação. A fila cancela entrega se sessão expirou/saiu ou se dispositivo mudou de conta. Recibo Expo indica aceite do provedor, não comprova que a pessoa leu a mensagem. O aviso interno permanece disponível independentemente do push.

## Configuração e execução

No backend, use variáveis do ambiente de execução, seguindo .env.example. Nenhuma credencial deve estar no mobile:

- DATABASE_URL: Neon com TLS.
- JWT_SEGREDO: segredo privado com pelo menos 32 bytes; SESSAO_DIAS conforme política existente.
- TRUST_PROXY_HOPS: 0 para conexão direta; configure a quantidade real de proxies da hospedagem antes de expor a API.
- SMTP_HOST, SMTP_PORTA (465 ou 587), SMTP_USUARIO, SMTP_SENHA, EMAIL_REMETENTE.
- RECUPERACAO_MINUTOS (1–60) e RECUPERACAO_TENTATIVAS (1–10): sem valores definidos, recuperação retorna 503.
- PUSH_HABILITADO=false por padrão; EXPO_PUSH_ACCESS_TOKEN quando exigido pelo projeto Expo. Credenciais FCM/APNs e registro do token pelo mobile precisam ser preparados.
- Flags DEMO_* desabilitadas em operação real.

npm start prepara as tabelas com sync sem force/alter. Não altera destrutivamente schemas antigos. Antes de um deploy real, confira o schema existente e as condições descritas em ../REVISAO_BACKEND.md.

No mobile, EXPO_PUBLIC_API_URL deve ser o domínio público da API ou terminar em /api/v1. Login e cadastros existentes foram preservados. As telas integradas, verificações e limites estão descritos em [IMPLEMENTACAO_FRONTEND.md](../IMPLEMENTACAO_FRONTEND.md).

## Testes locais

O comando verificar continua sendo somente ESLint no backend. A suíte solicitada tem comando separado:

```powershell
npm run verificar
$env:NODE_ENV = 'test'
$env:DATABASE_URL_TESTE = 'postgres://academia_teste@127.0.0.1:55439/academia_teste'
npm run testar
```

É necessário preparar uma instância PostgreSQL local descartável. A configuração de testes aceita somente localhost/127.0.0.1 e banco com prefixo academia_teste. Não execute a suíte com dados de operação: ela cadastra dados fictícios. O exemplo não contém credenciais reais.

No mobile: npm run verificar. A verificação é aplicada aos arquivos JS/JSX; não houve migração para TypeScript.
