import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface User {
  id: string;
  email: string;
  nome?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nome: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Verificar se Firebase está configurado
const isFirebaseConfigured = () => {
  try {
    return auth && auth.app.options.apiKey && auth.app.options.apiKey !== 'YOUR_API_KEY';
  } catch {
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured()) {
      // Usar Firebase Auth
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Buscar nome do usuário no Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              nome: userData?.nome || firebaseUser.displayName || undefined
            });
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              nome: firebaseUser.displayName || undefined
            });
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Fallback para localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }
  }, []);

  const hashPassword = (password: string): string => {
    // Hash simples para demonstração (NÃO usar em produção)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const register = async (email: string, password: string, nome: string): Promise<boolean> => {
    try {
      // Validações básicas
      if (!email || !password || !nome) {
        alert('Por favor, preencha todos os campos');
        return false;
      }

      if (password.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres');
        return false;
      }

      if (isFirebaseConfigured()) {
        // Usar Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Atualizar perfil com nome
        await updateProfile(userCredential.user, { displayName: nome });
        
        // Salvar nome no Firestore
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            nome,
            email,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Erro ao salvar nome no Firestore:', error);
        }
        
        setUser({
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          nome
        });
        return true;
      } else {
        // Fallback para localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find((u: any) => u.email === email);
        
        if (existingUser) {
          alert('Este email já está cadastrado');
          return false;
        }

        // Criar novo usuário
        const newUser = {
          id: crypto.randomUUID(),
          email,
          nome,
          password: hashPassword(password),
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Fazer login automático após cadastro
        const userWithoutPassword = { id: newUser.id, email: newUser.email, nome: newUser.nome };
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

        return true;
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      const errorMessage = error.code === 'auth/email-already-in-use' 
        ? 'Este email já está cadastrado'
        : error.message || 'Erro ao cadastrar. Tente novamente.';
      alert(errorMessage);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Validações básicas
      if (!email || !password) {
        alert('Por favor, preencha todos os campos');
        return false;
      }

      if (isFirebaseConfigured()) {
        // Usar Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Buscar nome do usuário no Firestore
        let nome: string | undefined;
        try {
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          const userData = userDoc.data();
          nome = userData?.nome || userCredential.user.displayName || undefined;
        } catch (error) {
          console.error('Erro ao buscar nome do usuário:', error);
          nome = userCredential.user.displayName || undefined;
        }
        
        setUser({
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          nome
        });
        return true;
      } else {
        // Fallback para localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(
          (u: any) => u.email === email && u.password === hashPassword(password)
        );

        if (!user) {
          alert('Email ou senha incorretos');
          return false;
        }

        // Fazer login
        const userWithoutPassword = { id: user.id, email: user.email, nome: user.nome };
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

        return true;
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      const errorMessage = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found'
        ? 'Email ou senha incorretos'
        : error.message || 'Erro ao fazer login. Tente novamente.';
      alert(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured()) {
      await signOut(auth);
    } else {
      setUser(null);
      localStorage.removeItem('currentUser');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
