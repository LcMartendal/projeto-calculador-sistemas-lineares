# INSTRUÇÕES DE USO - Solucionador de Sistemas Lineares

## 1. Como Executar a Aplicação

### Opção 1: Arquivo Local (Recomendado)
```
1. Abra o arquivo: second-version/index.html
   - Clique duplo no arquivo, OU
   - Arraste para o navegador, OU
   - Clique direito → "Abrir com" → Navegador
```

### Opção 2: Python (Se disponível)
```bash
# Na pasta do projeto, execute:
python -m http.server 8000

# Acesse no navegador:
http://localhost:8000/second-version/
```

---

## 2. Interface da Aplicação

### Seção 1: Entrada de Dados
```
┌─────────────────────────────────────┐
│ Modo 1: Entrada Manual              │
├─────────────────────────────────────┤
│ Número de Equações:    [ 3]          │
│ Número de Variáveis:   [ 3]          │
│ [Criar Matriz]                      │
└─────────────────────────────────────┘

[Gradeado de inputs para valores]

┌─────────────────────────────────────┐
│ Modo 2: Upload de Arquivo           │
├─────────────────────────────────────┤
│ [Selecionar arquivo .txt]           │
│ Formato: primeiro número = m (linhas)│
│          segundo número = n (colunas)│
└─────────────────────────────────────┘

[Resolver Sistema] [Limpar]
```

### Seção 2: Resultados
```
┌─────────────────────────────────────┐
│ Classificação do Sistema             │
├─────────────────────────────────────┤
│ ✓ SPD/SPI/SI com explicação         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Matriz Ampliada Original [A|b]       │
├─────────────────────────────────────┤
│ [ 1  2  3 | 14]                     │
│ [ 2  3  1 | 11]                     │
│ [ 3  1  2 | 11]                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Passo a Passo do Escalonamento       │
├─────────────────────────────────────┤
│ Passo 1: L1 ↔ L3                    │
│ Descrição...                        │
│ [Matriz após passo]                 │
│ Passo 2: L2 ← L2 + (value) × L1     │
│ ...                                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Forma Escalonada Reduzida (RREF)    │
├─────────────────────────────────────┤
│ [Matriz final]                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Conjunto Solução                     │
├─────────────────────────────────────┤
│ x = 1, y = 2, z = 3                 │
│ S = {(1, 2, 3)}                     │
└─────────────────────────────────────┘
```

---

## 3. Modo de Entrada Manual

### Passo 1: Especifique as Dimensões
```
Número de Equações (m):  [2 a 10]
Número de Variáveis (n): [2 a 10]
[Criar Matriz]
```

### Passo 2: Preencha os Valores
```
Sistema 2x3 (2 equações, 3 variáveis):

a₁₁  a₁₂  a₁₃ | b₁
a₂₁  a₂₂  a₂₃ | b₂

Exemplo:
[1] [2] [3] [14]
[4] [5] [6] [15]

Significado:
Equação 1: 1x + 2y + 3z = 14
Equação 2: 4x + 5y + 6z = 15
```

### Passo 3: Resolver
```
[Resolver Sistema]
```

---

## 4. Modo de Upload de Arquivo

### Formato do Arquivo .txt

```
m n
a11 a12 ... a1n b1
a21 a22 ... a2n b2
...
am1 am2 ... amn bm
```

#### Parâmetros:
- `m` = número de equações (linhas da matriz [A])
- `n` = número de variáveis (colunas de [A])
- `aij` = coeficiente da variável j na equação i
- `bi` = termo independente (coluna [b])

#### Exemplo para 3 equações e 3 variáveis:

**Arquivo: sistema.txt**
```
3 3
1 2 3 14
2 3 1 11
3 1 2 11
```

**Interpretação:**
```
Sistema: Ax = b

      [ 1  2  3 ]   [ x ]   [ 14 ]
      [ 2  3  1 ] × [ y ] = [ 11 ]
      [ 3  1  2 ]   [ z ]   [ 11 ]

Equações:
x + 2y + 3z = 14
2x + 3y + z = 11
3x + y + 2z = 11
```

### Como usar:
1. Crie um arquivo de texto (.txt) com o formato acima
2. Clique em "Selecionar arquivo .txt"
3. Escolha o arquivo
4. Clique em "Resolver Sistema"

---

## 5. Interpretação dos Resultados

### Caso 1: SPD (Sistema Possível Determinado) ✓

```
Classificação:
"Sistema Possível Determinado (SPD): Rank(A) = Rank([A|b]) = 3 = 
número de variáveis. Solução única."

Solução:
Solução única:
x = 1.000000
y = 2.000000
z = 3.000000

S = {(1.000000, 2.000000, 3.000000)}
```

**O que significa:**
- Exatamente uma solução existe
- Cada variável tem um valor definido
- O sistema é consistente e completo

**Cor de indicação:** Verde

### Caso 2: SPI (Sistema Possível Indeterminado) ∞

