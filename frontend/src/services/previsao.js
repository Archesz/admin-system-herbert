// Modelo FAKE de previsão de aprovação no vestibular.
// Ainda não existe modelo treinado: os indicadores do aluno são gerados de forma
// determinística a partir do CPF e a probabilidade vem de uma regressão logística
// com pesos escolhidos à mão. Quando houver um modelo real, basta trocar
// `preverAprovacao` por uma chamada à API mantendo o mesmo formato de retorno.

export const MODELO_VERSAO = "fake-v0.1";

export const CONCORRENCIA = {
    Baixa: { label: "Baixa (ex.: licenciaturas)", peso: 0.6 },
    Média: { label: "Média (ex.: engenharias)", peso: 0 },
    Alta: { label: "Alta (ex.: medicina, direito)", peso: -1.2 },
};

// Hash simples (FNV-1a) para gerar números estáveis por aluno
function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function pseudoAleatorio(seed, salt) {
    return (hash(`${seed}:${salt}`) % 10000) / 10000;
}

// Indicadores fictícios do aluno (frequência, simulados, redação, concorrência)
export function gerarIndicadores(aluno) {
    const seed = aluno.cpf || aluno.nome || "";
    const concorrencias = Object.keys(CONCORRENCIA);

    return {
        frequencia: Math.round(55 + pseudoAleatorio(seed, "freq") * 45),
        simulados: Math.round(30 + pseudoAleatorio(seed, "sim") * 60),
        redacao: Math.round((400 + pseudoAleatorio(seed, "red") * 560) / 20) * 20,
        concorrencia: concorrencias[hash(`${seed}:conc`) % concorrencias.length],
    };
}

const PESOS = {
    intercepto: -9,
    frequencia: 0.03,
    simulados: 0.07,
    redacao: 0.004,
};

// Retorna a probabilidade (0-100) e a contribuição de cada fator
export function calcularPrevisao({ frequencia, simulados, redacao, concorrencia }) {
    const fatores = [
        { fator: "Frequência", impacto: PESOS.frequencia * (frequencia - 80) },
        { fator: "Média nos simulados", impacto: PESOS.simulados * (simulados - 60) },
        { fator: "Nota de redação", impacto: PESOS.redacao * (redacao - 700) },
        { fator: "Concorrência do curso", impacto: CONCORRENCIA[concorrencia]?.peso ?? 0 },
    ];

    const base =
        PESOS.intercepto +
        PESOS.frequencia * 80 +
        PESOS.simulados * 60 +
        PESOS.redacao * 700;
    const z = base + fatores.reduce((soma, f) => soma + f.impacto, 0);
    const probabilidade = Math.round(100 / (1 + Math.exp(-z)));

    return { probabilidade, fatores, versao: MODELO_VERSAO };
}

export function classificar(probabilidade) {
    if (probabilidade >= 70) return { nivel: "Alta", cor: "green" };
    if (probabilidade >= 40) return { nivel: "Média", cor: "gold" };
    return { nivel: "Baixa", cor: "red" };
}

// Simula a chamada assíncrona de um modelo hospedado
export async function preverAprovacao(aluno, indicadores = gerarIndicadores(aluno)) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { indicadores, ...calcularPrevisao(indicadores) };
}
