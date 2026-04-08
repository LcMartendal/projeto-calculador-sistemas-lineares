/**
 * SOLUCIONADOR DE SISTEMAS LINEARES — Escalonamento de Gauss com Pivoteamento Parcial
 *
 * Este programa implementa o método de Escalonamento de Gauss para resolver
 * sistemas lineares da forma Ax = b (representado pela matriz ampliada [A|b]).
 *
 * O algoritmo:
 * 1. Escalona a matriz (zera apenas ABAIXO do pivô)
 * 2. Classifica o sistema (SPD, SPI, SI)
 * 3. Resolve usando substituição retroativa (quando SPD)
 */

const EPSILON = 1e-10;

let dadosSistema = {
    matriz: null,
    matrizOriginal: null,
    passos: [],
    classificacao: null,
    solucao: null
};

function criarInputsMatriz() {
    const linhas = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);

    const container = document.getElementById('matrix-inputs');
    container.innerHTML = '';

    for (let i = 0; i < linhas; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';

        for (let j = 0; j <= cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.placeholder = j === cols ? 'b' : `a${i + 1}${j + 1}`;
            input.id = `cell-${i}-${j}`;
            rowDiv.appendChild(input);
        }

        container.appendChild(rowDiv);
    }
}

function lerMatrizInputs() {
    const linhas = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);

    const matriz = [];

    for (let i = 0; i < linhas; i++) {
        const linha = [];
        for (let j = 0; j <= cols; j++) {
            const valor = parseFloat(document.getElementById(`cell-${i}-${j}`).value);
            if (isNaN(valor)) throw new Error("Preencha todos os valores.");
            linha.push(valor);
        }
        matriz.push(linha);
    }

    return matriz;
}

function trocarLinhas(matriz, l1, l2) {
    const nova = matriz.map(l => [...l]);
    [nova[l1], nova[l2]] = [nova[l2], nova[l1]];

    return {
        matriz: nova,
        operacao: `L${l1 + 1} ↔ L${l2 + 1}`
    };
}

function somarLinhas(matriz, origem, destino, fator) {
    const nova = matriz.map(l => [...l]);

    for (let j = 0; j < nova[0].length; j++) {
        nova[destino][j] += fator * nova[origem][j];
        if (Math.abs(nova[destino][j]) < EPSILON) nova[destino][j] = 0;
    }

    return {
        matriz: nova,
        operacao: `L${destino + 1} ← L${destino + 1} + (${fator.toFixed(4)})L${origem + 1}`
    };
}

function encontrarPivo(matriz, col, linhaInicial) {
    let linhaPivo = linhaInicial;
    let max = Math.abs(matriz[linhaInicial][col]);

    for (let i = linhaInicial + 1; i < matriz.length; i++) {
        const valor = Math.abs(matriz[i][col]);
        if (valor > max) {
            max = valor;
            linhaPivo = i;
        }
    }

    return {
        linhaPivo,
        valorPivo: matriz[linhaPivo][col]
    };
}

/**
 * ESCALONAMENTO DE GAUSS
 * Zera apenas abaixo do pivô
 */
function escalonamentoGauss(matriz) {

    let m = matriz.length;
    let n = matriz[0].length - 1;

    let trabalho = matriz.map(l => [...l]);
    let passos = [];

    let linhaAtual = 0;

    for (let col = 0; col < n && linhaAtual < m; col++) {

        const { linhaPivo, valorPivo } = encontrarPivo(trabalho, col, linhaAtual);

        if (Math.abs(valorPivo) < EPSILON) continue;

        if (linhaPivo !== linhaAtual) {
            const troca = trocarLinhas(trabalho, linhaAtual, linhaPivo);
            trabalho = troca.matriz;

            passos.push({
                titulo: "Troca de linhas",
                descricao: troca.operacao,
                matriz: trabalho.map(l => [...l])
            });
        }

        for (let i = linhaAtual + 1; i < m; i++) {
            if (Math.abs(trabalho[i][col]) > EPSILON) {

                const fator = -trabalho[i][col] / trabalho[linhaAtual][col];

                const resultado = somarLinhas(trabalho, linhaAtual, i, fator);
                trabalho = resultado.matriz;

                passos.push({
                    titulo: "Eliminação",
                    descricao: resultado.operacao,
                    matriz: trabalho.map(l => [...l])
                });
            }
        }

        linhaAtual++;
    }

    return {
        matriz: trabalho,
        passos
    };
}

