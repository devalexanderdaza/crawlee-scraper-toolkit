# Correcciones en examples/advanced-product-scraper.ts

## ✅ Errores Corregidos

### **1. Errores de Tipos en Hooks**

#### **Problema Original:**
```typescript
// ❌ ANTES: Tipos incorrectos extendiendo ScraperContext
onError: [
  async (context: ScraperContext<string, ProductSearchResult> & { error: Error }) => {
    // ...
  }
],

onRetry: [
  async (context: ScraperContext<string, ProductSearchResult> & { attempt: number }) => {
    // ...
  }
]
```

#### **Solución Aplicada:**
```typescript
// ✅ DESPUÉS: Usando ScraperContext correctamente
onError: [
  async (context: ScraperContext<string, ProductSearchResult>) => {
    context.log.error(`❌ Product search failed for: ${context.input}`, { 
      message: context.error?.message  // ← error ya disponible en context
    });
  }
],

onRetry: [
  async (context: ScraperContext<string, ProductSearchResult>) => {
    context.log.info(`🔄 Retrying product search for: ${context.input} (attempt ${context.attempt})`);
    // ← attempt ya disponible en context
  }
]
```

**Explicación:** `ScraperContext` ya incluye `error?: Error` y `attempt: number`, no es necesario extender el tipo.

### **2. Error de Constructor CrawleeScraperEngine**

#### **Problema Original:**
```typescript
// ❌ ANTES: Tipo incompatible
const config = createConfig().build(); // Retorna Partial<ScraperEngineConfig>
const engine = new CrawleeScraperEngine(config, logger); // Espera ScraperEngineConfig completo
```

#### **Solución Aplicada:**
```typescript
// ✅ DESPUÉS: Usando configManager para obtener configuración completa
const partialConfig = createConfig()
  .browserPool({ /* ... */ })
  .defaultOptions({ /* ... */ })
  .logging({ /* ... */ })
  .build();

// Update config manager and get complete configuration
configManager.updateConfig(partialConfig);
const config = configManager.getConfig(); // Retorna ScraperEngineConfig completo

const engine = new CrawleeScraperEngine(config, logger);
```

**Explicación:** `createConfig().build()` retorna `Partial<ScraperEngineConfig>`, pero el constructor necesita `ScraperEngineConfig` completo. `configManager.getConfig()` proporciona la configuración completa con valores por defecto.

### **3. Errores de TypeScript Strict Mode**

#### **Problema Original:**
```typescript
// ❌ ANTES: Posibles valores undefined sin verificación
if (ratingWord) ratingAverage = ratingMap[ratingWord]; // ratingMap[ratingWord] puede ser undefined
const currentPage = match ? parseInt(match[1], 10) : 1; // match[1] puede ser undefined  
const totalPages = match ? parseInt(match[2], 10) : 1;  // match[2] puede ser undefined
```

#### **Solución Aplicada:**
```typescript
// ✅ DESPUÉS: Verificaciones de tipos seguras
if (ratingWord && ratingMap[ratingWord] !== undefined) {
  ratingAverage = ratingMap[ratingWord];
}

const currentPage = match && match[1] ? parseInt(match[1], 10) : 1;
const totalPages = match && match[2] ? parseInt(match[2], 10) : 1;
```

**Explicación:** TypeScript en modo estricto requiere verificaciones explícitas para valores que pueden ser `undefined`.

## ✅ Resultado Final

### **Compilación Exitosa**
- ✅ Sin errores de TypeScript
- ✅ Build completo exitoso
- ✅ Tests pasando (41/41)
- ✅ Linting sin errores

### **Funcionalidad Verificada**
El ejemplo ahora ejecuta correctamente y demuestra:

```bash
$ pnpm run example:products books

🎉 Successfully scraped 20 books in 1704ms from https://books.toscrape.com/

1. A Light in the Attic
   💰 Price: GBP 51.77
   ⭐ Rating: 3/5
   📦 Available: Yes
   
2. Tipping the Velvet
   💰 Price: GBP 53.74
   ⭐ Rating: 1/5
   📦 Available: Yes

... and 15 more products

📊 Performance Metrics:
   Total Requests: 1
   Successful: 1
   Failed: 0
   Success Rate: 100.0%
   Average Duration: 1530ms
```

### **Características Demostradas**
- ✅ **Hooks avanzados** con manejo correcto de contexto
- ✅ **Plugins funcionales** (Retry, Cache, Metrics)
- ✅ **Captura de screenshots** en errores
- ✅ **Manejo de reintentos** con limpieza de estado
- ✅ **Métricas de rendimiento** detalladas
- ✅ **Configuración avanzada** del motor de scraping
- ✅ **Validación de entrada y salida**
- ✅ **Logging estructurado**

## 🎯 Lecciones Aprendidas

1. **Tipos de Hooks:** Los hooks reciben `ScraperContext` completo, no es necesario extender tipos
2. **Configuración del Motor:** Usar `configManager` para obtener configuración completa
3. **TypeScript Estricto:** Siempre verificar valores que pueden ser `undefined`
4. **Arquitectura del Toolkit:** El patrón builder + config manager proporciona flexibilidad y tipo-seguridad

El ejemplo ahora sirve como una **demostración completa y funcional** de las capacidades avanzadas del Crawlee Scraper Toolkit.
