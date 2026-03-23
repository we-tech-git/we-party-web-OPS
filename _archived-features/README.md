# Funcionalidades Arquivadas

Este diretório contém funcionalidades do espaço do produtor que não estão sendo utilizadas nesta etapa do projeto.

## Data do Arquivamento

19 de março de 2026

## Funcionalidades Arquivadas

### 1. Analytics (Análises)

- **Componentes**: `admin/analytics/AnalyticsDashboard.vue`
- **Páginas**: `pages/analytics/`
- **Descrição**: Dashboard de análises e estatísticas de eventos

### 2. Engagement (Engajamento)

- **Componentes**: `admin/engagement/EngagementHub.vue`
- **Páginas**: `pages/engagement/`
- **Descrição**: Hub de engajamento com participantes

### 3. Lineup (Lineup)

- **Componentes**: `admin/lineup/LineupManager.vue`
- **Páginas**: `pages/lineup/`
- **Descrição**: Gerenciador de lineup de eventos

### 4. Notifications (Notificações)

- **Componentes**: `admin/notifications/NotificationsCenter.vue`
- **Páginas**: `pages/notifications/`
- **Descrição**: Centro de notificações

### 5. Participants (Participantes)

- **Componentes**: `admin/participants/ParticipantsManager.vue`
- **Páginas**: `pages/participants/`
- **Descrição**: Gerenciador de participantes

### 6. Post-Event (Pós-Evento)

- **Componentes**: `admin/post-event/PostEventManager.vue`
- **Páginas**: `pages/post-event/`
- **Descrição**: Gerenciador de atividades pós-evento

## Como Restaurar

Para restaurar qualquer dessas funcionalidades no futuro:

1. **Mover componentes de volta:**

   ```powershell
   Move-Item -Path ".\_archived-features\admin\[nome-da-funcionalidade]" -Destination ".\src\components\admin\"
   ```

2. **Mover páginas de volta:**

   ```powershell
   Move-Item -Path ".\_archived-features\pages\[nome-da-funcionalidade]" -Destination ".\src\pages\public\admin\"
   ```

3. **Restaurar imports no layout admin** (`src/layouts/admin.vue`):
   - Adicionar os imports dos ícones necessários
   - Adicionar as entradas correspondentes no array `items`

4. **Verificar rotas:**
   - As rotas serão criadas automaticamente pelo vue-router/auto-routes quando os arquivos forem movidos de volta

## Estrutura de Arquivos

```
_archived-features/
├── admin/
│   ├── analytics/
│   ├── engagement/
│   ├── lineup/
│   ├── notifications/
│   ├── participants/
│   └── post-event/
└── pages/
    ├── analytics/
    ├── engagement/
    ├── lineup/
    ├── notifications/
    ├── participants/
    └── post-event/
```

## Notas

- As rotas para essas funcionalidades foram removidas automaticamente
- Os itens de menu foram removidos do layout admin
- Os imports de ícones foram removidos do layout admin
