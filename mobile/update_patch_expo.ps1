$ErrorActionPreference = 'Stop'
$ProgressPreference = 'Continue'
$script:InicioEnvio = Get-Date
$script:UltimaEtapa = ''
$codigoSaida = 0
$localAlterado = $false
$buildId = ''
$linkBuild = ''

function Mostrar-Progresso {
    param(
        [int]$Percentual,
        [string]$Etapa
    )

    $tempo = (Get-Date) - $script:InicioEnvio
    $status = '{0}% | {1} | Decorrido: {2:hh\:mm\:ss}' -f $Percentual, $Etapa, $tempo
    Write-Progress -Id 1 -Activity 'Academia App - envio ao Expo' -Status $status -PercentComplete $Percentual
    if ($script:UltimaEtapa -ne $Etapa) {
        Write-Host $status -ForegroundColor Cyan
        $script:UltimaEtapa = $Etapa
    }
}

function Executar-Comando {
    param(
        [string]$Programa,
        [string[]]$Argumentos,
        [string]$MensagemErro
    )

    & $Programa @Argumentos
    if ($LASTEXITCODE -ne 0) {
        throw $MensagemErro
    }
}

function Consultar-Expo {
    param([string[]]$Argumentos)

    # Separo o JSON dos avisos do CLI, que continuam aparecendo no terminal.
    $resposta = & npx.cmd --yes eas-cli@latest @Argumentos
    if ($LASTEXITCODE -ne 0) {
        throw 'O comando do Expo falhou. Confira a mensagem exibida acima.'
    }
    try {
        return ConvertFrom-Json -InputObject ($resposta -join [Environment]::NewLine)
    } catch {
        throw 'O Expo não retornou um JSON válido. Confira o painel antes de iniciar outro envio.'
    }
}

function Obter-EtapaBuild {
    param([string]$Status)

    switch ($Status) {
        'NEW' { return @{ Percentual = 70; Etapa = 'Build recebido pelo Expo' } }
        'IN_QUEUE' { return @{ Percentual = 75; Etapa = 'Aguardando vaga na fila do Expo' } }
        'IN_PROGRESS' { return @{ Percentual = 85; Etapa = 'Compilando o APK no Expo' } }
        'PENDING_CANCEL' { return @{ Percentual = 85; Etapa = 'Cancelamento solicitado no Expo' } }
        'FINISHED' { return @{ Percentual = 100; Etapa = 'APK concluído com sucesso' } }
        'ERRORED' { throw 'A compilação falhou no Expo. Abra o link do build para consultar os logs.' }
        'CANCELED' { throw 'A compilação foi cancelada no Expo.' }
        default { throw "O Expo retornou um status desconhecido: $Status. Consulte o link do build." }
    }
}

function Aguardar-Consulta {
    param(
        [int]$Percentual,
        [string]$Etapa
    )

    # Atualizo o tempo decorrido sem inventar avanço percentual durante a espera.
    $proximaConsulta = (Get-Date).AddSeconds(15)
    while ((Get-Date) -lt $proximaConsulta) {
        Mostrar-Progresso -Percentual $Percentual -Etapa $Etapa
        Start-Sleep -Seconds 1
    }
}

function Acompanhar-Build {
    param([object]$Build)

    $falhasConsecutivas = 0
    while ($true) {
        $etapa = Obter-EtapaBuild -Status $Build.status
        Mostrar-Progresso -Percentual $etapa.Percentual -Etapa $etapa.Etapa
        if ($Build.status -eq 'FINISHED') {
            return $Build
        }

        Aguardar-Consulta -Percentual $etapa.Percentual -Etapa $etapa.Etapa
        try {
            $consulta = Consultar-Expo -Argumentos @('build:view', $Build.id, '--json')
            if ($consulta.id -ne $Build.id -or -not $consulta.status) {
                throw 'A consulta não retornou o build esperado.'
            }
            $Build = $consulta
            $falhasConsecutivas = 0
        } catch {
            $falhasConsecutivas += 1
            Write-Warning "Não consegui atualizar o status ($falhasConsecutivas de 3 tentativas)."
            if ($falhasConsecutivas -ge 3) {
                throw 'O acompanhamento foi interrompido. O build pode continuar no Expo; consulte o link antes de enviar novamente.'
            }
        }
    }
}

