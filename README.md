# Teste do QZ Tray

Esta é uma aplicação simples para testar a funcionalidade do QZ Tray usando Vite e TypeScript.

## Pré-requisitos

1. Instale o [QZ Tray](https://qz.io/download/) no seu computador
2. Certifique-se de que o QZ Tray esteja em execução antes de usar esta aplicação

## Configuração

1. Clone este repositório
2. Instale as dependências:
   ```bash
   npm install
   # ou
   pnpm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   pnpm dev
   ```
4. Abra a aplicação no seu navegador (geralmente em http://localhost:5173)

## Uso

1. Clique no botão "Connect to QZ Tray" para estabelecer uma conexão com o QZ Tray
2. Uma vez conectado, clique em "Get Printers" para obter uma lista de impressoras disponíveis
3. Para cada impressora na lista, você pode clicar no botão "Print Test" para enviar uma página de teste
4. Quando terminar, clique em "Disconnect QZ Tray" para fechar a conexão

## Certificados de Segurança

Esta aplicação usa certificados digitais para autenticar a conexão com o QZ Tray. Os certificados estão localizados em:

- **Certificado Digital**: `public/cert/digital-certificate.txt`
- **Chave Privada**: `public/cert/private-key.pem`

Estes certificados são carregados automaticamente quando você inicia a aplicação. Se você precisar usar seus próprios certificados:

1. Substitua os arquivos existentes pelos seus próprios certificados
2. Mantenha os mesmos nomes de arquivo para que a aplicação possa encontrá-los
3. Certifique-se de que os certificados estejam no formato correto (PEM para a chave privada)

## Lidando com Prompts de Segurança

Ao conectar-se ao QZ Tray pela primeira vez, você pode ver prompts de segurança. Existem dois tipos principais:

### 1. Prompt de Conexão (Vermelho)

Este prompt pergunta se você deseja permitir que o site se conecte ao QZ Tray:

- Clique em "Allow" (Permitir) para autorizar a conexão
- Marque a opção "Remember this decision" (Lembrar esta decisão) para evitar que o prompt apareça novamente

### 2. Prompt de Assinatura Inválida (Amarelo)

Este prompt indica que o QZ Tray não consegue verificar a assinatura digital:

- Clique em "Allow" (Permitir) para continuar mesmo com a assinatura inválida
- Marque a opção "Remember this decision" (Lembrar esta decisão) para evitar que o prompt apareça novamente

Para resolver permanentemente o problema de assinatura inválida, você tem duas opções:

#### Opção 1: Permitir Manualmente no QZ Tray

1. Quando o prompt amarelo aparecer, clique em "Allow" e marque "Remember this decision"
2. Isso adicionará uma exceção para o seu site no QZ Tray

#### Opção 2: Configurar Certificados Válidos

Para um ambiente de produção, você deve:

1. Gerar um par de chaves adequado usando a ferramenta de certificados do QZ Tray
2. Configurar o QZ Tray para confiar no seu certificado
3. Implementar a assinatura digital correta usando a biblioteca JSRSASign

Consulte a [documentação de assinatura do QZ Tray](https://qz.io/docs/article/signing) para instruções detalhadas.

## Notas sobre Tipagem TypeScript

Esta aplicação usa o pacote `@types/qz-tray` para fornecer definições de tipos para a biblioteca QZ Tray. Algumas observações importantes:

1. **Limitações das definições de tipos**: As definições de tipos podem não incluir todos os métodos e propriedades disponíveis na biblioteca QZ Tray. Isso pode causar erros de tipagem.

2. **Formato de dados para impressão**: De acordo com as definições de tipos, o método `qz.print()` aceita apenas arrays de strings como dados de impressão. Se você precisar usar formatos mais complexos (como objetos com propriedades `type`, `format` e `data`), poderá ser necessário fazer um cast de tipo.

3. **Retorno do método `qz.printers.find()`**: Este método pode retornar uma string única ou um array de strings, dependendo do contexto. O código foi adaptado para garantir que sempre retorne um array.

4. **Opções de conexão**: Algumas opções de conexão (como `ignoreSSL`) não estão incluídas nas definições de tipos, então foram removidas do código.

## Solução de Problemas

- Certifique-se de que o QZ Tray esteja em execução antes de tentar conectar
- Verifique o console do navegador para ver mensagens de erro
- Se encontrar problemas com certificados, pode ser necessário configurar as definições de segurança do QZ Tray
- Para mais informações, visite a [documentação do QZ Tray](https://qz.io/docs/)

## Notas sobre o QZ Tray

O QZ Tray é uma aplicação baseada em Java que conecta aplicações web com hardware local como impressoras, balanças e leitores de cartão. Ele funciona como um serviço em segundo plano e se comunica com aplicações web através de WebSockets.

Principais recursos usados nesta demonstração:
- Conexão com o serviço QZ Tray
- Obtenção da lista de impressoras disponíveis
- Envio de comandos de impressão para uma impressora
- Desconexão adequada do serviço

Para uso mais avançado, consulte a [documentação da API do QZ Tray](https://qz.io/api/).

# QZ Tray Integration

This project demonstrates two approaches to integrating QZ Tray for printing:

1. **Frontend-only integration (insecure)** - Private key is stored in the frontend
2. **Backend + Frontend integration (secure)** - Private key is stored securely on the backend

## Security Concerns

The original implementation (`src/qz-tray-service.ts`) has a significant security vulnerability:
- The private key used for signing QZ Tray commands is stored and used directly in the frontend
- This exposes the private key to anyone who can view your source code or network traffic
- Anyone with the private key can impersonate your application to QZ Tray

## Secure Solution

The secure implementation moves the sensitive operations to a Laravel backend:
- `qz-tray-backend/` - Laravel backend application that handles certificate storage and data signing
- `src/qz-tray-service-secure.ts` - Updated frontend implementation that uses the backend for signing

### Benefits of the Secure Solution

- Private key never leaves the server
- Signing operations happen server-side
- CORS protection limits which domains can access the signing API
- Easily configurable via environment variables

## Setup Instructions

### Backend (Secure Implementation)

1. Navigate to the backend directory
   ```bash
   cd qz-tray-backend
   ```

2. Install PHP dependencies
   ```bash
   composer install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Add your QZ Tray certificates to `storage/app/certs/superfast/`:
   - `cert.pem` - The public certificate
   - `key.pem` - The private key

5. Start the backend server
   ```bash
   php artisan serve
   ```

### Frontend

Choose which implementation to use by importing from the appropriate file:

#### For the insecure frontend-only approach:
```javascript
import { initQzTray, getPrinters, printTestPage, disconnectQzTray } from './qz-tray-service';
```

#### For the secure backend+frontend approach:
```javascript
import { initQzTray, getPrinters, printTestPage, disconnectQzTray } from './qz-tray-service-secure';
```

## Implementation Differences

### Original Implementation (Insecure)
- Loads certificate and private key directly from frontend
- Uses JSRSASign for frontend signing
- All sensitive operations happen client-side

### Secure Implementation
- Retrieves certificate from backend API
- Sends data to backend API for signing
- Private key never exposed to the frontend

## How to Switch Between Implementations

To migrate from the insecure to secure approach:

1. Set up the Laravel backend as described above
2. Update your imports to use `qz-tray-service-secure.ts` instead of `qz-tray-service.ts`
3. No other code changes should be necessary as both implementations expose the same API

## API Reference

Both implementations provide the same functions:

- `initQzTray()` - Connect to QZ Tray
- `getPrinters()` - Get list of available printers
- `printTestPage(printerName)` - Print a test page to the specified printer
- `disconnectQzTray()` - Disconnect from QZ Tray 