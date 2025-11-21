import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Student, StudentHistory } from '../types/Student';

// Verificar se Firebase está configurado
const isFirebaseConfigured = () => {
  try {
    return db && db.app.options.apiKey && db.app.options.apiKey !== 'YOUR_API_KEY';
  } catch {
    return false;
  }
};

// Converter Firestore Timestamp para string ISO
const convertTimestamp = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Converter Student para formato Firestore
const studentToFirestore = (student: Student) => {
  const { id, dataCadastro, historico, ...studentData } = student;
  return {
    ...studentData,
    dataCadastro: Timestamp.fromDate(new Date(dataCadastro)),
    historico: historico?.map(h => ({
      ...h,
      dataAtualizacao: Timestamp.fromDate(new Date(h.dataAtualizacao))
    }))
  };
};

// Converter Firestore para Student
const firestoreToStudent = (doc: any): Student => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    dataCadastro: convertTimestamp(data.dataCadastro),
    historico: data.historico?.map((h: any) => ({
      ...h,
      dataAtualizacao: convertTimestamp(h.dataAtualizacao)
    }))
  };
};

// Carregar alunos do Firestore
export const loadStudents = async (userId: string): Promise<Student[]> => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, 'students'),
        where('userId', '==', userId),
        orderBy('dataCadastro', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(firestoreToStudent);
    } catch (error) {
      console.error('Erro ao carregar alunos do Firestore:', error);
      // Fallback para localStorage
      return loadStudentsFromLocalStorage(userId);
    }
  } else {
    return loadStudentsFromLocalStorage(userId);
  }
};

// Carregar alunos do localStorage (fallback)
const loadStudentsFromLocalStorage = (userId: string): Student[] => {
  const storageKey = `students_${userId}`;
  const stored = localStorage.getItem(storageKey);
  return stored ? JSON.parse(stored) : [];
};

// Salvar aluno no Firestore
export const saveStudent = async (student: Student, userId: string): Promise<Student> => {
  if (isFirebaseConfigured()) {
    try {
      const studentData = studentToFirestore(student);
      const studentWithUserId = { ...studentData, userId };

      if (student.id && student.id.startsWith('temp_')) {
        // Novo aluno
        const docRef = await addDoc(collection(db, 'students'), studentWithUserId);
        return { ...student, id: docRef.id };
      } else {
        // Atualizar aluno existente
        const studentRef = doc(db, 'students', student.id);
        
        // Criar snapshot do histórico antes de atualizar
        const currentStudent = await getStudentById(student.id, userId);
        if (currentStudent) {
          const historyEntry: StudentHistory = {
            id: crypto.randomUUID(),
            dataAtualizacao: new Date().toISOString(),
            dados: {
              nome: currentStudent.nome,
              idade: currentStudent.idade,
              sexo: currentStudent.sexo,
              foto: currentStudent.foto,
              alongamentos: currentStudent.alongamentos,
              liberacao: currentStudent.liberacao,
              mobilidade: currentStudent.mobilidade,
              peso: currentStudent.peso,
              altura: currentStudent.altura,
              imc: currentStudent.imc,
              perimetros: currentStudent.perimetros,
              objetivoPrincipal: currentStudent.objetivoPrincipal,
              datasTreino: currentStudent.datasTreino,
              duracaoTreino: currentStudent.duracaoTreino,
              treinoA: currentStudent.treinoA,
              treinoB: currentStudent.treinoB,
              treinoC: currentStudent.treinoC,
            }
          };
          
          const updatedHistory = [
            ...(currentStudent.historico || []),
            historyEntry
          ];
          
          studentWithUserId.historico = updatedHistory.map(h => ({
            ...h,
            dataAtualizacao: Timestamp.fromDate(new Date(h.dataAtualizacao))
          }));
        }
        
        await updateDoc(studentRef, studentWithUserId);
        // Retornar aluno com histórico atualizado
        const updatedHistory = currentStudent 
          ? [...(currentStudent.historico || []), {
              id: crypto.randomUUID(),
              dataAtualizacao: new Date().toISOString(),
              dados: {
                nome: currentStudent.nome,
                idade: currentStudent.idade,
                sexo: currentStudent.sexo,
                foto: currentStudent.foto,
                alongamentos: currentStudent.alongamentos,
                liberacao: currentStudent.liberacao,
                mobilidade: currentStudent.mobilidade,
                peso: currentStudent.peso,
                altura: currentStudent.altura,
                imc: currentStudent.imc,
                perimetros: currentStudent.perimetros,
                objetivoPrincipal: currentStudent.objetivoPrincipal,
                datasTreino: currentStudent.datasTreino,
                duracaoTreino: currentStudent.duracaoTreino,
                treinoA: currentStudent.treinoA,
                treinoB: currentStudent.treinoB,
                treinoC: currentStudent.treinoC,
              }
            }]
          : [];
        return { ...student, historico: updatedHistory };
      }
    } catch (error) {
      console.error('Erro ao salvar aluno no Firestore:', error);
      // Fallback para localStorage
      return saveStudentToLocalStorage(student, userId);
    }
  } else {
    return saveStudentToLocalStorage(student, userId);
  }
};

