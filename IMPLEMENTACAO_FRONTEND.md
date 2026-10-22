# Frontend integrado ao backend

Atualização: 21/10/2026. Branch: `melhorias/frontend-e-rotinas`.
Base da etapa: `6573d83`. O usuário consolidou a implementação no commit `d81cee4`, já presente na branch remota. Nenhum commit foi criado pelo assistente.

## Rotinas e treinos

- A tela inicial apresenta as rotinas recomendada e pessoal, com seleção da divisão. O treino oficial exige chegada confirmada pela recepção.
- A demonstração fica separada, aparece apenas quando habilitada pela API e usa somente a rotina pessoal. Não integra a evolução oficial.
- O editor compartilhado usa seletores para divisão, posição, equipamento, referência de carga, séries, repetições/duração e descanso. Valores personalizados continuam disponíveis.
- A posição move o item dentro da sequência, preservando identidades e os demais exercícios. Não há botões “subir”/“descer”.
- Divisões e exercícios são recolhíveis. Carga/observações opcionais podem ser abertas separadamente. As colunas se ajustam ao espaço disponível; os alvos de toque mantêm altura mínima de 44 pontos.
- A validação anterior ao envio indica qual divisão e exercício precisam de correção. Carga vazia continua opcional; zero é preservado e descanso vazio não vira zero silenciosamente.
- A rotina pessoal pode copiar a recomendada sem modificá-la. O rascunho local é cifrado e a substituição exige confirmação.
- O instrutor pode copiar modelos, salvar rascunho, publicar após conferir aluno/matrícula, consultar versões e restaurar uma versão como rascunho. Restaurar consulta a versão publicada atual e continua exigindo publicação separada.
- O rascunho do instrutor é cifrado por conta e aluno. Um conflito não substitui automaticamente a edição local.
- A biblioteca permite criar, copiar, editar e arquivar modelos. Modelos oficiais exigem Administrador; privados exigem Instrutor. A API continua verificando autoria.
- O catálogo profissional permite cadastrar, editar e arquivar exercícios, com nomes alternativos e links de mídia. Vídeos exigem revisão manual. Arquivar preserva referências históricas.
- O início do treino guarda o identificador antes do pedido. Uma perda de resposta permite recuperar o mesmo treino, sem abrir outra sessão.
- A execução preserva séries e pedidos pendentes no aparelho. Conflitos de revisão pausam os reenvios automáticos; usar a versão confirmada exige aceitar o descarte das mudanças locais pendentes.
- Séries realizadas ficam recolhidas. Corrigir um treino encerrado exige motivo e revisão, sem alterar a prescrição.
- Evolução consulta o período escolhido, separa equipamento/referência de carga e mostra as séries realmente realizadas. O histórico completo/parcial continua paginado.

## Demais integrações

| Área | Disponível no mobile |
| --- | --- |
| Cobertura/pagamentos | Aluno consulta situação/histórico. Recepção/Gestão registram pendência, conferem recebimento e confirmam separadamente; cancelamento de renovação preserva vigência. |
| Benefícios | Aluno consulta histórico. Gestão concede/revoga com motivo, respeitando as regras da API. |
| Chegada | Aluno solicita; recepção consulta fila identificada e confirma presença. Gestão autoriza exceção diária. |
| Equipe | Gestão/Admin buscam contas existentes por nome/matrícula, conferem identidade e administram vínculos conforme seus papéis. Credencial inicial continua fora deste fluxo. |
| Catálogo comercial | Gestão cria/edita/desativa planos e modalidades, com versão e preço em centavos. |
| Medidas | Registro opcional de peso/altura, correção com motivo e consentimento revogável. Instrutor consulta apenas com compartilhamento atual. |
| Recuperação | Solicitação de código e confirmação de nova senha. E-mail/código/senha não são salvos no rascunho. Falta de configuração é apresentada como indisponibilidade. |
| Notificações | Central paginada, leitura por conta e destinos conhecidos. Usuário ativa/desativa push vinculado à sessão. Após novo login, a ativação precisa ser repetida. |

Papéis não são herdados automaticamente: Administrador sem papel de Instrutor não prescreve; Gestor sem papel de Recepção não confirma chegada.

## Organização e falhas

