# Music Tracker — instalador para Windows

Este projeto gera um instalador `.exe` (Windows 10/11, 64 bits) da aplicação.

## Requisitos

- Node.js versão LTS, descarregado em https://nodejs.org (instala com as opções por defeito)

## Passos

1. Extrai esta pasta para um sítio do teu PC, por exemplo `C:\album-critico-desktop`.
2. Abre o **Terminal** (ou o PowerShell) dentro dessa pasta.
   - No Explorador de Ficheiros, clica na barra de endereço, escreve `powershell` e carrega em Enter.
3. Instala as dependências:
   ```
   npm install
   ```
4. Gera o instalador:
   ```
   npm run dist
   ```
5. Quando terminar, o instalador fica em:
   ```
   dist\Music Tracker Setup 2.39.3.exe
   ```

Basta fazer duplo clique nesse ficheiro para instalar. Fica com atalho no ambiente de trabalho e no menu Iniciar.

## Testar antes de gerar o instalador

Para abrir a app diretamente, sem instalar, usa:
```
npm start
```

## Publicar para descarregar no site

1. No repositório do GitHub, vai a **Releases → Create a new release**.
2. Dá-lhe um nome, por exemplo `v2.0.0`.
3. Arrasta o ficheiro `Music Tracker Setup 2.39.3.exe` para a área de anexos e publica.
4. Copia o link do ficheiro e usa-o no botão de download da página `index.html`.

## Notas

- O Windows pode mostrar um aviso do SmartScreen ("O Windows protegeu o seu PC"), porque a app não tem assinatura digital. Para continuar, clica em **Mais informações → Executar mesmo assim**.
- A app precisa de internet para pesquisar o catálogo e carregar as fotos. As avaliações ficam guardadas no próprio PC.
- Para atualizar a app, sobe o número de `version` no `package.json` e gera o instalador de novo.