// Salvar aluno no localStorage (fallback)
const saveStudentToLocalStorage = (student: Student, userId: string): Student => {
  const storageKey = `students_${userId}`;
  const students = loadStudentsFromLocalStorage(userId);
  
  const existingIndex = students.findIndex(s => s.id === student.id);
  
  if (existingIndex >= 0) {
    // Atualizar aluno existente
    const currentStudent = students[existingIndex];
    
    // Criar entrada de histórico
    const historyEntry: StudentHistory = {
      id: crypto.randomUUID(),
      dataAtualizacao: new Date().toISOString(),
      dados: {
        nome: currentStudent.nome,
        idade: currentStudent.idade,
        sexo: currentStudent.sexo,
        foto: currentStudent.foto,
        alongamentos: currentStudent.alongamentos,
        liberacao: currentStudent.liberacao,
        mobilidade: currentStudent.mobilidade,
        peso: currentStudent.peso,
        altura: currentStudent.altura,
        imc: currentStudent.imc,
        perimetros: currentStudent.perimetros,
        objetivoPrincipal: currentStudent.objetivoPrincipal,
        datasTreino: currentStudent.datasTreino,
        duracaoTreino: currentStudent.duracaoTreino,
        treinoA: currentStudent.treinoA,
        treinoB: currentStudent.treinoB,
        treinoC: currentStudent.treinoC,
      }
    };
    
    const updatedStudent = {
      ...student,
      historico: [...(currentStudent.historico || []), historyEntry]
    };
    
    students[existingIndex] = updatedStudent;
    localStorage.setItem(storageKey, JSON.stringify(students));
    return updatedStudent;
  } else {
    // Novo aluno
    students.push(student);
    localStorage.setItem(storageKey, JSON.stringify(students));
    return student;
  }
};

// Deletar aluno
export const deleteStudent = async (studentId: string, userId: string): Promise<void> => {
  if (isFirebaseConfigured()) {
    try {
      await deleteDoc(doc(db, 'students', studentId));
    } catch (error) {
      console.error('Erro ao deletar aluno do Firestore:', error);
      // Fallback para localStorage
      deleteStudentFromLocalStorage(studentId, userId);
    }
  } else {
    deleteStudentFromLocalStorage(studentId, userId);
  }
};

// Deletar aluno do localStorage (fallback)
const deleteStudentFromLocalStorage = (studentId: string, userId: string): void => {
  const storageKey = `students_${userId}`;
  const students = loadStudentsFromLocalStorage(userId);
  const filtered = students.filter(s => s.id !== studentId);
  localStorage.setItem(storageKey, JSON.stringify(filtered));
};

// Obter aluno por ID
const getStudentById = async (studentId: string, userId: string): Promise<Student | null> => {
  if (isFirebaseConfigured()) {
    try {
      const q = query(
        collection(db, 'students'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const studentDoc = querySnapshot.docs.find(doc => doc.id === studentId);
      return studentDoc ? firestoreToStudent(studentDoc) : null;
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      return null;
    }
  } else {
    const students = loadStudentsFromLocalStorage(userId);
    return students.find(s => s.id === studentId) || null;
  }
};

// Upload de foto para Firebase Storage
export const uploadPhoto = async (file: File, userId: string, studentId: string): Promise<string> => {
  if (isFirebaseConfigured()) {
    try {
      const fileRef = ref(storage, `students/${userId}/${studentId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      // Fallback para base64
      return convertFileToBase64(file);
    }
  } else {
    // Fallback para base64
    return convertFileToBase64(file);
  }
};

// Converter arquivo para base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