- `TelaFormulario`: área segura, rolagem e teclado.
- `useConsulta`: consulta ao ganhar foco, atualização manual e descarte de respostas de consulta anterior.
- `useGravacao`: trava contra toque repetido e armazenamento cifrado da chave/conteúdo de operações idempotentes. “Repetir envio pendente” reenvia o mesmo pedido.
- `EstadoConsulta`, `Paginacao`, `EnvioPendente`: apresentação compartilhada.
- `validar-rotina`, `organizar-rotina`, `opcoes-formulario`: validação, reordenação e rótulos separados da interface.
- Nenhuma dependência nova, credencial, arquivo `.env`, migração ou diretório nativo foi adicionado.

## Complementos da API

- `GET /funcionarios/contas?busca=...`: Gestão/Admin, contas ativas existentes por nome/matrícula, mínimo dois caracteres, até 30 resultados. Identidade e vínculo atual; sem CPF, e-mail ou hash de senha.
- `GET /funcionarios`: inclui `identidade` com nome e matrícula.
- `GET /equipe/chegadas`: inclui `aluno` com id, nome e matrícula.

A autorização permanece no backend. Frontend e backend precisam estar em versões compatíveis.

## Verificações realizadas

- 36 testes aprovados: HTTP com PostgreSQL 17 local isolado, permissões, isolamento, concorrência, idempotência, regras e compatibilidade do formulário com o validador real do backend.
- `backend: npm run verificar`: aprovado.
- `mobile: npm run verificar`: ESLint e checagem JS/JSX aprovados.
- Exportação Android aprovada: 1422 módulos, bundle Hermes em pasta temporária.
- Exportação iOS aprovada: 1284 módulos, bundle Hermes em pasta temporária.
- Sem acesso ao Neon de produção, envio real de e-mail/push ou publicação de APK/IPA.

A suíte não automatiza toques e navegação em aparelhos. Os bundles comprovam compilação, não homologação visual nem entrega de notificações.

## Roteiro de homologação em aparelho

1. Android/iOS, telas estreitas e fonte ampliada: conferir seletores, teclado, foco, rolagem e áreas de toque.
2. Criar rotina com exercícios do catálogo e manuais; testar valores personalizados, carga zero/vazia e descanso zero. Verificar localização dos erros de preenchimento.
3. Reposicionar divisões/exercícios, conferir conteúdo e confirmar remoções.
4. Fechar/reabrir rotina pessoal e trocar de aluno na equipe; confirmar recuperação do rascunho correto e isolamento entre contas.
5. Copiar recomendada para pessoal; publicar outra ficha e confirmar que a cópia não mudou.
6. Criar/copiar modelo, salvar ficha, conferir matrícula, publicar e restaurar versão anterior como rascunho. A restauração sozinha não deve alterar a ficha do aluno.
7. Publicar com dois instrutores; conferir conflito e recuperação explícita, preservando treino ativo.
8. Solicitar/confirmar chegada. Testar ausência de cobertura, exceção da Gestão e confirmação sem solicitação no celular.
9. Iniciar treino oficial, registrar séries, interromper rede, retomar e sincronizar; conferir ausência de duplicação.
10. Criar divergência entre aparelhos; conferir escolha explícita antes de descartar dados locais.
11. Encerrar parcialmente, corrigir série com motivo e conferir histórico/evolução sem mudar prescrição.
12. Registrar/corrigir medida, compartilhar com instrutor e revogar; confirmar recusa para Recepção.
13. Registrar pagamento pendente; conferir que não libera cobertura; confirmar recebimento e consultar situação/notificação. Repetir após perda de resposta.
14. Recuperar senha com SMTP de homologação; testar código expirado/incorreto e revogação das sessões anteriores.
15. Ativar push em instalação real configurada, receber aviso, consultar central, desativar, sair e trocar conta; confirmar cancelamento dos avisos da sessão encerrada.

## Limites preservados

Continuam bloqueadas as regras pendentes acordadas: aniversários nos dias 29/30/31, combinação de modalidades, correção/anulação financeira, entrega de credencial inicial e demais indefinições em [REVISAO_BACKEND.md](REVISAO_BACKEND.md).

Configuração real de SMTP, FCM/APNs, hospedagem, privacidade/retenção e validação em smartphones ainda são necessárias. Conta funcional independente de aluno, reautenticação de contexto, bloqueio por inatividade e automações pendentes de definição continuam fora da entrega.

A auditoria gerencial geral e o painel agregado de pendências financeiras permanecem disponíveis pela API; esta etapa usa o atendimento financeiro por aluno.

Referências: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [Expo Notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/), [Expo Router](https://docs.expo.dev/router/basics/navigation/), [KeyboardAvoidingView](https://reactnative.dev/docs/keyboardavoidingview).
