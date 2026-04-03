# Solucionador de Sistemas Lineares - Projeto Alvébra Linear FURB

> Implementação do método de Escalonamento (Eliminação de Gauss) com Pivoteamento Parcial

## 📋 Descrição

Este projeto implementa uma aplicação web que resolve sistemas lineares Ax = b usando o método de Eliminação de Gauss com pivoteamento parcial. O programa clasifica o sistema como SPD (Sistema Possível Determinado), SPI (Sistema Possível Indeterminado) ou SI (Sistema Impossível), exibindo o passo a passo do escalonamento.

## ✨ Características

- ✅ **Entrada flexível:** Manual ou via arquivo .txt
- ✅ **Algoritmo completo:** Escalonamento com pivoteamento parcial
- ✅ **Classificação automática:** SPD, SPI, ou SI
- ✅ **Rastreabilidade:** Cada operação elementar é exibida
- ✅ **Interface intuitiva:** Visualização clara de matrizes
- ✅ **Documentação extensiva:** Comentários explicando todo conceito matemático
- ✅ **Zero dependências:** 100% JavaScript vanilla, sem bibliotecas de álgebra linear

## 📁 Estrutura do Projeto

```
projeto-calculador-matriz/
├── first-version/                 # Versão anterior (referência)
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── second-version/                # ← VERSÃO ATUAL (USE ESTA)
│   ├── index.html                 # Interface da aplicação
│   ├── script.js                  # Algoritmo completo + lógica
│   └── style.css                  # Estilização responsiva
│
├── test-cases/                    # Casos de teste
│   ├── caso_SPD.txt              # Sistema Possível Determinado
│   ├── caso_SPI.txt              # Sistema Possível Indeterminado
│   └── caso_SI.txt               # Sistema Impossível
│
├── RELATORIO_TECNICO.md           # Relatório PDF (conteúdo markdown)
├── INSTRUCOES_USO.md              # Manual de uso detalhado
└── README.md                      # Este arquivo

```

## 🚀 Como Usar

### Opção 1: Abrir no Navegador (Mais Fácil)
```bash
# Windows Explorer:
- Navegue até: second-version/
- Clique duplo em: index.html
```

### Opção 2: Servidor Local (Python)
```bash
# Na pasta principal do projeto:
python -m http.server 8000

# Abra no navegador:
# http://localhost:8000/second-version/
```

## 📚 Documentação

### Para Usuários
- **[INSTRUCOES_USO.md](INSTRUCOES_USO.md)** - Como usar a aplicação, exemplos, interpretação de resultados

### Para Avaliadores / Desenvolvedores
- **[RELATORIO_TECNICO.md](RELATORIO_TECNICO.md)** - Explicação matemática, algoritmo, tratamento de pivôs
- **[script.js](second-version/script.js)** - Código completamente comentado com conceitos matemáticos

## 🧮 Exemplos Rápidos

### Sistema Possível Determinado (SPD) - Solução Única ✓

```
Equações:
x + 2y + 3z = 14
2x + 3y + z = 11
3x + y + 2z = 11

Resultado: x = 1, y = 2, z = 3
```

**Use arquivo:** `test-cases/caso_SPD.txt`

### Sistema Possível Indeterminado (SPI) - Infinitas Soluções ∞

```
Equações:
x + 2y + 3z = 14
2x + 4y + 6z = 28    ← Múltipla da 1ª
3x + y + 2z = 11

Resultado: x = 14 - 2y - 3z, onde y e z são livres
```

**Use arquivo:** `test-cases/caso_SPI.txt`

### Sistema Impossível (SI) - Nenhuma Solução ✗

```
Equações:
x + 2y + 3z = 14
2x + 4y + 6z = 28    ← Múltipla da 1ª
2x + 4y + 6z = 15    ← Contradição!

Resultado: Nenhuma solução (0 = -13)
```

**Use arquivo:** `test-cases/caso_SI.txt`

## 🔧 Requisitos Técnicos

### O que Está Implementado ✅
- Operações elementares de linha (multiplicação, adição, permutação)
- Pivoteamento parcial para estabilidade numérica
- Forma escalonada reduzida (RREF)
- Classificação de sistemas (SPD/SPI/SI)
- Extração de conjuntos solução
- Interface gráfica responsiva
- Upload de arquivo .txt
- Rastreamento de operações

