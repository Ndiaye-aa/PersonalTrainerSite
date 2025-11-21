import { useState } from 'react';
import { WorkoutPlan, Exercise } from '../types/Student';
import { Plus, Trash2, Dumbbell } from 'lucide-react';

interface WorkoutPlanEditorProps {
  treinoA: WorkoutPlan;
  treinoB: WorkoutPlan;
  treinoC: WorkoutPlan;
  onChange: (tipo: 'A' | 'B' | 'C', plan: WorkoutPlan) => void;
}

export function WorkoutPlanEditor({ treinoA, treinoB, treinoC, onChange }: WorkoutPlanEditorProps) {
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C'>('A');

  const getCurrentPlan = () => {
    switch (activeTab) {
      case 'A': return treinoA;
      case 'B': return treinoB;
      case 'C': return treinoC;
    }
  };

  const addExercise = () => {
    const currentPlan = getCurrentPlan();
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      nome: '',
      series: '',
      repeticoes: '',
      carga: '',
      descanso: '',
      observacao: '',
    };
    
    onChange(activeTab, {
      ...currentPlan,
      exercicios: [...currentPlan.exercicios, newExercise],
    });
  };

  const removeExercise = (id: string) => {
    const currentPlan = getCurrentPlan();
    onChange(activeTab, {
      ...currentPlan,
      exercicios: currentPlan.exercicios.filter(ex => ex.id !== id),
    });
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    const currentPlan = getCurrentPlan();
    onChange(activeTab, {
      ...currentPlan,
      exercicios: currentPlan.exercicios.map(ex =>
        ex.id === id ? { ...ex, [field]: value } : ex
      ),
    });
  };

  const updateObservacoes = (value: string) => {
    const currentPlan = getCurrentPlan();
    onChange(activeTab, {
      ...currentPlan,
      observacoesGerais: value,
    });
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
      <div className="flex items-center gap-2 mb-6">
        <Dumbbell className="w-6 h-6 text-purple-600" />
        <h2 className="text-purple-900">5. Planilha de Treino</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['A', 'B', 'C'] as const).map((treino) => (
          <button
            key={treino}
            type="button"
            onClick={() => setActiveTab(treino)}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === treino
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400'
            }`}
          >
            Treino {treino}
          </button>
        ))}
      </div>

      {/* Exercises Table */}
      <div className="space-y-4">
        {currentPlan.exercicios.length === 0 ? (
          <div className="text-center py-8 text-purple-400 bg-white rounded-lg">
            <p>Nenhum exercício adicionado ao Treino {activeTab}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Exercício</th>
                  <th className="px-4 py-3 text-left w-24">Séries</th>
                  <th className="px-4 py-3 text-left w-24">Reps</th>
                  <th className="px-4 py-3 text-left w-24">Carga</th>
                  <th className="px-4 py-3 text-left w-32">Descanso</th>
                  <th className="px-4 py-3 text-left">Observação</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {currentPlan.exercicios.map((exercise, index) => (
                  <tr key={exercise.id} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={exercise.nome}
                        onChange={(e) => updateExercise(exercise.id, 'nome', e.target.value)}
                        placeholder="Nome do exercício"
                        className="w-full px-3 py-2 border border-purple-200 rounded focus:border-purple-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={exercise.series}
                        onChange={(e) => updateExercise(exercise.id, 'series', e.target.value)}
                        placeholder="3"
                        className="w-full px-3 py-2 border border-purple-200 rounded focus:border-purple-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={exercise.repeticoes}
                        onChange={(e) => updateExercise(exercise.id, 'repeticoes', e.target.value)}
                        placeholder="12"
                        className="w-full px-3 py-2 border border-purple-200 rounded focus:border-purple-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={exercise.carga}
                        onChange={(e) => updateExercise(exercise.id, 'carga', e.target.value)}
                        placeholder="20kg"
                        className="w-full px-3 py-2 border border-purple-200 rounded focus:border-purple-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={exercise.descanso}
                        onChange={(e) => updateExercise(exercise.id, 'descanso', e.target.value)}
                        placeholder="60s"
                        className="w-full px-3 py-2 border border-purple-200 rounded focus:border-purple-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={exercise.observacao}
                        onChange={(e) => updateExercise(exercise.id, 'observacao', e.target.value)}
                        placeholder="Observações..."
                        className="w-full px-3 py-2 border border-purple-200 rounded focus:border-purple-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Remover exercício"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Exercise Button */}
        <button
          type="button"
          onClick={addExercise}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Adicionar Exercício ao Treino {activeTab}
        </button>

        {/* Observações Gerais */}
        <div className="mt-6">
          <label className="block text-purple-700 mb-2">Observações Gerais do Treino {activeTab}</label>
          <textarea
            value={currentPlan.observacoesGerais || ''}
            onChange={(e) => updateObservacoes(e.target.value)}
            rows={4}
            placeholder="Ex: Aluno apresenta dificuldade na execução do agachamento. Atenção especial ao posicionamento dos joelhos..."
            className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none bg-white"
          />
        </div>
      </div>
    </div>
  );
}