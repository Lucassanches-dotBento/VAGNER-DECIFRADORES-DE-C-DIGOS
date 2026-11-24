import { EndlessCategory, EndlessPuzzle, PuzzleLevel } from '../types/game';

export interface BilingualNumberEntry {
  value: number;
  en: string;
  es: string;
}

export const BILINGUAL_NUMBERS: BilingualNumberEntry[] = [
  { value: 0, en: 'ZERO', es: 'CERO' },
  { value: 1, en: 'ONE', es: 'UNO' },
  { value: 2, en: 'TWO', es: 'DOS' },
  { value: 3, en: 'THREE', es: 'TRES' },
  { value: 4, en: 'FOUR', es: 'CUATRO' },
  { value: 5, en: 'FIVE', es: 'CINCO' },
  { value: 6, en: 'SIX', es: 'SEIS' },
  { value: 7, en: 'SEVEN', es: 'SIETE' },
  { value: 8, en: 'EIGHT', es: 'OCHO' },
  { value: 9, en: 'NINE', es: 'NUEVE' },
  { value: 10, en: 'TEN', es: 'DIEZ' },
  { value: 11, en: 'ELEVEN', es: 'ONCE' },
  { value: 12, en: 'TWELVE', es: 'DOCE' },
  { value: 13, en: 'THIRTEEN', es: 'TRECE' },
  { value: 14, en: 'FOURTEEN', es: 'CATORCE' },
  { value: 15, en: 'FIFTEEN', es: 'QUINCE' },
  { value: 16, en: 'SIXTEEN', es: 'DIECISEIS' },
  { value: 17, en: 'SEVENTEEN', es: 'DIECISIETE' },
  { value: 18, en: 'EIGHTEEN', es: 'DIECIOCHO' },
  { value: 19, en: 'NINETEEN', es: 'DIECINUEVE' },
  { value: 20, en: 'TWENTY', es: 'VEINTE' },
  { value: 21, en: 'TWENTY-ONE', es: 'VEINTIUNO' },
  { value: 24, en: 'TWENTY-FOUR', es: 'VEINTICUATRO' },
  { value: 30, en: 'THIRTY', es: 'TREINTA' },
  { value: 40, en: 'FORTY', es: 'CUARENTA' },
  { value: 50, en: 'FIFTY', es: 'CINCUENTA' },
  { value: 100, en: 'ONE HUNDRED', es: 'CIEN' },
];

