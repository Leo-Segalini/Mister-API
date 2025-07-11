# Test de Connexion Backend - Diagnostic

## Problème Identifié

Le frontend affiche "Serveur hors ligne" malgré que le backend soit lancé sur le port 3001.

## Diagnostic Étape par Étape

### 1. Vérification du Backend

**Dans le terminal du backend** :
```bash
cd backend-mister-api
npm run start:dev
```

**Vérifiez que vous voyez** :
```
[Nest] 15220  - 10/07/2025 17:40:10   DEBUG [SupabaseAuthMiddleware] 🔍 Checking authentication for GET /
[Nest] 15220  - 10/07/2025 17:40:10   DEBUG [SupabaseAuthMiddleware] 🍪 Available cookies:
```

### 2. Test Direct de l'API

**Dans un nouveau terminal** :
```bash
# Test de l'endpoint health
curl -X GET http://localhost:3001/api/v1/health

# Test avec verbose pour voir les détails
curl -v -X GET http://localhost:3001/api/v1/health

# Test avec timeout
curl --max-time 10 -X GET http://localhost:3001/api/v1/health
```

### 3. Vérification des Ports

**Vérifiez que le port 3001 est bien utilisé** :
```bash
# Windows
netstat -ano | findstr :3001

# Ou avec PowerShell
Get-NetTCPConnection -LocalPort 3001
```

### 4. Test depuis le Frontend

**Ouvrez la console du navigateur** (F12) et exécutez :
```javascript
// Test direct de l'API
fetch('http://localhost:3001/api/v1/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Data:', data);
})
.catch(error => {
  console.error('Error:', error);
});

// Test avec timeout
fetch('http://localhost:3001/api/v1/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  signal: AbortSignal.timeout(5000),
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### 5. Vérification CORS

**Dans la console du navigateur, vérifiez les erreurs CORS** :
- Ouvrez les outils de développement (F12)
- Allez dans l'onglet "Console"
- Regardez s'il y a des erreurs CORS

### 6. Test de Configuration

**Vérifiez la configuration du frontend** :
```javascript
// Dans la console du navigateur
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Config baseUrl:', window.location.origin);
```

## Solutions Possibles

### Solution 1 : Redémarrage Complet

1. **Arrêtez le backend** (Ctrl+C)
2. **Arrêtez le frontend** (Ctrl+C)
3. **Redémarrez le backend** :
   ```bash
   cd backend-mister-api
   npm run start:dev
   ```
4. **Redémarrez le frontend** :
   ```bash
   cd mister-api
   npm run dev
   ```

### Solution 2 : Vérification des Variables d'Environnement

**Créez un fichier `.env.local` dans `mister-api/`** :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Solution 3 : Test de Connexion Simple

**Créez un fichier de test temporaire** `mister-api/test-connection.html` :
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Backend Connection</title>
</head>
<body>
    <h1>Test de Connexion Backend</h1>
    <button onclick="testConnection()">Tester la Connexion</button>
    <div id="result"></div>

    <script>
        async function testConnection() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Test en cours...';
            
            try {
                const response = await fetch('http://localhost:3001/api/v1/health', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    resultDiv.innerHTML = `<p style="color: green;">✅ Connexion réussie!</p><pre>${JSON.stringify(data, null, 2)}</pre>`;
                } else {
                    resultDiv.innerHTML = `<p style="color: red;">❌ Erreur HTTP: ${response.status}</p>`;
                }
            } catch (error) {
                resultDiv.innerHTML = `<p style="color: red;">❌ Erreur: ${error.message}</p>`;
            }
        }
    </script>
</body>
</html>
```

### Solution 4 : Vérification du Firewall

**Vérifiez que le port 3001 n'est pas bloqué** :
1. Ouvrez le Pare-feu Windows
2. Vérifiez les règles pour le port 3001
3. Ajoutez une exception si nécessaire

## Logs de Diagnostic

### Logs Backend Attendus

```
[Nest] 15220  - 10/07/2025 17:40:10   DEBUG [SupabaseAuthMiddleware] 🔍 Checking authentication for GET /
[Nest] 15220  - 10/07/2025 17:40:10   DEBUG [SupabaseAuthMiddleware] 🍪 Available cookies:
[Nest] 15220  - 10/07/2025 17:40:10   DEBUG [SupabaseAuthMiddleware] ❌ No access token found in cookies
```

### Logs Frontend Attendus

```
🔍 Server status check failed: TypeError: fetch failed
🔍 Middleware - Route: /login (middleware temporairement désactivé)
🔐 Initializing authentication...
```

## Commandes de Test Rapides

```bash
# Test rapide avec curl
curl http://localhost:3001/api/v1/health

# Test avec wget (si disponible)
wget -qO- http://localhost:3001/api/v1/health

# Test avec PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -Method GET

# Vérification des processus
tasklist | findstr node
```

## Résolution du Problème

Une fois le diagnostic effectué, nous pourrons :
1. Identifier la cause exacte du problème
2. Appliquer la solution appropriée
3. Tester la connexion
4. Vérifier que l'authentification fonctionne

**Exécutez ces tests et partagez les résultats pour un diagnostic précis.** 