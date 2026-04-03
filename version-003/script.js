/**
 * SOLUCIONADOR DE SISTEMAS LINEARES - Eliminação de Gauss com Pivoteamento Parcial
 * 
 * Este programa implementa o método de Escalonamento (Eliminação de Gauss) para resolver
 * sistemas lineares da forma Ax = b (representado pela matriz ampliada [A|b]).
 * 
 * Conceitos Matemáticos:
 * - Operações Elementares de Linha: multiplicação, adição e troca de linhas
 * - Pivô: elemento diagonal não-nulo usado para eliminar elementos abaixo
 * - Pivoteamento Parcial: troca de linhas quando o pivô é nulo ou próximo de zero
 * - Forma Escalonada: matriz onde cada linha não-nula começa com um pivô (não necessariamente 1)
 * 
 * Classificação de Sistemas:
 * - SPD (Sistema Possível Determinado): solução única
 * - SPI (Sistema Possível Indeterminado): infinitas soluções
 * - SI (Sistema Impossível): nenhuma solução
 * 
 * Nota: Os pivôs mantêm seus valores originais para melhor rastreabilidade numérica
 */

// Constante para comparar números em ponto flutuante
const EPSILON = 1e-10;

// Objeto global para armazenar dados do sistema
let systemData = {
    matrix: null,
    originalMatrix: null,
    steps: [],
    classification: null,
    solution: null
};

/**
 * Cria os inputs para entrada manual da matriz
 * Gera uma grade de inputs baseada nas dimensões especificadas
 */
function createMatrixInputs() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    
    if (rows < 2 || cols < 2 || rows > 10 || cols > 10) {
        alert('Dimensões inválidas. Use entre 2 e 10.');
        return;
    }
    
    const container = document.getElementById('matrix-inputs');
    container.innerHTML = '';
    
    for (let i = 0; i < rows; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';
        
        for (let j = 0; j <= cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.placeholder = j === cols ? 'b' : `a${i+1}${j+1}`;
            input.id = `cell-${i}-${j}`;
            rowDiv.appendChild(input);
        }
        
        container.appendChild(rowDiv);
    }
}

/**
 * Lê a matriz dos inputs HTML
 * Retorna um array 2D representando a matriz ampliada [A|b]
 */
function readMatrixFromInputs() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    const matrix = [];
    
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j <= cols; j++) {
            const value = parseFloat(document.getElementById(`cell-${i}-${j}`).value);
            if (isNaN(value)) {
                throw new Error(`Valor inválido em [${i}][${j}]`);
            }
            row.push(value);
        }
        matrix.push(row);
    }
    
    return matrix;
}

/**
 * Lê matriz de um arquivo de texto
 * Formato esperado:
 * Primeira linha: m n (m = linhas, n = colunas das variáveis)
 * Próximas m linhas: coeficientes da matriz ampliada [A|b]
 */
function readMatrixFromFile(fileContent) {
    const lines = fileContent.trim().split('\n');
    
    if (lines.length < 2) {
        throw new Error('Arquivo inválido. Formato esperado: primeira linha com "m n"');
    }
    
    const [m, n] = lines[0].split(/\s+/).map(Number);
    
    if (isNaN(m) || isNaN(n) || m < 2 || n < 2) {
        throw new Error('Dimensões inválidas no arquivo.');
    }
    
    const matrix = [];
    for (let i = 1; i <= m; i++) {
        if (!lines[i]) {
            throw new Error(`Linha ${i} não encontrada no arquivo.`);
        }
        const values = lines[i].split(/\s+/).map(Number);
        if (values.length !== n + 1) {
            throw new Error(`Linha ${i} possui ${values.length} elementos, mas esperados ${n + 1}.`);
        }
        matrix.push(values);
    }
    
    // Atualiza os inputs com os valores lidos
    document.getElementById('rows').value = m;
    document.getElementById('cols').value = n;
    createMatrixInputs();
    
    for (let i = 0; i < m; i++) {
        for (let j = 0; j <= n; j++) {
            document.getElementById(`cell-${i}-${j}`).value = matrix[i][j];
        }
    }
    
    return matrix;
}

/**
 * Manipula o upload de arquivo
 * Lê o arquivo .txt e o carrega na matriz
 */
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        readMatrixFromFile(evt.target.result);
                        alert('Arquivo carregado com sucesso!');
                    } catch (err) {
                        alert('Erro ao carregar arquivo: ' + err.message);
                    }
                };
                reader.readAsText(file);
            }
        });
    }
});

