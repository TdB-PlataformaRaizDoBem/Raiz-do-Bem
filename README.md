<div align="center">

<img src="./public/TDB_logo.svg" alt="Logo Turma do Bem" width="80" />


# Raiz do Bem
### Plataforma Digital da Turma do Bem (TdB)

> *"Usar a tecnologia como raiz para espalhar cuidado, esperança e dignidade."* 🌻

<br/>

[🌐 Acessar o site](https://raiz-do-bem.vercel.app/) &nbsp;·&nbsp;
[📁 Repositório](https://github.com/TdB-PlataformaRaizDoBem/Raiz-do-Bem) &nbsp;·&nbsp;
[🎨 Organização](https://github.com/TdB-PlataformaRaizDoBem) &nbsp;·&nbsp;
[🎥 Pitch](https://youtu.be/3qlfh8A-jWM) &nbsp;·&nbsp;
[🎥 Como Usar](https://1drv.ms/f/c/b0ad38be1ceef4ff/IgAlG98XUoZGQ61FEvMsyMTOAerK_bjnil6JWOr8vByswcg?e=rlFmSF)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura e Documentação](#-arquitetura-e-documentação)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Executar Localmente](#-como-executar-localmente)
- [Páginas e Funcionalidades](#-páginas-e-funcionalidades)
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
| **TanStack Query** | 5.x | Cache de requisições: dados compartilhados entre telas, sem buscas repetidas |
| **React Hook Form** | 7.x | Gerenciamento e validação de formulários |
| **Leaflet / React-Leaflet** | 1.9 / 5.x | Mapa de vulnerabilidade social |
| **GSAP, Lenis** | 3.x / 1.x | Animações e scroll suave da área pública |

---

## 📚 Arquitetura e Documentação

| Documento | Conteúdo |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Camadas, fluxo de dados, cache, autenticação, rotas e como adicionar uma funcionalidade |

O front-end conversa com três serviços: a **API principal** (Java), o chat **ms-sandbox-menager** (WhatsApp) e a **vulnerabilidade-api** (mapa). Diagrama em [`ARCHITECTURE.md`](ARCHITECTURE.md#visão-geral).

---

## 📁 Estrutura de Pastas

```
Raiz-do-Bem/
├── public/                    # Arquivos estáticos (logo)
├── ARCHITECTURE.md            # Guia de arquitetura
├── src/
│   ├── assets/                # Imagens e SVGs
│   ├── domain/                # ① DOMÍNIO (sem React)
│   │   ├── entities/          #    Formato dos dados da API
│   │   ├── mappers/           #    API → ViewModel (formatação de CPF, datas, status)
│   │   └── types/             #    Enums, tipos de autenticação
│   ├── services/              # ② SERVIÇOS (HTTP, sem React)
│   │   ├── httpClient.ts      #    safeFetch / publicFetch: token, renovação, erros
│   │   ├── tokenStore.ts      #    Tokens JWT na localStorage
│   │   └── *Service.ts        #    Um arquivo por recurso (Pedido, Beneficiario, Dentista...)
│   ├── hooks/                 # ③ HOOKS (leitura em cache, filtros, formulários, voz, animações)
│   ├── context/               #    Sessão (Auth), mensagens não lidas e leitura em voz
│   ├── lib/                   #    Cliente do TanStack Query e GSAP
│   ├── components/            # ④ COMPONENTES (UI reutilizável)
│   │   ├── ui/                #    Botão, modal, toast, paginação, busca
│   │   ├── forms/             #    Formulários de criação e edição
│   │   ├── details/           #    Painéis de detalhe por entidade
│   │   ├── chat/              #    Tela de conversas
│   │   └── vulnerabilityMap/  #    Mapa e painéis de análise
│   ├── pages/                 # ⑤ PÁGINAS (uma pasta por tela; ações de escrita ficam aqui)
│   ├── Routes/                #    Rotas públicas e ProtectedRoutes (autenticação + role)
│   ├── layout/                #    PublicLayout, AuthLayout e AppLayout
│   ├── utils/                 #    Formatação, datas, CSV e geo
│   ├── styles/                #    Tailwind, tema e Leaflet
│   ├── __tests__/             #    Testes, espelhando as camadas
│   ├── test/                  #    Fábricas e mocks de teste
│   ├── App.tsx                #    Providers e rotas
│   └── main.tsx               #    Ponto de entrada
├── .env.template              # Modelo das variáveis de ambiente
├── vercel.json                # Deploy: reescrita das rotas da SPA
└── vite.config.ts
```

---

## 🚀 Como Executar Localmente

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18+, npm 9+ e Git.

```bash
git clone https://github.com/TdB-PlataformaRaizDoBem/Raiz-do-Bem
cd Raiz-do-Bem
npm install
cp .env.template .env.local   # ajuste as URLs abaixo
npm run dev                   # http://localhost:5173
```

| Variável | Serviço | Valor local padrão |
|---|---|---|
| `VITE_API_BASE_URL` | API principal (domínio e autenticação) | `http://localhost:8080` |
| `VITE_CHAT_API_URL` | Chat WhatsApp (`ms-sandbox-menager`) | `http://localhost:8000` |
| `VITE_GEO_API_URL` | Mapa de vulnerabilidade (`vulnerabilidade-api`) | `http://localhost:8000` |

> As duas APIs em FastAPI usam a porta 8000 por padrão. Para rodá-las juntas, suba uma em outra porta (`uvicorn app.main:app --port 8001`) e ajuste a variável. Sem a API principal no ar, login e telas internas não funcionam.

| Variável | Serviço | Valor local padrão |
|---|---|---|
| `VITE_API_BASE_URL` | API principal (domínio e autenticação) | `http://localhost:8080` |
| `VITE_CHAT_API_URL` | Chat WhatsApp (`ms-sandbox-menager`) | `http://localhost:8000` |
| `VITE_GEO_API_URL` | Mapa de vulnerabilidade (`vulnerabilidade-api`) | `http://localhost:8000` |

> As duas APIs em FastAPI usam a porta 8000 por padrão. Para rodá-las juntas, suba uma delas em outra porta (`uvicorn app.main:app --port 8001`) e ajuste a variável correspondente. Sem a API principal no ar, o login e as telas internas não funcionam.

### 🔧 Outros Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload |
| `npm run build` | Gera a versão otimizada para produção na pasta `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Analisa o código em busca de erros e más práticas |
| `npm test` | Executa `vitest run` (veja a nota em [Testes](#-testes)) |
| `npm run test:watch` | Executa `vitest` em modo contínuo |

---

### 🧪 Testes

Ficam em `src/__tests__/` (por camada); fábricas e mocks em `src/test/`. Nenhum teste chama a API real.

O único executor é o **Vitest** (ambiente `jsdom`, configurado em `vite.config.ts`):

```bash
npm test               # roda tudo e exige 92% de cobertura (meta do projeto)
npm run test:watch     # modo interativo
```

Detalhes em [`ARCHITECTURE.md`](ARCHITECTURE.md#testes).

---

### ⚠️ Problemas Comuns

- **`npm` não é reconhecido:** instale o Node.js LTS e reinicie o terminal.
- **Porta 5173 em uso:** o Vite usa a próxima livre; veja a URL no terminal.
- **Erro no `npm install`:** rode `npm cache clean --force` e tente de novo.

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

O login (`/auth/login`) usa a API principal e devolve um JWT; o perfil vem do token. Existem dois perfis: **Administrador** (`ADMIN`) e **Coordenador** (`COLABORADOR`). Beneficiários e dentistas são cadastros gerenciados pela equipe e **não têm login**.

| Funcionalidade | Coordenador | Administrador |
|---|:---:|:---:|
| Painel geral (indicadores e gráficos) | ✔ | ✔ |
| Pedidos de ajuda: aprovar e suspender | ✔ | ✔ |
| Beneficiários e dentistas: listar, criar e editar | ✔ | ✔ |
| Atendimento: designar e encerrar | ✔ | ✔ |
| Conversas por WhatsApp | ✔ | ✔ |
| Excluir beneficiários e dentistas | — | ✔ |
| Exportar CSV | — | ✔ |
| Gestão de colaboradores | — | ✔ |
| Mapa de vulnerabilidade social | — | ✔ |

As contas de acesso são criadas na API principal por um administrador (**Colaboradores → Novo**); não há contas de teste embutidas no front-end.

---

## 👥 Integrantes do Grupo

<table>
  <tr>
    <td align="center">
      <b>Renan Paulino</b><br/>
      <sub>1TDSPS - RM566610</sub><br/>
      <a href="https://www.linkedin.com/in/renansilvapaulino/" target="_blank">LinkedIn - Renan</a>
    </td>
    <td align="center">
      <b>Murilo Ayabe</b><br/>
      <sub>1TDSPS - RM567479</sub><br/>
      <a href="https://www.linkedin.com/in/muriloayabe/" target="_blank">LinkedIn - Murilo</a>
    </td>
    <td align="center">
      <b>Paulo Cavalcante</b><br/>
      <sub>1TDSPS - RM566667</sub><br/>
      <a href="https://www.linkedin.com/in/paulocavalcantec/" target="_blank">LinkedIn - Paulo</a>
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