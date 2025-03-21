import qz from 'qz-tray';
// Importar a biblioteca JSRSASign corretamente
import jsrsasign from 'jsrsasign';

// Carregar certificados
async function loadCertificates() {
  try {
    // Carregar o certificado digital
    const certificateResponse = await fetch('/cert/superfast/cert.pem');
    const certificate = await certificateResponse.text();
    
    // Carregar a chave privada
    const privateKeyResponse = await fetch('/cert/superfast/key.pem');
    const privateKey = await privateKeyResponse.text();
    
    return { certificate, privateKey };
  } catch (error) {
    console.error('Erro ao carregar certificados:', error);
    return { certificate: null, privateKey: null };
  }
}

// Função para assinar dados usando a chave privada e JSRSASign
function signData(privateKey: string, data: string): string {
  try {
    // Criar objeto de assinatura
    const sig = new jsrsasign.KJUR.crypto.Signature({ "alg": "SHA1withRSA" });
    
    // Inicializar com a chave privada
    sig.init(privateKey);
    
    // Adicionar os dados a serem assinados
    sig.updateString(data);
    
    // Gerar a assinatura
    const signatureHex = sig.sign();
    
    // Converter para base64
    return jsrsasign.hextob64(signatureHex);
  } catch (error) {
    console.error('Erro ao assinar dados:', error);
    // Retornar uma assinatura simulada em caso de erro
    return btoa(`${data}:signed:${Date.now()}`);
  }
}

// Configuração de certificados e segurança
async function setupCertificates() {
  // Carregar certificados
  const { certificate, privateKey } = await loadCertificates();
  
  // Configuração para usar o certificado digital
  qz.security.setCertificatePromise(function(resolve: (cert: any) => void, reject: (error: any) => void) {
    if (certificate) {
      resolve(certificate);
    } else {
      // Fallback para certificado padrão se não conseguir carregar o arquivo
      reject(new Error("Certificado digital não disponível"));
    }
  });

  // Configuração para usar a chave privada para assinatura
  qz.security.setSignaturePromise(function(toSign: string) {
    return function(resolve: (signature: any) => void, reject: (error: any) => void) {
      try {
        if (privateKey) {
          // Assinar os dados usando a chave privada e JSRSASign
          const signature = signData(privateKey, toSign);
          resolve(signature);
        } else {
          // Se não tiver a chave privada, rejeitar a promessa
          reject(new Error("Chave privada não disponível para assinatura"));
        }
      } catch (err) {
        console.error("Erro ao assinar:", err);
        reject(err);
      }
    };
  });
}

// Inicializar QZ Tray
export async function initQzTray(): Promise<void> {
  try {
    // Configurar certificados e segurança
    await setupCertificates();
    
    // Conectar ao QZ Tray
    // Usando apenas as opções suportadas pela definição de tipos
    await qz.websocket.connect({
      retries: 3,
      delay: 1000
    });
    
    console.log('QZ Tray conectado com sucesso');
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao conectar ao QZ Tray:', error);
    return Promise.reject(error);
  }
}

// Obter lista de impressoras disponíveis
export async function getPrinters(): Promise<string[]> {
  try {
    const printers = await qz.printers.find();
    // Garantir que o retorno seja sempre um array
    return Array.isArray(printers) ? printers : [printers].filter(Boolean) as string[];
  } catch (error) {
    console.error('Erro ao obter impressoras:', error);
    return [];
  }
}

// Imprimir página de teste
export async function printTestPage(printerName: string): Promise<void> {
  try {
    // Criar configuração para a impressora
    const config = qz.configs.create(printerName);
    
    // Criar dados de teste - texto simples (como strings)
    const data = [
      'Teste de Impressão QZ Tray\n',
      '=================\n',
      'Este é um teste de impressão do QZ Tray\n',
      'Data: ' + new Date().toLocaleString() + '\n',
      '\n\n\n\n\n' // Adicionar algumas quebras de linha para avançar o papel
    ];
    
    // Enviar o trabalho de impressão para o QZ Tray
    await qz.print(config, data);
    console.log('Página de teste enviada para a impressora:', printerName);
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao imprimir página de teste:', error);
    return Promise.reject(error);
  }
}

// Desconectar do QZ Tray
export async function disconnectQzTray(): Promise<void> {
  try {
    await qz.websocket.disconnect();
    console.log('Desconectado do QZ Tray');
    return Promise.resolve();
  } catch (error) {
    console.error('Erro ao desconectar do QZ Tray:', error);
    return Promise.reject(error);
  }
} 