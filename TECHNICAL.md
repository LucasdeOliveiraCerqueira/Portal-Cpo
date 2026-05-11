# 🔧 Documentação Técnica - API Interna

## Índice
1. [Estrutura de Dados](#estrutura-de-dados)
2. [Funções de Script](#funções-de-script)
3. [Sistema de Eventos](#sistema-de-eventos)
4. [localStorage - Persistência](#localstorage---persistência)
5. [CSS - Seletores e Classes](#css---seletores-e-classes)
6. [URLs e Roteamento](#urls-e-roteamento)

---

## 📦 Estrutura de Dados

### DEFAULT_BOOK_SETTINGS

Define os livros e configuração padrão para todas as disciplinas.

**Localização:** `script.js` (linhas ~20-30)

**Estrutura:**
```javascript
const DEFAULT_BOOK_SETTINGS = {
    books: {
        1: { title: 'Livro 1', chapters: 24 },
        2: { title: 'Livro 2', chapters: 24 },
        3: { title: 'Livro 3', chapters: 24 },
        4: { title: 'Livro 4', chapters: 24 },
        5: { title: 'Livro 5', chapters: 24 },
        6: { title: 'Livro 6', chapters: 24 }
    },
    attachments: {},
    subsubjects: {}
};
```

**Propriedades:**
- `books[n]`: Objeto com `title` (string) e `chapters` (número)
- `attachments`: Mapa de {livro: {capítulo: [recursos]}}
- `subsubjects`: Mapa de submatérias (inicialmente vazio)

---

### window.subjectBookConfig

Definido em cada `pages/{disciplina}.html` para customizar aquela disciplina.

**Exemplo de Matemática:**
```javascript
window.subjectBookConfig = {
    subsubjects: {
        'Mat 1': {
            books: {
                1: { title: 'Livro 1', chapters: 24 },
                // ... 6 livros
            },
            attachments: {
                1: {  // Livro 1
                    5: [  // Capítulo 5
                        {
                            label: 'Apostila PDF',
                            viewUrl: 'url/apostila.pdf',
                            downloadUrl: 'url/apostila.pdf'
                        }
                    ]
                }
            }
        },
        'Mat 2': {
            // Se não definir books, recebe DEFAULT_BOOK_SETTINGS.books
            attachments: {}
        }
    }
};
```

**Propriedades:**
- `subsubjects[name].books[n]`: Livros customizados (opcional)
- `subsubjects[name].attachments[livro][capítulo][]`: Recursos do capítulo
- `attachments[livro][capítulo][]`: Recursos globais (fora de submatérias)

---

### Objeto Normalizado (localStorage)

Resultado após `normalizeSubjectBookConfig()` e armazenado em localStorage.

**Estrutura:**
```javascript
{
    books: {
        1: { title: 'Livro 1', chapters: 24 },
        // ... até 6 livros (pode ser customizado)
    },
    chaptersByBook: {
        1: 24,
        2: 24,
        // ... (compatibilidade)
    },
    attachments: {
        1: { 5: [{...}], 6: [{...}] },
        // ... por livro
    },
    subsubjects: {
        'Mat 1': {
            books: {...},
            chaptersByBook: {...},
            attachments: {...}
        },
        'Mat 2': {...}
    }
}
```

---

## 🔌 Funções de Script

### goToSubject(subject)

**Propósito:** Navegar para a página de uma disciplina

**Localização:** `script.js` (linhas ~10-30)

**Assinatura:**
```javascript
function goToSubject(subject: string): void
```

**Parâmetros:**
- `subject` (string): Slug da disciplina (ex: 'matematica', 'biologia')

**Funcionamento:**
1. Busca `subject` em `subjectPages`
2. Se encontrado, redireciona para `window.location.href = subjectPages[subject]`
3. Se não encontrado, não faz nada

**Exemplo:**
```javascript
goToSubject('matematica');  // Navega para pages/matematica.html
```

**Mapa de páginas (interno):**
```javascript
const subjectPages = {
    'matematica': 'pages/matematica.html',
    'gramatica': 'pages/gramatica.html',
    'biologia': 'pages/biologia.html',
    // ... 15 disciplinas
};
```

---

### normalizeBookCollection(config)

**Propósito:** Processar e validar configuração de livros

**Localização:** `script.js` (linhas ~50-120)

**Assinatura:**
```javascript
function normalizeBookCollection(config: Object): Object
```

**Parâmetros:**
- `config` (object): Configuração de livros (pode estar vazia ou incompleta)

**Retorno:**
```javascript
{
    books: {
        1: { title: string, chapters: number },
        // ... até 6 (ou customizados)
    },
    chaptersByBook: {
        1: number,
        // ... (compatibilidade)
    },
    attachments: {
        livro: {
            capítulo: [recursos]
        }
    }
}
```

**Processo interno:**
1. Extrai `config.books` e `config.chaptersByBook`
2. Coleta todos os números de livro (1-6 + customizados)
3. Para cada livro:
   - Obtém nome: `config.books[n].title` || `DEFAULT_BOOK_SETTINGS.books[n].title`
   - Obtém capítulos: `config.books[n].chapters` || `DEFAULT_BOOK_SETTINGS.books[n].chapters`
   - Valida: número, mínimo 1, máximo infinito
4. Retorna estrutura normalizada

**Exemplo:**
```javascript
const input = {
    books: {
        1: { title: 'Frente 1', chapters: 12 }
    }
};
const output = normalizeBookCollection(input);
// output.books[1] = { title: 'Frente 1', chapters: 12 }
// output.books[2] = { title: 'Livro 2', chapters: 24 }  (padrão)
// ... até 6 livros
```

---

### normalizeSubjectBookConfig(config)

**Propósito:** Processar configuração completa de uma disciplina

**Localização:** `script.js` (linhas ~125-155)

**Assinatura:**
```javascript
function normalizeSubjectBookConfig(config: Object): Object
```

**Parâmetros:**
- `config` (object): Configuração da disciplina (do `window.subjectBookConfig`)

**Retorno:**
```javascript
{
    books: {...},                  // Livros principais
    chaptersByBook: {...},         // Compatibilidade
    attachments: {...},            // Anexos globais
    subsubjects: {
        'subname': {
            books: {...},
            chaptersByBook: {...},
            attachments: {...}
        }
    }
}
```

**Processo:**
1. Para cada submatéria em `config.subsubjects`:
   - Chama `normalizeBookCollection(subsubjectConfig)`
   - Armazena resultado em `normalizedSubsubjects[name]`
2. Normaliza livros principais com `normalizeBookCollection(config)`
3. Combina resultados: livros principais + submatérias normalizadas

**Exemplo:**
```javascript
const config = {
    subsubjects: {
        'Mat 1': { attachments: {} },
        'Mat 2': { attachments: {} }
    }
};
const result = normalizeSubjectBookConfig(config);
// result.subsubjects['Mat 1'].books = 6 livros padrão
// result.subsubjects['Mat 2'].books = 6 livros padrão
```

---

### getSubjectBookConfigStorageKey(subjectSlug)

**Propósito:** Gerar chave única para localStorage

**Localização:** `script.js` (linhas ~160-165)

**Assinatura:**
```javascript
function getSubjectBookConfigStorageKey(slug: string): string
```

**Retorno:**
```
'subjectBookConfig:' + slug
```

**Exemplo:**
```javascript
getSubjectBookConfigStorageKey('matematica');
// Retorna: 'subjectBookConfig:matematica'
```

---

### persistSubjectBookConfig(subjectSlug)

**Propósito:** Salvar configuração de disciplina no localStorage

**Localização:** `script.js` (linhas ~170-185)

**Assinatura:**
```javascript
function persistSubjectBookConfig(slug: string): void
```

**Processo:**
1. Obtém `window.subjectBookConfig` da página
2. Normaliza com `normalizeSubjectBookConfig()`
3. Serializa com `JSON.stringify()`
4. Salva em `localStorage[getSubjectBookConfigStorageKey(slug)]`

**Quando é chamada:**
- Automaticamente em `setupSubjectBookNavigation()`
- Ao carregar página de disciplina

**Exemplo:**
```javascript
// Na página pages/matematica.html
window.subjectBookConfig = {...};
persistSubjectBookConfig('matematica');
// localStorage['subjectBookConfig:matematica'] = JSON stringificado
```

---

### getSubjectBookConfig(subjectSlug)

**Propósito:** Recuperar configuração normalizada de localStorage

**Localização:** `script.js` (linhas ~190-210)

**Assinatura:**
```javascript
function getSubjectBookConfig(slug: string): Object
```

**Retorno:** Configuração normalizada (veja estrutura em `normalizeSubjectBookConfig`)

**Processo:**
1. Busca em `localStorage[getSubjectBookConfigStorageKey(slug)]`
2. Se encontrado, deserializa com `JSON.parse()`
3. Normaliza resultado
4. Se não encontrado ou JSON inválido, retorna padrão normalizado

**Exemplo:**
```javascript
const config = getSubjectBookConfig('biologia');
console.log(config.books);        // 6 livros
console.log(config.subsubjects);  // { 'Bio 1': {...}, 'Bio 2': {...} }
```

---

### setupSubjectBookNavigation()

**Propósito:** Criar seção de livros/submatérias na página da disciplina

**Localização:** `script.js` (linhas ~215-310)

**Assinatura:**
```javascript
function setupSubjectBookNavigation(): void
```

**Quando é executada:**
- No evento `DOMContentLoaded`
- Apenas se houver elemento `.subject-page` na página

**Processo:**
1. Obtém slug da disciplina com `getCurrentSubjectSlug()`
2. Persiste config no localStorage
3. Recupera config normalizada
4. Organiza em "grupos":
   - Se há submatérias: cada submatéria é um grupo
   - Se não: todos os livros em um único grupo
5. Para cada grupo:
   - Cria `<article class="books-subsubject-block">`
   - Gera links para cada livro: `<a class="book-link" href="livro.html?...`
6. Insere HTML antes de `.topics-section`

**URLs geradas:**
```
livro.html?subject=matematica&book=1&subsubject=Mat%201
livro.html?subject=biologia&book=1
```

**Exemplo de HTML gerado:**
```html
<section class="books-section">
    <h2>Livros</h2>
    <div class="books-groups">
        <article class="books-subsubject-block">
            <div class="books-subsubject-header">
                <h3>Mat 1</h3>
                <p>6 livros automáticos por submatéria</p>
            </div>
            <div class="books-grid">
                <a class="book-link" href="livro.html?subject=matematica&book=1&subsubject=Mat%201">Livro 1</a>
                <a class="book-link" href="livro.html?subject=matematica&book=2&subsubject=Mat%201">Livro 2</a>
                <!-- ... até 6 livros -->
            </div>
        </article>
    </div>
</section>
```

---

### setupBookPage()

**Propósito:** Renderizar capítulos com anexos na página de livro

**Localização:** `script.js` (linhas ~315-450)

**Assinatura:**
```javascript
function setupBookPage(): void
```

**Quando é executada:**
- No evento `DOMContentLoaded`
- Apenas se houver elemento `[data-book-page]` na página

**Extração de parâmetros de URL:**
```javascript
const params = new URLSearchParams(window.location.search);
subject = params.get('subject') || 'sociologia';
book = params.get('book') || '1';
subsubject = params.get('subsubject') || '';
```

**Processo:**
1. Extrai parâmetros: `subject`, `book`, `subsubject`
2. Recupera configuração com `getSubjectBookConfig(subject)`
3. Seleciona submatéria se fornecida
4. Obtém número de capítulos e anexos do livro
5. Preenche títulos:
   - `[data-book-title]`: "Matemática — Mat 1 — Livro 1"
   - `[data-book-subtitle]`: "24 capítulo(s)"
   - `[data-book-chapter-count]`: "24 capítulo(s)"
6. Renderiza accordions para cada capítulo:
   - `<details class="chapter-accordion">`
   - `<summary>Capítulo N</summary>`
   - `<div class="chapter-body">` com anexos ou mensagem vazia
7. Insere HTML em `[data-chapters-grid]`

**Exemplo de output HTML:**
```html
<details class="chapter-accordion">
    <summary class="chapter-summary">
        <span>Capítulo 1</span>
        <span class="chapter-arrow">⌄</span>
    </summary>
    <div class="chapter-body">
        <div class="resource-links">
            <div class="resource-row">
                <span class="resource-name">Apostila PDF</span>
                <div class="resource-actions">
                    <a class="resource-link" href="...">Visualizar</a>
                    <a class="resource-link" href="..." download>Baixar</a>
                </div>
            </div>
        </div>
    </div>
</details>
```

---

### getCurrentSubjectSlug()

**Propósito:** Extrair o slug da disciplina atual do URL

**Localização:** `script.js` (linhas ~40-45)

**Assinatura:**
```javascript
function getCurrentSubjectSlug(): string
```

**Retorno:** Slug extraído do nome do arquivo (sem `.html`)

**Processo:**
1. `window.location.pathname.split('/').pop()` → últimono arquivo
2. `.replace('.html', '')` → remove extensão

**Exemplo:**
```javascript
// Se URL é: http://site.com/pages/matematica.html
getCurrentSubjectSlug();  // Retorna: 'matematica'

// Se URL é: http://site.com/pages/biologia.html
getCurrentSubjectSlug();  // Retorna: 'biologia'
```

---

## 🎯 Sistema de Eventos

### DOMContentLoaded

**Localização:** `script.js` (linhas ~460-500)

**O que acontece:**

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // 1. Configurar filtros (home page)
    const filterButtons = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.subject-card');
    
    // 2. Aplicar filtro inicial: mostrar todos
    applyFilter('all');
    
    // 3. Listener em botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover 'active' de todos
            // Adicionar 'active' ao clicado
            // Chamar applyFilter(this.dataset.filter)
        });
    });
    
    // 4. Efeito ripple ao clicar em cards
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Criar <span class="ripple">
            // Posicionar na coordenada do clique
            // Deixar CSS animar
        });
    });
    
    // 5. Renderizar livros/submatérias (página de disciplina)
    setupSubjectBookNavigation();
    
    // 6. Renderizar capítulos (página de livro)
    setupBookPage();
});
```

---

### Filter Chip Click

**Função interna:** `applyFilter(filterValue)`

**Localização:** `script.js` (linhas ~465-475)

**Processo:**
1. Itera sobre todos os cards `.subject-card`
2. Para cada card:
   - Extrai `card.dataset.categories` (ex: "linguagens natureza")
   - Divide em array: `['linguagens', 'natureza']`
3. Se `filterValue === 'all'` OU card contém categoria:
   - Mostra card: `card.hidden = false`
4. Senão:
   - Oculta card: `card.hidden = true`

**Exemplo:**
```javascript
// Usuário clica em "Natureza"
applyFilter('natureza');
// Card com data-categories="natureza" fica visível
// Card com data-categories="linguagens" fica oculto
```

---

### Ripple Effect

**Localização:** `script.js` (linhas ~478-495)

**Processo:**
1. Usuário clica em um `.subject-card`
2. JavaScript cria `<span class="ripple">`
3. Calcula posição relativa ao clique
4. Define `width`, `height`, `left`, `top` do ripple
5. CSS `@keyframes ripple` faz a animação

**CSS da animação (style.css):**
```css
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    animation: ripple 0.6s ease-out;
}