/**
 * OPERAÇÃO ELEMENTAR 1: Multiplicar uma linha por uma constante não-nula
 * Conceito: L_i = c * L_i (onde c ≠ 0)
 * Usado para normalizar o pivô para 1
 */
function multiplyRow(matrix, rowIndex, scalar) {
    if (Math.abs(scalar) < EPSILON) {
        throw new Error('Não é possível multiplicar por zero.');
    }
    
    const newMatrix = matrix.map(row => [...row]);
    for (let j = 0; j < newMatrix[rowIndex].length; j++) {
        newMatrix[rowIndex][j] *= scalar;
    }
    
    return {
        matrix: newMatrix,
        operation: `L${rowIndex + 1} ← ${scalar.toFixed(4)} × L${rowIndex + 1}`
    };
}

/**
 * OPERAÇÃO ELEMENTAR 2: Adicionar múltiplo de uma linha a outra
 * Conceito: L_i = L_i + c * L_j
 * Usado para eliminar o pivô em linhas abaixo (ou acima em RREF)
 */
function addRows(matrix, sourceRow, targetRow, scalar) {
    const newMatrix = matrix.map(row => [...row]);
    
    for (let j = 0; j < newMatrix[targetRow].length; j++) {
        newMatrix[targetRow][j] += scalar * newMatrix[sourceRow][j];
        // Arredonda para evitar erros de precisão numérica
        if (Math.abs(newMatrix[targetRow][j]) < EPSILON) {
            newMatrix[targetRow][j] = 0;
        }
    }
    
    return {
        matrix: newMatrix,
        operation: `L${targetRow + 1} ← L${targetRow + 1} + (${scalar.toFixed(4)}) × L${sourceRow + 1}`
    };
}

/**
 * OPERAÇÃO ELEMENTAR 3: Trocar duas linhas (Pivoteamento Parcial)
 * Conceito: L_i ↔ L_j
 * 
 * Pivoteamento Parcial: encontra a linha com o maior elemento (em valor absoluto)
 * a partir da linha atual até o final. Isto melhora a estabilidade numérica
 * evitando divisão por números muito pequenos.
 */
function swapRows(matrix, row1, row2) {
    const newMatrix = matrix.map(row => [...row]);
    [newMatrix[row1], newMatrix[row2]] = [newMatrix[row2], newMatrix[row1]];
    
    return {
        matrix: newMatrix,
        operation: `L${row1 + 1} ↔ L${row2 + 1}`
    };
}

/**
 * Encontra o pivô (maior elemento em valor absoluto) na coluna especificada
 * a partir da linha current para baixo
 * 
 * Retorna:
 * - pivotRow: índice da linha com o maior elemento
 * - pivotValue: valor do pivô
 * 
 * Isso implementa o Pivoteamento Parcial, essencial para estabilidade numérica
 */
function findPivot(matrix, col, startRow) {
    let pivotRow = startRow;
    let maxValue = Math.abs(matrix[startRow][col]);
    
    for (let i = startRow + 1; i < matrix.length; i++) {
        const currentValue = Math.abs(matrix[i][col]);
        if (currentValue > maxValue) {
            maxValue = currentValue;
            pivotRow = i;
        }
    }
    
    return {
        pivotRow: pivotRow,
        pivotValue: matrix[pivotRow][col]
    };
}

/**
 * ALGORITMO PRINCIPAL: Escalonamento com Pivoteamento Parcial
 * 
 * O algoritmo transforma a matriz ampliada [A|b] para a forma escalonada
 * através de operações elementares de linha.
 * 
 * Processo:
 * 1. Para cada coluna de variável (pivot_col):
 *    a. Encontrar o maior pivô na coluna (pivoteamento parcial)
 *    b. Se pivô = 0, passar para próxima coluna
 *    c. Trocar linhas se necessário
 *    d. Eliminar elementos abaixo do pivô (sem normalizar para 1)
 * 
 * 2. Resultado é a Forma Escalonada (mantém pivôs originais)
 * 
 * Nota: Os pivôs NÃO são normalizados para 1, mantendo valores originais
 * para melhor rastreabilidade dos números nas operações intermediárias
 */
