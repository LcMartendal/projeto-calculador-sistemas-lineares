/**
 * Classe que representa um sistema linear
 * Exemplo:
 * 2x + y = 5
 * x - y = 1
 *
 * Isso vira uma matriz:
 * [2 1 | 5]
 * [1 -1 | 1]
 */
class SistemaLinear {

    constructor(numeroDeEquacoes, numeroDeVariaveis) {
        // quantidade de linhas
        this.numeroDeEquacoes = numeroDeEquacoes;

        // quantidade de colunas (sem contar resultado)
        this.numeroDeVariaveis = numeroDeVariaveis;
    }

    // matriz que armazenará o sistema
    matriz = [];

    /**
     * Monta a matriz pedindo valores ao usuário
     */
    montarMatriz() {

        for (let i = 0; i < this.numeroDeEquacoes; i++) {

            // cria linha
            this.matriz[i] = [];

            for (let j = 0; j < this.numeroDeVariaveis + 1; j++) {

                // pede valor ao usuário
                const valor = parseFloat(
                    prompt(`Digite o valor da posição [${i}][${j}]`)
                );

                this.matriz[i][j] = valor;
            }
        }

        return this.matriz;
    }
}

/**
 * Classe responsável por:
 * - Escalonar a matriz
 * - Classificar o sistema
 * - Resolver o sistema
 */
class CalculadoraDeSistemasLineares {

    constructor(matriz) {
        this.matriz = matriz;
    }

    /**
     * Método que executa o ESCALONAMENTO
     * (Eliminação de Gauss)
     */
    executarEscalonamentoNaMatriz() {

        // percorre diagonal principal
        for (let i = 0; i < Math.min(this.matriz.length, this.matriz[0].length - 1); i++) {

            // se pivô for zero → tenta trocar linha
            if (this.matriz[i][i] === 0) {

                let trocouLinha = false;

                for (let k = i + 1; k < this.matriz.length; k++) {

                    // procura linha abaixo com pivô diferente de zero
                    if (this.matriz[k][i] !== 0) {

                        // troca as linhas
                        this.trocarLinhas(this.matriz, i, k);

                        mostrarNovoPassoNoCalculo(`Troca L${i + 1} ↔ L${k + 1}`);
                        imprimirMatriz(this.matriz);

                        trocouLinha = true;
                        break;
                    }
                }

                // se não conseguiu trocar, pula
                if (!trocouLinha) continue;
            }

            // pivô atual
            let pivo = this.matriz[i][i];

            if (!isFinite(pivo) || pivo === 0) continue;

            // zera valores abaixo do pivô
            for (let k = i + 1; k < this.matriz.length; k++) {

                // calcula fator
                let fator = this.matriz[k][i] / pivo;

                if (!isFinite(fator)) continue;

                // operação linha
                for (let j = 0; j < this.matriz[i].length; j++) {
                    this.matriz[k][j] -= fator * this.matriz[i][j];
                }

                mostrarNovoPassoNoCalculo(
                    `L${k + 1} = L${k + 1} - (${fator.toFixed(3)}) * L${i + 1}`
                );

                imprimirMatriz(this.matriz);
            }
        }
    }

    /**
     * Resolve o sistema após escalonamento
     */
    resolverSistema() {

        const n = this.matriz.length;
        const m = this.matriz[0].length;

        let rank = 0;

        // verifica pivôs
        for (let i = 0; i < n; i++) {

            let temPivo = false;

            for (let j = 0; j < m - 1; j++) {
                if (Math.abs(this.matriz[i][j]) > 1e-10) {
                    temPivo = true;
                    break;
                }
            }

            if (temPivo) {
                rank++;
            } else {

                // linha do tipo 0 0 0 | b (b ≠ 0)
                if (Math.abs(this.matriz[i][m - 1]) > 1e-10) {
                    mostrarNovoPassoNoCalculo("Sistema Impossível (SI)");
                    return null;
                }
            }
        }

        const variaveis = m - 1;

        // SPI
        if (rank < variaveis) {
            return this.resolverSPI();
        }

        mostrarNovoPassoNoCalculo("Sistema Possível e Determinado (SPD)");

        // substituição para trás
        const solucoes = new Array(n).fill(0);

        for (let i = n - 1; i >= 0; i--) {

            let soma = 0;

            for (let j = i + 1; j < m - 1; j++) {
                soma += this.matriz[i][j] * solucoes[j];
            }

            const termo = this.matriz[i][m - 1];
            const pivo = this.matriz[i][i];

            solucoes[i] = (termo - soma) / pivo;

            mostrarNovoPassoNoCalculo(
                `x${i + 1} = (${termo.toFixed(3)} - ${soma.toFixed(3)}) / ${pivo.toFixed(3)}`
            );
        }

        return solucoes;
    }

    /**
     * Resolve quando o sistema é SPI
     * (infinitas soluções)
     */
    resolverSPI() {

        const A = this.matriz;
        const n = A.length;
        const m = A[0].length;

        const vars = ["x", "y", "z", "w", "v"];
        const livres = new Array(m - 1).fill(true);
        const sol = new Array(m - 1);

        // identifica variáveis livres
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m - 1; j++) {
                if (Math.abs(A[i][j]) > 1e-10) {
                    livres[j] = false;
                    break;
                }
            }
        }

        // define parâmetro t
        let param = "t";
        for (let j = 0; j < m - 1; j++) {
            if (livres[j]) sol[j] = param;
        }

        // retro substituição simbólica
        for (let i = n - 1; i >= 0; i--) {

            let pivotCol = -1;

            for (let j = 0; j < m - 1; j++) {
                if (Math.abs(A[i][j]) > 1e-10) {
                    pivotCol = j;
                    break;
                }
            }

            if (pivotCol === -1) continue;

            let expr = A[i][m - 1];

            for (let j = pivotCol + 1; j < m - 1; j++) {
                if (sol[j] !== undefined) {
                    expr += ` - (${A[i][j].toFixed(3)})${sol[j]}`;
                }
            }

            sol[pivotCol] = `(${expr})/${A[i][pivotCol].toFixed(3)}`;
        }

        mostrarNovoPassoNoCalculo("Sistema Possível e Indeterminado (SPI)");

        // monta conjunto solução
        let saida = "S = { (";

        for (let i = 0; i < m - 1; i++) {
            saida += vars[i] + (i < m - 2 ? ", " : "");
        }

        saida += ") | ";

        for (let i = 0; i < m - 1; i++) {
            saida += `${vars[i]} = ${sol[i]}`;
            if (i < m - 2) saida += ", ";
        }

        saida += ", t ∈ ℝ }";

        mostrarNovoPassoNoCalculo(saida);

        return saida;
    }

    /**
     * Troca duas linhas da matriz
     */
    trocarLinhas(matriz, i, k) {
        [matriz[i], matriz[k]] = [matriz[k], matriz[i]];
    }
}

/**
 * Mostra um passo no painel
 */
function mostrarNovoPassoNoCalculo(texto) {
    const passos = document.getElementById("passos");
    passos.textContent += texto + "\n";
}

/**
 * Imprime matriz atual no painel
 */
function imprimirMatriz(matriz) {
    const passos = document.getElementById("passos");

    matriz.forEach(linha => {
        passos.textContent += linha
            .map(v => isFinite(v) ? Number(v).toFixed(3) : "NaN")
            .join(" ") + "\n";
    });

    passos.textContent += "\n";
}