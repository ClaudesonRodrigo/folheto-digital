Plataforma de Folheto Digital para Mercearias
🎯 Sobre o Projeto
O Folheto Digital é uma plataforma SaaS (Software as a Service) desenvolvida para modernizar a maneira como pequenas e médias mercearias divulgam suas promoções. A solução substitui os tradicionais e custosos folhetos de papel por uma versão digital, interativa e de fácil compartilhamento, que se integra diretamente ao WhatsApp para facilitar as vendas.
Este projeto foi criado para resolver um problema real: os altos custos e a baixa eficiência do marketing impresso para o pequeno varejista. Com nossa plataforma, o dono da mercearia pode criar, atualizar e distribuir suas ofertas em minutos, alcançando milhares de clientes de forma econômica e mensurável.
✨ Funcionalidades Principais
A plataforma é dividida em duas frentes principais: o painel administrativo para o lojista e a visualização do folheto para o cliente final.
🧑‍💼 Painel de Administração (admin.html)
 * Autenticação Segura: Acesso ao painel protegido por e-mail e senha.
 * Gerenciamento de Lojas: O administrador pode criar, editar e excluir múltiplas mercearias.
 * Cadastro de Endereço Inteligente: Preenchimento automático de endereço a partir do CEP (ViaCEP API).
 * Upload de Logo: Envio de imagens para a logo da mercearia, com upload e hospedagem via Cloudinary.
 * Gerenciamento de Produtos: Para cada loja, é possível adicionar, editar e excluir produtos, definindo nome, descrição, preço e imagem.
 * Destaque de Promoções: Opção de marcar um produto como "promocional" para que ele apareça no folheto principal.
 * Geração de Link Único: Cada mercearia tem seu próprio link para o folheto, facilitando o compartilhamento.
🛒 Folheto Digital (folheto.html)
 * Visual Moderno e Responsivo: O folheto se adapta a qualquer tela, seja celular, tablet ou computador.
 * Carregamento Dinâmico: As informações da loja e os produtos são carregados diretamente do banco de dados Firebase.
 * Modal de Detalhes do Produto: Ao clicar em um produto, um pop-up exibe a imagem, nome, descrição e preço.
 * Integração com WhatsApp:
   * Um botão flutuante permite que o cliente inicie uma conversa geral com a loja.
   * Dentro do modal de cada produto, o botão "Tenho Interesse" cria uma mensagem personalizada, agilizando o pedido.
 * Mapa de Localização: Exibe a localização da loja física através do Google Maps.
🚀 Tecnologias Utilizadas
Este projeto foi construído com foco em tecnologias modernas, escaláveis e de baixo custo, ideais para um MVP robusto.
 * Frontend:
   *    *    * (ES6 Modules)
 * Backend & Banco de Dados (Serverless):
   *      * Firestore: Banco de dados NoSQL para armazenar dados das lojas e produtos.
     * Firebase Authentication: Para o sistema de login do painel administrativo.
 * Serviços de Terceiros:
   * : Para hospedagem e otimização das imagens de produtos e logos.
   * ViaCEP API: Para consulta e preenchimento de endereços.
 * Hospedagem & Deploy:
   * : Para deploy contínuo e hospedagem do frontend.
🔧 Como Rodar o Projeto Localmente
Para executar este projeto em sua máquina local, você precisará de um servidor web simples. A forma mais fácil é usar a extensão Live Server no Visual Studio Code.
 * Clone o repositório:
   git clone [https://github.com/Claudesonrodrigo/folheto-digital.git](https://github.com/Claudesonrodrigo/folheto-digital.git)

 * Abra a pasta do projeto no VS Code:
   cd folheto-digital
code .

 * Configure suas chaves do Firebase:
   * Vá para o arquivo js/config.js.
   * Substitua o objeto firebaseConfig pelas credenciais do seu próprio projeto no Firebase.
 * Inicie o Live Server:
   * Com o VS Code aberto, clique com o botão direito no arquivo index.html.
   * Selecione "Open with Live Server".
 * Acesse o painel de administração:
   * Navegue para /login.html para acessar a área de login.
   * Importante: Você precisará criar um usuário manualmente no painel do Firebase Authentication para poder fazer login.
🔗 Demonstração
Você pode ver o projeto em ação através do link abaixo:
 * Acessar a Landing Page do Folheto Digital
👨‍💻 Contato
Feito com ❤️ por Claudeson Rodrigo (Carioca).


