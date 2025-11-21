import { useState, useEffect, useRef } from 'react';
import { Student, WorkoutPlan } from '../types/Student';
import { Save, X, User, Activity, Target, Ruler, Camera, Image as ImageIcon } from 'lucide-react';
import { WorkoutPlanEditor } from './WorkoutPlanEditor';
import { useAuth } from '../contexts/AuthContext';
import { uploadPhoto } from '../services/studentService';

interface StudentFormProps {
  onSave: (student: Student) => void;
  editingStudent: Student | null;
  onCancel: () => void;
}

export function StudentForm({ onSave, editingStudent, onCancel }: StudentFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'dataCadastro' | 'imc'>>(({
    nome: '',
    idade: 0,
    sexo: 'Masculino',
    foto: undefined,
    alongamentos: '',
    liberacao: '',
    mobilidade: '',
    peso: 0,
    altura: 0,
    perimetros: {
      ombros: 0,
      torax: 0,
      cintura: 0,
      abdomen: 0,
      bracoDireito: 0,
      bracoEsquerdo: 0,
      coxaDireita: 0,
      coxaEsquerda: 0,
      gemeoDireito: 0,
      gemeoEsquerdo: 0,
    },
    objetivoPrincipal: 'Hipertrofia',
    datasTreino: [],
    duracaoTreino: 60,
    treinoA: { exercicios: [], observacoesGerais: '' },
    treinoB: { exercicios: [], observacoesGerais: '' },
    treinoC: { exercicios: [], observacoesGerais: '' },
  }));

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        nome: editingStudent.nome,
        idade: editingStudent.idade,
        sexo: editingStudent.sexo,
        foto: editingStudent.foto,
        alongamentos: editingStudent.alongamentos,
        liberacao: editingStudent.liberacao,
        mobilidade: editingStudent.mobilidade,
        peso: editingStudent.peso,
        altura: editingStudent.altura,
        perimetros: editingStudent.perimetros,
        objetivoPrincipal: editingStudent.objetivoPrincipal,
        datasTreino: editingStudent.datasTreino,
        duracaoTreino: editingStudent.duracaoTreino,
        treinoA: editingStudent.treinoA,
        treinoB: editingStudent.treinoB,
        treinoC: editingStudent.treinoC,
      });
      setSelectedDays(editingStudent.datasTreino);
    }
  }, [editingStudent]);

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const calcularIMC = (peso: number, altura: number) => {
    if (peso > 0 && altura > 0) {
      return Number((peso / (altura * altura)).toFixed(2));
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const student: Student = {
      id: editingStudent?.id || crypto.randomUUID(),
      ...formData,
      imc: calcularIMC(formData.peso, formData.altura),
      datasTreino: selectedDays,
      dataCadastro: editingStudent?.dataCadastro || new Date().toISOString(),
    };
    
    onSave(student);
    
    // Reset form
    setFormData({
      nome: '',
      idade: 0,
      sexo: 'Masculino',
      foto: undefined,
      alongamentos: '',
      liberacao: '',
      mobilidade: '',
      peso: 0,
      altura: 0,
      perimetros: {
        ombros: 0,
        torax: 0,
        cintura: 0,
        abdomen: 0,
        bracoDireito: 0,
        bracoEsquerdo: 0,
        coxaDireita: 0,
        coxaEsquerda: 0,
        gemeoDireito: 0,
        gemeoEsquerdo: 0,
      },
      objetivoPrincipal: 'Hipertrofia',
      datasTreino: [],
      duracaoTreino: 60,
      treinoA: { exercicios: [], observacoesGerais: '' },
      treinoB: { exercicios: [], observacoesGerais: '' },
      treinoC: { exercicios: [], observacoesGerais: '' },
    });
    setSelectedDays([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const studentId = editingStudent?.id || `temp_${crypto.randomUUID()}`;
      const photoUrl = await uploadPhoto(file, user?.id || '', studentId);
      setFormData({ ...formData, foto: photoUrl });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      alert('Erro ao fazer upload da foto. Tente novamente.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, foto: undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
      {/* Dados Pessoais e Biológicos */}
      <section className="border-2 border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-6 bg-purple-50">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <h2 className="text-purple-900 text-base sm:text-lg md:text-xl">1. Dados Pessoais e Biológicos</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-purple-700 mb-2 text-sm sm:text-base">Nome Completo *</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label className="block text-purple-700 mb-2 text-sm sm:text-base">Idade *</label>
            <input
              type="number"
              required
              min="0"
              value={formData.idade || ''}
              onChange={(e) => setFormData({ ...formData, idade: Number(e.target.value) })}
              className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label className="block text-purple-700 mb-2 text-sm sm:text-base">Sexo Biológico *</label>
            <select
              value={formData.sexo}
              onChange={(e) => setFormData({ ...formData, sexo: e.target.value as 'Masculino' | 'Feminino' })}
              className="w-full px-3 sm:px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base"
            >
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
        </div>

        {/* Campo de Foto */}
        <div className="mt-4">
          <label className="block text-purple-700 mb-2 text-sm sm:text-base">Foto do Aluno</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {formData.foto ? (
              <div className="relative">
                <img
                  src={formData.foto}
                  alt="Foto do aluno"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-purple-200"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remover foto"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center bg-purple-50">
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              </div>
            )}
            <div className="w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
                disabled={isUploadingPhoto}
              />
              <label
                htmlFor="photo-upload"
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer text-sm sm:text-base w-full sm:w-auto ${
                  isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Camera className="w-4 h-4" />
                {isUploadingPhoto ? 'Enviando...' : formData.foto ? 'Alterar Foto' : 'Adicionar Foto'}
              </label>
              <p className="text-xs text-purple-600 mt-1 text-center sm:text-left">Máximo 5MB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Aquecimento e Preparação */}
      <section className="border-2 border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-6 bg-purple-50">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <h2 className="text-purple-900 text-base sm:text-lg md:text-xl">2. Aquecimento e Preparação</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-purple-700 mb-2">Alongamentos</label>
            <textarea
              value={formData.alongamentos}
              onChange={(e) => setFormData({ ...formData, alongamentos: e.target.value })}
              rows={3}
              placeholder="Ex: Alongamento de quadríceps, isquiotibiais..."
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>
          
          <div>
            <label className="block text-purple-700 mb-2">Liberação</label>
            <textarea
              value={formData.liberacao}
              onChange={(e) => setFormData({ ...formData, liberacao: e.target.value })}
              rows={3}
              placeholder="Ex: Foam roller em IT band, massagem..."
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>
          
          <div>
            <label className="block text-purple-700 mb-2">Mobilidade</label>
            <textarea
              value={formData.mobilidade}
              onChange={(e) => setFormData({ ...formData, mobilidade: e.target.value })}
              rows={3}
              placeholder="Ex: Mobilidade de ombro, quadril..."
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
            />
          </div>
        </div>
      </section>

      {/* Dados Antropométricos */}
      <section className="border-2 border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-6 bg-purple-50">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <h2 className="text-purple-900 text-base sm:text-lg md:text-xl">3. Dados Antropométricos Iniciais</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-purple-700 mb-2">Peso (kg) *</label>
            <input
              type="number"
              required
              step="0.1"
              min="0"
              value={formData.peso || ''}
              onChange={(e) => setFormData({ ...formData, peso: Number(e.target.value) })}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-purple-700 mb-2">Altura (m) *</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.altura || ''}
              onChange={(e) => setFormData({ ...formData, altura: Number(e.target.value) })}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-purple-700 mb-2">IMC (calculado)</label>
            <input
              type="text"
              disabled
              value={calcularIMC(formData.peso, formData.altura) || '—'}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg bg-purple-100 text-purple-900"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-purple-800 mb-4">Perímetros (cm)</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-purple-700 mb-2">Ombros</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.ombros || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, ombros: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Tórax</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.torax || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, torax: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Cintura</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.cintura || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, cintura: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Abdômen</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.abdomen || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, abdomen: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Braço Direito</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.bracoDireito || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, bracoDireito: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Braço Esquerdo</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.bracoEsquerdo || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, bracoEsquerdo: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Coxa Direita</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.coxaDireita || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, coxaDireita: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Coxa Esquerda</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.coxaEsquerda || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, coxaEsquerda: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Gêmeo Direito</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.gemeoDireito || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, gemeoDireito: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-purple-700 mb-2">Gêmeo Esquerdo</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.perimetros.gemeoEsquerdo || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  perimetros: { ...formData.perimetros, gemeoEsquerdo: Number(e.target.value) }
                })}
                className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Objetivos e Metas */}
      <section className="border-2 border-purple-200 rounded-lg sm:rounded-xl p-3 sm:p-6 bg-purple-50">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <h2 className="text-purple-900 text-base sm:text-lg md:text-xl">4. Objetivos e Metas</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-purple-700 mb-2">Objetivo Principal *</label>
            <select
              value={formData.objetivoPrincipal}
              onChange={(e) => setFormData({ ...formData, objetivoPrincipal: e.target.value as any })}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="Hipertrofia">Hipertrofia</option>
              <option value="Emagrecimento">Emagrecimento</option>
              <option value="Força">Força</option>
              <option value="Resistência">Resistência</option>
              <option value="Reabilitação">Reabilitação</option>
            </select>
          </div>
          
          <div>
            <label className="block text-purple-700 mb-2">Dias de Treino</label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => toggleDay(dia)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedDays.includes(dia)
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400'
                  }`}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-purple-700 mb-2">Duração do Treino (minutos)</label>
            <input
              type="number"
              min="0"
              step="5"
              value={formData.duracaoTreino || ''}
              onChange={(e) => setFormData({ ...formData, duracaoTreino: Number(e.target.value) })}
              className="w-full px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Planos de Treino */}
      <WorkoutPlanEditor
        treinoA={formData.treinoA}
        treinoB={formData.treinoB}
        treinoC={formData.treinoC}
        onChange={(tipo, plan) => {
          setFormData({
            ...formData,
            [`treino${tipo}`]: plan
          });
        }}
      />

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
        {editingStudent && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg text-sm sm:text-base"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
          {editingStudent ? 'Atualizar Aluno' : 'Salvar Aluno'}
        </button>
      </div>
    </form>
  );
}