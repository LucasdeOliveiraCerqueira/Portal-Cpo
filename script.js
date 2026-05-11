/**
 * NAVEGAÇÃO - Sistema de Roteamento de Matérias
 * Redireciona o usuário para a página correta da matéria ao clicar no card
 */
function goToSubject(subject) {
    // Mapear o nome da matéria para o arquivo correspondente
    // Cada chave é o slug da matéria (usado nas URLs)
    // Cada valor é o caminho do arquivo HTML da matéria
    const subjectPages = {
        'matematica': 'pages/matematica.html',
        'gramatica': 'pages/gramatica.html',
        'biologia': 'pages/biologia.html',
        'fisica': 'pages/fisica.html',
        'quimica': 'pages/quimica.html',
        'historia': 'pages/historia.html',
        'geografia': 'pages/geografia.html',
        'ingles': 'pages/ingles.html',
        'filosofia': 'pages/filosofia.html',
        'sociologia': 'pages/sociologia.html',
        'arte': 'pages/arte.html',
        'redacao': 'pages/redacao.html',
        'interpretacao': 'pages/interpretacao.html',
        'conhecimentos-adicionais': 'pages/conhecimentos-adicionais.html',
        'literatura': 'pages/literatura.html'
    };

    if (subjectPages[subject]) {
        window.location.href = subjectPages[subject];
    }
}

/**
 * CONFIGURAÇÃO DE LIVROS - Padrão Global
 * Define os valores padrão para todas as matérias e submatérias
 * Cada livro tem um título e uma quantidade de capítulos
 * Estes valores serão usados como base se não forem sobrescritosa na página da matéria
 */
const DEFAULT_BOOK_SETTINGS = {
    books: {
        1: { title: 'Livro 1', chapters: 24 },
        2: { title: 'Livro 2', chapters: 24 },
        3: { title: 'Livro 3', chapters: 24 },
        4: { title: 'Livro 4', chapters: 24 },
        5: { title: 'Livro 5', chapters: 24 },
        6: { title: 'Livro 6', chapters: 24 }
    },
    attachments: {},  // Não preenchido por padrão; cada matéria define seus anexos
    subsubjects: {}   // Não preenchido por padrão; cada matéria pode ter divisões como "Mat 1", "Mat 2"
};

/**
 * RÓTULOS DE MATÉRIAS
 * Mapeia cada slug de matéria para seu nome em português
 * Usado para exibir o nome legível na página de livro e nos heróis
 */
const subjectLabels = {
    matematica: 'Matemática',
    gramatica: 'Gramática',
    biologia: 'Biologia',
    fisica: 'Física',
    quimica: 'Química',
    historia: 'História',
    geografia: 'Geografia',
    ingles: 'Inglês',
    filosofia: 'Filosofia',
    sociologia: 'Sociologia',
    arte: 'Artes',
    redacao: 'Redação',
    interpretacao: 'Interpretação',
    'conhecimentos-adicionais': 'Conhecimentos Adicionais',
    literatura: 'Literatura'
};

/**
 * OBTER SLUG DA MATÉRIA ATUAL
 * Extrai o nome do arquivo HTML (sem a extensão) que é o slug da matéria
 * Exemplo: em pages/biologia.html, retorna 'biologia'
 * Usado para recuperar a configuração correta da matéria do localStorage
 */
function getCurrentSubjectSlug() {
    const fileName = window.location.pathname.split('/').pop().replace('.html', '');
    return fileName || '';
}

/**
 * NORMALIZAR COLEÇÃO DE LIVROS
 * Processa a configuração de livros e capítulos de uma matéria ou submatéria
 * Aceita tanto a estrutura nova (books com title e chapters) quanto a antiga (chaptersByBook)
 * Garante que todos os livros de 1 a 6 estejam presentes com valores válidos
 * 
 * @param {Object} config - Configuração de livros (pode ser de uma matéria ou submatéria)
 * @returns {Object} Objeto normalizado com books, chaptersByBook (compatibilidade) e attachments
 */