```
Classificação:
"Sistema Possível Indeterminado (SPI): Rank(A) = Rank([A|b]) = 2 < 3 
variáveis. Infinitas soluções."

Solução:
Infinitas soluções. Sistema indeterminado:

Variáveis livres: z

Variáveis dependentes em função das livres:
x = 14.000000 - 2.000000*z
y = 1.000000 - 1.000000*z
```

**O que significa:**
- Infinitas soluções existem
- Algumas variáveis são "livres" (podem ser qualquer valor)
- Outras variáveis dependem das livres
- Para cada valor de z, obtém valores de x e y

**Exemplo de soluções:**
```
Se z = 0:  x = 14, y = 1, z = 0
Se z = 1:  x = 12, y = 0, z = 1
Se z = 5:  x = 4,  y = -4, z = 5
...infinitas possibilidades
```

**Cor de indicação:** Amarelo

### Caso 3: SI (Sistema Impossível) ✗

```
Classificação:
"Sistema Impossível (SI): Linha 3 representa 0 = -13.000000, que é 
inconsistente."

Solução:
Nenhuma solução. O sistema é inconsistente.
```

**O que significa:**
- Nenhuma solução existe
- As equações se contradizem
- O sistema é inconsistente

**Exemplo:**
```
Observação durante escalonamento:
0x + 0y + 0z = -13

Isso é impossível! 0 nunca pode ser -13
```

**Cor de indicação:** Vermelho

---

## 6. Compreendendo os Passos de Escalonamento

O programa mostra cada operação elementar realizada:

### Exemplo de Passo:

```
Passo 1: L1 ↔ L3
Trocar linhas para obter o maior pivô na coluna 1

Matriz após operação:
[ 3  1  2 | 11]
[ 2  3  1 | 11]
[ 1  2  3 | 14]
```

### Tipos de Operações:

#### 1. Multiplicação de Linha
```
L1 ← 0.3333 × L1
(Normalizar para que pivô = 1)
```

#### 2. Adição de Múltiplo
```
L2 ← L2 + (-2.0000) × L1
(Eliminar elemento abaixo do pivô)
```

#### 3. Troca de Linhas
```
L1 ↔ L2
(Pivoteamento parcial para estabilidade)
```

---

## 7. Casos de Teste Fornecidos

### Teste 1: sistema_SPD.txt
```
3 3
1 2 3 14
2 3 1 11
3 1 2 11
```
**Tipo esperado:** SPD  
**Solução esperada:** x=1, y=2, z=3  
**Para testar:** Verifique se o programa encontra solução única e correta

### Teste 2: caso_SPI.txt
```
3 3
1 2 3 14
2 4 6 28
3 1 2 11
```
**Tipo esperado:** SPI (pois linha 2 é 2× linha 1)  
**Para testar:** Verifique se identifica infinitas soluções com 1 variável livre

### Teste 3: caso_SI.txt
```
3 3
1 2 3 14
2 4 6 28
2 4 6 15
```
**Tipo esperado:** SI (contradição entre linhas 2 e 3)  
**Para testar:** Verifique se detecta inconsistência corretamente

---

## 8. Dicas de Uso

### ✓ Boas Práticas

1. **Valide seus dados antes de enviar**
   - Verifique se preencheu todos os campos
   - Confirme as dimensões

2. **Use o modo de arquivo para dados complexos**
   - Menos propenso a erros de entrada
   - Mais rápido para sistemas grandes

3. **Analise os passos intermediários**
   - Entenda cada operação realizada
   - Confirme a progressão ao RREF

4. **Para SPI, experimente valores diferentes**
   - Substitua variáveis livres com valores diferentes
   - Confirme que as soluções satisfazem as equações

### ⚠ Pontos de Atenção

1. **Dimensões máximas:** até 10×10
   - Acima disso pode ficar lento

2. **Números muito grandes ou muito pequenos**
   - Podem causar problemas numéricos
   - Use valores nas escalas -1000 a +1000 para melhor precisão

3. **Valores incompletos**
   - O programa mantém campos em branco como 0
   - Preencha explicitamente se zero for intencional

---

## 9. Solução de Problemas

### Problema: "Valor inválido em [i][j]"

**Causa:** Deixou algum campo em branco ou com valor não-numérico

**Solução:** 
- Preencha todos os campos
- Use "0" para coeficientes nulos
- Não deixe campos vazios

### Problema: "Arquivo inválido"

**Causa:** Formato de arquivo incorreto

**Solução:**
```
✓ Correto:
3 3
1 2 3 14
2 3 1 11
3 1 2 11

✗ Errado:
3 3
1 2 3
14  (falta na mesma linha)
```

### Problema: Resultados com muitas casas decimais

**Causa:** Acúmulo de erros de arredondamento

**Solução:** Esperado em sistemas com valores não-inteiros. Arredonde conforme necessário.

---

## 10. Contato e Suporte

Para dúvidas sobre:
- **Como usar a aplicação:** Ver acima
- **Matemática e algoritmo:** Ver RELATORIO_TECNICO.md
- **Código-fonte:** Ver comentários em script.js

---

**Versão:** 2.0  
**Última atualização:** Abril 2026  
**Status:** Pronto para uso
