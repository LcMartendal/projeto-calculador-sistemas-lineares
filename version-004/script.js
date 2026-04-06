/**
 * SOLUCIONADOR DE SISTEMAS LINEARES - Eliminação de Gauss-Jordan com Pivoteamento Parcial
 *
 * Este programa implementa o método de Escalonamento (Eliminação de Gauss-Jordan) para resolver
 * sistemas lineares da forma Ax = b (representado pela matriz ampliada [A|b]).
 *
 * Conceitos Matemáticos:
 * - Operações Elementares de Linha: multiplicação, adição e troca de linhas
 * - Pivô: elemento diagonal não-nulo usado para eliminar elementos abaixo e acima
 * - Pivoteamento Parcial: troca de linhas quando o pivô é nulo ou próximo de zero
 * - Forma Escalonada Reduzida (RREF): matriz onde cada pivô é 1 e é o único
 *   elemento não-nulo na sua coluna
 *
 * Classificação de Sistemas:
 * - SPD (Sistema Possível Determinado): solução única
 * - SPI (Sistema Possível Indeterminado): infinitas soluções
 * - SI (Sistema Impossível): nenhuma solução
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
                throw new Error(`Valor inválido em [${i+1}][${j+1}]`);
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
        const values = lines[i].trim().split(/\s+/).map(Number);
        if (values.length !== n + 1) {
            throw new Error(`Linha ${i} possui ${values.length} elementos, mas esperados ${n + 1}.`);
        }
        matrix.push(values);
    }

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
 * Usado para normalizar o pivô para 1 (etapa da forma escalonada reduzida)
 */
function multiplyRow(matrix, rowIndex, scalar) {
    if (Math.abs(scalar) < EPSILON) {
        throw new Error('Não é possível multiplicar por zero.');
    }

    const newMatrix = matrix.map(row => [...row]);
    for (let j = 0; j < newMatrix[rowIndex].length; j++) {
        newMatrix[rowIndex][j] *= scalar;
        if (Math.abs(newMatrix[rowIndex][j]) < EPSILON) {
            newMatrix[rowIndex][j] = 0;
        }
    }

    return {
        matrix: newMatrix,
        operation: `L${rowIndex + 1} ← (${scalar.toFixed(4)}) × L${rowIndex + 1}`
    };
}

/**
 * OPERAÇÃO ELEMENTAR 2: Adicionar múltiplo de uma linha a outra
 * Conceito: L_i = L_i + c * L_j
 * Usado para eliminar o pivô em linhas abaixo (fase direta) e acima (fase inversa / RREF)
 */
