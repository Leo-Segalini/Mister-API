# Guide de Déploiement - API Punchiline

Ce guide explique comment déployer l'API Punchiline en production.

## 🚀 **Environnements**

### **Développement**
- **URL**: `http://localhost:3000`
- **Base de données**: PostgreSQL local
- **Cache**: Redis local
- **Variables**: `.env.development`

### **Staging**
- **URL**: `https://staging-api.punchiline.com`
- **Base de données**: PostgreSQL staging
- **Cache**: Redis staging
- **Variables**: `.env.staging`

### **Production**
- **URL**: `https://api.punchiline.com`
- **Base de données**: PostgreSQL production
- **Cache**: Redis production
- **Variables**: `.env.production`

## 🐳 **Déploiement avec Docker**

### **1. Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### **2. Docker Compose**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: punchiline_api
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## ☁️ **Déploiement Cloud**

### **AWS (ECS + RDS)**

#### **1. Infrastructure Terraform**
```hcl
# main.tf
provider "aws" {
  region = "eu-west-1"
}

# VPC et sous-réseaux
module "vpc" {
  source = "./modules/vpc"
}

# RDS PostgreSQL
module "rds" {
  source = "./modules/rds"
  vpc_id = module.vpc.vpc_id
}

# ElastiCache Redis
module "redis" {
  source = "./modules/redis"
  vpc_id = module.vpc.vpc_id
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  vpc_id = module.vpc.vpc_id
}
```

#### **2. Task Definition ECS**
```json
{
  "family": "punchiline-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "123456789012.dkr.ecr.eu-west-1.amazonaws.com/punchiline-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:eu-west-1:123456789012:secret:punchiline/database-url"
        },
        {
          "name": "STRIPE_SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:eu-west-1:123456789012:secret:punchiline/stripe-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/punchiline-api",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### **Google Cloud (GKE)**

#### **1. Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: punchiline-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: punchiline-api
  template:
    metadata:
      labels:
        app: punchiline-api
    spec:
      containers:
      - name: api
        image: gcr.io/punchiline/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: punchiline-secrets
              key: database-url
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: punchiline-secrets
              key: stripe-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### **2. Service Kubernetes**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: punchiline-api-service
spec:
  selector:
    app: punchiline-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 🔧 **Configuration de Production**

### **1. Variables d'Environnement**
```env
# Production
NODE_ENV=production
PORT=3000

# Base de données
DATABASE_URL=postgresql://user:password@host:5432/punchiline_api

# Redis
REDIS_URL=redis://host:6379

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Webhooks
WEBHOOK_PAYMENT_URL=https://api.punchiline.com/webhooks/payment
WEBHOOK_SECURITY_URL=https://api.punchiline.com/webhooks/security
WEBHOOK_ADMIN_URL=https://api.punchiline.com/webhooks/admin

# Sécurité
JWT_SECRET=your-super-secure-jwt-secret
COOKIE_SECRET=your-super-secure-cookie-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### **2. Base de Données**
```sql
-- Création de la base de données
CREATE DATABASE punchiline_api;

-- Création de l'utilisateur
CREATE USER punchiline_user WITH PASSWORD 'secure_password';

-- Permissions
GRANT ALL PRIVILEGES ON DATABASE punchiline_api TO punchiline_user;

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### **3. Redis Configuration**
```conf
# redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 📊 **Monitoring et Observabilité**

### **1. Métriques Prometheus**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'punchiline-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

### **2. Dashboards Grafana**
- **API Performance**: Temps de réponse, taux d'erreur
- **Base de données**: Requêtes, connexions, performance
- **Cache Redis**: Hit rate, mémoire utilisée
- **Paiements Stripe**: Transactions, revenus
- **Sécurité**: Tentatives d'intrusion, clés API

### **3. Alertes**
```yaml
# alertmanager.yml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'https://hooks.slack.com/services/...'
```

## 🔒 **Sécurité**

### **1. SSL/TLS**
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.punchiline.com;

    ssl_certificate /etc/ssl/certs/punchiline.crt;
    ssl_certificate_key /etc/ssl/private/punchiline.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **2. WAF (Web Application Firewall)**
- **AWS WAF**: Protection contre les attaques DDoS
- **Cloudflare**: Protection avancée
- **Rate Limiting**: Limitation des requêtes par IP

### **3. Secrets Management**
- **AWS Secrets Manager**: Stockage sécurisé des secrets
- **HashiCorp Vault**: Gestion centralisée des secrets
- **Kubernetes Secrets**: Secrets pour K8s

## 🚀 **Scripts de Déploiement**

### **1. Script de Déploiement Automatique**
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Déploiement de l'API Punchiline..."

# Variables
ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
    echo "Usage: ./deploy.sh <environment> <version>"
    echo "Example: ./deploy.sh production v1.2.0"
    exit 1
fi

echo "📦 Construction de l'image Docker..."
docker build -t punchiline-api:$VERSION .

echo "🏷️ Tagging de l'image..."
docker tag punchiline-api:$VERSION gcr.io/punchiline/api:$VERSION

echo "📤 Push de l'image..."
docker push gcr.io/punchiline/api:$VERSION

echo "🔄 Déploiement sur Kubernetes..."
kubectl set image deployment/punchiline-api api=gcr.io/punchiline/api:$VERSION

echo "⏳ Attente du déploiement..."
kubectl rollout status deployment/punchiline-api

echo "✅ Déploiement terminé avec succès!"
echo "🌐 URL: https://api.punchiline.com"
echo "📊 Monitoring: https://grafana.punchiline.com"
```

### **2. Script de Rollback**
```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔄 Rollback de l'API Punchiline..."

# Récupération de la version précédente
PREVIOUS_VERSION=$(kubectl rollout history deployment/punchiline-api | grep -A1 "REVISION" | tail -n1 | awk '{print $1}')

echo "📦 Rollback vers la version $PREVIOUS_VERSION..."
kubectl rollout undo deployment/punchiline-api --to-revision=$PREVIOUS_VERSION

echo "⏳ Attente du rollback..."
kubectl rollout status deployment/punchiline-api

echo "✅ Rollback terminé avec succès!"
```

## 📋 **Checklist de Déploiement**

### **Pré-déploiement**
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Audit de sécurité effectué
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Cache vidé si nécessaire

### **Déploiement**
- [ ] Image Docker construite
- [ ] Image poussée vers le registry
- [ ] Déploiement effectué
- [ ] Health checks passent
- [ ] Métriques vérifiées
- [ ] Logs surveillés

### **Post-déploiement**
- [ ] Tests de fumée effectués
- [ ] Monitoring vérifié
- [ ] Alertes configurées
- [ ] Documentation mise à jour
- [ ] Équipe notifiée

## 🆘 **Support et Maintenance**

### **Contacts**
- **DevOps**: devops@punchiline.com
- **Support**: support@punchiline.com
- **Urgences**: +33 1 23 45 67 89

### **Procédures d'Urgence**
1. **Incident critique**: Rollback immédiat
2. **Performance dégradée**: Scale up automatique
3. **Sécurité compromise**: Isolation du service
4. **Base de données**: Restauration depuis backup

### **Maintenance Planifiée**
- **Mises à jour**: Dimanche 2h-4h
- **Backups**: Quotidien à 2h du matin
- **Monitoring**: 24/7
- **Sécurité**: Audit mensuel 