function gaussianElimination(matrix) {
    const m = matrix.length; // número de equações (linhas)
    const n = matrix[0].length - 1; // número de variáveis (colunas - 1 para o vetor b)
    
    let workMatrix = matrix.map(row => [...row]);
    const steps = [];
    let currentRow = 0;
    
    // Fase 1: Escalonamento para frente (Forward Elimination)
    for (let col = 0; col < n && currentRow < m; col++) {
        // Encontrar pivô usando pivoteamento parcial
        const { pivotRow, pivotValue } = findPivot(workMatrix, col, currentRow);
        
        // Se pivô é muito pequeno (próximo a zero), coluna é dependente
        if (Math.abs(pivotValue) < EPSILON) {
            steps.push({
                title: `Coluna ${col + 1} - Sem Pivô`,
                description: `Nenhum elemento não-nulo na coluna ${col + 1} a partir da linha ${currentRow + 1}.`,
                matrix: workMatrix.map(row => [...row])
            });
            continue;
        }
        
        // Trocar linhas se o pivô não está na posição atual (Pivoteamento Parcial)
        if (pivotRow !== currentRow) {
            const swapResult = swapRows(workMatrix, currentRow, pivotRow);
            workMatrix = swapResult.matrix;
            steps.push({
                title: `Passo: ${swapResult.operation}`,
                description: `Trocar linhas para obter o maior pivô na coluna ${col + 1}`,
                matrix: workMatrix.map(row => [...row])
            });
        }
        
        // Eliminar todos os elementos não-nulos abaixo do pivô
        // (Escalonamento sem normalizar para 1)
        for (let i = currentRow + 1; i < m; i++) {
            if (Math.abs(workMatrix[i][col]) > EPSILON) {
                // Calcular multiplicador para eliminar o elemento
                const scalar = -workMatrix[i][col] / workMatrix[currentRow][col];
                const addResult = addRows(workMatrix, currentRow, i, scalar);
                workMatrix = addResult.matrix;
                steps.push({
                    title: `Passo: ${addResult.operation}`,
                    description: `Eliminar elemento na posição [${i + 1}][${col + 1}]`,
                    matrix: workMatrix.map(row => [...row])
                });
            }
        }
        
        currentRow++;
    }
    
    return {
        matrix: workMatrix,
        steps: steps,
        rank: currentRow
    };
}

/**
 * Classifica o sistema como SPD, SPI ou SI
 * 
 * Conceitos:
 * - Rank(A): número de linhas não-nulas em [A]
 * - Rank([A|b]): número de linhas não-nulas em [A|b]
 * 
 * Classificação:
 * - SPD: Rank(A) = Rank([A|b]) = n (número de variáveis) → Solução única
 * - SPI: Rank(A) = Rank([A|b]) < n → Infinitas soluções
 * - SI: Rank(A) < Rank([A|b]) → Nenhuma solução (inconsistência)
 */
function classifySystem(matrix) {
    const m = matrix.length; // linhas
    const n = matrix[0].length - 1; // colunas de variáveis
    
    let rankA = 0;
    let rankAb = 0;
    
    // Contar linhas não-nulas
    for (let i = 0; i < m; i++) {
        let isZeroA = true;
        let isZeroAb = true;
        
        // Verifica se linha tem algo em [A]
        for (let j = 0; j < n; j++) {
            if (Math.abs(matrix[i][j]) > EPSILON) {
                isZeroA = false;
                break;
            }
        }
        
        // Verifica se linha tem algo em [A|b]
        for (let j = 0; j <= n; j++) {
            if (Math.abs(matrix[i][j]) > EPSILON) {
                isZeroAb = false;
                break;
            }
        }
        
        // Verifica inconsistência: 0 = b (última coluna não-nula mas resto zero)
        if (isZeroA && !isZeroAb) {
            return {
                type: 'SI',
                description: `Sistema Impossível (SI): Linha ${i + 1} representa 0 = ${matrix[i][n].toFixed(4)}, que é inconsistente.`,
                rankA: rankA,
                rankAb: rankAb + 1
            };
        }
        
        if (!isZeroA) rankA++;
        if (!isZeroAb) rankAb++;
    }
    
    if (rankA === rankAb && rankA === n) {
        return {
            type: 'SPD',
            description: `Sistema Possível Determinado (SPD): Rank(A) = Rank([A|b]) = ${rankA} = número de variáveis. Solução única.`,
            rankA: rankA,
            rankAb: rankAb
        };
    } else if (rankA === rankAb && rankA < n) {
        return {
            type: 'SPI',
            description: `Sistema Possível Indeterminado (SPI): Rank(A) = Rank([A|b]) = ${rankA} < ${n} variáveis. Infinitas soluções.`,
            rankA: rankA,
            rankAb: rankAb,
            freeVariables: n - rankA
        };
    } else {
        return {
            type: 'SI',
            description: `Sistema Impossível (SI): Rank(A) = ${rankA} < Rank([A|b]) = ${rankAb}. Nenhuma solução.`,
            rankA: rankA,
            rankAb: rankAb
        };
    }
}