### O que NÃO Está Usado ❌
- numpy, scipy, ou qualquer biblioteca de álgebra linear
- Funções prontas de resolução
- Qualquer dependência externa

Implementação **100% manual** do algoritmo!

## 📝 Formato de Arquivo Aceito

```
m n
a11 a12 ... a1n b1
a21 a22 ... a2n b2
...
am1 am2 ... amn bm
```

**Onde:**
- `m` = número de equações
- `n` = número de variáveis
- Números separados por espaço

**Exemplo:**
```
2 2
1 2 5
3 4 11
```
Sistema: x + 2y = 5 e 3x + 4y = 11

## 🎯 Objetivos da Atividade (Cumpridos)

| Objetivo | Status | Detalhes |
|----------|--------|----------|
| Entrada de dados | ✅ | Manual e arquivo |
| Escalonamento | ✅ | Implementado manualmente |
| Pivoteamento | ✅ | Parcial para estabilidade |
| Rastreabilidade | ✅ | Cada passo é exibido |
| Classificação | ✅ | SPD, SPI, SI |
| Solução | ✅ | Conjunto solução exibido |
| Sem bibliotecas | ✅ | 100% implementado |
| Comentários | ✅ | Explicam conceitos |
| Relatório | ✅ | Documento técnico |
| Testes | ✅ | 3 casos fornecidos |

## 💡 Conceitos Matemáticos Implementados

- **Matrizes e Operações de Linha:** Multiplicação, adição, permutação
- **Determinantes e Rank:** Número de linhas não-nulas
- **Forma Escalonada Reduzida (RREF):** Transformação via operações elementares
- **Pivoteamento Parcial:** Seleção de maior elemento para estabilidade
- **Classificação de Sistemas:** Baseada em Rank(A) vs Rank([A|b])
- **Variáveis Livres vs Dependentes:** SPI com infinitas soluções
- **Estabilidade Numérica:** EPSILON = 1e-10 para comparações

## 🔍 Arquivos Importantes para Entendimento

### Para Entender a Matemática
1. **RELATORIO_TECNICO.md** - Explicação teórica completa
2. **script.js** - Linhas 1-150: Algoritmo principal comentado

### Para Usar a Aplicação
1. **INSTRUCOES_USO.md** - Guia de usuário passo a passo
2. **index.html** - Estrutura da interface
3. **style.css** - Estilização visual

### Para Testar
1. **test-cases/caso_SPD.txt** - Solução única
2. **test-cases/caso_SPI.txt** - Infinitas soluções
3. **test-cases/caso_SI.txt** - Nenhuma solução

## 🎓 Aprendizados Consolidados

✓ Compreensão profunda do método de Gauss  
✓ Operações elementares e RREF  
✓ Classificação de sistemas lineares  
✓ Tratamento de casos especiais (pivô nulo)  
✓ Estabilidade numérica em algoritmos  
✓ Realização de projeto matemático completo  

## 📊 Estatísticas

- **Linhas de código:** ~600 (com comentários)
- **Comentários:** >50% do código
- **Casos de teste:** 3 (SPD, SPI, SI)
- **Dimensões suportadas:** 2×2 até 10×10
- **Documentação:** 3 documentos completos

## ⚠️ Notas Importantes

1. **Sem dependências externas:** Requer apenas um navegador moderno
2. **Compatibilidade:** Chrome, Firefox, Edge, Safari (últimas versões)
3. **Limitações:** Máximo de 10×10 para melhor performance
4. **Precisão:** EPSILON = 1e-10 para evitar erros numéricos
5. **Arquivo:** Formato específico obrigatório

## 🎬 Vídeo de Apresentação

Durante a arguição oral, será demonstrado:
1. ✓ Carregamento de arquivo teste SPD
2. ✓ Visualização do passo a passo
3. ✓ Classificação correta
4. ✓ Extração da solução
5. ✓ Teste com caso SPI (infinitas soluções)
6. ✓ Teste com caso SI (impossível)

## 📞 Contato / Dúvidas

- **Matemática:** Ver RELATORIO_TECNICO.md
- **Uso:** Ver INSTRUCOES_USO.md
- **Código:** Comentários em script.js

---

## 📄 Licença

Este projeto foi desenvolvido como atividade avaliativa de Álgebra Linear na FURB.

**Data:** Abril 2026  
**Semestre:** 5º  
**Disciplina:** Álgebra Linear  
**Status:** ✅ Completo