try {
    # Parto da pasta do script, mesmo quando ele é aberto por um atalho.
    Push-Location -LiteralPath $PSScriptRoot
    $localAlterado = $true
    Write-Host 'Progresso geral por etapas; não representa tempo restante ou bytes enviados.'
    Write-Host 'O percentual só chega a 100% quando o Expo confirma a compilação.'
    Write-Host 'As alterações locais serão usadas para gerar o APK Android (perfil preview).'
    Mostrar-Progresso -Percentual 0 -Etapa 'Conferindo ferramentas e projeto'
    Get-Command node.exe, npm.cmd, npx.cmd -ErrorAction Stop | Out-Null
    if (-not (Test-Path -LiteralPath 'package-lock.json') -or -not (Test-Path -LiteralPath 'eas.json')) {
        throw 'Execute este arquivo dentro da pasta mobile do projeto.'
    }
    $configuracao = Get-Content -LiteralPath 'app.json' -Raw -Encoding UTF8 | ConvertFrom-Json

    Mostrar-Progresso -Percentual 10 -Etapa 'Instalando as dependências'
    Executar-Comando -Programa 'npm.cmd' -Argumentos @('ci', '--no-audit', '--no-fund') -MensagemErro 'Falha ao instalar as dependências.'

    Mostrar-Progresso -Percentual 35 -Etapa 'Verificando o código e os tipos'
    Executar-Comando -Programa 'npm.cmd' -Argumentos @('run', 'verificar') -MensagemErro 'As verificações falharam. Corrija os erros antes de enviar.'

    Mostrar-Progresso -Percentual 50 -Etapa 'Conferindo a conta do Expo'
    & npx.cmd --yes eas-cli@latest whoami
    if ($LASTEXITCODE -ne 0) {
        Executar-Comando -Programa 'npx.cmd' -Argumentos @('--yes', 'eas-cli@latest', 'login') -MensagemErro 'Não foi possível entrar na conta Expo.'
    }

    Mostrar-Progresso -Percentual 60 -Etapa 'Preparando e enviando o projeto'
    # Solicito um único build e acompanho esse identificador, sem reenviar ao perder conexão.
    $builds = @(Consultar-Expo -Argumentos @('build', '--platform', 'android', '--profile', 'preview', '--non-interactive', '--no-wait', '--json'))
    if ($builds.Count -ne 1 -or -not $builds[0].id) {
        throw 'Não consegui identificar o build criado. Consulte o painel do Expo antes de repetir.'
    }
    $buildId = $builds[0].id
    $conta = [Uri]::EscapeDataString($configuracao.expo.owner)
    $projeto = [Uri]::EscapeDataString($configuracao.expo.slug)
    $linkBuild = "https://expo.dev/accounts/$conta/projects/$projeto/builds/$buildId"
    Write-Host "Acompanhe os logs: $linkBuild" -ForegroundColor Yellow

    $concluido = Acompanhar-Build -Build $builds[0]
    if ($concluido.artifacts -and $concluido.artifacts.buildUrl) {
        Write-Host ('Baixar APK: ' + $concluido.artifacts.buildUrl) -ForegroundColor Green
    }
    Write-Host '100% - Compilação concluída no Expo.' -ForegroundColor Green
} catch {
    $codigoSaida = 1
    Write-Host ('Processo interrompido: ' + $_.Exception.Message) -ForegroundColor Red
    if ($buildId) {
        Write-Host "Build já enviado: $linkBuild" -ForegroundColor Yellow
    } else {
        Write-Host 'Se a falha ocorreu durante o envio, confira o painel do Expo antes de tentar novamente.'
        Write-Host 'Se faltarem credenciais de assinatura, configure-as com: npx eas-cli@latest credentials:configure-build --platform android --profile preview'
    }
} finally {
    Write-Progress -Id 1 -Activity 'Academia App - envio ao Expo' -Completed
    if ($localAlterado) {
        Pop-Location
    }
}

exit $codigoSaida