function substituicaoRetroativa(matriz) {

    const m = matriz.length;
    const n = matriz[0].length - 1;

    const solucao = new Array(n).fill(0);

    for (let i = m - 1; i >= 0; i--) {

        let soma = matriz[i][n];
        let colPivo = -1;

        for (let j = 0; j < n; j++) {
            if (Math.abs(matriz[i][j]) > EPSILON) {
                colPivo = j;
                break;
            }
        }

        if (colPivo === -1) continue;

        for (let j = colPivo + 1; j < n; j++) {
            soma -= matriz[i][j] * solucao[j];
        }

        solucao[colPivo] = soma / matriz[i][colPivo];
    }

    return solucao;
}

function classificarSistema(matriz) {

    const m = matriz.length;
    const n = matriz[0].length - 1;

    let rankA = 0;
    let rankAb = 0;

    for (let i = 0; i < m; i++) {

        let zeroA = true;
        let zeroAb = true;

        for (let j = 0; j < n; j++)
            if (Math.abs(matriz[i][j]) > EPSILON) zeroA = false;

        for (let j = 0; j <= n; j++)
            if (Math.abs(matriz[i][j]) > EPSILON) zeroAb = false;

        if (zeroA && !zeroAb)
            return { type: "SI", description: "Sistema impossível." };

        if (!zeroA) rankA++;
        if (!zeroAb) rankAb++;
    }

    if (rankA === rankAb && rankA === n)
        return { type: "SPD", description: "Sistema possível determinado (solução única)." };

    if (rankA === rankAb)
        return { type: "SPI", description: "Sistema possível indeterminado (infinitas soluções)." };

    return { type: "SI", description: "Sistema impossível." };
}

function extrairSolucao(matriz, classificacao) {

    const m = matriz.length;
    const n = matriz[0].length - 1;

    if (classificacao.type === "SI")
        return "Sistema impossível.";

    // SPD → solução única
    if (classificacao.type === "SPD") {

        const solucao = substituicaoRetroativa(matriz);

        let texto = "Solução única:\n";

        solucao.forEach((v, i) => {
            texto += `${rotuloVariavel(i)} = ${formatarNumero(v)}\n`
        });

        texto += `\nS = {(${solucao.map(v => formatarNumero(v)).join(", ")})}`;

        return texto;
    }

    // SPI → solução paramétrica
    if (classificacao.type === "SPI") {

        let texto = "Sistema possível indeterminado (SPI)\n";
        texto += "Solução paramétrica:\n";

        // identificar pivôs
        let pivots = new Array(n).fill(false);
        let pivotRow = new Array(n).fill(-1);

        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                if (Math.abs(matriz[i][j]) > EPSILON) {
                    pivots[j] = true;
                    pivotRow[j] = i;
                    break;
                }
            }
        }

        // variáveis livres
        let livres = [];
        for (let j = 0; j < n; j++)
            if (!pivots[j]) livres.push(j);

        let expressoes = new Array(n).fill("");

        // variáveis livres = parâmetro
        livres.forEach(j => {
            expressoes[j] = rotuloVariavel(j);
        });

        // resolver pivôs
        for (let j = n - 1; j >= 0; j--) {

            if (!pivots[j]) continue;

            let i = pivotRow[j];

            let expr = formatarNumero(matriz[i][n] / matriz[i][j]);

            for (let k = j + 1; k < n; k++) {
                if (Math.abs(matriz[i][k]) > EPSILON) {

                    let coef = -matriz[i][k] / matriz[i][j];

                    // usa expressão já resolvida (substituição correta)
                    if (expressoes[k] === rotuloVariavel(k)) {
                        expr += ` ${coef >= 0 ? '+' : '-'} ${formatarNumero(Math.abs(coef))}${rotuloVariavel(k)}`;
                    } else {
                        expr += ` ${coef >= 0 ? '+' : '-'} ${formatarNumero(Math.abs(coef))}(${expressoes[k]})`;
                    }
                }
            }

            expressoes[j] = expr;
        }

        // montar saída
        for (let j = 0; j < n; j++) {
            texto += `${rotuloVariavel(j)} = ${expressoes[j]}\n`;
        }

        texto += `\nS = {(${expressoes.join(", ")})}`;

        return texto;
    }
}