function addRows(matrix, sourceRow, targetRow, scalar) {
    const newMatrix = matrix.map(row => [...row]);

    for (let j = 0; j < newMatrix[targetRow].length; j++) {
        newMatrix[targetRow][j] += scalar * newMatrix[sourceRow][j];
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
 * Pivoteamento Parcial: busca a linha com o maior elemento em módulo
 * a partir da linha atual, melhorando a estabilidade numérica e evitando
 * divisão por valores próximos de zero.
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
 * a partir de startRow para baixo — implementa o Pivoteamento Parcial.
 *
 * Retorna:
 * - pivotRow: índice da linha com o maior elemento
 * - pivotValue: valor desse elemento
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
 * ALGORITMO PRINCIPAL: Eliminação de Gauss-Jordan com Pivoteamento Parcial
 *
 * Transforma a matriz ampliada [A|b] para a Forma Escalonada Reduzida (RREF)
 * através de operações elementares de linha.
 *
 * O processo tem duas fases:
 *
 * FASE 1 — Eliminação para frente (Forward Elimination):
 *   Para cada coluna de variável:
 *     a. Pivoteamento Parcial: troca linhas para colocar o maior elemento no pivô
 *     b. Se pivô ≈ 0, a coluna é dependente — pula para a próxima
 *     c. Normaliza a linha do pivô: L_i ← (1/pivô) × L_i  →  pivô vira 1
 *     d. Elimina elementos ABAIXO do pivô: L_j ← L_j - a_ji × L_i
 *
 * FASE 2 — Eliminação para trás (Back Elimination):
 *   Para cada pivô já encontrado (de baixo para cima):
 *     Elimina elementos ACIMA do pivô: L_i ← L_i - a_ij × L_j
 *
 * Resultado: Forma Escalonada Reduzida (RREF), onde:
 *   - Cada pivô é 1
 *   - Cada pivô é o único elemento não-nulo na sua coluna
 */
function gaussianElimination(matrix) {
    const m = matrix.length;           // número de equações (linhas)
    const n = matrix[0].length - 1;   // número de variáveis (colunas sem b)

    let workMatrix = matrix.map(row => [...row]);
    const steps = [];
    let currentRow = 0;

    // Guarda quais colunas têm pivô e em qual linha
    const pivotPositions = []; // [{row, col}, ...]

    // ── FASE 1: Eliminação para frente ──────────────────────────────────────
    for (let col = 0; col < n && currentRow < m; col++) {

        // Pivoteamento Parcial: encontra o maior elemento na coluna
        const { pivotRow, pivotValue } = findPivot(workMatrix, col, currentRow);

        // Se pivô ≈ 0, a coluna não tem variável dependente aqui
        if (Math.abs(pivotValue) < EPSILON) {
            steps.push({
                title: `Coluna ${col + 1} — Sem Pivô`,
                description: `Todos os elementos na coluna ${col + 1} a partir da linha ${currentRow + 1} são nulos. Coluna pulada (variável livre).`,
                matrix: workMatrix.map(row => [...row])
            });
            continue;
        }

        // Troca linhas se necessário (Pivoteamento Parcial)
        if (pivotRow !== currentRow) {
            const swapResult = swapRows(workMatrix, currentRow, pivotRow);
            workMatrix = swapResult.matrix;
            steps.push({
                title: `Pivoteamento: ${swapResult.operation}`,
                description: `Troca de linhas para posicionar o maior pivô (${formatNumber(pivotValue)}) na coluna ${col + 1}.`,
                matrix: workMatrix.map(row => [...row])
            });
        }

        // Normalização: divide a linha do pivô pelo valor do pivô → pivô vira 1
        // Conceito: L_i ← (1 / pivô) × L_i
        const pivotVal = workMatrix[currentRow][col];
        if (Math.abs(pivotVal - 1) > EPSILON) {
            const normalResult = multiplyRow(workMatrix, currentRow, 1 / pivotVal);
            workMatrix = normalResult.matrix;
            steps.push({
                title: `Normalização: ${normalResult.operation}`,
                description: `Divide L${currentRow + 1} pelo pivô (${formatNumber(pivotVal)}) para que o pivô se torne 1.`,
                matrix: workMatrix.map(row => [...row])
            });
        }

        // Eliminação abaixo do pivô
        for (let i = currentRow + 1; i < m; i++) {
            if (Math.abs(workMatrix[i][col]) > EPSILON) {
                const scalar = -workMatrix[i][col]; // pivô já é 1
                const addResult = addRows(workMatrix, currentRow, i, scalar);
                workMatrix = addResult.matrix;
                steps.push({
                    title: `Eliminação (abaixo): ${addResult.operation}`,
                    description: `Zera o elemento na posição [${i + 1}][${col + 1}] usando o pivô da linha ${currentRow + 1}.`,
                    matrix: workMatrix.map(row => [...row])
                });
            }
        }

        pivotPositions.push({ row: currentRow, col: col });
        currentRow++;
    }

    // ── FASE 2: Eliminação para trás (Back Elimination) ─────────────────────
    // Para cada pivô, elimina os elementos ACIMA dele → RREF completa
    for (let p = pivotPositions.length - 1; p >= 0; p--) {
        const { row: pivRow, col: pivCol } = pivotPositions[p];

        for (let i = 0; i < pivRow; i++) {
            if (Math.abs(workMatrix[i][pivCol]) > EPSILON) {
                const scalar = -workMatrix[i][pivCol]; // pivô é 1
                const addResult = addRows(workMatrix, pivRow, i, scalar);
                workMatrix = addResult.matrix;
                steps.push({
                    title: `Eliminação (acima): ${addResult.operation}`,
                    description: `Zera o elemento na posição [${i + 1}][${pivCol + 1}] para obter a Forma Escalonada Reduzida (RREF).`,
                    matrix: workMatrix.map(row => [...row])
                });
            }
        }
    }

    return {
        matrix: workMatrix,
        steps: steps,
        pivotPositions: pivotPositions,
        rank: pivotPositions.length
    };
}

/**
 * Classifica o sistema como SPD, SPI ou SI
 *
 * Conceitos:
 * - Rank(A):    número de linhas não-nulas em [A]
 * - Rank([A|b]): número de linhas não-nulas em [A|b]
 *
 * Classificação:
 * - SPD: Rank(A) = Rank([A|b]) = n  → Solução única
 * - SPI: Rank(A) = Rank([A|b]) < n  → Infinitas soluções
 * - SI:  Rank(A) < Rank([A|b])       → Nenhuma solução
 */
function classifySystem(matrix) {
    const m = matrix.length;
    const n = matrix[0].length - 1;

    let rankA = 0;
    let rankAb = 0;

    for (let i = 0; i < m; i++) {
        let isZeroA  = true;
        let isZeroAb = true;

        for (let j = 0; j < n; j++) {
            if (Math.abs(matrix[i][j]) > EPSILON) { isZeroA = false; break; }
        }
        for (let j = 0; j <= n; j++) {
            if (Math.abs(matrix[i][j]) > EPSILON) { isZeroAb = false; break; }
        }

        // Linha do tipo "0 = b" com b ≠ 0 → inconsistência
        if (isZeroA && !isZeroAb) {
            return {
                type: 'SI',
                description: `Sistema Impossível (SI): a linha ${i + 1} representa 0 = ${formatNumber(matrix[i][n])}, o que é inconsistente.`,
                rankA: rankA,
                rankAb: rankAb + 1
            };
        }

        if (!isZeroA)  rankA++;
        if (!isZeroAb) rankAb++;
    }

    if (rankA === rankAb && rankA === n) {
        return {
            type: 'SPD',
            description: `Sistema Possível Determinado (SPD): Rank(A) = Rank([A|b]) = ${rankA} = nº de variáveis. Solução única.`,
            rankA, rankAb
        };
    } else if (rankA === rankAb && rankA < n) {
        return {
            type: 'SPI',
            description: `Sistema Possível Indeterminado (SPI): Rank(A) = Rank([A|b]) = ${rankA} < ${n} variáveis. Infinitas soluções (${n - rankA} variável(is) livre(s)).`,
            rankA, rankAb,
            freeVariables: n - rankA
        };
    } else {
        return {
            type: 'SI',
            description: `Sistema Impossível (SI): Rank(A) = ${rankA} ≠ Rank([A|b]) = ${rankAb}. Nenhuma solução.`,
            rankA, rankAb
        };
    }
}

/**
 * Extrai o conjunto solução a partir da matriz em Forma Escalonada Reduzida (RREF)
 *
 * Como a matriz está em RREF (pivôs = 1, zeros acima e abaixo):
 * - SPD: lê a solução diretamente da última coluna
 * - SPI: expressa variáveis dependentes em função APENAS das variáveis livres
 * - SI:  informa que o sistema não tem solução
 */
function extractSolution(matrix, classification) {
    const m = matrix.length;
    const n = matrix[0].length - 1;

    if (classification.type === 'SI') {
        return 'Nenhuma solução. O sistema é inconsistente.';
    }

    // Identifica colunas pivô (primeira coluna não-nula de cada linha)
    const pivotColOfRow = new Array(m).fill(null);
    const isPivotCol    = new Array(n).fill(false);

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (Math.abs(matrix[i][j]) > EPSILON) {
                pivotColOfRow[i] = j;
                isPivotCol[j]    = true;
                break;
            }
        }
    }

    // Variáveis livres: colunas sem pivô
    const freeVars = [];
    for (let j = 0; j < n; j++) {
        if (!isPivotCol[j]) freeVars.push(j);
    }

    // ── SPD: lê solução diretamente (RREF → pivô = 1, coluna limpa) ─────────
    if (classification.type === 'SPD') {
        const solution = new Array(n).fill(0);

        for (let i = 0; i < m; i++) {
            const pc = pivotColOfRow[i];
            if (pc !== null) {
                solution[pc] = matrix[i][n]; // pivô é 1, leitura direta
            }
        }

        let text = 'Solução única:\n';
        for (let j = 0; j < n; j++) {
            const varName = varLabel(j);
            text += `${varName} = ${formatNumber(solution[j])}\n`;
        }
        text += `\nS = {(${solution.map(v => formatNumber(v)).join(', ')})}`;
        return text;
    }

    // ── SPI: expressa pivôs em função das variáveis livres ──────────────────
    if (classification.type === 'SPI') {
        let text = 'Infinitas soluções. Sistema indeterminado.\n\n';
        text += `Variável(is) livre(s): ${freeVars.map(j => varLabel(j)).join(', ')}\n\n`;
        text += 'Solução geral (variáveis dependentes em função das livres):\n';

        for (let i = 0; i < m; i++) {
            const pc = pivotColOfRow[i];
            if (pc === null) continue;

            const varName = varLabel(pc);
            const constTerm = matrix[i][n];
            let expr = `${varName} = `;
            let firstTerm = true;

            if (Math.abs(constTerm) > EPSILON) {
                expr += formatNumber(constTerm);
                firstTerm = false;
            }

            // Na RREF, os únicos termos restantes nesta linha são nas colunas livres
            for (const fj of freeVars) {
                const coef = -matrix[i][fj]; // move para o outro lado
                if (Math.abs(coef) < EPSILON) continue;
                const sign = coef >= 0 ? ' + ' : ' - ';
                expr += `${sign}${formatNumber(Math.abs(coef))}${varLabel(fj)}`;
            }

            text += expr + '\n';
        }

        text += `\n(onde ${freeVars.map(j => `${varLabel(j)} ∈ ℝ`).join(', ')})`;
        return text;
    }
}