export const STANDARD_PUZZLES: PuzzleLevel[] = [
  {
    id: 'lv-01',
    numberLabel: '01',
    isSecret: false,
    title: 'O Cofre Bilíngue',
    mechanic: 'Tradução & Aritmética',
    languages: 'Inglês · Espanhol',
    briefing:
      'Na primeira gaveta do arquivo, duas operações matemáticas tiveram seus números escritos em idiomas alternados. Traduza cada termo para calcular os dois pares da fechadura.',
    expressions: [
      {
        label: 'Par Esquerdo',
        language: 'EN / ES',
        code: 'NINE  +  CATORCE  =  ??',
        detail: 'Inglês somado ao Espanhol',
      },
      {
        label: 'Par Direito',
        language: 'EN / ES',
        code: 'VEINTIUNO  −  FOUR  =  ??',
        detail: 'Espanhol subtraído do Inglês',
      },
    ],
    instruction: 'Una os dois resultados de 2 dígitos para formar o código de 4 dígitos.',
    answer: '2317',
    slotLabels: ['Par Esquerdo', 'Par Direito'],
    masterDigit: '2',
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: 'Em inglês, NINE = 9 e FOUR = 4. Em espanhol, CATORCE = 14 e VEINTIUNO = 21.',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'Some 9 + 14 para o primeiro par e subtraia 21 − 4 para o segundo par.',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: 'Os dois primeiros dígitos da senha são 23.',
      },
    ],
    solutionSteps: [
      'NINE (EN) = 9 e CATORCE (ES) = 14 → 9 + 14 = 23.',
      'VEINTIUNO (ES) = 21 e FOUR (EN) = 4 → 21 − 4 = 17.',
      'Combinando os dois pares em sequência: 2317.',
    ],
  },
  {
    id: 'lv-02',
    numberLabel: '02',
    isSecret: false,
    title: 'O Índice Alfabético',
    mechanic: 'Cifra A1Z26',
    languages: 'Inglês · Espanhol',
    briefing:
      'Os arquivistas converteram palavras em números somando a posição de cada letra no alfabeto (A=1, B=2, C=3 … Z=26). Decifre o valor oculto de uma palavra em Inglês e uma em Espanhol.',
    expressions: [
      {
        label: 'Exemplo Resolvido',
        language: 'EN',
        code: 'ONE  →  O(15) + N(14) + E(5)  =  34',
        detail: 'Use a Tabela A1Z26 na Mesa de Decifração para conferir',
      },
      {
        label: 'Primeiro Bloco',
        language: 'EN',
        code: 'SIX  →  S(?) + I(?) + X(?)  =  ??',
        detail: 'Número em Inglês',
      },
      {
        label: 'Segundo Bloco',
        language: 'ES',
        code: 'SOL  →  S(?) + O(?) + L(?)  =  ??',
        detail: 'Palavra em Espanhol',
      },
    ],
    instruction: 'Digite a soma das letras de SIX seguida pela soma das letras de SOL.',
    answer: '5246',
    slotLabels: ['Soma SIX', 'Soma SOL'],
    masterDigit: '5',
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: 'Use a aba "Tabela A1Z26" na Mesa de Decifração ao lado e clique nas letras S, I, X e depois S, O, L.',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'S = 19, I = 9, X = 24, O = 15, L = 12. Some os três valores de cada palavra.',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: 'SIX soma 52. Agora descubra a soma de SOL.',
      },
    ],
    solutionSteps: [
      'SIX: S(19) + I(9) + X(24) = 52.',
      'SOL: S(19) + O(15) + L(12) = 46.',
      'Código formado pelos dois resultados: 5246.',
    ],
  },
  {
    id: 'lv-03',
    numberLabel: '03',
    isSecret: false,
    title: 'Roda de César Bilíngue',
    mechanic: 'Deslocamento de César',
    languages: 'Inglês · Espanhol',
    briefing:
      'Duas palavras numéricas foram embaralhadas avançando as letras no alfabeto. A chave de deslocamento está escondida na diferença entre dois números de idiomas distintos.',
    expressions: [
      {
        label: 'Chave de Deslocamento',
        language: 'EN / ES',
        code: 'Chave  =  FIVE (EN)  −  DOS (ES)',
        detail: 'Retroceda esse número de posições na Roda de César',
      },
      {
        label: 'Cifra A (Espanhol)',
        language: 'ES',
        code: 'F L Q F R',
        detail: 'Decifra para um número em Espanhol (formato 2 dígitos: 0X)',
      },
      {
        label: 'Cifra B (Inglês)',
        language: 'EN',
        code: 'W H Q',
        detail: 'Decifra para um número em Inglês (formato 2 dígitos)',
      },
    ],
    instruction: 'Converta os dois números decifrados para 2 dígitos cada (ex: 5 vira 05) e junte-os.',
    answer: '0510',
    slotLabels: ['Cifra A (0X)', 'Cifra B (XX)'],
    masterDigit: '0',
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: 'FIVE = 5 e DOS = 2, portanto a chave é 3. As letras avançaram +3; volte −3 para ler o original.',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'Na aba "Roda de César", ajuste o deslocamento para −3 e teste FLQFR e WHQ.',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: 'FLQFR revela CINCO (05). Decifre WHQ em inglês.',
      },
    ],
    solutionSteps: [
      'Chave: FIVE (5) − DOS (2) = 3. Para decifrar, retroceda −3 posições no alfabeto.',
      'FLQFR (−3) → CINCO (ES) = 05.',
      'WHQ (−3) → TEN (EN) = 10.',
      'Unindo ambos com dois dígitos cada: 0510.',
    ],
  },
  {
    id: 'lv-04',
    numberLabel: '04',
    isSecret: false,
    title: 'Anatomia das Palavras',
    mechanic: 'Contagem de Letras',
    languages: 'Inglês · Espanhol',
    briefing:
      'Neste painel, o valor oculto não vem da soma alfabética, mas do produto entre a quantidade de letras que o mesmo número possui em Inglês e em Espanhol.',
    expressions: [
      {
        label: 'Exemplo (Número 1)',
        language: 'EN / ES',
        code: 'ONE (3 letras) × UNO (3 letras)  =  09',
        detail: 'Conte exatamente quantas letras cada idioma usa',
      },
      {
        label: 'Bloco A (Número 4)',
        language: 'EN / ES',
        code: 'Letras de 4 em Inglês × Letras de 4 em Espanhol  =  ??',
        detail: 'FOUR × CUATRO',
      },
      {
        label: 'Bloco B (Número 7)',
        language: 'EN / ES',
        code: 'Letras de 7 em Inglês × Letras de 7 em Espanhol  =  ??',
        detail: 'SEVEN × SIETE',
      },
    ],
    instruction: 'Insira o produto do Número 4 seguido pelo produto do Número 7.',
    answer: '2425',
    slotLabels: ['Produto 4', 'Produto 7'],
    masterDigit: '4',
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: '4 se escreve FOUR (EN) e CUATRO (ES). 7 se escreve SEVEN (EN) e SIETE (ES).',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'Conte as letras: FOUR tem 4 letras, CUATRO tem 6. SEVEN tem 5 letras, SIETE tem 5.',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: '4 × 6 = 24. Agora calcule 5 × 5.',
      },
    ],
    solutionSteps: [
      'Número 4: FOUR (4 letras) × CUATRO (6 letras) = 24.',
      'Número 7: SEVEN (5 letras) × SIETE (5 letras) = 25.',
      'Código resultante: 2425.',
    ],
  },
  {
    id: 'lv-05',
    numberLabel: '05',
    isSecret: false,
    title: 'A Sequência Alternada',
    mechanic: 'Progressão & A1Z26',
    languages: 'Inglês · Espanhol',
    briefing:
      'Um código de acesso segue uma contagem crescente que alterna rigorosamente entre Inglês e Espanhol. Descubra os dois próximos termos da fila e calcule suas somas A1Z26.',
    expressions: [
      {
        label: 'Sequência Observada',
        language: 'EN / ES',
        code: 'ONE  →  DOS  →  THREE  →  CUATRO  →  FIVE  →  [ P1 ]  →  [ P2 ]',
        detail: '1 (EN), 2 (ES), 3 (EN), 4 (ES), 5 (EN), ...',
      },
      {
        label: 'Primeiro Valor',
        language: 'ES',
        code: 'Soma A1Z26 de [ P1 ]  =  ??',
        detail: '6 em Espanhol (A=1 … Z=26)',
      },
      {
        label: 'Segundo Valor',
        language: 'EN',
        code: 'Soma A1Z26 de [ P2 ]  =  ??',
        detail: '7 em Inglês (A=1 … Z=26)',
      },
    ],
    instruction: 'Digite a soma A1Z26 de P1 seguida pela soma A1Z26 de P2.',
    answer: '5265',
    slotLabels: ['Soma P1', 'Soma P2'],
    masterDigit: '6',
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: 'P1 é o número 6 em espanhol (SEIS) e P2 é o número 7 em inglês (SEVEN).',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'SEIS: S(19)+E(5)+I(9)+S(19). SEVEN: S(19)+E(5)+V(22)+E(5)+N(14).',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: 'SEIS soma 52. Calcule a soma de SEVEN.',
      },
    ],
    solutionSteps: [
      'A sequência alterna idiomas: 6 em Espanhol = SEIS; 7 em Inglês = SEVEN.',
      'SEIS: S(19) + E(5) + I(9) + S(19) = 52.',
      'SEVEN: S(19) + E(5) + V(22) + E(5) + N(14) = 65.',
      'Código final: 5265.',
    ],
  },
  {
    id: 'lv-06',
    numberLabel: '06',
    isSecret: false,
    title: 'A Matriz dos Idiomas',
    mechanic: 'Sistema Lógico',
    languages: 'Inglês · Espanhol',
    briefing:
      'O último selo da campanha principal exige resolver três variáveis numéricas (X, Y e Z) escondidas em pistas bilíngues antes de montar a combinação final.',
    expressions: [
      {
        label: 'Variável X',
        language: 'ES',
        code: 'X  =  DIEZ  +  DOCE',
        detail: 'Soma em Espanhol',
      },
      {
        label: 'Variável Y',
        language: 'EN',
        code: 'Y  =  THIRTY  ÷  (letras de THREE)',
        detail: 'Divisão usando contagem de letras',
      },
      {
        label: 'Variável Z',
        language: 'EN / ES',
        code: 'Z  =  TWENTY (EN)  −  QUINCE (ES)',
        detail: 'Diferença entre os dois idiomas',
      },
      {
        label: 'Combinação da Trava',
        language: 'EN / ES',
        code: '[ X + Y ]   seguido de   [ Y × Z ]',
        detail: 'Dois resultados de 2 dígitos',
      },
    ],
    instruction: 'Calcule (X + Y) e (Y × Z) e insira os quatro dígitos.',
    answer: '2830',
    slotLabels: ['X + Y', 'Y × Z'],
    masterDigit: '8',
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: 'DIEZ=10, DOCE=12, THIRTY=30, THREE tem 5 letras, TWENTY=20 e QUINCE=15.',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'X = 22, Y = 30 ÷ 5 = 6, Z = 20 − 15 = 5.',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: 'X + Y = 22 + 6 = 28. Agora multiplique Y × Z.',
      },
    ],
    solutionSteps: [
      'X = 10 + 12 = 22.',
      'Y = 30 ÷ 5 (letras de THREE) = 6.',
      'Z = 20 − 15 = 5.',
      'X + Y = 28 e Y × Z = 30 → Código: 2830.',
    ],
  },
];

