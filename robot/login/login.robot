*** Settings ***
Library    SeleniumLibrary

Suite Setup       Abrir Navegador na Tela de Login
Suite Teardown    Fechar Navegador

*** Variables ***
${URL}              http://localhost:3000/login
${BROWSER}          chrome

${INPUT_EMAIL}      id=email
${INPUT_SENHA}      id=password
${BTN_ENTRAR}       css=button[type="submit"]
${MENSAGEM_ERRO}    css=div.bg-red-50

*** Test Cases ***

CT02 - Deve exibir erro para e-mail com formato inválido
    [Documentation]    E-mail sem @ exibe mensagem de erro
    Dado que o usuário acessa a tela de login
    E preenche o e-mail    testeemail.com
    E preenche a senha    senha123
    Quando clicar em Entrar
    Então deve exibir mensagem de erro    E-mail inválido

CT03 - Deve exibir erro quando senha não é preenchida
    [Documentation]    Senha vazia exibe mensagem de erro
    Dado que o usuário acessa a tela de login
    E preenche o e-mail    teste@email.com
    E preenche a senha    ${EMPTY}
    Quando clicar em Entrar
    Então deve exibir mensagem de erro    Informe a senha

CT04 - Deve exibir erro para credenciais incorretas
    [Documentation]    Senha errada exibe mensagem genérica de erro
    Dado que o usuário acessa a tela de login
    E preenche o e-mail    teste@email.com
    E preenche a senha    senhaErrada
    Quando clicar em Entrar
    Então deve exibir mensagem de erro    E-mail ou senha incorretos.

CT01 - Deve realizar login com credenciais válidas
    [Documentation]    Login bem-sucedido redireciona para /rotinas
    Dado que o usuário acessa a tela de login
    E preenche o e-mail    teste@email.com
    E preenche a senha    senha123
    Quando clicar em Entrar
    Então deve ser redirecionado para    /rotinas

*** Keywords ***

Abrir Navegador na Tela de Login
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Fechar Navegador
    Close Browser

Dado que o usuário acessa a tela de login
    Go To    ${URL}
    Wait Until Element Is Visible    ${INPUT_EMAIL}    timeout=10s

E preenche o e-mail
    [Arguments]    ${email}=${EMPTY}
    Clear Element Text    ${INPUT_EMAIL}
    Run Keyword If    '${email}' != '${EMPTY}'    Input Text    ${INPUT_EMAIL}    ${email}

E preenche a senha
    [Arguments]    ${senha}=${EMPTY}
    Clear Element Text    ${INPUT_SENHA}
    Run Keyword If    '${senha}' != '${EMPTY}'    Input Password    ${INPUT_SENHA}    ${senha}

Quando clicar em Entrar
    Click Button    ${BTN_ENTRAR}

Então deve ser redirecionado para
    [Arguments]    ${caminho}
    Wait Until Location Contains    ${caminho}    timeout=10s

Então deve exibir mensagem de erro
    [Arguments]    ${mensagem}
    Wait Until Element Is Visible    ${MENSAGEM_ERRO}    timeout=10s
    Element Should Contain    ${MENSAGEM_ERRO}    ${mensagem}
