*** Settings ***
Library    SeleniumLibrary

Suite Setup       Abrir Navegador
Suite Teardown    Fechar Navegador

*** Variables ***
${URL}              http://localhost:3000/cadastro
${BROWSER}          chrome

${INPUT_NOME}       id=name
${INPUT_EMAIL}      id=email
${INPUT_SENHA}      id=password
${BTN_CADASTRAR}    css=button[type="submit"]
${MENSAGEM_ERRO}    css=div.bg-red-50

*** Test Cases ***

CT02 - Deve exibir erro para nome com menos de 2 caracteres
    [Documentation]    Nome com 1 caractere exibe mensagem de erro
    Dado que o usuário acessa a tela de cadastro
    E preenche o nome       A
    E preenche o e-mail     ana@email.com
    E preenche a senha      minhasenha
    Quando clicar em Criar Conta
    Então deve exibir mensagem de erro    Nome deve ter ao menos 2 caracteres

CT03 - Deve exibir erro para e-mail com formato inválido
    [Documentation]    E-mail sem @ exibe mensagem de erro
    Dado que o usuário acessa a tela de cadastro
    E preenche o nome       Ana Costa
    E preenche o e-mail     anaemail.com
    E preenche a senha      minhasenha
    Quando clicar em Criar Conta
    Então deve exibir mensagem de erro    E-mail inválido

CT04 - Deve exibir erro para senha curta
    [Documentation]    Senha com menos de 6 caracteres exibe mensagem de erro
    Dado que o usuário acessa a tela de cadastro
    E preenche o nome       Ana Costa
    E preenche o e-mail     ana2@email.com
    E preenche a senha      123
    Quando clicar em Criar Conta
    Então deve exibir mensagem de erro    Senha deve ter ao menos 6 caracteres

CT05 - Deve exibir erro para e-mail já cadastrado
    [Documentation]    E-mail duplicado exibe mensagem de conflito
    Dado que o usuário acessa a tela de cadastro
    E preenche o nome       Ana Costa
    E preenche o e-mail     teste@email.com
    E preenche a senha      minhasenha
    Quando clicar em Criar Conta
    Então deve exibir mensagem de erro    Este e-mail já está cadastrado.


CT01 - Deve realizar cadastro com todos os dados válidos
    [Documentation]    Cadastro bem-sucedido redireciona para /rotinas
    Dado que o usuário acessa a tela de cadastro
    E preenche o nome       Ana Costa
    E preenche o e-mail     ana@email.com
    E preenche a senha      minhasenha
    Quando clicar em Criar Conta
    Então deve ser redirecionado para    /rotinas

*** Keywords ***

Abrir Navegador
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Fechar Navegador
    Close Browser

Dado que o usuário acessa a tela de cadastro
    Go To    ${URL}
    Wait Until Element Is Visible    ${INPUT_NOME}    timeout=10s

E preenche o nome
    [Arguments]    ${nome}=${EMPTY}
    Clear Element Text    ${INPUT_NOME}
    Run Keyword If    '${nome}' != '${EMPTY}'    Input Text    ${INPUT_NOME}    ${nome}

E preenche o e-mail
    [Arguments]    ${email}=${EMPTY}
    Clear Element Text    ${INPUT_EMAIL}
    Run Keyword If    '${email}' != '${EMPTY}'    Input Text    ${INPUT_EMAIL}    ${email}

E preenche a senha
    [Arguments]    ${senha}=${EMPTY}
    Clear Element Text    ${INPUT_SENHA}
    Run Keyword If    '${senha}' != '${EMPTY}'    Input Password    ${INPUT_SENHA}    ${senha}

Quando clicar em Criar Conta
    Click Button    ${BTN_CADASTRAR}

Então deve ser redirecionado para
    [Arguments]    ${caminho}
    Wait Until Location Contains    ${caminho}    timeout=10s

Então deve exibir mensagem de erro
    [Arguments]    ${mensagem}
    Wait Until Element Is Visible    ${MENSAGEM_ERRO}    timeout=5s
    Element Should Contain    ${MENSAGEM_ERRO}    ${mensagem}