/**
 * Extrai o conjunto solução a partir da matriz em forma escalonada
 * Funciona com pivôs que podem não ser 1
 * 
 * Para SPD: resolve usando substituição regressiva
 * Para SPI: expressa variáveis dependentes em função das variáveis livres
 * Para SI: indica sistema sem solução
 */
function extractSolution(matrix, classification) {
    const m = matrix.length; // número de linhas
    const n = matrix[0].length - 1; // número de variáveis
    
    if (classification.type === 'SI') {
        return 'Nenhuma solução. O sistema é inconsistente.';
    }
    
    // Identifica variáveis pivot (colunas que têm líderes de linhas não-nulas)
    const pivotCols = new Array(n).fill(null);
    const pivotValues = new Array(n).fill(null);
    
    for (let i = 0; i < m; i++) {
        // Encontra o primeiro elemento não-nulo da linha
        for (let j = 0; j < n; j++) {
            if (Math.abs(matrix[i][j]) > EPSILON) {
                pivotCols[j] = i;
                pivotValues[j] = matrix[i][j];
                break;
            }
        }
    }
    
    // Para SPD - Resolver usando substituição regressiva
    if (classification.type === 'SPD') {
        let solutionText = 'Solução única:\n';
        const solution = new Array(n).fill(0);
        
        // Substituição regressiva: começa da última linha
        for (let j = n - 1; j >= 0; j--) {
            if (pivotCols[j] !== null) {
                const i = pivotCols[j];
                let value = matrix[i][n]; // termo independente
                
                // Subtrai contribuições das variáveis já calculadas
                for (let k = j + 1; k < n; k++) {
                    value -= matrix[i][k] * solution[k];
                }
                
                // Divide pelo coeficiente (pivô)
                solution[j] = value / matrix[i][j];
            }
        }
        
        for (let j = 0; j < n; j++) {
            const varName = String.fromCharCode(120 + j); // x, y, z, ...
            solutionText += `${varName} = ${formatNumber(solution[j])}\n`;
        }
        
        solutionText += `\nS = {(${solution.map(v => formatNumber(v)).join(', ')})}`;
        return solutionText;
    }
    
    // Para SPI - Variáveis livres
    if (classification.type === 'SPI') {
        const freeVars = [];
        
        // Identifica variáveis livres (não-pivot)
        for (let j = 0; j < n; j++) {
            if (pivotCols[j] === null) {
                freeVars.push(j);
            }
        }
        
        let solutionText = 'Infinitas soluções. Sistema indeterminado:\n\n';
        solutionText += 'Variáveis livres: ';
        solutionText += freeVars.map(j => String.fromCharCode(120 + j)).join(', ') + '\n\n';
        
        solutionText += 'Variáveis dependentes em função das livres:\n';
        
        // Para cada variável pivot, expressa em função das variáveis livres
        for (let j = 0; j < n; j++) {
            if (pivotCols[j] !== null) {
                const i = pivotCols[j];
                const varName = String.fromCharCode(120 + j);
                const pivotCoef = matrix[i][j];
                
                let expression = `${varName} = (${formatNumber(matrix[i][n])}`;
                
                // Adiciona termos das variáveis (livres e dependentes)
                for (let k = 0; k < n; k++) {
                    if (k !== j && Math.abs(matrix[i][k]) > EPSILON) {
                        const coef = -matrix[i][k] / pivotCoef;
                        const varNameK = String.fromCharCode(120 + k);
                        if (coef > 0) {
                            expression += ` + ${formatNumber(coef)}*${varNameK}`;
                        } else {
                            expression += ` - ${formatNumber(Math.abs(coef))}*${varNameK}`;
                        }
                    }
                }
                
                expression += `) / ${formatNumber(pivotCoef)}`;
                solutionText += expression + '\n';
            }
        }
        
        return solutionText;
    }
}

/**
 * Formata um número para exibição, removendo zeros desnecessários
 * Exemplo: 1.0000 → 1, 2.5000 → 2.5, 0 → 0
 */
