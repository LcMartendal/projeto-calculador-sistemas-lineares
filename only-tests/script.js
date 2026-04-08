function SetarValoresMatriz() {
    var qtdeExpressao = document.getElementById("qtdeExpressao").value;
    var qtdeVariavel = document.getElementById("qtdeVariavel").value;

    var container = document.getElementById("matriz-container");

    //Para limpar matriz anterior *Se existir*
    container.innerHTML = "";

    for (var i = 0; i < qtdeExpressao; i++) {
        var linha = document.createElement("div");

        for (var j = 0; j < qtdeVariavel; j++) {
            var input = document.createElement("input");
            input.type = "number";
            input.placeholder = `a${i + 1}${j + 1}`;
            input.id = `m_${i}_${j}`;
            input.style.width = "60px";

            linha.appendChild(input);
        }

        // var igual = document.createElement("span");
        // igual.textContent = " = ";
        // linha.appendChild(igual);

        var resultado = document.createElement("input");
        resultado.type = "number";
        resultado.placeholder = `r${i + 1}`;
        resultado.id = `r_${i}`;
        resultado.style.width = "60px";

        linha.appendChild(resultado);

        container.appendChild(linha);
    }

    var botaoCalcular = document.createElement("button");
    botaoCalcular.textContent = "Calcular";
    botaoCalcular.onclick = getValoresMatrizPreenchida;
    container.appendChild(botaoCalcular);
}

function getValoresMatrizPreenchida() {
    var qtdeExpressao = parseInt(document.getElementById("qtdeExpressao").value);
    var qtdeVariavel = parseInt(document.getElementById("qtdeVariavel").value);

    var matriz = montarMatriz(qtdeExpressao, qtdeVariavel);
    console.log(matriz);

    //CHAMANDO FUNÇÃO DE CALCULO DO METODO DE ESCALONAMENTO
    calcularPorMetodoEscalonamento(matriz);
}

function montarMatriz(qtdeExpressao, qtdeVariavel) {
    var matriz = [];

    for (var i = 0; i < qtdeExpressao; i++) {
        matriz[i] = [];

        for (var j = 0; j < qtdeVariavel; j++) {
            matriz[i][j] = parseFloat(document.getElementById(`m_${i}_${j}`).value);
        }

        matriz[i].push(
            parseFloat(document.getElementById(`r_${i}`).value)
        );
    }

    return matriz;
}

/*********************************************************************
 * FUNÇÃO PRINCIPAL
 * - Limpa a tela
 * - Executa Gauss-Jordan
 * - Classifica o sistema
 * - Mostra solução
 *********************************************************************/
function calcularPorMetodoEscalonamento(matriz) {

    limparSaida();

    adicionarPasso("Matriz inicial:");
    imprimirMatrizHTML(matriz);

    var matrizFinal = gaussJordan(matriz);

    adicionarPasso("<hr>");
    adicionarPasso("<b>Matriz na forma reduzida:</b>");
    imprimirMatrizHTML(matrizFinal);

    var classificacao = classificarSistema(matrizFinal);

    mostrarClassificacao(classificacao);

    if (classificacao === "SPD") {
        var solucao = extrairSolucao(matrizFinal);
        mostrarSolucao(solucao);
    }

    if (classificacao === "SPI") {
        mostrarSolucaoSPI(matrizFinal);
    }

    if (classificacao === "SI") {
        document.getElementById("solucao").innerHTML =
            "Sistema impossível (sem solução).";
    }
}


/*********************************************************************
 * MÉTODO GAUSS-JORDAN COMPLETO
 *********************************************************************/
function gaussJordan(matriz) {

    var linhas = matriz.length;
    var colunas = matriz[0].length;

    var linha = 0;
    var coluna = 0;

    while (linha < linhas && coluna < colunas - 1) {

        var linhaPivo = encontrarLinhaPivo(matriz, linha, coluna);

        if (linhaPivo === -1) {
            adicionarPasso(
                "Nenhum pivô na coluna " + (coluna + 1) + ", pulando coluna."
            );
            coluna++;
            continue;
        }

        trocarLinhas(matriz, linha, linhaPivo);

        normalizarLinhaPivo(matriz, linha, coluna);

        zerarColuna(matriz, linha, coluna);

        linha++;
        coluna++;
    }

    return matriz;
}


/*********************************************************************
 * ENCONTRAR PIVÔ
 *********************************************************************/
function encontrarLinhaPivo(matriz, linhaInicial, coluna) {

    for (var i = linhaInicial; i < matriz.length; i++) {
        if (Math.abs(matriz[i][coluna]) > 0.000001) {
            return i;
        }
    }

    return -1;
}


/*********************************************************************
 * TROCAR LINHAS
 *********************************************************************/
function trocarLinhas(matriz, linha1, linha2) {

    if (linha1 === linha2) return;

    adicionarPasso(
        "Troca: L" + (linha1 + 1) + " ↔ L" + (linha2 + 1)
    );

    var temp = matriz[linha1];
    matriz[linha1] = matriz[linha2];
    matriz[linha2] = temp;

    imprimirMatrizHTML(matriz);
}


/*********************************************************************
 * NORMALIZAR PIVÔ
 *********************************************************************/
function normalizarLinhaPivo(matriz, linha, coluna) {

    var pivo = matriz[linha][coluna];

    adicionarPasso(
        "Dividindo L" + (linha + 1) + " por " + pivo.toFixed(3)
    );

    for (var j = 0; j < matriz[0].length; j++) {
        matriz[linha][j] /= pivo;
    }

    imprimirMatrizHTML(matriz);
}


