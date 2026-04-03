class CalculoSistemaLinear {

    constructor(matriz) {
        this.matriz = matriz;
        this.pivos = [];
    }

    escalonar() {
        const m = this.matriz;
        const linhas = m.length;
        const colunas = m[0].length;

        let linhaPivo = 0;

        for (let col = 0; col < colunas - 1 && linhaPivo < linhas; col++) {

            // procurar pivô não zero
            if (Math.abs(m[linhaPivo][col]) < 1e-10) {

                let linhaTroca = -1;

                for (let i = linhaPivo + 1; i < linhas; i++) {
                    if (Math.abs(m[i][col]) > 1e-10) {
                        linhaTroca = i;
                        break;
                    }
                }

                if (linhaTroca !== -1) {

                    [m[linhaPivo], m[linhaTroca]] =
                        [m[linhaTroca], m[linhaPivo]];

                    mostrarMatriz(m, `Troca L${linhaPivo+1} ↔ L${linhaTroca+1}`, [linhaPivo, col]);

                } else {
                    continue;
                }
            }

            // marcar pivô
            this.pivos.push([linhaPivo, col]);

            mostrarMatriz(m, `Pivô na coluna ${col+1}`, [linhaPivo, col]);

            // zerar abaixo
            for (let i = linhaPivo + 1; i < linhas; i++) {

                const fator = m[i][col] / m[linhaPivo][col];

                if (Math.abs(fator) < 1e-10) continue;

                for (let j = col; j < colunas; j++) {
                    m[i][j] -= fator * m[linhaPivo][j];
                }

                mostrarMatriz(
                    m,
                    `L${i+1} = L${i+1} - (${fator.toFixed(2)})·L${linhaPivo+1}`,
                    [linhaPivo, col]
                );
            }

            linhaPivo++;
        }
    }

    classificar() {

        const m = this.matriz;
        const linhas = m.length;
        const colunas = m[0].length;
        const variaveis = colunas - 1;

        let pivots = 0;

        for (let i = 0; i < linhas; i++) {

            let todosZero = true;

            for (let j = 0; j < variaveis; j++) {
                if (Math.abs(m[i][j]) > 1e-10) {
                    todosZero = false;
                    pivots++;
                    break;
                }
            }

            if (todosZero && Math.abs(m[i][colunas - 1]) > 1e-10) {
                return "SI";
            }
        }

        if (pivots === variaveis) return "SPD";
        return "SPI";
    }

    resolverSPD() {
        const m = this.matriz;
        const n = m.length;
        const colunas = m[0].length;

        const sol = new Array(colunas - 1).fill(0);

        // retro-substituição
        for (let i = n - 1; i >= 0; i--) {

            let soma = m[i][colunas - 1];

            for (let j = i + 1; j < colunas - 1; j++) {
                soma -= m[i][j] * sol[j];
            }

            sol[i] = soma / m[i][i];
        }

        return sol;
    }
}


function gerarInputs() {
    const linhas = numeroEquacoes.value;
    const colunas = numeroVariaveis.value;

    const container = document.getElementById("matrizInputs");
    container.innerHTML = "";

    for (let i = 0; i < linhas; i++) {
        const div = document.createElement("div");
        div.className = "linha";

        for (let j = 0; j < colunas; j++) {
            const input = document.createElement("input");
            input.type = "number";
            input.step = "any";
            input.id = `m-${i}-${j}`;
            div.appendChild(input);
        }

        container.appendChild(div);
    }
}


function lerMatriz() {
    const linhas = numeroEquacoes.value;
    const colunas = numeroVariaveis.value;

    const matriz = [];

    for (let i = 0; i < linhas; i++) {
        matriz[i] = [];
        for (let j = 0; j < colunas; j++) {
            matriz[i][j] =
                parseFloat(document.getElementById(`m-${i}-${j}`).value) || 0;
        }
    }

    return matriz;
}


function mostrarMatriz(matriz, titulo, pivo = null) {

    const passos = document.getElementById("passos");

    const div = document.createElement("div");
    div.className = "matriz";

    const h3 = document.createElement("h3");
    h3.textContent = titulo;

    const table = document.createElement("table");

    matriz.forEach((linha, i) => {
        const tr = document.createElement("tr");

        linha.forEach((valor, j) => {
            const td = document.createElement("td");
            td.textContent = valor.toFixed(2);

            // destacar pivô
            if (pivo && pivo[0] === i && pivo[1] === j) {
                td.classList.add("pivo");
            }

            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    div.appendChild(h3);
    div.appendChild(table);
    passos.appendChild(div);
}


function resolverSistema() {

    passos.innerHTML = "";

    const matriz = lerMatriz();

    const calc = new CalculoSistemaLinear(matriz);

    mostrarMatriz(matriz, "Matriz Inicial");

    calc.escalonar();

    const tipo = calc.classificar();

    const resultado = document.createElement("h2");
    resultado.textContent = "Classificação: " + tipo;
    passos.appendChild(resultado);

    if (tipo === "SPD") {

        const sol = calc.resolverSPD();

        const vars = ["x","y","z","w","v"];

        const div = document.createElement("div");

        sol.forEach((v,i)=>{
            const p = document.createElement("p");
            p.textContent = `${vars[i]} = ${v.toFixed(4)}`;
            div.appendChild(p);
        });

        passos.appendChild(div);
    }
}