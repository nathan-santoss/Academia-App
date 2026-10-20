# Revisão do backend e das rotinas

Data: 20/10/2026. Base funcional: Documentacao_Academia_Atualizada.pdf, versão 3.0, de 14/10/2026. Base Git: beec92a. Branch: melhorias/backend-e-rotinas.

## Resultado e limites

O código já tinha login, cadastro, permissões funcionais, rotinas versionadas e execução de treinos. O texto do PDF sobre inexistência de implementação é histórico. Esta revisão compara as regras funcionais com o código encontrado e implementa os módulos descritos abaixo.

A entrega amplia a API e simplifica o editor compartilhado pelo aluno e pelo instrutor. **Não representa liberação de produção**: permanecem as decisões que o usuário pediu para manter bloqueadas, a configuração dos serviços externos e a validação em aparelhos reais. Não houve deploy, commit, alteração no Neon ou envio real de e-mail/push.

## Comparação com o PDF

| Área / páginas | Antes | Agora / limite |
| --- | --- | --- |
| Pessoas, alunos e equipe, 7–9 | Pessoa/CPF, conta vinculada a aluno e papéis funcionais; gestão indisponível pela API | Gestão de vínculos de contas existentes, matrícula F, revogação funcional e auditoria. Conta exclusivamente de funcionário e credencial inicial continuam pendentes; não se assume titularidade pelo CPF. |
| Login e recuperação, 9 | Login, hash, JWT e revogação de sessão; sem recuperação | Recuperação por código de uso único, limite de tentativas, validade configurável e revogação de todas as sessões após troca de senha. SMTP e parâmetros precisam ser configurados. |
| Planos/modalidades, 10 | Consulta existente; toda gravação retornava 403 | Gestão pode criar/editar/desativar itens, com preço configurável, controle de versão e recibo idempotente. Modalidades permanecem catálogo; contratação combinada bloqueada. |
| Assinatura/pagamento, 11–12 | Ausentes | Pagamento manual pendente, confirmação transacional, cobertura, snapshots comerciais, cinco dias gratuitos para períodos elegíveis e cancelamento de renovações preservando cobertura. Sem conciliação bancária ou estorno. |
| Benefícios/cortesias, 13 | Ausentes | Concessão, consulta de estados, revogação, motivo/autoria e vigência. Benefício aguarda período pago; desligamento revoga os benefícios funcionais, preservando aluno e pagamentos. |
| Chegada/exceção, 14–15 | Entrada dependia sempre de exceção diária | Recepção consulta cobertura atual, confirma inclusive sem pedido no celular e atende fila paginada. Exceção continua separada de presença e de pagamento. |
| Notificações, 16 | Apenas lembretes pessoais | Central interna, leitura por conta e avisos de pagamento confirmado, ficha publicada e concessão/revogação de benefício. Backend de push com fila, reenvios limitados e recibos. Cronograma de lembretes e automação de transições de vencimento/tolerância não foram definidos. |
| Exercícios/mídia, 17 | Catálogo de leitura e exemplos | Cadastro local por instrutor, oficial por administrador, busca por termos, arquivamento e mídia opcional; vídeo exige confirmação de revisão manual. Curadoria do conteúdo continua humana. |
| Modelos, 18 | Ausentes | Modelos privados do instrutor e oficiais do administrador, com revisão e cópia para rascunho pelo contrato de ficha. Nenhum modelo é automaticamente prescrito. Modelos-base reais precisam ser cadastrados/revisados. |
| Recomendação, 19–20 | Rascunho/publicação e controle de versão | Conferência de referências do catálogo, histórico paginado, auditoria antes/depois e restauração como novo rascunho. Publicação continua explícita. |
| Rotina pessoal, 21 | Formulário extenso; botões subir/descer | Seletores, personalização de valores, seções recolhíveis, posição direta, confirmação de remoção e aviso de exercício repetido. Uma rotina atual, sem alterar a recomendada. |
| Treino, 22–26 | Sessão única, snapshot, séries, rascunho e idempotência | Fluxos preservados e testados; correção de treino encerrado com motivo, revisão e auditoria. Ajustado tratamento de rede no mobile. |
| Evolução/medidas, 27–28 | Histórico de treinos; sem medidas privadas | Resumo por período, separando completos/parciais e referências de carga; medidas opcionais corrigíveis, privadas por padrão e compartilhamento revogável com instrutores. Recepção não acessa medidas. |
| Arquitetura, 29–31 | Express/Sequelize/Neon e camadas existentes | Mantidas rotas → controllers → services → repositories → models, com validações em utils e preparação em config. Sem classes artificiais, geradores, migrations destrutivas ou ternários. |