/**
 * Retorna o nome da variável para o índice dado
 * 0 → x, 1 → y, 2 → z, 3 → w, 4 → v, ... ou x1, x2, ... para mais de 6 variáveis
 */
function varLabel(index) {
    const names = ['x', 'y', 'z', 'w', 'v', 'u'];
    return index < names.length ? names[index] : `x${index + 1}`;
}

/**
 * Formata um número para exibição, removendo zeros desnecessários
 * Exemplos: 1.0000 → 1, 2.5000 → 2.5, 0 → 0
 */
function formatNumber(value) {
    if (Math.abs(value) < EPSILON) return '0';
    if (Math.abs(value - Math.round(value)) < EPSILON) return Math.round(value).toString();
    return parseFloat(value.toFixed(4)).toString();
}

/**
 * Converte uma array 2D em HTML para exibição visual da matriz
 * Destaca pivôs e insere divisor visual entre [A] e [b]
 */
function matrixToHTML(matrix, highlightPivots = false) {
    const n = matrix[0].length - 1;

    let html = '<div class="matrix">';

    for (let i = 0; i < matrix.length; i++) {
        html += '<div class="matrix-row-display">';

        for (let j = 0; j < matrix[i].length; j++) {
            const value = matrix[i][j];
            let cellClass = 'matrix-cell';

            if (highlightPivots && j < n && Math.abs(value) > EPSILON) {
                let allZero = true;
                for (let k = 0; k < j; k++) {
                    if (Math.abs(matrix[i][k]) > EPSILON) { allZero = false; break; }
                }
                if (allZero) cellClass += ' matrix-pivot';
            }

            html += `<div class="${cellClass}">${formatNumber(value)}</div>`;

            if (j === n - 1) html += '<div class="pivot-divider"></div>';
        }

        html += '</div>';
    }

    html += '</div>';
    return html;
}