function normalizeBookCollection(config) {
    const safeConfig = config && typeof config === 'object' ? config : {};
    // Extrair livros configurados (estrutura nova: books com title e chapters)
    const sourceBooks = safeConfig.books && typeof safeConfig.books === 'object' ? safeConfig.books : {};
    
    // Extrair livros configurados (estrutura antiga: chaptersByBook apenas com números de capítulos)
    const sourceChapters = safeConfig.chaptersByBook && typeof safeConfig.chaptersByBook === 'object'
        ? safeConfig.chaptersByBook
        : {};
    // Coletar todos os números de livros: padrão (1-6) + personalizados da matéria
    const bookNumbers = new Set([
        ...Object.keys(DEFAULT_BOOK_SETTINGS.books),
        ...Object.keys(sourceBooks),
        ...Object.keys(sourceChapters)
    ].map(Number));

    // Se nenhum livro foi encontrado, usar os 6 padrões
    if (!bookNumbers.size) {
        [1, 2, 3, 4, 5, 6].forEach(bookNumber => bookNumbers.add(bookNumber));
    }

    // Processar cada livro: obter título e capítulos
    // Prioridade: configuração personalizada > valor padrão
    const books = {};

    Array.from(bookNumbers).sort((left, right) => left - right).forEach(bookNumber => {
        // Padrão: Livro X com 24 capítulos
        const defaultBook = DEFAULT_BOOK_SETTINGS.books[bookNumber] || { title: `Livro ${bookNumber}`, chapters: 24 };
        
        // Configuração personalizada do livro nesta matéria/submatéria
        const sourceBook = sourceBooks[bookNumber] || sourceBooks[String(bookNumber)] || {};
        
        // Tentar obter número de capítulos de várias fontes possíveis
        const chaptersValue = sourceBook.chapters ?? sourceBook.chapterCount ?? sourceChapters[bookNumber] ?? sourceChapters[String(bookNumber)] ?? defaultBook.chapters;
        
        // Tentar obter título: personalizado > padrão
        const titleValue = typeof sourceBook.title === 'string' && sourceBook.title.trim() ? sourceBook.title.trim() : defaultBook.title;
        
        // Converter para número e validar
        const parsedChapterCount = Number(chaptersValue);

        books[bookNumber] = {
            title: titleValue,
            // Garantir que chapters seja um número válido entre 1 e infinito (padrão: 24)
            chapters: Number.isFinite(parsedChapterCount) && parsedChapterCount > 0 ? Math.floor(parsedChapterCount) : 24
        };
    });

    return {
        books,  // Nova estrutura: title + chapters para cada livro
        // Estrutura antiga (compatibilidade): mapa de bookNumber => número de capítulos
        chaptersByBook: Object.fromEntries(
            Object.entries(books).map(([bookNumber, bookInfo]) => [bookNumber, bookInfo.chapters])
        ),
        // Anexos por livro e capítulo (preenchidos na página da matéria)
        attachments: safeConfig.attachments && typeof safeConfig.attachments === 'object'
            ? safeConfig.attachments
            : {}
    };
}

/**
 * NORMALIZAR CONFIGURAÇÃO DA MATÉRIA
 * Processa toda a configuração de uma matéria, incluindo livros principais e submatérias
 * Se houver submatérias (como "Mat 1", "Mat 2"), normaliza cada uma delas
 * Também normaliza a coleção de livros principal (compatibilidade com matérias sem submatérias)
 * 
 * @param {Object} config - Configuração da matéria (do bloco window.subjectBookConfig)
 * @returns {Object} Objeto normalizado com books, attachments e subsubjects
 */
function normalizeSubjectBookConfig(config) {
    const safeConfig = config && typeof config === 'object' ? config : {};
    const normalizedSubsubjects = {};

    // Processar cada submatéria (ex: Mat 1, Mat 2, Bio 1, Bio 2)
    // Cada uma recebe automaticamente os 6 livros padrão se não definir livros customizados
    if (safeConfig.subsubjects && typeof safeConfig.subsubjects === 'object') {
        Object.entries(safeConfig.subsubjects).forEach(([subsubjectName, subsubjectConfig]) => {
            normalizedSubsubjects[subsubjectName] = normalizeBookCollection(subsubjectConfig);
        });
    }

    return {
        // Livros principais da matéria (compatibilidade com matérias sem submatérias)
        ...normalizeBookCollection(safeConfig),
        // Coleção de submatérias com seus livros
        subsubjects: normalizedSubsubjects
    };
}