export const SECRET_PUZZLES: PuzzleLevel[] = [
  {
    id: 'sec-01',
    numberLabel: 'S1',
    isSecret: true,
    title: 'Cofre Alfa: Núcleo Espelhado',
    mechanic: 'Letras Centrais & Inversão',
    languages: 'Inglês · Espanhol',
    requiredLevels: ['lv-01', 'lv-02'],
    briefing:
      'Bem-vindo ao primeiro nível secreto. Aqui, apenas a letra exatamente central de cada número de 5 letras carrega o peso da senha — somado ao espelhamento alfabético de TWO.',
    expressions: [
      {
        label: 'Letras Centrais (A1Z26)',
        language: 'EN / ES',
        code: 'THREE (EN)  +  SIETE (ES)  +  EIGHT (EN)  +  CINCO (ES)',
        detail: 'Pegue a 3ª letra de cada palavra e some seus valores (A=1 … Z=26)',
      },
      {
        label: 'Valor Espelhado',
        language: 'EN',
        code: 'Inverta os dígitos da soma A1Z26 de TWO',
        detail: 'Exemplo: se a soma fosse 41, espelhado seria 14',
      },
    ],
    instruction: 'Insira a soma das 4 letras centrais seguida pelo valor espelhado de TWO.',
    answer: '4485',
    slotLabels: ['Soma Central', 'TWO Espelhado'],
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: 'As letras centrais são: R (THREE), E (SIETE), G (EIGHT) e N (CINCO).',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'R=18, E=5, G=7, N=14. Para TWO: T(20)+W(23)+O(15) = 58.',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: 'A soma das letras centrais é 44. Inverta os dígitos de 58.',
      },
    ],
    solutionSteps: [
      'Letras centrais: R(18) + E(5) + G(7) + N(14) = 44.',
      'Soma A1Z26 de TWO: T(20) + W(23) + O(15) = 58 → invertendo os dígitos: 85.',
      'Senha do Cofre Alfa: 4485.',
    ],
  },
  {
    id: 'sec-02',
    numberLabel: 'S2',
    isSecret: true,
    title: 'Cofre Beta: Transmissão Dupla',
    mechanic: 'César +4 & Expressão Cruzada',
    languages: 'Inglês · Espanhol',
    requiredLevels: ['lv-01', 'lv-02', 'lv-03', 'lv-04'],
    briefing:
      'Interceptamos três números criptografados com deslocamento de César +4, alternando entre Espanhol e Inglês. Decifre os valores A, B e C para calcular as duas travas do Cofre Beta.',
    expressions: [
      {
        label: 'A (Espanhol, César +4)',
        language: 'ES',
        code: 'G Y E X V S',
        detail: 'Retroceda −4 posições na Roda de César',
      },
      {
        label: 'B (Inglês, César +4)',
        language: 'EN',
        code: 'I M K L X',
        detail: 'Retroceda −4 posições na Roda de César',
      },
      {
        label: 'C (Espanhol, César +4)',
        language: 'ES',
        code: 'U Y M R G I',
        detail: 'Retroceda −4 posições na Roda de César',
      },
      {
        label: 'Equação do Cofre',
        language: 'EN / ES',
        code: '[ (A × B) + C ]   seguido de   [ (C − A) × B ]',
        detail: 'Calcule usando os números decifrados A, B e C',
      },
    ],
    instruction: 'Digite o resultado de (A × B) + C seguido por (C − A) × B.',
    answer: '4788',
    slotLabels: ['(A×B)+C', '(C−A)×B'],
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: 'Use a Roda de César com −4: GYEXVS = CUATRO (4), IMKLX = EIGHT (8), UYMRGI = QUINCE (15).',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'Substitua A=4, B=8, C=15 nas duas fórmulas.',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: '(4 × 8) + 15 = 47. Agora calcule (15 − 4) × 8.',
      },
    ],
    solutionSteps: [
      'Com deslocamento −4: GYEXVS = CUATRO (A=4), IMKLX = EIGHT (B=8), UYMRGI = QUINCE (C=15).',
      'Parte 1: (4 × 8) + 15 = 32 + 15 = 47.',
      'Parte 2: (15 − 4) × 8 = 11 × 8 = 88.',
      'Senha do Cofre Beta: 4788.',
    ],
  },
  {
    id: 'sec-03',
    numberLabel: 'S3',
    isSecret: true,
    title: 'Cofre Ômega: O Selo Poliglota',
    mechanic: 'César +5 × A1Z26',
    languages: 'Inglês · Espanhol',
    requiredLevels: ['lv-01', 'lv-02', 'lv-03', 'lv-04', 'lv-05', 'lv-06'],
    requiresMasterKey: true,
    briefing:
      'O núcleo final do Arquivo Cifra. Decifre dois números protegidos por César +5 (um em Inglês, um em Espanhol), some seus valores numéricos e multiplique pelo peso alfabético da palavra-chave em Inglês.',
    expressions: [
      {
        label: 'Número X (Inglês, César +5)',
        language: 'EN',
        code: 'Y B J S Y D',
        detail: 'Retroceda −5 na Roda de César',
      },
      {
        label: 'Número Y (Espanhol, César +5)',
        language: 'ES',
        code: 'T S H J',
        detail: 'Retroceda −5 na Roda de César',
      },
      {
        label: 'Fórmula Final',
        language: 'EN / ES',
        code: '( X + Y )  ×  Soma A1Z26 de "KEY"',
        detail: 'O produto exato forma o código de 4 dígitos',
      },
    ],
    instruction: 'Multiplique (X + Y) pela soma das letras de KEY e digite o número de 4 dígitos.',
    answer: '1271',
    slotLabels: ['Milhar/Centena', 'Dezena/Unidade'],
    hints: [
      {
        tier: 1,
        title: 'Pista Linguística',
        content: 'Com −5: YBJSYD = TWENTY (20) e TSHJ = ONCE (11).',
      },
      {
        tier: 2,
        title: 'Operação Numérica',
        content: 'KEY em A1Z26: K(11) + E(5) + Y(25) = 41. Multiplique (20 + 11) × 41.',
      },
      {
        tier: 3,
        title: 'Primeiro Par',
        content: '31 × 41 começa com 12.',
      },
    ],
    solutionSteps: [
      'YBJSYD (−5) → TWENTY (EN) = 20.',
      'TSHJ (−5) → ONCE (ES) = 11.',
      'KEY (A1Z26) = K(11) + E(5) + Y(25) = 41.',
      '(20 + 11) × 41 = 31 × 41 = 1271.',
    ],
  },
];