/*********************************************************************
 * ZERAR COLUNA
 *********************************************************************/
function zerarColuna(matriz, linhaPivo, coluna) {

    for (var i = 0; i < matriz.length; i++) {

        if (i === linhaPivo) continue;

        var fator = matriz[i][coluna];

        if (Math.abs(fator) < 0.000001) continue;

        adicionarPasso(
            "L" + (i + 1) +
            " = L" + (i + 1) +
            " - (" + fator.toFixed(3) +
            ") × L" + (linhaPivo + 1)
        );

        for (var j = 0; j < matriz[0].length; j++) {
            matriz[i][j] -= fator * matriz[linhaPivo][j];
        }

        imprimirMatrizHTML(matriz);
    }
}


/*********************************************************************
 * CLASSIFICAR SISTEMA (SPD / SPI / SI)
 *********************************************************************/
function classificarSistema(matriz) {

    var linhas = matriz.length;
    var colunas = matriz[0].length - 1;

    var rank = 0;

    for (var i = 0; i < linhas; i++) {

        var todosZero = true;

        for (var j = 0; j < colunas; j++) {
            if (Math.abs(matriz[i][j]) > 0.000001) {
                todosZero = false;
                break;
            }
        }

        if (todosZero && Math.abs(matriz[i][colunas]) > 0.000001) {
            return "SI";
        }

        if (!todosZero) rank++;
    }

    if (rank < colunas) return "SPI";

    return "SPD";
}


/*********************************************************************
 * EXTRAIR SOLUÇÃO
 *********************************************************************/
function extrairSolucao(matriz) {

    var solucao = {};
    var colunas = matriz[0].length - 1;

    for (var i = 0; i < colunas; i++) {
        solucao["x" + (i + 1)] =
            Number(matriz[i][colunas].toFixed(4));
    }

    return solucao;
}

/*********************************************************************
 * ENCONTRAR VARIÁVEIS LIVRES (PARA SISTEMA SPI)
 *********************************************************************/
function encontrarVariaveisLivres(matriz) {

    var linhas = matriz.length;
    var colunas = matriz[0].length - 1;

    var pivots = new Array(colunas).fill(false);

    for (var i = 0; i < linhas; i++) {
        for (var j = 0; j < colunas; j++) {

            if (Math.abs(matriz[i][j] - 1) < 0.000001) {

                var ehPivo = true;

                for (var k = 0; k < linhas; k++) {
                    if (k !== i && Math.abs(matriz[k][j]) > 0.000001) {
                        ehPivo = false;
                        break;
                    }
                }

                if (ehPivo) {
                    pivots[j] = true;
                    break;
                }
            }
        }
    }

    var livres = [];

    for (var j = 0; j < colunas; j++) {
        if (!pivots[j]) {
            livres.push("x" + (j + 1));
        }
    }

    return livres;
}

/*********************************************************************
 * MOSTRAR SOLUÇÃO PARA SISTEMA SPI
 *********************************************************************/
function mostrarSolucaoSPI(matriz) {

    var livres = encontrarVariaveisLivres(matriz);

    var html = "<b>Variáveis livres:</b><br>";

    livres.forEach(v => {
        html += v + " = parâmetro livre<br>";
    });

    html += "<br><b>Solução geral:</b><br>";

    var colunas = matriz[0].length - 1;

    for (var i = 0; i < matriz.length; i++) {

        var pivotCol = -1;

        for (var j = 0; j < colunas; j++) {
            if (Math.abs(matriz[i][j] - 1) < 0.000001) {
                pivotCol = j;
                break;
            }
        }

        if (pivotCol === -1) continue;

        var expressao = "x" + (pivotCol + 1) + " = " + matriz[i][colunas].toFixed(3);

        for (var j = 0; j < colunas; j++) {
            if (j !== pivotCol && Math.abs(matriz[i][j]) > 0.000001) {

                expressao += " - (" +
                    matriz[i][j].toFixed(3) +
                    ")x" + (j + 1);
            }
        }

        html += expressao + "<br>";
    }

    document.getElementById("solucao").innerHTML = html;
}

/*********************************************************************
 * MOSTRAR MATRIZ NA TELA
 *********************************************************************/
function imprimirMatrizHTML(matriz) {

    var html = "<div class='matriz'>";

    for (var i = 0; i < matriz.length; i++) {

        html += "<div class='matriz-linha'>";

        for (var j = 0; j < matriz[i].length; j++) {
            html += "[" + matriz[i][j].toFixed(3) + "]";
        }

        html += "</div>";
    }

    html += "</div>";

    adicionarPasso(html);
}


/*********************************************************************
 * FUNÇÕES DE INTERFACE
 *********************************************************************/
function limparSaida() {
    document.getElementById("passos").innerHTML = "";
    document.getElementById("solucao").innerHTML = "";
    document.getElementById("classificacao").innerHTML = "";
}

function adicionarPasso(texto) {
    document.getElementById("passos").innerHTML += texto + "<br>";
}

function mostrarClassificacao(tipo) {

    var texto = "";

    if (tipo === "SPD")
        texto = "Sistema Possível Determinado (SPD)";

    if (tipo === "SPI")
        texto = "Sistema Possível Indeterminado (SPI)";

    if (tipo === "SI")
        texto = "Sistema Impossível (SI)";

    document.getElementById("classificacao").innerHTML =
        "<b>" + texto + "</b>";
}

function mostrarSolucao(solucao) {

    var html = "";

    for (var key in solucao) {
        html += key + " = " + solucao[key] + "<br>";
    }

    document.getElementById("solucao").innerHTML = html;
}