@keyframes ripple {
    from {
        opacity: 1;
        transform: scale(0);
    }
    to {
        opacity: 0;
        transform: scale(1);
    }
}
```

---

## 💾 localStorage - Persistência

### Chaves utilizadas

**Padrão:** `subjectBookConfig:{slug}`

**Exemplos:**
```
subjectBookConfig:matematica
subjectBookConfig:biologia
subjectBookConfig:historia
... (uma por disciplina)
```

### Ciclo de vida

1. **Salvamento:**
   - Usuário acessa `pages/disciplina.html`
   - `setupSubjectBookNavigation()` lê `window.subjectBookConfig`
   - Chama `persistSubjectBookConfig(slug)`
   - Config é normalizada e serializada para JSON
   - Armazenada em `localStorage['subjectBookConfig:' + slug]`

2. **Leitura:**
   - Usuário clica em um livro → vai para `livro.html?...`
   - `setupBookPage()` chama `getSubjectBookConfig(subject)`
   - Busca em `localStorage['subjectBookConfig:' + subject]`
   - Deserializa JSON e retorna

3. **Fallback:**
   - Se localStorage vazio ou JSON inválido:
   - Retorna `normalizeSubjectBookConfig(DEFAULT_BOOK_SETTINGS)`

### Tamanho máximo

- Navegadores típicos: 5-10MB por origem
- Esta aplicação usa apenas alguns KB (estrutura + configuração)
- Sem problemas de limite

### Limpeza

Para resetar todas as configurações:
```javascript
// No console do navegador
Object.keys(localStorage)
    .filter(key => key.startsWith('subjectBookConfig:'))
    .forEach(key => localStorage.removeItem(key));