/**
 * GERAR CHAVE DE ARMAZENAMENTO NO LOCALSTORAGE
 * Cria uma chave única para cada matéria para armazenar configurações no navegador
 * 
 * @param {string} subjectSlug - Slug da matéria (ex: 'matematica', 'biologia')
 * @returns {string} Chave para localStorage (ex: 'subjectBookConfig:matematica')
 */
function getSubjectBookConfigStorageKey(subjectSlug) {
    return `subjectBookConfig:${subjectSlug}`;
}

/**
 * PERSISTIR CONFIGURAÇÃO NO LOCALSTORAGE
 * Salva a configuração da matéria (definida no HTML) no localStorage do navegador
 * Isso permite que o site lembre das customizações mesmo após recarregar a página
 * 
 * @param {string} subjectSlug - Slug da matéria
 */
function persistSubjectBookConfig(subjectSlug) {
    // Verificar se a matéria tem uma configuração definida no HTML
    if (!subjectSlug || typeof window.subjectBookConfig !== 'object') {
        return;
    }

    // Normalizar e salvar a configuração
    const normalizedConfig = normalizeSubjectBookConfig(window.subjectBookConfig);
    localStorage.setItem(getSubjectBookConfigStorageKey(subjectSlug), JSON.stringify(normalizedConfig));
}

/**
 * RECUPERAR CONFIGURAÇÃO DA MATÉRIA
 * Obtém a configuração da matéria do localStorage (se salva anteriormente)
 * Se não encontrar, usa a configuração padrão
 * 
 * @param {string} subjectSlug - Slug da matéria
 * @returns {Object} Configuração normalizada com books, attachments e subsubjects
 */
function getSubjectBookConfig(subjectSlug) {
    const key = getSubjectBookConfigStorageKey(subjectSlug);
    const savedConfig = localStorage.getItem(key);

    // Se não há configuração salva, retornar o padrão
    if (!savedConfig) {
        return normalizeSubjectBookConfig(DEFAULT_BOOK_SETTINGS);
    }

    try {
        // Tentar recuperar e normalizar a configuração salva
        return normalizeSubjectBookConfig(JSON.parse(savedConfig));
    } catch (error) {
        // Se houver erro no JSON, retornar o padrão
        return normalizeSubjectBookConfig(DEFAULT_BOOK_SETTINGS);
    }
}

/**
 * CONFIGURAR NAVEGAÇÃO DE LIVROS NA PÁGINA DA MATÉRIA
 * Cria a seção de livros/submatérias na página da matéria (abaixo do conteúdo)
 * Se houver submatérias, mostra cada uma com seus 6 livros
 * Se não houver submatérias, mostra apenas os livros principais
 */
