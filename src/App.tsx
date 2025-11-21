import { useState, useEffect } from 'react';
import { StudentForm } from './components/StudentForm';
import { StudentList } from './components/StudentList';
import { AuthForm } from './components/AuthForm';
import { Student } from './types/Student';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserPlus, Users, LogOut, Dumbbell } from 'lucide-react';
import { loadStudents, saveStudent, deleteStudent } from './services/studentService';

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('list');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Carregar alunos do Firestore/localStorage quando o usuário fizer login
  useEffect(() => {
    if (user) {
      setIsLoadingStudents(true);
      loadStudents(user.id)
        .then(setStudents)
        .catch(error => {
          console.error('Erro ao carregar alunos:', error);
          setStudents([]);
        })
        .finally(() => setIsLoadingStudents(false));
    } else {
      setStudents([]);
    }
  }, [user]);

  const handleSaveStudent = async (student: Student) => {
    if (!user) return;
    
    setIsLoadingStudents(true);
    try {
      // Se for novo aluno, criar ID temporário
      const studentToSave = editingStudent 
        ? student 
        : { ...student, id: `temp_${crypto.randomUUID()}` };
      
      const savedStudent = await saveStudent(studentToSave, user.id);
      
      if (editingStudent) {
        setStudents(students.map(s => s.id === savedStudent.id ? savedStudent : s));
      } else {
        setStudents([...students, savedStudent]);
      }
      
      setEditingStudent(null);
      setActiveTab('list');
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      alert('Erro ao salvar aluno. Tente novamente.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setActiveTab('form');
  };

  const handleDeleteStudent = async (id: string) => {
    if (!user) return;
    
    setIsLoadingStudents(true);
    try {
      await deleteStudent(id, user.id);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      alert('Erro ao deletar aluno. Tente novamente.');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      logout();
      setStudents([]);
      setEditingStudent(null);
      setActiveTab('list');
    }
  };

  // Mostrar loading
  if (isLoading || (user && isLoadingStudents)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-purple-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar tela de login se não estiver autenticado
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex-1 hidden sm:block" />
            <div className="flex-1 text-center order-2 sm:order-1">
              <h1 className="text-purple-900 mb-2 text-lg sm:text-2xl md:text-3xl font-bold">
                Sistema de Gerenciamento de Alunos
              </h1>
              <p className="text-purple-600 text-sm sm:text-base">Personal Training</p>
            </div>
            <div className="flex-1 flex justify-end order-1 sm:order-2 w-full sm:w-auto">
              <div className="text-right w-full sm:w-auto">
                {user.nome && (
                  <p className="text-purple-700 mb-1 text-sm sm:text-base font-semibold truncate">
                    {user.nome}
                  </p>
                )}
                <p className="text-purple-600 mb-2 text-xs sm:text-sm truncate">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs sm:text-sm w-full sm:w-auto justify-center sm:justify-start"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sair</span>
                  <span className="sm:hidden">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-8 justify-center flex-wrap">
          <button
            onClick={() => {
              setActiveTab('form');
              if (activeTab === 'form') {
                setEditingStudent(null);
              }
            }}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all text-xs sm:text-base flex-1 sm:flex-initial ${
              activeTab === 'form'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-purple-600 hover:bg-purple-50'
            }`}
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</span>
            <span className="sm:hidden">{editingStudent ? 'Editar' : 'Novo'}</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition-all text-xs sm:text-base flex-1 sm:flex-initial ${
              activeTab === 'list'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-purple-600 hover:bg-purple-50'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Alunos ({students.length})</span>
            <span className="sm:hidden">Alunos ({students.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-6 md:p-8">
          {activeTab === 'form' ? (
            <StudentForm 
              onSave={handleSaveStudent} 
              editingStudent={editingStudent}
              onCancel={handleCancelEdit}
            />
          ) : (
            <StudentList
              students={students}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}