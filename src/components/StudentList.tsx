import { Student, StudentHistory } from '../types/Student';
import { Edit, Trash2, ChevronDown, ChevronUp, History, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { WorkoutPlanViewer } from './WorkoutPlanViewer';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

export function StudentList({ students, onEdit, onDelete }: StudentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-purple-400">
        <p>Nenhum aluno cadastrado ainda.</p>
        <p className="mt-2">Clique em "Novo Aluno" para começar.</p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {students.map((student) => (
        <div
          key={student.id}
          className="border-2 border-purple-200 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                {student.foto && (
                  <img
                    src={student.foto}
                    alt={student.nome}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full border-2 border-purple-300 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-purple-900 text-sm sm:text-base font-semibold truncate">{student.nome}</h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2 text-purple-700 text-xs sm:text-sm">
                    <span>{student.idade} anos</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{student.sexo}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{student.objetivoPrincipal}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>IMC: {student.imc}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleExpand(student.id)}
                  className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors"
                  title="Ver detalhes"
                >
                  {expandedId === student.id ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <button
                  onClick={() => onEdit(student)}
                  className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Deseja realmente excluir ${student.nome}?`)) {
                      onDelete(student.id);
                    }
                  }}
                  className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === student.id && (
            <div className="p-3 sm:p-6 bg-white space-y-4 sm:space-y-6">
              {/* Aquecimento e Preparação */}
              {(student.alongamentos || student.liberacao || student.mobilidade) && (
                <div>
                  <h4 className="text-purple-900 mb-3">Aquecimento e Preparação</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {student.alongamentos && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-purple-700 mb-1">Alongamentos</p>
                        <p className="text-purple-900">{student.alongamentos}</p>
                      </div>
                    )}
                    {student.liberacao && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-purple-700 mb-1">Liberação</p>
                        <p className="text-purple-900">{student.liberacao}</p>
                      </div>
                    )}
                    {student.mobilidade && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-purple-700 mb-1">Mobilidade</p>
                        <p className="text-purple-900">{student.mobilidade}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dados Antropométricos */}
              <div>
                <h4 className="text-purple-900 mb-3">Dados Antropométricos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-purple-700">Peso</p>
                    <p className="text-purple-900">{student.peso} kg</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-purple-700">Altura</p>
                    <p className="text-purple-900">{student.altura} m</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-purple-700">IMC</p>
                    <p className="text-purple-900">{student.imc}</p>
                  </div>
                </div>
              </div>

              {/* Perímetros */}
              <div>
                <h4 className="text-purple-900 mb-3">Perímetros (cm)</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {student.perimetros.ombros > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Ombros</p>
                      <p className="text-purple-900">{student.perimetros.ombros} cm</p>
                    </div>
                  )}
                  {student.perimetros.torax > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Tórax</p>
                      <p className="text-purple-900">{student.perimetros.torax} cm</p>
                    </div>
                  )}
                  {student.perimetros.cintura > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Cintura</p>
                      <p className="text-purple-900">{student.perimetros.cintura} cm</p>
                    </div>
                  )}
                  {student.perimetros.abdomen > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Abdômen</p>
                      <p className="text-purple-900">{student.perimetros.abdomen} cm</p>
                    </div>
                  )}
                  {student.perimetros.bracoDireito > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Braço Dir.</p>
                      <p className="text-purple-900">{student.perimetros.bracoDireito} cm</p>
                    </div>
                  )}
                  {student.perimetros.bracoEsquerdo > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Braço Esq.</p>
                      <p className="text-purple-900">{student.perimetros.bracoEsquerdo} cm</p>
                    </div>
                  )}
                  {student.perimetros.coxaDireita > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Coxa Dir.</p>
                      <p className="text-purple-900">{student.perimetros.coxaDireita} cm</p>
                    </div>
                  )}
                  {student.perimetros.coxaEsquerda > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Coxa Esq.</p>
                      <p className="text-purple-900">{student.perimetros.coxaEsquerda} cm</p>
                    </div>
                  )}
                  {student.perimetros.gemeoDireito > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Gêmeo Dir.</p>
                      <p className="text-purple-900">{student.perimetros.gemeoDireito} cm</p>
                    </div>
                  )}
                  {student.perimetros.gemeoEsquerdo > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-purple-700">Gêmeo Esq.</p>
                      <p className="text-purple-900">{student.perimetros.gemeoEsquerdo} cm</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Treino */}
              <div>
                <h4 className="text-purple-900 mb-3">Rotina de Treino</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.datasTreino.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-purple-700 mb-2">Dias de Treino</p>
                      <div className="flex flex-wrap gap-2">
                        {student.datasTreino.map((dia) => (
                          <span
                            key={dia}
                            className="px-3 py-1 bg-purple-600 text-white rounded-full"
                          >
                            {dia}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {student.duracaoTreino > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-purple-700 mb-1">Duração do Treino</p>
                      <p className="text-purple-900">{student.duracaoTreino} minutos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Planilha de Treino */}
              <WorkoutPlanViewer student={student} />

              {/* Histórico de Atualizações */}
              {student.historico && student.historico.length > 0 && (
                <div className="mt-6 pt-6 border-t border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-purple-600" />
                    <h4 className="text-purple-900">Histórico de Atualizações</h4>
                  </div>
                  
                  <div className="space-y-3">
                    {student.historico
                      .sort((a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime())
                      .map((historyEntry, index) => (
                        <div
                          key={historyEntry.id}
                          className="border-2 border-purple-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => setSelectedHistoryId(
                              selectedHistoryId === historyEntry.id ? null : historyEntry.id
                            )}
                            className="w-full p-3 bg-purple-50 hover:bg-purple-100 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-purple-600 font-semibold">
                                Atualização #{student.historico!.length - index}
                              </span>
                              <span className="text-purple-600">
                                {new Date(historyEntry.dataAtualizacao).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            {selectedHistoryId === historyEntry.id ? (
                              <ChevronUp className="w-5 h-5 text-purple-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-purple-600" />
                            )}
                          </button>
                          
                          {selectedHistoryId === historyEntry.id && (
                            <div className="p-4 bg-white space-y-4">
                              <ComparisonView
                                current={student}
                                previous={historyEntry.dados}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Data de Cadastro */}
              <div className="pt-4 border-t border-purple-200">
                <p className="text-purple-600">
                  Cadastrado em: {new Date(student.dataCadastro).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Componente para comparar dados atuais com histórico
function ComparisonView({ 
  current, 
  previous 
}: { 
  current: Student; 
  previous: Omit<Student, 'id' | 'dataCadastro' | 'historico'>;
}) {
  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return value > 0 ? value.toString() : '—';
    }
    if (typeof value === 'string') {
      return value || '—';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '—';
    }
    return '—';
  };

  const getChangeIndicator = (currentVal: any, previousVal: any, isHigherBetter: boolean = true) => {
    if (typeof currentVal !== 'number' || typeof previousVal !== 'number') return null;
    if (currentVal === previousVal) return null;
    
    const isIncrease = currentVal > previousVal;
    const isGood = isHigherBetter ? isIncrease : !isIncrease;
    
    return (
      <span className={`ml-2 ${isGood ? 'text-green-600' : 'text-red-600'}`}>
        {isIncrease ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Dados Básicos */}
      <div>
        <h5 className="text-purple-800 font-semibold mb-2">Dados Básicos</h5>
        <div className="grid grid-cols-2 gap-4">
          <ComparisonField
            label="Peso"
            current={current.peso}
            previous={previous.peso}
            unit="kg"
            isHigherBetter={false}
          />
          <ComparisonField
            label="Altura"
            current={current.altura}
            previous={previous.altura}
            unit="m"
            isHigherBetter={true}
          />
          <ComparisonField
            label="IMC"
            current={current.imc}
            previous={previous.imc}
            isHigherBetter={false}
          />
        </div>
      </div>

      {/* Perímetros */}
      <div>
        <h5 className="text-purple-800 font-semibold mb-2">Perímetros (cm)</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(current.perimetros).map(([key, value]) => {
            const previousValue = previous.perimetros[key as keyof typeof previous.perimetros];
            if (value === 0 && previousValue === 0) return null;
            
            return (
              <div key={key} className="bg-purple-50 p-2 rounded">
                <p className="text-xs text-purple-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-purple-900">
                    {previousValue > 0 ? `${previousValue} → ` : ''}
                    {value > 0 ? value : '—'}
                  </span>
                  {getChangeIndicator(value, previousValue, true)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ComparisonField({
  label,
  current,
  previous,
  unit = '',
  isHigherBetter = true
}: {
  label: string;
  current: number;
  previous: number;
  unit?: string;
  isHigherBetter?: boolean;
}) {
  const change = current - previous;
  const hasChange = change !== 0;
  
  return (
    <div className="bg-purple-50 p-3 rounded">
      <p className="text-xs text-purple-600 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-purple-900">
          {previous > 0 ? `${previous}${unit} → ` : ''}
          {current > 0 ? `${current}${unit}` : '—'}
        </span>
        {hasChange && (
          <span className={`text-sm font-semibold ${change > 0 === isHigherBetter ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}{unit}
          </span>
        )}
      </div>
    </div>
  );
}