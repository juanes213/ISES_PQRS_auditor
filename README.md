# Auditor PQRS - Sistema Inteligente de Análisis

Sistema profesional para auditoría automatizada de documentos PQRS (Peticiones, Quejas, Reclamos y Sugerencias) usando Google Gemini AI.

## Características Principales

### Dashboard Profesional
- **Interfaz moderna y responsiva** con sidebar dinámico
- **Estadísticas en tiempo real** con gráficos interactivos
- **Sistema de notificaciones** integrado
- **Modo oscuro** y personalización avanzada

### Análisis Inteligente
- **Extracción automática** de datos personales
- **Clasificación de tipo** de requerimiento (P.Q.R.S)
- **Análisis de procedencia** con justificación detallada
- **Puntuación de calidad** del documento
- **Detección de errores** y recomendaciones

### Gestión de Reportes
- **Almacenamiento local** de reportes procesados
- **Exportación a HTML/JSON** de reportes individuales o masivos
- **Filtros avanzados** por tipo, estado y calidad
- **Historial completo** de documentos procesados

### Funcionalidades Avanzadas
- **Drag & Drop** para subida de archivos
- **Procesamiento en tiempo real** con indicadores de progreso
- **Sistema de configuración** personalizable
- **API REST** para integración con otros sistemas

## Instalación Rápida

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd auditor-pqrs
```

### 2. Crear entorno virtual
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar API Key
```bash
cp .env.example .env
# Editar .env y agregar tu GEMINI_API_KEY
```

### 5. Ejecutar la aplicación
```bash
python app.py
```

La aplicación estará disponible en `http://localhost:5000`

## Uso del Sistema

### Subir Documento
1. Navega a **"Subir Documento"** en el sidebar
2. Arrastra tu archivo PDF o haz clic para seleccionar
3. El sistema procesará automáticamente el documento
4. Revisa los resultados en el modal de resultados

### Ver Reportes
1. Ve a **"Reportes Guardados"** para ver todos los documentos procesados
2. Usa los filtros para encontrar reportes específicos
3. Descarga reportes individuales o exporta todo en lote
4. Elimina reportes que ya no necesites

### Análisis y Estadísticas
1. El **Dashboard** muestra estadísticas generales
2. **"Análisis y Estadísticas"** ofrece gráficos detallados
3. Monitorea tendencias de calidad y tipos de PQRS
4. Identifica patrones en los documentos procesados


**Desarrollado usando Google Gemini AI**

*Sistema profesional para modernizar la gestión de PQRS en entidades públicas y privadas.*
