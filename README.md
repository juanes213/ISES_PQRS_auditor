# 🔍 Auditor PQRS - Sistema Inteligente de Análisis

Sistema profesional para auditoría automatizada de documentos PQRS (Peticiones, Quejas, Reclamos y Sugerencias) usando Google Gemini AI.

## ✨ Características Principales

### 🎯 Dashboard Profesional
- **Interfaz moderna y responsiva** con sidebar dinámico
- **Estadísticas en tiempo real** con gráficos interactivos
- **Sistema de notificaciones** integrado
- **Modo oscuro** y personalización avanzada

### 📊 Análisis Inteligente
- **Extracción automática** de datos personales
- **Clasificación de tipo** de requerimiento (P.Q.R.S)
- **Análisis de procedencia** con justificación detallada
- **Puntuación de calidad** del documento
- **Detección de errores** y recomendaciones

### 📈 Gestión de Reportes
- **Almacenamiento local** de reportes procesados
- **Exportación a HTML/JSON** de reportes individuales o masivos
- **Filtros avanzados** por tipo, estado y calidad
- **Historial completo** de documentos procesados

### 🔧 Funcionalidades Avanzadas
- **Drag & Drop** para subida de archivos
- **Procesamiento en tiempo real** con indicadores de progreso
- **Sistema de configuración** personalizable
- **API REST** para integración con otros sistemas

## 🚀 Instalación Rápida

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

## 🔑 Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API Key
4. Copia la clave y pégala en tu archivo `.env`

**¡Es completamente GRATIS!** Gemini ofrece un límite generoso para uso personal y desarrollo.

## 📱 Uso del Sistema

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

## 🏗️ Estructura del Proyecto

```
auditor-pqrs/
├── app.py                 # Aplicación Flask principal
├── requirements.txt       # Dependencias Python
├── .env.example          # Plantilla de configuración
├── README.md             # Documentación
├── config.py             # Configuraciones del sistema
├── utils.py              # Utilidades y funciones auxiliares
├── static/
│   ├── css/
│   │   └── dashboard.css # Estilos del dashboard
│   └── js/
│       └── dashboard.js  # Lógica del frontend
├── templates/
│   └── dashboard.html    # Template principal
├── uploads/              # Archivos temporales (auto-creado)
└── temp_reports/         # Reportes generados (auto-creado)
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
GEMINI_API_KEY=tu_api_key_aqui
FLASK_ENV=development
FLASK_DEBUG=True
MAX_FILE_SIZE=16777216  # 16MB en bytes
```

### Personalización
- Modifica `dashboard.css` para cambiar la apariencia
- Ajusta `dashboard.js` para agregar funcionalidades
- Personaliza los prompts de IA en `app.py`

## 🤖 Criterios de Auditoría

El sistema analiza automáticamente:

### ✅ Datos Personales
- Nombre completo del solicitante
- Número de cédula/identificación
- Correo electrónico
- Teléfono de contacto
- Dirección de residencia

### 📋 Clasificación
- **Petición**: Solicitud de información o trámite
- **Queja**: Manifestación de insatisfacción
- **Reclamo**: Solicitud de corrección o compensación
- **Sugerencia**: Propuesta de mejora

### 🔍 Análisis de Calidad
- Claridad en la redacción
- Completitud de la información
- Coherencia del contenido
- Viabilidad de la solicitud

### ⚖️ Determinación de Procedencia
- Cumplimiento de requisitos legales
- Competencia de la entidad
- Fundamentación adecuada
- Documentación soporte

## 🎨 Características de la Interfaz

### 🖥️ Dashboard Moderno
- **Sidebar colapsible** con navegación intuitiva
- **Cards estadísticas** con iconos y colores distintivos
- **Gráficos interactivos** para visualización de datos
- **Tablas responsivas** con acciones rápidas

### 📱 Diseño Responsivo
- **Adaptable a móviles** y tablets
- **Navegación touch-friendly** en dispositivos móviles
- **Sidebar overlay** en pantallas pequeñas
- **Componentes escalables** automáticamente

### 🎯 Experiencia de Usuario
- **Drag & Drop** intuitivo para archivos
- **Indicadores de progreso** durante el procesamiento
- **Notificaciones toast** para feedback inmediato
- **Modales informativos** para resultados detallados

## 🔒 Seguridad y Privacidad

- **Procesamiento local** de documentos
- **No almacenamiento permanente** de archivos PDF
- **Datos en localStorage** del navegador
- **API Key segura** en variables de entorno

## 🚀 Próximas Funcionalidades

- [ ] **Base de datos** para persistencia de reportes
- [ ] **Autenticación de usuarios** y roles
- [ ] **API REST completa** para integraciones
- [ ] **Exportación a Excel/Word** de reportes
- [ ] **Análisis de sentimientos** en los textos
- [ ] **Dashboard de administración** avanzado
- [ ] **Notificaciones por email** automáticas
- [ ] **Integración con sistemas** de gestión documental

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

¿Necesitas ayuda? 

- 📧 **Email**: soporte@auditor-pqrs.com
- 💬 **Issues**: Abre un issue en GitHub
- 📖 **Documentación**: Wiki del proyecto

---

**Desarrollado con ❤️ usando Google Gemini AI**

*Sistema profesional para modernizar la gestión de PQRS en entidades públicas y privadas.*
