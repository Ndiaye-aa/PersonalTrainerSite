export interface Exercise {
  id: string;
  nome: string;
  series: string;
  repeticoes: string;
  carga: string;
  descanso: string;
  observacao: string;
}

export interface WorkoutPlan {
  exercicios: Exercise[];
  observacoesGerais: string;
}

// Tipo base para dados do aluno (sem id, dataCadastro e historico)
export type StudentData = {
  // Dados Pessoais e Biológicos
  nome: string;
  idade: number;
  sexo: 'Masculino' | 'Feminino';
  foto?: string; // URL ou base64 da foto
  
  // Aquecimento e Preparação
  alongamentos: string;
  liberacao: string;
  mobilidade: string;
  
  // Dados Antropométricos
  peso: number;
  altura: number;
  imc: number;
  perimetros: {
    ombros: number;
    torax: number;
    cintura: number;
    abdomen: number;
    bracoDireito: number;
    bracoEsquerdo: number;
    coxaDireita: number;
    coxaEsquerda: number;
    gemeoDireito: number;
    gemeoEsquerdo: number;
  };
  
  // Objetivos e Metas
  objetivoPrincipal: 'Hipertrofia' | 'Emagrecimento' | 'Força' | 'Resistência' | 'Reabilitação';
  datasTreino: string[];
  duracaoTreino: number;
  
  // Planilhas de Treino
  treinoA: WorkoutPlan;
  treinoB: WorkoutPlan;
  treinoC: WorkoutPlan;
};

export interface StudentHistory {
  id: string;
  dataAtualizacao: string;
  dados: StudentData;
}

export interface Student extends StudentData {
  id: string;
  // Metadata
  dataCadastro: string;
  historico?: StudentHistory[]; // Histórico de atualizações
}