function formatNumber(value) {
    // Se é praticamente zero
    if (Math.abs(value) < EPSILON) {
        return '0';
    }
    
    // Se é um inteiro, exibe sem decimais
    if (Math.abs(value - Math.round(value)) < EPSILON) {
        return Math.round(value).toString();
    }
    
    // Caso contrário, exibe com até 4 casas decimais, removendo zeros à direita
    return parseFloat(value.toFixed(4)).toString();
}

/**
 * Converte uma array 2D em HTML para exibição visual
 * Exibe números de forma limpa (sem decimais desnecessários)
 */
function matrixToHTML(matrix, highlightPivots = false) {
    const n = matrix[0].length - 1; // número de variáveis
    
    let html = '<div class="matrix">';
    
    for (let i = 0; i < matrix.length; i++) {
        html += '<div class="matrix-row-display">';
        
        for (let j = 0; j < matrix[i].length; j++) {
            const value = matrix[i][j];
            const displayValue = formatNumber(value);
            
            let cellClass = 'matrix-cell';
            // Detecta se é um pivô (primeira coluna não-nula de uma linha)
            if (highlightPivots && j < n) {
                let isPivot = false;
                if (Math.abs(value) > EPSILON) {
                    // Verifica se todos os elementos anteriores nesta linha são zero
                    let allZeroBefore = true;
                    for (let k = 0; k < j; k++) {
                        if (Math.abs(matrix[i][k]) > EPSILON) {
                            allZeroBefore = false;
                            break;
                        }
                    }
                    isPivot = allZeroBefore;
                }
                if (isPivot) {
                    cellClass += ' matrix-pivot';
                }
            }
            
            html += `<div class="${cellClass}">${displayValue}</div>`;
            
            // Divider visual entre [A] e [b]
            if (j === n - 1) {
                html += '<div class="pivot-divider"></div>';
            }
        }
        
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

/**
 * Função principal que resolve o sistema linear
 * Coordena todas as etapas: entrada, processamento e saída
 */
function solveSystem() {
    try {
        // Limpa dados anteriores
        systemData = {
            matrix: null,
            originalMatrix: null,
            steps: [],
            classification: null,
            solution: null
        };
        
        // Lê a matriz dos inputs
        const matrix = readMatrixFromInputs();
        systemData.originalMatrix = matrix.map(row => [...row]);
        
        // Executa o algoritmo de Escalonamento
        const result = gaussianElimination(matrix);
        systemData.matrix = result.matrix;
        systemData.steps = result.steps;
        
        // Classifica o sistema
        systemData.classification = classifySystem(result.matrix);
        
        // Extrai a solução
        systemData.solution = extractSolution(result.matrix, systemData.classification);
        
        // Exibe os resultados
        displayResults();
        
    } catch (error) {
        alert(`Erro ao resolver sistema: ${error.message}`);
    }
}

/**
 * Exibe todos os resultados na página
 */
function displayResults() {
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('hidden');
    
    // Classificação
    const classificationDiv = document.getElementById('classification');
    const classElement = `classification ${systemData.classification.type.toLowerCase()}`;
    classificationDiv.className = classElement;
    classificationDiv.textContent = systemData.classification.description;
    
    // Matriz Original
    document.getElementById('original-matrix').innerHTML = matrixToHTML(systemData.originalMatrix);
    
    // Passo a Passo
    const stepsContainer = document.getElementById('steps-container');
    stepsContainer.innerHTML = '';
    
    // Mostra uma seleção de passos importantes (para não sobrecarregar a tela)
    const selectedSteps = systemData.steps;
    
    selectedSteps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.innerHTML = `
            <div class="step-title">Passo ${index + 1}: ${step.title}</div>
            <div class="step-description">${step.description}</div>
            ${matrixToHTML(step.matrix, true)}
        `;
        stepsContainer.appendChild(stepDiv);
    });
    
    // Matriz Final
    document.getElementById('final-matrix').innerHTML = matrixToHTML(systemData.matrix, true);
    
    // Solução
    document.getElementById('solution').textContent = systemData.solution;
    
    // Scroll para resultados
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

/**
 * Limpa todos os dados e volta ao estado inicial
 */
function resetCalculator() {
    document.getElementById('matrix-inputs').innerHTML = '';
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('rows').value = '3';
    document.getElementById('cols').value = '3';
    document.getElementById('file-input').value = '';
    systemData = {
        matrix: null,
        originalMatrix: null,
        steps: [],
        classification: null,
        solution: null
    };
}
