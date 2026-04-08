# Relatório Técnico - Solucionador de Sistemas Lineares
## Método de Escalonamento (Eliminação de Gauss)

**Instituição:** FURB - Universidade Regional de Blumenau  
**Disciplina:** Álgebra Linear  
**Semestre:** 5º  
**Data:** 2026

---

## 1. Descrição do Algoritmo de Classificação

### 1.1 Conceitos Fundamentais

O programa implementa a classificação de sistemas lineares baseado nos conceitos de **Rank (Posto)** de uma matriz. Para um sistema linear Ax = b representado pela matriz ampliada [A|b], temos:

- **Rank(A)**: Número de linhas não-nulas da matriz [A] após escalonamento
- **Rank([A|b])**: Número de linhas não-nulas da matriz ampliada [A|b] após escalonamento
- **n**: Número de variáveis (incógnitas) do sistema

### 1.2 Classificação do Sistema

O programa classifica o sistema em três categorias:

#### **SPD (Sistema Possível Determinado)**
- **Condição:** Rank(A) = Rank([A|b]) = n
- **Interpretação:** 
  - Uma e somente uma solução existe
  - A matriz dos coeficientes tem rank completo
  - Cada variável pode ser determinada univocamente
- **Exemplo matemático:**
  ```
  x + 2y + 3z = 14
  2x + 3y + z = 11
  3x + y + 2z = 11
  
  Solução: x = 1, y = 2, z = 3
  ```

#### **SPI (Sistema Possível Indeterminado)**
- **Condição:** Rank(A) = Rank([A|b]) < n
- **Interpretação:**
  - Infinitas soluções existem
  - Há mais variáveis que equações efetivamente independentes
  - Algumas variáveis são "livres" (podem assumir qualquer valor)
  - Outras variáveis são expressas em função das livres
- **Número de variáveis livres:** n - Rank(A)
- **Exemplo matemático:**
  ```
  x + 2y + 3z = 14
  2x + 4y + 6z = 28    (múltipla da primeira)
  
  Resultado: x + 2y + 3z = 14
  Variáveis livres: y, z
  Solução geral: x = 14 - 2y - 3z, y livre, z livre
  ```

#### **SI (Sistema Impossível)**
- **Condição:** Rank(A) < Rank([A|b])
- **Interpretação:**
  - Nenhuma solução existe
  - O sistema é inconsistente
  - Existe uma linha na forma: 0 = b_i (onde b_i ≠ 0)
- **Exemplo matemático:**
  ```
  x + 2y + 3z = 14
  2x + 4y + 6z = 28
  2x + 4y + 6z = 15    (contradição!)
  
  Resultado: 0 = -13 (impossível)
  ```

### 1.3 Implementação no Código

```javascript
function classifySystem(matrix) {
    // Conta linhas não-nulas em [A] e [A|b]
    // Detecta inconsistências (0 = b_i não-nulo)
    // Retorna classificação com bases teóricas
}
```

O algoritmo:
1. Percorre cada linha da matriz reduzida
2. Verifica se a linha é nula em [A]
3. Verifica se a linha é nula em [A|b]
4. Detecta inconsistências (0 = valor não-nulo)
5. Calcula Rank(A) e Rank([A|b])
6. Aplica a classificação acima

---

## 2. Tratamento de Pivôs Nulos

### 2.1 O Problema do Pivô Nulo

Durante o escalonamento, o algoritmo precisa dividir por cada pivô (elemento diagonal que será normalizado para 1). Se este pivô for zero, teríamos divisão por zero, resultando em erro matemático e computacional.

```javascript
// PROBLEMA: Se pivotValue = 0
const scalar = 1 / 0; // Erro!
```

### 2.2 Estratégia: Pivoteamento Parcial

O programa implementa **Pivoteamento Parcial**, que busca o elemento com maior valor absoluto (em módulo) na coluna a partir da linha atual:

```javascript
function findPivot(matrix, col, startRow) {
    let pivotRow = startRow;
    let maxValue = Math.abs(matrix[startRow][col]);
    
    // Encontra a linha com o maior elemento em módulo
    for (let i = startRow + 1; i < matrix.length; i++) {
        const currentValue = Math.abs(matrix[i][col]);
        if (currentValue > maxValue) {
            maxValue = currentValue;
            pivotRow = i;
        }
    }
    
    return { pivotRow, pivotValue: matrix[pivotRow][col] };
}
```

### 2.3 Processo de Troca de Linhas

Quando o pivô máximo não está na linha atual, o algoritmo executa uma **Operação Elementar de Linha: Permutação**:

```javascript
function swapRows(matrix, row1, row2) {
    const newMatrix = matrix.map(row => [...row]);
    [newMatrix[row1], newMatrix[row2]] = [newMatrix[row2], newMatrix[row1]];
    return { matrix: newMatrix, operation: `L${row1 + 1} ↔ L${row2 + 1}` };
}
```