```

---

## 🎨 CSS - Seletores e Classes

### Seletores principais

| Seletor | Uso |
|---------|-----|
| `.navbar` | Barra de navegação fixa |
| `.reception` | Hero section com filtros |
| `.filter-chip` | Botão de categoria |
| `.subject-card` | Card de disciplina |
| `.books-section` | Container de livros |
| `.books-subsubject-block` | Grupo de submatéria |
| `.book-link` | Link de livro |
| `.chapter-accordion` | Elemento `<details>` de capítulo |
| `.chapter-summary` | Cabeçalho do accordion |
| `.chapter-arrow` | Seta indicadora |
| `.chapter-body` | Conteúdo do accordion |
| `.resource-row` | Linha de anexo |
| `.resource-link` | Link de anexo |
| `.empty-state` | Mensagem quando sem anexos |

### Data Attributes

| Atributo | Exemplo | Uso |
|----------|---------|-----|
| `[data-filter]` | `data-filter="linguagens"` | Identificar botão de filtro |
| `[data-categories]` | `data-categories="linguagens humanas"` | Categorias do card |
| `[data-book-page]` | `data-book-page` | Indicar página de livro |
| `[data-book-title]` | `data-book-title` | Elemento de título |
| `[data-book-subtitle]` | `data-book-subtitle` | Elemento de subtítulo |
| `[data-book-chapter-count]` | `data-book-chapter-count` | Badge com count |
| `[data-chapters-grid]` | `data-chapters-grid` | Container de capítulos |

---

## 🔗 URLs e Roteamento

### Estrutura de URLs

#### Home Page
```
/index.html
```

#### Página de Disciplina
```
/pages/{slug}.html