function setupSubjectBookNavigation() {
    const subjectPage = document.querySelector('.subject-page');
    const topicsSection = document.querySelector('.topics-section');

    // Sair se não conseguir encontrar os elementos ou se já existe uma seção de livros
    if (!subjectPage || !topicsSection || document.querySelector('.books-section')) {
        return;
    }

    // Obter slug e configuração da matéria atual
    const subjectSlug = getCurrentSubjectSlug();
    
    // Salvar a configuração definida no HTML (window.subjectBookConfig) no localStorage
    persistSubjectBookConfig(subjectSlug);
    
    // Recuperar a configuração salva (já normalizada)
    const subjectConfig = getSubjectBookConfig(subjectSlug);
    
    // Verificar se há submatérias definidas
    const subsubjectEntries = Object.entries(subjectConfig.subsubjects || {});
    // Organizar livros em grupos (submatérias se existirem, ou apenas livros principais)
    // Se há submatérias: mostrar cada uma como um bloco
    // Se não há: mostrar todos os livros como um único grupo
    const bookGroups = subsubjectEntries.length
        ? subsubjectEntries.map(([subsubjectName, subsubjectConfig]) => ({
            name: subsubjectName,                    // Nome da submatéria (ex: "Mat 1")
            config: subsubjectConfig,                // Configuração de livros da submatéria
            useSubsubjectParam: true                 // Indicador: incluir subsubject na URL
        }))
        : [{
            name: subjectLabels[subjectSlug] || 'Matéria',  // Nome da matéria
            config: subjectConfig,                           // Configuração de livros principal
            useSubsubjectParam: false                        // Indicador: não incluir subsubject na URL
        }];

    // Criar elemento HTML para a seção de livros
    const booksSection = document.createElement('section');
    booksSection.className = 'books-section';
    
    // Gerar HTML para cada grupo de livros (submatéria ou livros principais)
    const booksHtml = bookGroups.map(group => {
        // Obter lista de números de livro (1-6 ou customizados) e ordená-los
        const bookNumbers = Object.keys(group.config.books).map(Number).sort((left, right) => left - right);
        
        // Gerar links para cada livro do grupo
        const groupBooksHtml = bookNumbers.map(bookNumber => {
            // Obter informações do livro (título e capítulos)
            const bookInfo = group.config.books[bookNumber];
            const bookLabel = bookInfo && bookInfo.title ? bookInfo.title : `Livro ${bookNumber}`;
            
            // Construir URL para a página de livro
            const bookUrl = new URL('livro.html', window.location.href);
            bookUrl.searchParams.set('subject', subjectSlug);  // Qual matéria
            bookUrl.searchParams.set('book', String(bookNumber));  // Qual livro

            // Se for uma submatéria, adicionar parâmetro de submatéria
            if (group.useSubsubjectParam) {
                bookUrl.searchParams.set('subsubject', group.name);  // Qual submatéria
            }

            // Retornar link HTML
            return `<a class="book-link" href="${bookUrl.pathname.split('/').pop()}${bookUrl.search}">${bookLabel}</a>`;
        }).join('');

        // Retornar bloco HTML com o nome da submatéria/matéria e seus livros
        return `
            <article class="books-subsubject-block">
                <div class="books-subsubject-header">
                    <h3>${group.name}</h3>
                </div>
                <div class="books-grid">
                    ${groupBooksHtml}
                </div>
            </article>
        `;
    }).join('');

    // Inserir HTML na seção de livros
    booksSection.innerHTML = `
        <h2>Livros</h2>
        <div class="books-groups">
            ${booksHtml}
        </div>
    `;

    // Adicionar a seção de livros antes do conteúdo principal
    subjectPage.insertBefore(booksSection, topicsSection);
}

/**
 * CONFIGURAR TÓPICOS COM REDIRECIONAMENTO
 * Permite que cada tópico na página da matéria redirecione para um capítulo específico
 * 
 * COMO USAR:
 * 1. Na página da disciplina (ex: pages/biologia.html), adicione window.topicsRedirectConfig
 * 2. Cada tópico mapeia para um livro e capítulo
 * 3. Ao clicar no tópico, vai para livro.html com os parâmetros corretos
 * 
 * EXEMPLO:
 * window.topicsRedirectConfig = {
 *     'Fisiologia': { book: 1, chapter: 5 },     // Livro 1, Capítulo 5
 *     'Genética': { book: 2, chapter: 3 },       // Livro 2, Capítulo 3
 *     'Anatomia': { book: 1, chapter: 1, subsubject: 'Bio 1' }  // Com submatéria
 * }
 */