export const ALL_PUZZLES: PuzzleLevel[] = [...STANDARD_PUZZLES, ...SECRET_PUZZLES];

export const MASTER_KEY_CODE = STANDARD_PUZZLES.map((p) => p.masterDigit ?? '').join('');

export function a1z26Sum(word: string): number {
  return word
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .reduce((acc, ch) => acc + (ch.charCodeAt(0) - 64), 0);
}

export function caesarShift(text: string, shift: number): string {
  const normalized = ((shift % 26) + 26) % 26;
  return text
    .toUpperCase()
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + normalized) % 26) + 65);
      }
      return ch;
    })
    .join('');
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function generateEndlessPuzzle(category: EndlessCategory): EndlessPuzzle {
  const pool = BILINGUAL_NUMBERS.filter((n) => n.value >= 1 && n.value <= 20);
  const pick = () => pool[Math.floor(Math.random() * pool.length)];

  if (category === 'ARITHMETIC') {
    const a = pick();
    const b = pick();
    const cPool = pool.filter((x) => x.value > 5);
    const c = cPool[Math.floor(Math.random() * cPool.length)];
    const dPool = pool.filter((x) => x.value < c.value);
    const d = dPool[Math.floor(Math.random() * dPool.length)];

    const left = a.value + b.value;
    const right = c.value - d.value;

    return {
      id: `end-arith-${Date.now()}-${Math.random()}`,
      category,
      title: 'Desafio de Aritmética Bilíngue',
      briefing: 'Traduza os termos em Inglês e Espanhol para encontrar os dois pares de 2 dígitos.',
      expressions: [
        {
          label: 'Par Esquerdo',
          language: 'EN / ES',
          code: `${a.en}  +  ${b.es}  =  ??`,
          detail: 'Inglês + Espanhol (use 2 dígitos, ex: 09)',
        },
        {
          label: 'Par Direito',
          language: 'EN / ES',
          code: `${c.es}  −  ${d.en}  =  ??`,
          detail: 'Espanhol − Inglês (use 2 dígitos, ex: 04)',
        },
      ],
      instruction: 'Una os dois resultados (com 2 dígitos cada) para formar 4 dígitos.',
      answer: `${pad2(left)}${pad2(right)}`,
      slotLabels: ['Par Esquerdo', 'Par Direito'],
      hint: `${a.en}=${a.value}, ${b.es}=${b.value}, ${c.es}=${c.value}, ${d.en}=${d.value}.`,
      solutionExplanation: `${a.en} (${a.value}) + ${b.es} (${b.value}) = ${pad2(left)}; ${c.es} (${c.value}) − ${d.en} (${d.value}) = ${pad2(right)}. Código: ${pad2(left)}${pad2(right)}.`,
    };
  }

  if (category === 'A1Z26') {
    const a1z26Pool = pool.filter((n) => a1z26Sum(n.en) <= 99 && a1z26Sum(n.es) <= 99);
    const enWord = a1z26Pool[Math.floor(Math.random() * a1z26Pool.length)];
    let esWord = a1z26Pool[Math.floor(Math.random() * a1z26Pool.length)];
    while (esWord.es === enWord.en) {
      esWord = a1z26Pool[Math.floor(Math.random() * a1z26Pool.length)];
    }
    const sum1 = a1z26Sum(enWord.en);
    const sum2 = a1z26Sum(esWord.es);
    return {
      id: `end-a1z26-${Date.now()}-${Math.random()}`,
      category,
      title: 'Desafio de Soma Alfabética (A1Z26)',
      briefing: 'Calcule a soma das posições alfabéticas (A=1 … Z=26) de cada palavra numérica.',
      expressions: [
        {
          label: 'Primeiro Bloco',
          language: 'EN',
          code: `${enWord.en}  →  Soma A1Z26 = ??`,
          detail: 'Número em Inglês',
        },
        {
          label: 'Segundo Bloco',
          language: 'ES',
          code: `${esWord.es}  →  Soma A1Z26 = ??`,
          detail: 'Número em Espanhol',
        },
      ],
      instruction: 'Junte as duas somas (ou use a Tabela A1Z26 ao lado) para formar 4 dígitos.',
      answer: `${pad2(sum1)}${pad2(sum2)}`,
      slotLabels: [`Soma ${enWord.en}`, `Soma ${esWord.es}`],
      hint: `Use a Tabela A1Z26 para somar ${enWord.en} (${sum1}) e ${esWord.es}.`,
      solutionExplanation: `${enWord.en} soma ${sum1} e ${esWord.es} soma ${sum2}. Código: ${pad2(sum1)}${pad2(sum2)}.`,
    };
  }

  // CAESAR
  const shift = Math.floor(Math.random() * 5) + 2; // +2 to +6
  const numA = pick();
  const numB = pick();
  const cipherA = caesarShift(numA.en, shift).split('').join(' ');
  const cipherB = caesarShift(numB.es, shift).split('').join(' ');

  return {
    id: `end-caesar-${Date.now()}-${Math.random()}`,
    category,
    title: `Desafio César +${shift}`,
    briefing: `Ambas as palavras numéricas foram cifradas avançando +${shift} letras no alfabeto. Retroceda −${shift} na Roda de César.`,
    expressions: [
      {
        label: 'Palavra A (Inglês)',
        language: 'EN',
        code: cipherA,
        detail: `Deslocamento aplicado: +${shift} (volte −${shift})`,
      },
      {
        label: 'Palavra B (Espanhol)',
        language: 'ES',
        code: cipherB,
        detail: `Deslocamento aplicado: +${shift} (volte −${shift})`,
      },
    ],
    instruction: 'Converta cada número decifrado para 2 dígitos (ex: 4 vira 04) e una-os.',
    answer: `${pad2(numA.value)}${pad2(numB.value)}`,
    slotLabels: ['Número EN', 'Número ES'],
    hint: `Com −${shift} na Roda de César, ${cipherA.replace(/\s+/g, '')} vira ${numA.en} (${pad2(numA.value)}).`,
    solutionExplanation: `Retrocedendo −${shift}: ${cipherA.replace(/\s+/g, '')} → ${numA.en} (${pad2(numA.value)}) e ${cipherB.replace(/\s+/g, '')} → ${numB.es} (${pad2(numB.value)}). Código: ${pad2(numA.value)}${pad2(numB.value)}.`,
  };
}
