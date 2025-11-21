import { useState } from 'react';
import { Student } from '../types/Student';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface WorkoutPlanViewerProps {
  student: Student;
}

export function WorkoutPlanViewer({ student }: WorkoutPlanViewerProps) {
  const [currentWorkout, setCurrentWorkout] = useState<'A' | 'B' | 'C'>('A');

  const getPlan = () => {
    switch (currentWorkout) {
      case 'A': return student.treinoA;
      case 'B': return student.treinoB;
      case 'C': return student.treinoC;
    }
  };

  const nextWorkout = () => {
    if (currentWorkout === 'A') setCurrentWorkout('B');
    else if (currentWorkout === 'B') setCurrentWorkout('C');
    else setCurrentWorkout('A');
  };

  const prevWorkout = () => {
    if (currentWorkout === 'A') setCurrentWorkout('C');
    else if (currentWorkout === 'B') setCurrentWorkout('A');
    else setCurrentWorkout('B');
  };

  const exportToPDF = async () => {
    try {
      const element = document.getElementById(`workout-pdf-${student.id}-${currentWorkout}`);
      if (!element) {
        alert('Erro: elemento não encontrado para exportação');
        return;
      }

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${student.nome}_Treino_${currentWorkout}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF. Por favor, tente novamente.');
    }
  };

  const currentPlan = getPlan();
  const hasExercises = currentPlan.exercicios.length > 0;

  return (
    <div className="mt-4 sm:mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <h4 className="text-purple-900 text-base sm:text-lg font-semibold">Planilha de Treino</h4>
        {hasExercises && (
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        )}
      </div>

      <div className="relative bg-white border-2 border-purple-200 rounded-lg sm:rounded-xl overflow-hidden">
        {/* Navigation Arrows */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white">
          <button
            onClick={prevWorkout}
            className="p-1.5 sm:p-2 hover:bg-purple-700 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <h3 className="text-sm sm:text-base font-semibold">Treino {currentWorkout}</h3>
          
          <button
            onClick={nextWorkout}
            className="p-1.5 sm:p-2 hover:bg-purple-700 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content for PDF Export */}
        <div id={`workout-pdf-${student.id}-${currentWorkout}`} className="p-3 sm:p-6">
          {/* PDF Header */}
          <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-purple-200">
            <h1 className="text-purple-900 text-lg sm:text-xl md:text-2xl font-bold">Planilha de Treino {currentWorkout}</h1>
            <p className="text-purple-700 mt-2 text-sm sm:text-base">Aluno: {student.nome}</p>
            <p className="text-purple-600 text-xs sm:text-sm">Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          {/* Aquecimento e Preparação */}
          {(student.alongamentos || student.liberacao || student.mobilidade) && (
            <div className="mb-6">
              <h4 className="text-purple-900 mb-3">Aquecimento e Preparação</h4>
              <div className="grid grid-cols-1 gap-3">
                {student.alongamentos && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-purple-700">Alongamentos:</p>
                    <p className="text-purple-900">{student.alongamentos}</p>
                  </div>
                )}
                {student.liberacao && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-purple-700">Liberação:</p>
                    <p className="text-purple-900">{student.liberacao}</p>
                  </div>
                )}
                {student.mobilidade && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-purple-700">Mobilidade:</p>
                    <p className="text-purple-900">{student.mobilidade}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercises */}
          {hasExercises ? (
            <div>
              <h4 className="text-purple-900 mb-3">Exercícios</h4>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-purple-600 text-white">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">#</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Exercício</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Séries</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Reps</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Carga</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Descanso</th>
                      <th className="px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Observação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPlan.exercicios.map((exercise, index) => (
                      <tr key={exercise.id} className={index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}>
                        <td className="px-2 sm:px-4 py-2 text-purple-700 text-xs sm:text-sm">{index + 1}</td>
                        <td className="px-2 sm:px-4 py-2 text-purple-900 text-xs sm:text-sm">{exercise.nome || '—'}</td>
                        <td className="px-2 sm:px-4 py-2 text-purple-900 text-xs sm:text-sm">{exercise.series || '—'}</td>
                        <td className="px-2 sm:px-4 py-2 text-purple-900 text-xs sm:text-sm">{exercise.repeticoes || '—'}</td>
                        <td className="px-2 sm:px-4 py-2 text-purple-900 text-xs sm:text-sm">{exercise.carga || '—'}</td>
                        <td className="px-2 sm:px-4 py-2 text-purple-900 text-xs sm:text-sm">{exercise.descanso || '—'}</td>
                        <td className="px-2 sm:px-4 py-2 text-purple-700 text-xs sm:text-sm">{exercise.observacao || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-purple-400">
              <p>Nenhum exercício cadastrado no Treino {currentWorkout}</p>
            </div>
          )}

          {/* Observações Gerais */}
          {currentPlan.observacoesGerais && (
            <div className="mt-6 pt-6 border-t-2 border-purple-200">
              <h4 className="text-purple-900 mb-3">Observações Gerais</h4>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-900 whitespace-pre-wrap">{currentPlan.observacoesGerais}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}