/**
 * Função principal — coordena entrada, processamento e saída
 */
function solveSystem() {
    try {
        systemData = { matrix: null, originalMatrix: null, steps: [], classification: null, solution: null };

        const matrix = readMatrixFromInputs();
        systemData.originalMatrix = matrix.map(row => [...row]);

        const result = gaussianElimination(matrix);
        systemData.matrix = result.matrix;
        systemData.steps  = result.steps;

        systemData.classification = classifySystem(result.matrix);
        systemData.solution       = extractSolution(result.matrix, systemData.classification);

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

    const classDiv = document.getElementById('classification');
    classDiv.className = `classification ${systemData.classification.type.toLowerCase()}`;
    classDiv.textContent = systemData.classification.description;

    document.getElementById('original-matrix').innerHTML = matrixToHTML(systemData.originalMatrix);

    const stepsContainer = document.getElementById('steps-container');
    stepsContainer.innerHTML = '';
    systemData.steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.innerHTML = `
            <div class="step-title">Passo ${index + 1}: ${step.title}</div>
            <div class="step-description">${step.description}</div>
            ${matrixToHTML(step.matrix, true)}
        `;
        stepsContainer.appendChild(stepDiv);
    });

    document.getElementById('final-matrix').innerHTML = matrixToHTML(systemData.matrix, true);
    document.getElementById('solution').textContent   = systemData.solution;

    setTimeout(() => resultsSection.scrollIntoView({ behavior: 'smooth' }), 100);
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
    systemData = { matrix: null, originalMatrix: null, steps: [], classification: null, solution: null };
}