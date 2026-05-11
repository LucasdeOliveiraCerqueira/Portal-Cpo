# 📚 Plataforma Educacional Corporativa - Documentação Completa

## 📋 Sumário
1. [Visão Geral](#visão-geral)
2. [Arquitetura da Aplicação](#arquitetura-da-aplicação)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Como Editar Cada Componente](#como-editar-cada-componente)
5. [Sistema de Configuração](#sistema-de-configuração)
6. [Guia de Anexos (Materiais)](#guia-de-anexos)
7. [Cores e Branding](#cores-e-branding)

---

## 🎯 Visão Geral

Uma plataforma educacional corporativa que organiza conteúdo de 15 disciplinas do ensino médio.

**Características principais:**
- ✅ 15 disciplinas com interface consistente
- ✅ Sistema de 6 livros por disciplina (personalizável)
- ✅ Submatérias/divisões por disciplina (ex: "Mat 1", "Mat 2")
- ✅ Capítulos organizados em accordions expansíveis
- ✅ Anexos (materiais) com links de visualizar/baixar
- ✅ Filtro de disciplinas por categoria
- ✅ Design corporativo com tema azul (#1a3a52 / #2c5282)
- ✅ Totalmente responsivo (mobile, tablet, desktop)
- ✅ Sem frameworks (HTML5, CSS3, JavaScript vanilla)

---

## 🏗️ Arquitetura da Aplicação

### Fluxo de Navegação

```
index.html (Home)
    ↓
[Usuário clica em "Matemática"]
    ↓
pages/matematica.html (Página da Disciplina)
    ↓
[Define window.subjectBookConfig com livros/submatérias]
    ↓
[Usuário clica em "Mat 1 > Livro 1"]
    ↓
pages/livro.html?subject=matematica&subsubject=Mat%201&book=1
    ↓
[setupBookPage() renderiza capítulos com anexos]
    ↓
Exibe 24 capítulos como accordions com materiais
```

### Componentes Principais

#### 1. **index.html** - Página Inicial
- **Seção de Recepção**: Hero com título e filtros
- **Botões de Filtro**: 6 categorias para filtrar disciplinas
- **Grid de Disciplinas**: 15 cards clicáveis com ícones e emojis
- Cada card tem:
  - `data-categories="categoria1 categoria2"` → usado para filtros
  - `onclick="goToSubject('slug')"` → navegação
  - **Efeito ripple**: ondinha de clique quando pressionado

#### 2. **pages/{disciplina}.html** - Página da Disciplina
- **Navbar**: Fixa no topo
- **Seção de Tópicos**: Lista de tópicos da disciplina
- **Seção de Livros**: Injetada dinamicamente por `setupSubjectBookNavigation()`
- **Bloco de Configuração**: `window.subjectBookConfig` define:
  ```javascript
  window.subjectBookConfig = {
      subsubjects: {
          'Mat 1': {
              books: {...},
              attachments: {...}
          },
          'Mat 2': {...}
      }
  }
  ```

#### 3. **pages/livro.html** - Página de Livro (genérica)
- Renderiza qualquer livro dinamicamente baseado em URL params
- URL estrutura: `livro.html?subject=X&book=Y&subsubject=Z`
- `setupBookPage()` preenche:
  - `[data-book-title]` → Título
  - `[data-book-subtitle]` → Número de capítulos
  - `[data-chapters-grid]` → Lista de accordions

#### 4. **script.js** - Lógica da Aplicação
**Funções principais:**

| Função | Propósito |
|--------|-----------|
| `goToSubject(slug)` | Navega para pages/{slug}.html |
| `normalizeBookCollection(config)` | Processa config de livros |
| `normalizeSubjectBookConfig(config)` | Processa config de submatérias |
| `persistSubjectBookConfig(slug)` | Salva config no localStorage |
| `getSubjectBookConfig(slug)` | Recupera config do localStorage |
| `setupSubjectBookNavigation()` | Cria seção de livros na página |
| `setupBookPage()` | Renderiza capítulos e anexos |

#### 5. **style.css** - Estilos Globais
**Estrutura de seções:**
- `body, *` → Reset e variáveis globais
- `.navbar` → Barra fixa no topo (azul escuro #1a3a52)
- `.reception` → Hero section com filtros
- `.filter-chip` → Botões de categoria
- `.subject-card` → Card de disciplina (com ripple)
- `.books-section` → Grupo de livros/submatérias
- `.chapter-accordion` → Details/summary customizado
- `@media (max-width: 768px)` → Responsivo para tablets
- `@media (max-width: 480px)` → Responsivo para mobile

---

## 📂 Estrutura de Arquivos

```
p1/
├── index.html              # Página inicial com filtros e cards
├── style.css               # Estilos CSS globais (~900 linhas)
├── script.js               # Lógica JavaScript (~500 linhas comentadas)
│
├── pages/
│   ├── livro.html          # Página genérica para qualquer livro
│   ├── matematica.html     # Página da disciplina Matemática
│   ├── gramatica.html      # Página da disciplina Gramática
│   ├── biologia.html       # ... (e 12 mais)
│   ├── fisica.html
│   ├── quimica.html
│   ├── historia.html
│   ├── geografia.html
│   ├── ingles.html
│   ├── filosofia.html
│   ├── sociologia.html
│   ├── arte.html
│   ├── redacao.html
│   ├── interpretacao.html
│   ├── conhecimentos-adicionais.html
│   └── literatura.html
│
└── docs/                   # (opcional) Pasta para armazenar anexos
    └── materiais/          # PDFs, vídeos, etc.
```

---

## 🔧 Como Editar Cada Componente

### ✏️ 1. Adicionar uma Nova Disciplina

**Passo 1:** Criar arquivo em `pages/nova-disciplina.html`
- Copie o conteúdo de `pages/biologia.html`
- Troque o `<title>` e o nome da disciplina
- Atualize `window.subjectBookConfig` com submatérias/anexos

**Passo 2:** Adicionar card em `index.html`
```html
<article class="subject-card" data-categories="categoria" onclick="goToSubject('nova-disciplina')">
    <span class="subject-icon">🎓</span>
    <h2>Nome da Disciplina</h2>
    <p>Descrição breve do conteúdo</p>
</article>
```

**Passo 3:** Adicionar entrada em `script.js` (função `goToSubject`)
```javascript
const subjectPages = {
    ...
    'nova-disciplina': 'pages/nova-disciplina.html',
    ...
};
```

**Passo 4:** Adicionar label em `script.js` (objeto `subjectLabels`)
```javascript
const subjectLabels = {
    ...
    'nova-disciplina': 'Nome da Disciplina',
    ...
};
```

---

### 🎨 2. Editar Filtros de Categoria

**Arquivo:** `index.html`

**Adicionar novo filtro:**
```html
<!-- Antes da seção subjects-grid -->
<button class="filter-chip" data-filter="nova-categoria">Nova Categoria</button>
```

**Adicionar card a uma categoria:**
```html
<article class="subject-card" data-categories="nova-categoria outra-categoria">
    <!-- ... -->
</article>
```

**Remover um filtro:** Delete o botão `<button class="filter-chip" data-filter="...">` e qualquer referência em `data-categories`.

---

### 📚 3. Editar Livros e Submatérias

**Arquivo:** `pages/{disciplina}.html`

**Estrutura básica:**
```javascript
window.subjectBookConfig = {
    subsubjects: {
        'Mat 1': {
            books: {
                1: { title: 'Livro 1', chapters: 24 },
                2: { title: 'Livro 2', chapters: 24 },
                // ... até 6
            },
            attachments: { /* ... */ }
        },
        'Mat 2': {
            // Se não definir books, recebe os 6 padrão automaticamente
            attachments: { /* ... */ }
        }
    }
};
```

**Adicionar uma submatéria:**
```javascript
'Bio 3': {
    attachments: {}  // Recebe os 6 livros padrão
}
```

**Personalizar livros de uma submatéria:**
```javascript
'Mat 1': {
    books: {
        1: { title: 'Frente 1', chapters: 18 },
        2: { title: 'Frente 2', chapters: 20 },
        // ... restante dos 6 livros
    },
    attachments: {}
}
```

---

### 📎 4. Adicionar Anexos (Materiais)

**Arquivo:** `pages/{disciplina}.html`

**Estrutura de anexos:**
```javascript
attachments: {
    1: {           // Livro 1
        5: [        // Capítulo 5
            {
                label: 'Apostila - Introdução',
                viewUrl: '../docs/materiais/livro1-cap5.pdf',
                downloadUrl: '../docs/materiais/livro1-cap5.pdf'
            },
            {
                label: 'Vídeo Aula',
                viewUrl: 'https://youtube.com/watch?v=...',
                downloadUrl: ''  // Vazio se não tem download
            }
        ],
        6: [        // Capítulo 6
            {
                label: 'Exercícios',
                viewUrl: '../docs/exercicios/livro1-cap6.pdf',
                downloadUrl: '../docs/exercicios/livro1-cap6.pdf'
            }
        ]
    },
    2: { /* ... */ }  // Livro 2
}
```

**Como aparecem:**
- Quando um usuário abre "Livro 1 > Capítulo 5"
- Vê o título "Capítulo 5" em um accordion
- Expande e mostra os anexos com links:
  ```
  Apostila - Introdução  [Visualizar] [Baixar]
  Vídeo Aula             [Visualizar]
  ```

---

### 🎨 5. Editar Cores e Tema

**Arquivo:** `style.css`

**Cores principais:**
```css
#1a3a52  /* Azul escuro - navbar, títulos, bordas */
#2c5282  /* Azul médio - hover estados */
#3498db  /* Azul claro - barra lateral de cards */
#f5f7fa  /* Fundo claro */
#e3e8ee  /* Divisores */
#7f8c8d  /* Texto cinza (secundário) */
```

**Onde mudar:**
- `.navbar { background: #1a3a52; }` → Cor da navbar
- `.reception { background: linear-gradient(...#1a3a52...); }` → Hero
- `.subject-card { border-left: 4px solid #3498db; }` → Barra lateral
- `.chapter-accordion { border-left: 4px solid #3498db; }` → Barra de capítulos
- `.book-link { background: linear-gradient(...#1a3a52...); }` → Botão de livros

---

### 📱 6. Editar Espaçamento e Layout

**Arquivo:** `style.css`

**Principais propriedades:**
```css
/* Grid de disciplinas */
.subjects-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

/* Seção de recepção */
.reception {
    padding: 60px 40px;
    margin: 40px 0 50px 0;
}

/* Responsivo */
@media (max-width: 768px) {
    .reception { padding: 40px 24px; }
    .subjects-grid { gap: 18px; }
}

@media (max-width: 480px) {
    .reception { padding: 24px 16px; }
    .subjects-grid { gap: 12px; }
}
```

---

## ⚙️ Sistema de Configuração

### Como o localStorage funciona

**Objetivo:** Persistir configuração entre recarregos de página

**Fluxo:**
1. Usuário acessa `pages/matematica.html`
2. JavaScript lê `window.subjectBookConfig` do HTML
3. Chama `persistSubjectBookConfig('matematica')`
4. Salva em: `localStorage['subjectBookConfig:matematica']`
5. Quando acessa livro, `getSubjectBookConfig('matematica')` recupera
6. Sistema renderiza capítulos conforme configuração salva

**Chaves no localStorage:**
```
subjectBookConfig:matematica
subjectBookConfig:biologia
subjectBookConfig:historia
... (uma por disciplina)
```

### Estrutura Normalizada

**Entrada (HTML):**
```javascript
window.subjectBookConfig = {
    subsubjects: {
        'Mat 1': {
            attachments: {...}
        }
    }
}
```

**Após normalização (localStorage):**
```javascript
{
    books: {
        1: { title: 'Livro 1', chapters: 24 },
        // ... 6 livros
    },
    chaptersByBook: { 1: 24, 2: 24, ... },  // Para compatibilidade
    attachments: {...},
    subsubjects: {
        'Mat 1': {
            books: { 1: {...}, ... },
            chaptersByBook: {...},
            attachments: {...}
        }
    }
}
```

---

## 📎 Guia de Anexos

### Tipos de Anexos Suportados

1. **PDF (Apostilas, Exercícios)**
   ```javascript
   {
       label: 'Apostila - Capítulo 1',
       viewUrl: '../docs/materiais/apostila.pdf',
       downloadUrl: '../docs/materiais/apostila.pdf'
   }
   ```

2. **Vídeos YouTube**
   ```javascript
   {
       label: 'Aula em Vídeo',
       viewUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
       downloadUrl: ''  // Vazio
   }
   ```

3. **Links Externos**
   ```javascript
   {
       label: 'Exercício Online',
       viewUrl: 'https://exemplo.com/exercicio',
       downloadUrl: 'https://exemplo.com/exercicio/download'
   }
   ```

### Estrutura de Pastas Recomendada

```
docs/
├── materiais/
│   ├── matematica/
│   │   ├── mat-1/
│   │   │   ├── livro1/
│   │   │   │   ├── capitulo1.pdf
│   │   │   │   └── capitulo2.pdf
│   │   │   └── livro2/
│   │   └── mat-2/
│   │       └── livro1/
│   └── biologia/
│       ├── bio-1/
│       │   └── livro1/
│       │       └── capitulo5.pdf
│       └── bio-2/
└── videos/
    └── links.txt  # URLs de vídeos do YouTube
```

### Exemplo Completo de Matemática

```javascript
window.subjectBookConfig = {
    subsubjects: {
        'Mat 1': {
            books: {
                1: { title: 'Livro 1', chapters: 12 },
                2: { title: 'Livro 2', chapters: 15 },
                3: { title: 'Livro 3', chapters: 14 },
                4: { title: 'Livro 4', chapters: 16 },
                5: { title: 'Livro 5', chapters: 13 },
                6: { title: 'Livro 6', chapters: 11 }
            },
            attachments: {
                1: {
                    1: [
                        {
                            label: 'Apostila - Conjuntos',
                            viewUrl: '../docs/materiais/matematica/mat-1/livro1/c1.pdf',
                            downloadUrl: '../docs/materiais/matematica/mat-1/livro1/c1.pdf'
                        }
                    ],
                    5: [
                        {
                            label: 'Vídeo - Funções',
                            viewUrl: 'https://youtube.com/watch?v=abc123',
                            downloadUrl: ''
                        }
                    ]
                }
            }
        },
        'Mat 2': {
            attachments: {}  // Recebe 6 livros padrão
        }
    }
};
```

---

## 🎨 Cores e Branding

### Paleta Principal

| Cor | Código | Uso |
|-----|--------|-----|
| Azul Escuro | #1a3a52 | Navbar, títulos, bordas principais |
| Azul Médio | #2c5282 | Hover estados, gradientes |
| Azul Claro | #3498db | Barras laterais, destaque |
| Branco | #ffffff | Fundo de cards |
| Fundo Claro | #f5f7fa | Background geral |
| Cinza Divisor | #e3e8ee | Linhas, separadores |
| Cinza Texto | #7f8c8d | Texto secundário |

### Ajustes de Tema

**Para mudar para tema verde:**
```css
/* style.css */
#1a3a52 → #1a5f3a  /* Azul escuro → Verde escuro */
#2c5282 → #2d7a50  /* Azul médio → Verde médio */
#3498db → #27ae60  /* Azul claro → Verde claro */
```

---

## 🚀 Próximos Passos

1. **Adicione conteúdo**: Preencha os anexos para cada capítulo
2. **Customize cores**: Adapte a paleta para sua marca
3. **Organize materiais**: Estruture pasta `docs/` com seus arquivos
4. **Teste responsivo**: Verifique em mobile, tablet e desktop
5. **Deploy**: Hospede em servidor web

---

## 📞 Suporte

Todos os arquivos possuem comentários explicativos nas seções principais:
- **script.js**: Funções documentadas com parâmetros e exemplos
- **style.css**: Seções organizadas com comentários de propósito
- **index.html**: Comentários explicando cards e filtros
- **pages/*.html**: Bloco de configuração detalhado

**Dúvidas frequentes:**
- Como adicionar uma submatéria? → Veja "Editar Livros e Submatérias"
- Onde colocar anexos? → Veja "Guia de Anexos"
- Como mudar cores? → Veja "Cores e Branding"

