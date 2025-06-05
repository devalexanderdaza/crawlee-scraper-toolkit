# Development Setup Guide

Este proyecto está configurado para usar **pnpm** como gestor de paquetes predeterminado con Node.js >= 20.

## 🚀 Configuración Inicial

### 1. Instalar Node.js 20+

Usa nvm para instalar la versión correcta de Node.js:

```bash
# Instalar la versión específica
nvm install
nvm use
```

### 2. Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm@latest

# O usar corepack (incluido con Node.js 16+)
corepack enable
corepack prepare pnpm@latest --activate
```

### 3. Verificar Instalación

```bash
node --version  # Debe ser >= 20.0.0
pnpm --version  # Debe ser >= 8.0.0
```

## 📦 Comandos de Desarrollo

### Instalación de Dependencias

```bash
# Instalar todas las dependencias
pnpm install

# Instalar una nueva dependencia
pnpm add <package-name>

# Instalar dependencia de desarrollo
pnpm add -D <package-name>

# Instalar dependencia global
pnpm add -g <package-name>
```

### Scripts de Desarrollo

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Tests
pnpm test
pnpm test:watch
pnpm test:coverage

# Linting y formato
pnpm lint
pnpm lint:fix
pnpm format

# Ejemplos
pnpm example:news
pnpm example:products

# CLI
pnpm cli
```

### Scripts de Publicación

```bash
# Preparar release
pnpm release

# Build solo
pnpm build:tsc
```

## 🔧 Configuración de pnpm

El proyecto incluye un archivo `.npmrc` con configuraciones optimizadas:

- `auto-install-peers=true` - Instala automáticamente peer dependencies
- `shamefully-hoist=false` - Mantiene estructura de node_modules limpia
- `strict-peer-dependencies=false` - No falla por peer dependencies faltantes
- `prefer-workspace-packages=true` - Prefiere paquetes del workspace

## 🏗️ Estructura de Desarrollo

```
crawlee-scraper-toolkit/
├── .nvmrc                 # Versión de Node.js
├── .npmrc                 # Configuración de pnpm
├── package.json           # Configuración con packageManager
├── pnpm-lock.yaml         # Lockfile de pnpm
├── tsconfig.json          # TypeScript 5.5+ configurado
└── scripts/
    ├── build.sh           # Script de build con pnpm
    └── release.sh         # Script de release con pnpm
```

## 🆚 Diferencias con npm

| Comando npm | Comando pnpm | Descripción |
|-------------|--------------|-------------|
| `npm install` | `pnpm install` | Instalar dependencias |
| `npm install pkg` | `pnpm add pkg` | Agregar dependencia |
| `npm install -g pkg` | `pnpm add -g pkg` | Instalar globalmente |
| `npm run script` | `pnpm script` | Ejecutar script |
| `npx command` | `pnpm dlx command` | Ejecutar comando |
| `npm publish` | `pnpm publish` | Publicar paquete |

## 🚀 Ventajas de pnpm

- **Eficiencia de espacio**: Enlaces simbólicos vs copias
- **Velocidad**: Instalaciones más rápidas
- **Seguridad**: Estructura de node_modules más estricta
- **Monorepo**: Soporte nativo para workspaces
- **Compatibilidad**: 100% compatible con npm

## 🔍 Troubleshooting

### Error: "pnpm: command not found"

```bash
# Instalar pnpm
npm install -g pnpm
# O usar corepack
corepack enable
```

### Error de peer dependencies

```bash
# Instalar peer dependencies automáticamente
pnpm install --shamefully-hoist
```

### Cache corrupto

```bash
# Limpiar cache de pnpm
pnpm store prune
```

## 🎯 CI/CD

Para CI/CD, asegúrate de usar pnpm:

```yaml
# GitHub Actions ejemplo
- name: Install pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Use Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '20'
    cache: 'pnpm'

- name: Install dependencies
  run: pnpm install

- name: Run tests
  run: pnpm test
```