function rotuloVariavel(i) {
    const nomes = ['x', 'y', 'z', 'w', 'v', 'u'];
    return i < nomes.length ? nomes[i] : `x${i + 1}`;
}

function formatarNumero(v) {

    if (Math.abs(v) < EPSILON) return "0";

    // inteiro
    if (Math.abs(v - Math.round(v)) < EPSILON)
        return Math.round(v).toString();

    // converter decimal em fração
    const denominadorMax = 100;
    let melhorNum = 1;
    let melhorDen = 1;
    let menorErro = Math.abs(v - melhorNum / melhorDen);

    for (let den = 1; den <= denominadorMax; den++) {
        let num = Math.round(v * den);
        let erro = Math.abs(v - num / den);

        if (erro < menorErro) {
            menorErro = erro;
            melhorNum = num;
            melhorDen = den;
        }
    }

    // simplificar fração
    const mdc = (a, b) => b ? mdc(b, a % b) : Math.abs(a);

    const divisor = mdc(melhorNum, melhorDen);
    melhorNum /= divisor;
    melhorDen /= divisor;

    // evitar denominador negativo
    if (melhorDen < 0) {
        melhorNum *= -1;
        melhorDen *= -1;
    }

    return `${melhorNum}/${melhorDen}`;
}

function matrizParaHTML(matriz) {

    const n = matriz[0].length - 1;
    let html = '<div class="matrix">';

    matriz.forEach(linha => {
        html += '<div class="matrix-row-display">';

        linha.forEach((valor, j) => {
            html += `<div class="matrix-cell">${formatarNumero(valor)}</div>`;
            if (j === n - 1) html += '<div class="pivot-divider"></div>';
        });

        html += '</div>';
    });

    html += '</div>';
    return html;
}

function resolverSistema() {

    try {

        dadosSistema = {};

        const matriz = lerMatrizInputs();
        dadosSistema.matrizOriginal = matriz;

        const resultado = escalonamentoGauss(matriz);

        dadosSistema.matriz = resultado.matriz;
        dadosSistema.passos = resultado.passos;

        dadosSistema.classificacao = classificarSistema(resultado.matriz);
        dadosSistema.solucao = extrairSolucao(resultado.matriz, dadosSistema.classificacao);

        exibirResultados();

    } catch (e) {
        alert(e.message);
    }
}

function exibirResultados() {

    document.getElementById("results-section").classList.remove("hidden");

    document.getElementById("classification").textContent =
        dadosSistema.classificacao.description;

    document.getElementById("original-matrix").innerHTML =
        matrizParaHTML(dadosSistema.matrizOriginal);

    const passosDiv = document.getElementById("steps-container");
    passosDiv.innerHTML = "";

    dadosSistema.passos.forEach((p, i) => {
        passosDiv.innerHTML += `
        <div class="step">
            <div class="step-title">Passo ${i + 1}: ${p.titulo}</div>
            <div class="step-description">${p.descricao}</div>
            ${matrizParaHTML(p.matriz)}
        </div>`;
    });

    document.getElementById("final-matrix").innerHTML =
        matrizParaHTML(dadosSistema.matriz);

    document.getElementById("solution").textContent =
        dadosSistema.solucao;
}

function limparCalculadora() {
    document.getElementById('matrix-inputs').innerHTML = '';
    document.getElementById('results-section').classList.add('hidden');
}