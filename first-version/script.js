// ===== MATRIX CALCULATOR =====

class MatrixCalculator {
    constructor() {
        this.matrix = [];
        this.rows = 2;
        this.cols = 2;
        this.init();
    }

    init() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateMatrix());
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculate());
        document.getElementById('rows').addEventListener('change', () => this.updateSize());
        document.getElementById('cols').addEventListener('change', () => this.updateSize());
        
        this.generateMatrix();
    }

    updateSize() {
        this.rows = parseInt(document.getElementById('rows').value);
        this.cols = parseInt(document.getElementById('cols').value);
        this.generateMatrix();
    }

    generateMatrix() {
        this.rows = parseInt(document.getElementById('rows').value);
        this.cols = parseInt(document.getElementById('cols').value);
        
        const container = document.getElementById('matrixInput');
        let html = '<table>';
        
        for (let i = 0; i < this.rows; i++) {
            html += '<tr>';
            for (let j = 0; j < this.cols; j++) {
                html += `<td><input type="number" id="m_${i}_${j}" step="0.01" value="0"></td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        
        container.innerHTML = html;
    }

    getMatrixFromInput() {
        const matrix = [];
        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                const value = parseFloat(document.getElementById(`m_${i}_${j}`).value) || 0;
                row.push(value);
            }
            matrix.push(row);
        }
        return matrix;
    }

    // Calcula o determinante de uma matriz
    determinant(matrix) {
        const n = matrix.length;
        
        // Verifica se é quadrada
        if (n === 0 || n !== matrix[0].length) {
            return null;
        }

        // Matriz 1x1
        if (n === 1) {
            return matrix[0][0];
        }

        // Matriz 2x2
        if (n === 2) {
            return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        }

        // Matriz 3x3 - Regra de Sarrus
        if (n === 3) {
            const a = matrix[0][0] * matrix[1][1] * matrix[2][2];
            const b = matrix[0][1] * matrix[1][2] * matrix[2][0];
            const c = matrix[0][2] * matrix[1][0] * matrix[2][1];
            const d = matrix[0][2] * matrix[1][1] * matrix[2][0];
            const e = matrix[0][0] * matrix[1][2] * matrix[2][1];
            const f = matrix[0][1] * matrix[1][0] * matrix[2][2];
            return a + b + c - d - e - f;
        }

        // Para matrizes maiores - Regra de Laplace (Cofatores)
        let det = 0;
        for (let j = 0; j < n; j++) {
            det += matrix[0][j] * this.cofactor(matrix, 0, j);
        }
        return det;
    }

    // Calcula o cofator de um elemento (i, j)
    cofactor(matrix, row, col) {
        const minor = this.getMinor(matrix, row, col);
        const det = this.determinant(minor);
        return Math.pow(-1, row + col) * det;
    }

    // Obtém a matriz menor removendo linha e coluna
    getMinor(matrix, row, col) {
        const n = matrix.length;
        const minor = [];
        
        for (let i = 0; i < n; i++) {
            if (i === row) continue;
            const newRow = [];
            for (let j = 0; j < n; j++) {
                if (j !== col) {
                    newRow.push(matrix[i][j]);
                }
            }
            minor.push(newRow);
        }
        return minor;
    }

    // Calcula a matriz adjunta (transposta da matriz de cofatores)
    adjugate(matrix) {
        const n = matrix.length;
        const adjMatrix = [];

        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                row.push(this.cofactor(matrix, j, i)); // j, i (transposição)
            }
            adjMatrix.push(row);
        }

        return adjMatrix;
    }

    // Calcula a matriz inversa
    inverse(matrix) {
        const n = matrix.length;
        
        // Verifica se é quadrada
        if (n === 0 || n !== matrix[0].length) {
            return null;
        }

        const det = this.determinant(matrix);

        // Verifica se é singular (determinante = 0)
        if (Math.abs(det) < 1e-10) {
            return null;
        }

        // A^-1 = (1/det(A)) * adj(A)
        const adj = this.adjugate(matrix);
        const inverse = [];

        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                row.push(adj[i][j] / det);
            }
            inverse.push(row);
        }

        return inverse;
    }

    // Determina o status da matriz
    getMatrixStatus(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;

        // Se não é quadrada
        if (rows !== cols) {
            return {
                status: 'Não quadrada',
                details: `Matriz ${rows}×${cols} não é quadrada. Determinante e inversa não podem ser calculados.`,
                type: 'info'
            };
        }

        const det = this.determinant(matrix);

        if (det === null) {
            return {
                status: 'Erro',
                details: 'Erro ao calcular o determinante.',
                type: 'error'
            };
        }

        if (Math.abs(det) < 1e-10) {
            return {
                status: 'Possível Indeterminado',
                details: `Determinante = 0. A matriz é singular (não invertível). O sistema pode ser possível indeterminado ou impossível.`,
                type: 'possivel'
            };
        }

        return {
            status: 'Determinado',
            details: `Determinante ≠ 0. A matriz é invertível. O sistema tem solução única.`,
            type: 'determinante'
        };
    }

    // Formata uma matriz para exibição
    formatMatrix(matrix) {
        if (!matrix) {
            return '<span class="error-message">Não foi possível calcular</span>';
        }

        let html = '<div class="matrix-display"><table>';
        
        for (let i = 0; i < matrix.length; i++) {
            html += '<tr>';
            for (let j = 0; j < matrix[i].length; j++) {
                const value = matrix[i][j];
                const formatted = typeof value === 'number' ? value.toFixed(4) : value;
                html += `<td>${formatted}</td>`;
            }
            html += '</tr>';
        }
        
        html += '</table></div>';
        return html;
    }

    // Formata um número para exibição
    formatNumber(num) {
        if (num === null || num === undefined) {
            return 'Não definido';
        }
        return Math.abs(num) < 1e-10 ? '0' : num.toFixed(6);
    }

    // Função principal de cálculo
    calculate() {
        this.matrix = this.getMatrixFromInput();

        // Exibe a matriz original
        const originalHTML = this.formatMatrix(this.matrix);
        document.getElementById('originalResult').innerHTML = originalHTML;

        // Calcula e exibe o status
        const status = this.getMatrixStatus(this.matrix);
        let statusHTML = `<div class="status-${status.type}"><strong>${status.status}</strong></div>`;
        statusHTML += `<p style="margin-top: 10px; color: #64748b; font-size: 0.95em;">${status.details}</p>`;
        document.getElementById('status').innerHTML = statusHTML;

        // Calcula e exibe o determinante (se for quadrada)
        if (this.matrix.length === this.matrix[0].length) {
            const det = this.determinant(this.matrix);
            const detHTML = `<strong>det(A) = ${this.formatNumber(det)}</strong>`;
            document.getElementById('determinantResult').innerHTML = detHTML;
        } else {
            document.getElementById('determinantResult').innerHTML = '<span class="info-message">Matriz não é quadrada. Determinante não existe.</span>';
        }

        // Calcula e exibe a inversa (se existir)
        const inverse = this.inverse(this.matrix);
        if (inverse) {
            const inverseHTML = this.formatMatrix(inverse);
            document.getElementById('inverseResult').innerHTML = inverseHTML;
        } else {
            let inverseMessage = '<span class="error-message">';
            if (this.matrix.length !== this.matrix[0].length) {
                inverseMessage += 'Matriz não é quadrada. Inversa não existe.';
            } else {
                inverseMessage += 'Determinante é zero. Matriz é singular (não invertível).';
            }
            inverseMessage += '</span>';
            document.getElementById('inverseResult').innerHTML = inverseMessage;
        }
    }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
    new MatrixCalculator();
});