function setupTopicsRedirect() {
    const subjectPage = document.querySelector('.subject-page');
    const topicItems = document.querySelectorAll('.topic-item');
    
    // Sair se não há configuração de tópicos
    if (!window.topicsRedirectConfig || !subjectPage) {
        return;
    }
    
    // Obter slug da disciplina atual
    const subjectSlug = getCurrentSubjectSlug();
    
    // Para cada tópico na página
    topicItems.forEach(topicItem => {
        // Extrair nome do tópico (do h3 ou primeiro elemento de texto)
        const topicName = topicItem.querySelector('h3')?.textContent?.trim();
        
        // Se este tópico está configurado
        if (topicName && window.topicsRedirectConfig[topicName]) {
            const config = window.topicsRedirectConfig[topicName];
            
            // Construir URL de redirecionamento
            const targetUrl = new URL('livro.html', window.location.href);
            targetUrl.searchParams.set('subject', subjectSlug);
            targetUrl.searchParams.set('book', String(config.book));
            
            // Se houver submatéria, adicionar
            if (config.subsubject) {
                targetUrl.searchParams.set('subsubject', config.subsubject);
            }
            
            // Se houver capítulo, adicionar (opcional - pode ser útil para scroll futuro)
            if (config.chapter) {
                targetUrl.searchParams.set('chapter', String(config.chapter));
            }
            
            // Tornar o tópico clicável e com estilo de cursor
            topicItem.style.cursor = 'pointer';
            topicItem.style.transition = 'all 0.25s ease';
            
            // Adicionar hover effect
            topicItem.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px)';
                this.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
            });
            
            topicItem.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
            });
            
            // Ao clicar, redirecionar
            topicItem.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = targetUrl.pathname + targetUrl.search;
            });
        }
    });
}

/**
 * CONFIGURAR PÁGINA DE LIVRO
 * Carrega e renderiza todos os capítulos de um livro específico
 * Suporta tanto livros principais quanto livros de submatérias
 * Renderiza capítulos como accordions expansíveis com anexos
 */
function setupBookPage() {
    const bookPageRoot = document.querySelector('[data-book-page]');

    // Sair se não estamos na página de livro
    if (!bookPageRoot) {
        return;
    }

    // Extrair parâmetros da URL
    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject') || 'sociologia';      // Qual matéria (ex: 'matematica')
    const book = params.get('book') || '1';                      // Qual livro (1-6)
    const subsubject = params.get('subsubject') || '';           // Qual submatéria, se houver (ex: 'Mat 1')
    
    const bookNumber = Number(book);
    const subjectLabel = subjectLabels[subject] || 'Matéria';
    
    // Recuperar configuração da matéria
    const subjectConfig = getSubjectBookConfig(subject);
    // Selecionar a submatéria se houver (ou null para livros principais)
    const selectedSubsubject = subsubject && subjectConfig.subsubjects[subsubject]
        ? subjectConfig.subsubjects[subsubject]
        : null;
    
    // Coleção ativa: submatéria se selecionada, senão coleção principal
    const activeCollection = selectedSubsubject || subjectConfig;
    
    // Informações do livro selecionado (título e número de capítulos)
    const selectedBook = activeCollection.books[bookNumber] || activeCollection.books[book] || { title: `Livro ${bookNumber}`, chapters: 24 };
    
    // Número de capítulos deste livro
    const chapterCount = Number(selectedBook.chapters || activeCollection.chaptersByBook[bookNumber] || activeCollection.chaptersByBook[book] || 24);
    
    // Anexos deste livro (materiais para cada capítulo)
    const currentBookContent = activeCollection.attachments[bookNumber] || activeCollection.attachments[book] || {};

    // Encontrar elementos HTML da página de livro
    const heroTitle = document.querySelector('[data-book-title]');        // Título do herói
    const heroSubtitle = document.querySelector('[data-book-subtitle]');  // Subtítulo com número de capítulos
    const chaptersGrid = document.querySelector('[data-chapters-grid]');  // Container dos capítulos

    // Definir título do herói
    if (heroTitle) {
        // Se há submatéria: "Matemática — Mat 1 — Livro 1"
        // Se não: "Matemática — Livro 1"
        heroTitle.textContent = selectedSubsubject
            ? `${subjectLabel} — ${subsubject} — ${selectedBook.title || `Livro ${bookNumber}`}`
            : `${subjectLabel} — ${selectedBook.title || `Livro ${bookNumber}`}`;
    }

    // Definir subtítulo do herói (número de capítulos)
    if (heroSubtitle) {
        heroSubtitle.textContent = `${chapterCount} capítulo(s)`;
    }

    // Definir badge com número de capítulos (na topbar)
    const chapterCountBadge = document.querySelector('[data-book-chapter-count]');
    if (chapterCountBadge) {
        chapterCountBadge.textContent = `${chapterCount} capítulo(s)`;
    }

    // Renderizar capítulos como accordions
    if (chaptersGrid) {
        // Criar um accordion para cada capítulo (1 até chapterCount)
        chaptersGrid.innerHTML = Array.from({ length: chapterCount }, (_, index) => {
            // Número do capítulo (1-indexed)
            const chapterNumber = index + 1;
            
            // Anexos (materiais) deste capítulo
            const chapterAttachments = currentBookContent[chapterNumber] || [];
            
            // Renderizar anexos como links Visualizar/Baixar, ou mensagem vazia
            const attachmentHtml = chapterAttachments.length
                // Se há anexos: criar links
                ? `<div class="resource-links">${chapterAttachments.map(resource => `
                        <div class="resource-row">
                            <span class="resource-name">${resource.label || 'Material anexado'}</span>
                            <div class="resource-actions">
                                <a class="resource-link" href="${resource.viewUrl || '#'}" target="_blank" rel="noopener noreferrer">Visualizar</a>
                                ${resource.downloadUrl ? `<a class="resource-link" href="${resource.downloadUrl}" download>Baixar</a>` : ''}
                            </div>
                        </div>
                    `).join('')}</div>`
                // Se não há anexos: mostrar mensagem
                : '<div class="empty-state">Nenhum conteúdo anexado neste capítulo.</div>';

            // Retornar accordion HTML para este capítulo
            return `
                <details class="chapter-accordion">
                    <summary class="chapter-summary">
                        <span>Capítulo ${chapterNumber}</span>
                        <span class="chapter-arrow">⌄</span>
                    </summary>
                    <div class="chapter-body">
                        <p class="chapter-note">Edite o bloco subjectBookConfig na página desta matéria para anexar o conteúdo deste capítulo.</p>
                        ${attachmentHtml}
                    </div>
                </details>
            `;
        }).join('');
    }
}