## Problemas de requisições identificados

| Problema | Correção / verificação |
| --- | --- |
| Gravações de catálogo sempre proibidas | Autorização real da Gestão; testes incluem aluno e instrutor recebendo 403. |
| Recepção sem caminho normal de entrada | Cobertura calculada pelo servidor; teste de chegada sem celular e duas confirmações simultâneas. |
| Resposta HTML do proxy descartava o status HTTP | Leitura de texto antes de interpretar JSON; 401, 409, 429 e 5xx mantêm tratamento adequado. |
| URL pública sem /api/v1 causava rota incorreta | Normalização aceita domínio ou base completa, rejeitando caminhos inesperados e credenciais na URL. |
| PUT de treino/rotina tinha apenas 12 segundos | Mesmo limite de 60 segundos das demais chamadas, incluindo leitura do corpo; sem reenvio automático de gravações. |
| Limite de 128 KB menor que uma rotina válida extensa | Limite de JSON aumentado para 1 MB; 413 continua explícito. |
| Falhas de unicidade/integridade poderiam parecer erro interno | Tratamento central para conflito 409 e validação 422, sem expor detalhes do banco. |
| Proxy não configurável no limitador de acesso | TRUST_PROXY_HOPS explícito. Deve corresponder à topologia da hospedagem; não foi presumido um valor de produção. |
| Falta de contratos e testes de integração | Consulte backend/CONTRATOS_API.md e backend/testes. |

## Verificação

A suíte contém 29 testes automatizados: contratos HTTP contra PostgreSQL 17 local isolado, regras puras e tratamento de resposta do mobile. Inclui concorrência de pagamento e chegada, idempotência, isolamento de contas, privacidade, modelos privados, publicação/restauração, evolução, códigos de recuperação e push simulado.

Também são executados:

- backend: npm run verificar (ESLint, incluindo proibição de ternários);
- mobile: npm run verificar (ESLint e checagem dos arquivos JS/JSX);
- exportação dos bundles Android e iOS para pastas temporárias;
- git diff --check.

O teste de recuperação valida uso único, tentativas e revogação de sessão com código preparado na base de teste; não comprova entrega por um provedor SMTP real. O teste de push simula a API Expo e confere tickets/recibos e cancelamento após logout; não comprova entrega em Android/iOS. Exportar o bundle não é executar o app em um telefone.

## Pendências preservadas e condições de publicação

Conforme resposta do usuário, permanecem bloqueadas:

- aniversário de vencimento nos dias 29/30/31;
- contratação de modalidades combinadas e regras próprias de cobertura;
- correção/anulação de pagamento confirmado;
- definição e entrega da credencial inicial;
- segunda entrada física no mesmo dia e cadência de avisos ainda sem regra.

Renovação antecipada sobre período pago e troca de plano durante tolerância também não recebem uma regra presumida: a API responde 409. A vigência usa início inclusivo e vencimento exclusivo; a tolerância elegível ocupa exatamente os cinco dias seguintes, sem dívida.

Ainda precisam de trabalho/validação antes de afirmar que o produto completo do PDF está em produção:

- conta funcional independente de aluno, vinculação de identidades preexistentes, reautenticação ao entrar no contexto funcional e bloqueio por inatividade;
- configuração de SMTP e push; integração mobile do token de push, da central de notificações e das novas áreas administrativas;
- automação dos avisos de mudança de estado e alertas gerenciais além da consulta de pendências/auditoria;
- revisão dos modelos-base e da mídia por profissionais;
- validação visual e de interação em smartphones Android/iOS;
- definição das políticas de privacidade/retenção e validação da hospedagem, backups e operação real.

Essas limitações não são escondidas pelos testes aprovados. A suíte não garante ausência de qualquer falha futura, não foi executada no Neon real e não substitui homologação.

O npm audit do backend identificou dois alertas moderados relacionados à dependência transitiva uuid do Sequelize. Não foi aplicado downgrade forçado do ORM. Dependências e distribuição devem ser reavaliadas antes da publicação.

## Git

A branch melhorias/backend-e-rotinas foi enviada ao origin. Nenhum commit foi criado. Por isso, o remoto contém apenas o histórico já existente; as modificações desta entrega estão no diretório de trabalho local, sem staging.

Referências técnicas consultadas: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [transações Sequelize](https://sequelize.org/docs/v6/other-topics/transactions/), [Express e proxies](https://expressjs.com/en/guide/behind-proxies/), [SMTP Nodemailer](https://nodemailer.com/smtp), [push Expo](https://docs.expo.dev/push-notifications/sending-notifications/).