Exemplos:
/pages/matematica.html
/pages/biologia.html
/pages/historia.html
```

#### Página de Livro (Genérica)
```
/pages/livro.html?subject={slug}&book={n}&subsubject={name}

Exemplos:
/pages/livro.html?subject=matematica&book=1
/pages/livro.html?subject=matematica&book=1&subsubject=Mat%201
/pages/livro.html?subject=biologia&book=3&subsubject=Bio%202
```

### Parâmetros de Query

| Parâmetro | Obrigatório | Exemplo | Padrão |
|-----------|-------------|---------|--------|
| `subject` | Sim | `matematica` | `sociologia` |
| `book` | Não | `1` | `1` |
| `subsubject` | Não | `Mat%201` | vazio |

### Navegação via JavaScript

```javascript
// Ir para página de disciplina
window.location.href = 'pages/matematica.html';

// Ir para livro (sem submatéria)
window.location.href = 'pages/livro.html?subject=biologia&book=1';

// Ir para livro (com submatéria)
const url = new URL('pages/livro.html', window.location.href);
url.searchParams.set('subject', 'matematica');
url.searchParams.set('book', '1');
url.searchParams.set('subsubject', 'Mat 1');
window.location.href = url.pathname + url.search;
```

---

## 🐛 Debugging

### Console API

```javascript
// Ver configuração salva
console.log(getSubjectBookConfig('matematica'));

// Ver localStorage completo
console.log(localStorage);

// Ver chaves de configuração
Object.keys(localStorage)
    .filter(k => k.startsWith('subjectBookConfig:'))
    .forEach(k => console.log(k, localStorage[k]));

// Limpar uma disciplina
localStorage.removeItem('subjectBookConfig:matematica');
```

### Breakpoints Úteis

**Em `setupBookPage()` (linha ~340):**
```javascript
debugger;  // Parar aqui para inspecionar
const selectedBook = activeCollection.books[bookNumber];
console.log('Book selected:', selectedBook);
```

**Em `normalizeBookCollection()` (linha ~70):**
```javascript
console.log('Input:', config);
console.log('Normalized output:', result);
```

---

## 📚 Referências

- **MDN - localStorage:** https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **MDN - URLSearchParams:** https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
- **MDN - HTML details element:** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details

