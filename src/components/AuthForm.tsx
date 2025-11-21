import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Dumbbell } from 'lucide-react';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = isLogin 
      ? await login(email, password)
      : await register(email, password, nome);

    if (success) {
      setNome('');
      setEmail('');
      setPassword('');
    }

    setIsSubmitting(false);
  };

  const handleToggleMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setNome('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-purple-900 mb-2">Personal Trainer Manager</h1>
          <p className="text-purple-600">
            Gerencie seus alunos e planilhas de treino
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-8">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`flex-1 py-2 rounded-lg transition-all text-sm sm:text-base ${
                isLogin
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`flex-1 py-2 rounded-lg transition-all text-sm sm:text-base ${
                !isLogin
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-purple-700 mb-2 text-sm sm:text-base">Nome Completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label className="block text-purple-700 mb-2 text-sm sm:text-base">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-purple-700 mb-2 text-sm sm:text-base">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base"
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="text-purple-600 mt-1 text-xs sm:text-sm">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSubmitting ? (
                'Aguarde...'
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  Entrar
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Criar Conta
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <p className="text-center text-purple-600 mt-6 text-sm sm:text-base">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                className="text-purple-700 hover:underline font-semibold"
              >
                Cadastre-se
              </button>
            </p>
          )}
        </div>

        {/* Info Notice */}
        <div className="mt-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-purple-700 text-center text-xs sm:text-sm">
            ⚠️ Versão de demonstração - dados armazenados localmente
          </p>
        </div>
      </div>
    </div>
  );
}
