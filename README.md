<div align="center">

<img src="./public/TDB_logo.svg" alt="Logo Turma do Bem" width="80" />


# Raiz do Bem
### Plataforma Digital da Turma do Bem (TdB)

> *"Usar a tecnologia como raiz para espalhar cuidado, esperança e dignidade."* 🌻

<br/>

[🌐 Acessar o site](https://raiz-do-bem.vercel.app/) &nbsp;·&nbsp;
[📁 Repositório](https://github.com/TdB-PlataformaRaizDoBem/Raiz-do-Bem) &nbsp;·&nbsp;
[🎨 Organização](https://https://github.com/TdB-PlataformaRaizDoBem)
[🎥 Pitch](https://youtu.be/3qlfh8A-jWMm)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Executar Localmente](#-como-executar-localmente)
- [Páginas e Funcionalidades](#-páginas-e-funcionalidades)
- [Links Importantes](#-links-importantes)
- [Integrantes do Grupo](#-integrantes-do-grupo)
- [Licença](#-licença)

---

## 📖 Sobre o Projeto

A **Raiz do Bem** é uma plataforma web desenvolvida como solução para o **TdB Challenge**, desafio acadêmico proposto pela **FIAP** em parceria com a ONG **Turma do Bem**.

A ONG Turma do Bem conecta dentistas a jovens em situação de vulnerabilidade social, oferecendo atendimento odontológico gratuito. A plataforma surge para **digitalizar e centralizar toda essa operação**, eliminando processos manuais e integrando todos os perfis de usuário em um único sistema.

### 🎯 O que a plataforma resolve

| Problema | Solução |
|---|---|
| Cadastros e triagens feitos manualmente | Formulários digitais integrados ao sistema |
| Dificuldade de engajar dentistas voluntários | Página dedicada à inscrição de voluntários |
| Falta de visibilidade dos dados da ONG | Dashboard com métricas e relatórios de impacto |
| Comunicação fragmentada entre áreas | Perfis distintos por tipo de usuário (admin, colaborador ) |
| Gestão de pedidos de ajuda sem rastreabilidade | Módulo de acompanhamento de pedidos com status |

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React** | 19.x | Biblioteca principal para construção da interface |
| **TypeScript** | 5.9.x | Tipagem estática e segurança no desenvolvimento |
| **Vite** | 7.x | Bundler e servidor de desenvolvimento ultrarrápido |
| **Tailwind CSS** | 4.x | Estilização utilitária e responsividade |
| **React Router DOM** | 7.x | Gerenciamento de rotas e navegação entre páginas |
| **React Hook Form** | 7.x | Gerenciamento e validação de formulários |

---

## 📁 Estrutura de Pastas

```
Raiz-do-Bem/
├── public/
│   └── TDB_logo.svg                    # Logo exibida no navegador
│
├── src/
│   ├── assets/
│   │   ├── img/                        # Imagens (fotos, banners, mascote Dentinho)
│   │   └── svgs/                       # Ícones e ilustrações vetoriais
│   │
│   ├── data/                           # ① CAMADA DE DADOS (mock)
│   │   ├── auth.tsx                    # Credenciais e lógica de autenticação
│   │   ├── beneficiariosData.tsx       # Dados e tipos dos beneficiários
│   │   ├── colaboradorData.tsx         # Dados e tipos dos colaboradores
│   │   ├── dentistasData.tsx           # Dados e tipos dos dentistas
│   │   └── pedidosAjudaData.tsx        # Dados e tipos dos pedidos de ajuda
│   │
│   ├── services/                       # ② CAMADA DE SERVIÇOS (acesso a dados)
│   │   ├── Beneficiarioservice.tsx     # getBeneficiariosCompletos, getBeneficiarioCompleto
│   │   ├── ColaboradorService.tsx      # getColaboradoresCompletos, getColaboradorCompleto
│   │   ├── DentistaService.tsx         # getDentistasCompletos, getDentistasProximos
│   │   ├── PedidoService.tsx           # getPedidosCompletos, aprovarPedido, negarPedido
│   │   └── DesignacaoService.tsx       # getDesignacoes e operações relacionadas
│   │
│   ├── hooks/                          # ③ CAMADA DE ESTADO (custom hooks)
│   │   ├── useAsync.tsx                # Hook genérico: AsyncState<T> tipado (idle/loading/success/error)
│   │   ├── useBeneficiarios.tsx        # useBeneficiarios · useBeneficiario(id)
│   │   ├── useDentistas.tsx            # useDentistas · useDentista(id) · useDentistasProximos
│   │   ├── useColaboradores.tsx        # useColaboradores · useColaborador(id)
│   │   ├── usePedidos.tsx              # usePedidos · usePedido(id) · usePedidosAprovadosLivres
│   │   ├── useDesignacao.tsx           # Lógica de designação de casos
│   │   ├── useAuth.tsx                 # Autenticação e controle de sessão
│   │   ├── useCep.tsx                  # Busca de endereço por CEP (autocomplete)
│   │   ├── useDashboardData.tsx        # Métricas agregadas para o painel
│   │   ├── useImpactStats.tsx          # Estatísticas de impacto social
│   │   ├── useNotification.tsx         # Sistema de notificações (Toast)
│   │   ├── useOrderState.tsx           # Estado de pedidos
│   │   ├── useProfessionalStats.tsx    # Estatísticas por dentista
│   │   ├── useScrollLock.tsx           # Bloqueia scroll quando modais estão abertos
│   │   ├── useUser.tsx                 # Dados do usuário autenticado
│   │   └── validateAge.tsx             # Validação de idade mínima nos formulários
│   │
│   ├── components/                     # ④ CAMADA DE APRESENTAÇÃO
│   │   ├── details/                    # Componentes de detalhe por entidade
│   │   │   ├── BeneficiarioDetails.tsx # Detalhe completo com seções isoladas
│   │   │   ├── DentistaDetails.tsx     # Detalhe do dentista voluntário
│   │   │   ├── ColaboradorDetails.tsx  # Detalhe do colaborador/coordenador
│   │   │   ├── DesignacaoDetails.tsx   # Detalhe de designação de caso
│   │   │   └── PedidosDetails.tsx      # Detalhe de pedido de ajuda
│   │   ├── ui/
│   │   │   ├── AsyncEstado.tsx         # Feedback padronizado: loading · erro · vazio
│   │   │   ├── Button.tsx              # Botão com variantes (primary, secondary...)
│   │   │   ├── Modal.tsx               # Modal reutilizável
│   │   │   ├── Toast.tsx               # Notificações temporárias
│   │   │   ├── Search.tsx              # Campo de busca
│   │   │   ├── FilterBar.tsx           # Barra de filtros
│   │   │   └── buttonFilters/          # Botões de ação (editar, deletar, etc.)
│   │   ├── asidebar/                   # Sidebar lateral de navegação interna
│   │   ├── context/                    # Context API para notificações globais
│   │   ├── footer/                     # Rodapé do site
│   │   ├── formElements/               # Inputs e TextAreas genéricos reutilizáveis
│   │   ├── forms/
│   │   │   ├── create/                 # Formulários de cadastro (beneficiário, dentista, coord)
│   │   │   └── update/                 # Formulários de edição
│   │   ├── header/                     # Cabeçalho do site público
│   │   ├── impactChart/                # Gráfico de impacto social
│   │   ├── orderStatusBarChart/        # Gráfico de status de pedidos
│   │   ├── pendingOrdersList/          # Lista de pedidos pendentes
│   │   ├── staticCard/                 # Cards de métricas do dashboard
│   │   ├── StateRanking/               # Ranking de estados por atendimentos
│   │   ├── UserManagement.tsx/         # Página de gestão de usuários
│   │   ├── userActions/                # Barra de ações por perfil
│   │   ├── userCard/                   # Card de exibição de usuário
│   │   ├── userHeader/                 # Header interno pós-login
│   │   └── userInformation/            # Container de informações detalhadas
│   │
│   ├── pages/                          # Páginas da aplicação (uma pasta por rota)
│   │   ├── home/                       # Página inicial (landing page)
│   │   ├── about/                      # Sobre a TdB
│   │   ├── contact/                    # Contato e formulário de pedido de ajuda
│   │   ├── faq/                        # Perguntas frequentes
│   │   ├── login/                      # Login com autenticação por perfil
│   │   ├── voluntary/                  # Inscrição de dentistas voluntários
│   │   ├── Team/                       # Equipe de desenvolvimento
│   │   ├── dashboard/                  # Painel principal pós-login
│   │   ├── admin/                      # Painel do administrador + colaboradores
│   │   ├── coord/                      # Painel do coordenador
│   │   ├── gerenciaBeneficiarios/      # Gestão de beneficiários
│   │   ├── gerenciaDentistas/          # Gestão de dentistas voluntários
│   │   ├── designacao/                 # Designação de casos a dentistas
│   │   ├── pedidosAjuda/               # Pedidos de ajuda recebidos
│   │   └── reports/                    # Relatórios e métricas
│   │
│   ├── Routes/
│   │   ├── Routes.tsx                  # Definição de todas as rotas
│   │   └── ProtectedRoutes.tsx         # Rotas protegidas por autenticação e perfil
│   │
│   ├── layout/
│   │   ├── Layout.tsx                  # Layout base com Header e Footer
│   │   └── ScrollToTop.tsx             # Scroll para o topo ao navegar entre rotas
│   │
│   ├── App.tsx                         # Componente raiz
│   ├── main.tsx                        # Ponto de entrada — monta o React no DOM
│   └── index.css                       # Estilos globais e configuração do Tailwind
│
├── vercel.json                         # Configuração de deploy (redirecionamento de rotas SPA)
├── index.html                          # HTML base do Vite
├── package.json                        # Dependências e scripts
├── tsconfig.json                       # Configuração do TypeScript
└── vite.config.ts                      # Configuração do Vite
```

---

## 🚀 Como Executar Localmente

Siga o passo a passo abaixo para rodar o projeto na sua máquina. O processo é simples e leva menos de 5 minutos.

### ✅ Pré-requisitos

Antes de começar, verifique se você tem as seguintes ferramentas instaladas:

- **Node.js** — versão **18 ou superior** ([Baixar aqui](https://nodejs.org/))
- **npm** — já vem junto com o Node.js *(versão 9 ou superior)*
- **Git** — para clonar o repositório ([Baixar aqui](https://git-scm.com/))

> 💡 **Como verificar se já tem instalado?** Abra o terminal e rode os comandos abaixo. Se aparecer um número de versão, está tudo certo!

```bash
node --version
npm --version
git --version
```

---

### 📦 Passo a Passo

**1. Clone o repositório**

Abra o terminal na pasta onde deseja salvar o projeto e execute:

```bash
git clone https://github.com/TdB-PlataformaRaizDoBem/Raiz-do-Bem
```

**2. Acesse a pasta do projeto**

```bash
cd raiz-do-bem
```

**3. Instale as dependências**

Este comando irá baixar todas as bibliotecas necessárias (React, TypeScript, Tailwind, etc.):

```bash
npm install
```

> ⏳ Aguarde a instalação terminar. Isso pode levar alguns segundos dependendo da sua conexão.

**4. Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

**5. Acesse no navegador**

Após rodar o comando acima, o terminal exibirá uma mensagem como esta:

```
  VITE v7.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abra seu navegador e acesse: **[http://localhost:5173](http://localhost:5173)**

🎉 **Pronto! A plataforma Raiz do Bem está rodando localmente.**

---

### 🔧 Outros Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload |
| `npm run build` | Gera a versão otimizada para produção na pasta `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Analisa o código em busca de erros e más práticas |

---

### ⚠️ Problemas Comuns

<details>
<summary><strong>Erro: "npm não é reconhecido como comando"</strong></summary>

O Node.js não está instalado ou não foi adicionado ao PATH. Acesse [nodejs.org](https://nodejs.org/) e baixe a versão LTS. Reinicie o terminal após a instalação.

</details>

<details>
<summary><strong>Erro: "porta 5173 já está em uso"</strong></summary>

Outra aplicação está usando essa porta. O Vite irá automaticamente tentar a próxima porta disponível (5174, 5175...). Basta acessar a URL que aparecer no terminal.

</details>

<details>
<summary><strong>Erro durante o "npm install"</strong></summary>

Tente limpar o cache do npm e reinstalar:

```bash
npm cache clean --force
npm install
```

</details>

---

## 📄 Páginas e Funcionalidades

### 🌐 Área Pública

| Página | Descrição |
|---|---|
| **Home** | Landing page com apresentação da plataforma e chamada para ação |
| **Sobre** | História, missão, visão e valores da Turma do Bem |
| **Seja Voluntário** | Formulário de inscrição para dentistas voluntários |
| **FAQ** | Perguntas frequentes para beneficiários, voluntários e doadores |
| **Contato** | Formulário de contato e pedidos de ajuda |
| **Integrantes** | Equipe de desenvolvimento da plataforma |
| **Login** | Autenticação de usuários por perfil |

### 🔒 Área Interna (pós-login)

| Perfil | Acesso |
|---|---|
| **Administrador** | Painel geral, gestão de colaboradores, relatórios completos |
| **Coordenador** | Dashboard, gestão de beneficiários, dentistas, pedidos e designações |
| **Dentista** | Perfil profissional, tarefas atribuídas e registro de atendimentos |

### Perfis de Teste
| Conta | Senha |
|---|---|
| **admin@raizdobem.org** | 123 |
| **coord@raizdobem.org** | 123 |
---

> Importante: Para total visualização da plataforma estática recomendamos acessar as páginas internas (privadas) com os usuários da tabela acima.

## 🔗 Links Importantes

| Recurso | Link |
|---|---|
| 🌐 Site em produção | [https://tdb-plataformaraizdobem.github.io/Front-End/](https://tdb-plataformaraizdobem.github.io/Front-End/) |
| 📁 Repositório Front-End | [https://github.com/TdB-PlataformaRaizDoBem/Front-End](https://github.com/TdB-PlataformaRaizDoBem/Front-End) |
| 🏢 Organização no GitHub | [https://github.com/TdB-PlataformaRaizDoBem](https://github.com/TdB-PlataformaRaizDoBem) |
| 🎥 Pitch Explicativo do Código e Telas | [https://youtu.be/3qlfh8A-jWM](https://youtu.be/3qlfh8A-jWM) |

---

## 👥 Integrantes do Grupo

<table>
  <tr>
    <td align="center">
      <b>Renan Paulino</b><br/>
      <sub>RM566610</sub>
    </td>
    <td align="center">
      <b>Murilo Ayabe</b><br/>
      <sub>RM567479</sub>
    </td>
    <td align="center">
      <b>Paulo Cavalcante</b><br/>
      <sub>RM566667</sub>
</sub>
    </td>
  </tr>
</table>

> Projeto desenvolvido para o **TdB Challenge** — iniciativa acadêmica da **FIAP** em parceria com a ONG **Turma do Bem**.

---

## 🪪 Licença

Este projeto foi desenvolvido exclusivamente para fins **educacionais e sociais**, sem fins lucrativos.  
Todos os direitos reservados à **Turma do Bem** © 2025.

---

<div align="center">
  <sub>Feito por Renan Paulino, Murilo Ayabe e Paulo Cavalcante · FIAP 2026</sub>
</div>