/**
 * INICIALIZAÇÃO - Evento ao carregar a página
 * Configura filtros de matérias na home
 * Renderiza navegação de livros nas páginas de matéria
 * Renderiza capítulos na página de livro
 * Adiciona efeito de ripple aos cliques nos cards
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elementos de filtro e cards de matérias
    const filterButtons = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.subject-card');

    // Função para aplicar filtros: mostrar/ocultar cards baseado na categoria
    const applyFilter = function(filterValue) {
        cards.forEach(card => {
            // Extrair categorias do card (ex: "linguagens natureza")
            const categories = (card.dataset.categories || '').split(/\s+/).filter(Boolean);
            // Mostrar se: filtro é "todos" OU card tem a categoria selecionada
            const shouldShow = filterValue === 'all' || categories.includes(filterValue);
            card.hidden = !shouldShow;
        });
    };

    // Adicionar listeners aos botões de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover "active" de todos os botões
            filterButtons.forEach(currentButton => currentButton.classList.remove('active'));
            // Adicionar "active" ao botão clicado
            this.classList.add('active');
            // Aplicar o filtro correspondente
            applyFilter(this.dataset.filter);
        });
    });

    // Inicialmente, mostrar todos os cards (filtro "all")
    applyFilter('all');

    // Adicionar efeito de ripple ao clicar em um card de matéria
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Criar elemento de ripple (ondinha de clique)
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            // Posição do clique relativa ao card
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            // Estilizar ripple
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            // Adicionar ao card e deixar a animação CSS fazer o resto
            this.appendChild(ripple);
        });
    });

    // Renderizar navegação de livros (se na página de matéria)
    setupSubjectBookNavigation();
    
    // Configurar tópicos para redirecionar (se houver configuração)
    setupTopicsRedirect();
    
    // Renderizar capítulos e detalhes do livro (se na página de livro)
    setupBookPage();
});