Esta operação:
- É legítima (não altera o conjunto solução)
- Melhora a estabilidade numérica significativamente
- Evita divisão por números muito próximos a zero

### 2.4 Tratamento de Colunas Nulas

Após pivoteamento parcial, se o pivô ainda for **muito pequeno** (próximo a zero, menor que EPSILON = 1e-10):

```javascript
if (Math.abs(pivotValue) < EPSILON) {
    // Coluna é linearmente dependente
    // Passa para próxima coluna (variável livre)
    continue;
}
```

O programa:
1. Reconhece que a coluna é **linearmente dependente** das anteriores
2. Pula essa coluna (a variável correspondente será livre)
3. Continua com a próxima coluna
4. Incrementará o número de variáveis livres

### 2.5 Tratamento de Erros Numéricos

O código usa a constante **EPSILON** para comparações com zero:

```javascript
const EPSILON = 1e-10;

// Arredonda valores muito pequenos para zero
if (Math.abs(value) < EPSILON) {
    value = 0;
}
```

Isto é crítico porque:
- Operações em ponto flutuante introduzem erros
- Acumular pequenos erros pode produzir soluções incorretas
- EPSILON = 1e-10 é significativamente maior que a precisão da máquina (~1e-16)

---

## 3. Operações Elementares Implementadas

O programa implementa as três operações elementares de linha:

### 3.1 Operação 1: Multiplicação de Linha por Escalar

**Conceito Matemático:** L_i ← c × L_i (c ≠ 0)

```javascript
function multiplyRow(matrix, rowIndex, scalar) {
    const newMatrix = matrix.map(row => [...row]);
    for (let j = 0; j < newMatrix[rowIndex].length; j++) {
        newMatrix[rowIndex][j] *= scalar;
    }
    return { matrix: newMatrix, operation: `L${rowIndex + 1} ← ... × L${rowIndex + 1}` };
}
```

**Uso:** Normalização do pivô para 1 (dividir linha por seu pivô)

### 3.2 Operação 2: Adição de Múltiplo de Uma Linha a Outra

**Conceito Matemático:** L_i ← L_i + c × L_j

```javascript
function addRows(matrix, sourceRow, targetRow, scalar) {
    const newMatrix = matrix.map(row => [...row]);
    for (let j = 0; j < newMatrix[targetRow].length; j++) {
        newMatrix[targetRow][j] += scalar * newMatrix[sourceRow][j];
    }
    return { matrix: newMatrix, operation: `L${targetRow + 1} ← L${targetRow + 1} + ... × L${sourceRow + 1}` };
}
```

**Uso:** Eliminar elementos acima e abaixo do pivô

### 3.3 Operação 3: Permutação de Linhas (Pivoteamento Parcial)

**Conceito Matemático:** L_i ↔ L_j

```javascript
function swapRows(matrix, row1, row2) {
    const newMatrix = matrix.map(row => [...row]);
    [newMatrix[row1], newMatrix[row2]] = [newMatrix[row2], newMatrix[row1]];
    return { matrix: newMatrix, operation: `L${row1 + 1} ↔ L${row2 + 1}` };
}
```

**Uso:** Colocar o maior pivô na posição correta

---

## 4. Algoritmo de Escalonamento (Gaussiana)

### 4.1 Forma Escalonada Reduzida (RREF)

O algoritmo transforma [A|b] para a forma escalonada reduzida:

```
[1  0  0 | b'₁]
[0  1  0 | b'₂]
[0  0  1 | b'₃]
```

Propriedades:
- Cada linha não-nula começa com 1 único (o pivô)
- Pivôs estão em posições progressivamente à direita
- Cada coluna pivô tem 0 em todas as posições exceto o pivô

### 4.2 Pseudocódigo do Algoritmo

```
algoritmo GaussianaEscalonada([A|b]):
    currentRow ← 0
    
    para cada coluna pivô:
        se currentRow ≥ número de linhas:
            parar
        
        # PIVOTEAMENTO PARCIAL
        encontrar linha com maior |elemento| nesta coluna
        trocar linhas se necessário
        
        pivô ← elemento diagonal atual
        se |pivô| < EPSILON:
            pular coluna (variável livre)
            continuar
        
        # NORMALIZAÇÃO
        dividir currentRow por pivô (pivô = 1)
        
        # ELIMINAÇÃO
        para cada outra linha:
            eliminar elemento nesta coluna
            (adicionar múltiplo de currentRow)
        
        currentRow ← currentRow + 1
    
    retornar matriz escalonada reduzida
```

---

## 5. Características de Implementação

### 5.1 Rastreabilidade de Operações

Cada passo do algoritmo é registrado:

```javascript
steps.push({
    title: `Passo: ${operation}`,
    description: `Explicação do passo`,
    matrix: workMatrix.map(row => [...row])  // Cópia da matriz
});
```

Isso permite o usuário acompanhar:
- Quais operações foram realizadas
- O efeito de cada operação
- A progressão para a forma reduzida

### 5.2 Extração de Solução

Para **SPD:** Lê valores diretamente das posições pivô
Para **SPI:** Expressa variáveis dependentes em função das livres
Para **SI:** Indica impossibilidade

### 5.3 Interface Gráfica

- Entrada manual ou por arquivo
- Exibição visual de matrizes (com divisor entre [A] e [b])
- Navegação através dos passos
- Classificação com cores (verde=SPD, amarelo=SPI, vermelho=SI)

---

## 6. Casos de Teste

### Test Case 1: SPD (Sistema Possível Determinado)
**Arquivo:** `caso_SPD.txt`
```
3 3
1 2 3 14
2 3 1 11
3 1 2 11
```
**Solução esperada:** x=1, y=2, z=3

### Test Case 2: SPI (Sistema Possível Indeterminado)
**Arquivo:** `caso_SPI.txt`
```
3 3
1 2 3 14
2 4 6 28
3 1 2 11
```
**Comportamento esperado:** 2 variáveis livres, infinitas soluções

### Test Case 3: SI (Sistema Impossível)
**Arquivo:** `caso_SI.txt`
```
3 3
1 2 3 14
2 4 6 28
2 4 6 15
```
**Solução esperada:** Contradição detectada (0 = -13)

---

## 7. Tabela de Divisão de Tarefas

| Tarefa | Responsável | Status | Detalhes |
|--------|-------------|--------|----------|
| Análise matemática | Grupo | ✓ Concluído | Estudo do método de Gauss |
| Desenvolvimento do algoritmo de escalonamento | Grupo | ✓ Concluído | Implementação em JavaScript |
| Pivoteamento parcial | Grupo | ✓ Concluído | Estabilidade numérica |
| Classificação do sistema | Grupo | ✓ Concluído | SPD/SPI/SI |
| Extração de solução | Grupo | ✓ Concluído | Para todos os casos |
| Interface HTML/CSS | Grupo | ✓ Concluído | Entrada e visualização |
| Upload de arquivo | Grupo | ✓ Concluído | Leitura dinâmica |
| Testes unitários | Grupo | ✓ Concluído | 3 casos de teste |
| Documentação de código | Grupo | ✓ Concluído | Comentários explicativos |
| Relatório técnico | Grupo | ✓ Concluído | Este documento |

---

## 8. Instruções de Uso

### 8.1 Via Interface Web (Recomendado)

1. Abrir `second-version/index.html` em navegador
2. Escolher modo de entrada:
   - **Manual:** Especificar dimensões e preencher valores
   - **Arquivo:** Fazer upload de `.txt` formatado
3. Clicar em "Resolver Sistema"
4. Analisar resultados: classificação, passos, solução

### 8.2 Formato de Arquivo

```
<m> <n>
<a11> <a12> ... <a1n> <b1>
<a21> <a22> ... <a2n> <b2>
...
<am1> <am2> ... <amn> <bm>
```

Onde:
- `m` = número de equações
- `n` = número de variáveis
- `aij` = coeficiente da variável j na equação i
- `bi` = termo independente da equação i

---

## 9. Limitações e Notas Importantes

1. **Proibição de bibliotecas:** Nenhuma biblioteca de álgebra linear foi usada
   - Toda lógica de escalonamento é implementada manualmente
   - Conformidade total com requisitos

2. **Números muito grandes:** Para sistemas com números muito grandes ou muito pequenos, considerar normalização prévia

3. **Matrizes muito grandes:** Desempenho pode ser afetado para n > 20

4. **Arredondamento:** Usamos EPSILON = 1e-10 para evitar problemas numéricos

---

## 10. Conclusão

O programa implementa com sucesso o método de eliminação de Gauss com pivoteamento parcial, oferecendo:

✓ **Corretude matemática** completa (SPD, SPI, SI)  
✓ **Rastreabilidade** de todas as operações  
✓ **Tratamento robusto** de pivôs nulos  
✓ **Estabilidade numérica** via pivoteamento  
✓ **Interface intuitiva** e responsiva  
✓ **Documentação extensiva** do código  
✓ **Cumprimento integral** de todos os requisitos  

O trabalho consolida compreensão profunda de:
- Álgebra linear (matrizes, operações elementares)
- Teoria de sistemas (classificação, soluções)
- Algoritmos numéricos (Gauss, estabilidade)
- Implementação prática em JavaScript
- Design de interfaces para aplicações matemáticas

---

**Data de conclusão:** Abril de 2026  
**Status:** Pronto para apresentação e arguição
