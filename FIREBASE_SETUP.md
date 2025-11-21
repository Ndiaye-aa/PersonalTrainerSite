# Configuração do Firebase

Este projeto usa Firebase para armazenamento em nuvem de autenticação e dados dos alunos.

## Passos para Configuração

1. **Criar um projeto no Firebase**
   - Acesse https://console.firebase.google.com/
   - Clique em "Adicionar projeto"
   - Siga as instruções para criar o projeto

2. **Habilitar Autenticação**
   - No console do Firebase, vá em "Authentication"
   - Clique em "Começar"
   - Habilite o método "Email/Password"

3. **Criar Banco de Dados Firestore**
   - No console do Firebase, vá em "Firestore Database"
   - Clique em "Criar banco de dados"
   - Escolha o modo de produção
   - Selecione a localização do servidor
   - Configure as regras de segurança (veja abaixo)

4. **Habilitar Storage (para fotos)**
   - No console do Firebase, vá em "Storage"
   - Clique em "Começar"
   - Aceite as regras padrão ou configure conforme necessário

5. **Obter Credenciais**
   - No console do Firebase, vá em "Configurações do projeto" (ícone de engrenagem)
   - Role até "Seus aplicativos"
   - Clique em "Web" (ícone `</>`)
   - Copie as credenciais do Firebase

6. **Configurar no Projeto**
   - Abra o arquivo `src/config/firebase.ts`
   - Substitua os valores `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc. pelas suas credenciais

## Regras de Segurança do Firestore

Configure as regras do Firestore para permitir que usuários leiam e escrevam apenas seus próprios dados:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{studentId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Regras de Segurança do Storage

Configure as regras do Storage para permitir que usuários façam upload apenas em suas próprias pastas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /students/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Modo Fallback (LocalStorage)

Se o Firebase não estiver configurado, o sistema automaticamente usa localStorage como fallback. Isso permite que o sistema funcione mesmo sem configuração do Firebase, mas os dados ficarão apenas no navegador local.

## Notas Importantes

- As credenciais do Firebase são sensíveis. Não as compartilhe publicamente.
- Em produção, considere usar variáveis de ambiente para armazenar as credenciais.
- O Firebase oferece um plano gratuito generoso para começar.

