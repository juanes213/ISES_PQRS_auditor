// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.currentView = 'dashboard';
        this.reports = JSON.parse(localStorage.getItem('pqrs_reports') || '[]');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadView('dashboard');
        // Initial updateStats is called by loadView('dashboard') if it's the first view
    }

    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.loadView(view);
            });
        });

        // The file upload event listeners are now moved to initUpload()
        // because the 'uploadArea' and 'fileInput' only exist after that view is loaded.
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }

    loadView(viewName) {
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update breadcrumb
        const breadcrumb = document.querySelector('.breadcrumb');
        breadcrumb.textContent = this.getViewTitle(viewName);

        // Load view content into the specific dynamic content area
        const contentArea = document.getElementById('dynamicContentArea'); // <--- CORRECTED ID
        contentArea.innerHTML = this.getViewContent(viewName);
        contentArea.className = 'content fade-in'; // Apply animation class

        this.currentView = viewName;
        this.initViewSpecific(viewName);
    }

    getViewTitle(viewName) {
        const titles = {
            'dashboard': 'Dashboard',
            'upload': 'Subir Documento',
            'reports': 'Reportes Guardados',
            'analytics': 'Análisis y Estadísticas',
            'settings': 'Configuración'
        };
        return titles[viewName] || 'Dashboard';
    }

    getViewContent(viewName) {
        switch(viewName) {
            case 'dashboard':
                return this.getDashboardContent();
            case 'upload':
                return this.getUploadContent();
            case 'reports':
                return this.getReportsContent();
            case 'analytics':
                return this.getAnalyticsContent();
            case 'settings':
                return this.getSettingsContent();
            default:
                return this.getDashboardContent();
        }
    }

    getDashboardContent() {
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="totalDocuments">${this.reports.length}</h3>
                        <p>Documentos Analizados</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="approvedCount">${this.reports.filter(r => r.analisis_profundo?.procedente).length}</h3>
                        <p>Procedentes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="pendingCount">${this.reports.filter(r => !r.analisis_profundo?.procedente).length}</h3>
                        <p>No Procedentes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="avgQuality">${this.getAverageQuality()}%</h3>
                        <p>Calidad Promedio</p>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-chart-bar"></i> Análisis por Tipo de PQRS</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="pqrsChart" height="300"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-clock"></i> Actividad Reciente</h5>
                        </div>
                        <div class="card-body">
                            <div id="recentActivity"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-header">
                    <h5><i class="fas fa-list"></i> Últimos Documentos Procesados</h5>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Documento</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Calidad</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="recentDocuments">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getUploadContent() {
        return `
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-cloud-upload-alt"></i> Subir Documento PQRS</h5>
                        </div>
                        <div class="card-body">
                            <div class="upload-zone" id="uploadArea">
                                <div class="upload-icon">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                </div>
                                <h4>Arrastra tu archivo PDF aquí</h4>
                                <p class="text-muted mb-3">o haz clic para seleccionar</p>
                                <button class="btn btn-primary">
                                    <i class="fas fa-folder-open"></i> Seleccionar Archivo
                                </button>
                                <input type="file" id="fileInput" accept=".pdf" style="display: none;">
                            </div>
                            
                            <div class="mt-4">
                                <h6>Criterios de Auditoría:</h6>
                                <div class="row">
                                    <div class="col-md-6">
                                        <ul class="list-unstyled">
                                            <li><i class="fas fa-check text-success"></i> Datos personales completos</li>
                                            <li><i class="fas fa-check text-success"></i> Tipo de requerimiento</li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <ul class="list-unstyled">
                                            <li><i class="fas fa-check text-success"></i> Redacción clara</li>
                                            <li><i class="fas fa-check text-success"></i> Análisis de procedencia</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getReportsContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h4>Reportes Guardados (${this.reports.length})</h4>
                <div>
                    <button class="btn btn-outline-primary me-2" onclick="dashboard.exportAllReports()">
                        <i class="fas fa-download"></i> Exportar Todo
                    </button>
                    <button class="btn btn-danger" onclick="dashboard.clearAllReports()">
                        <i class="fas fa-trash"></i> Limpiar Todo
                    </button>
                </div>
            </div>

            <div class="row">
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-body">
                            <h6>Filtros</h6>
                            <div class="mb-3">
                                <label class="form-label">Tipo de PQRS</label>
                                <select class="form-select" id="typeFilter">
                                    <option value="">Todos</option>
                                    <option value="Petición">Petición</option>
                                    <option value="Queja">Queja</option>
                                    <option value="Reclamo">Reclamo</option>
                                    <option value="Sugerencia">Sugerencia</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Estado</label>
                                <select class="form-select" id="statusFilter">
                                    <option value="">Todos</option>
                                    <option value="procedente">Procedente</option>
                                    <option value="no-procedente">No Procedente</option>
                                </select>
                            </div>
                            <button class="btn btn-primary w-100" onclick="dashboard.applyFilters()">
                                <i class="fas fa-filter"></i> Aplicar Filtros
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-9">
                    <div class="card">
                        <div class="card-body">
                            <div id="reportsGrid"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAnalyticsContent() {
        return `
            <div class="row">
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-pie-chart"></i> Distribución por Tipo</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="typeDistributionChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-chart-line"></i> Tendencia de Calidad</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="qualityTrendChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-table"></i> Análisis Detallado</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-container">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Métrica</th>
                                            <th>Valor</th>
                                            <th>Descripción</th>
                                        </tr>
                                    </thead>
                                    <tbody id="analyticsTable">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsContent() {
        return `
            <div class="row">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-cog"></i> Configuración del Sistema</h5>
                        </div>
                        <div class="card-body">
                            <form id="settingsForm">
                                <div class="mb-3">
                                    <label class="form-label">API Key de Gemini</label>
                                    <input type="password" class="form-control" id="geminiApiKey" placeholder="Ingresa tu API Key">
                                    <div class="form-text">Obtén tu clave en Google AI Studio</div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Umbral de Calidad Mínima</label>
                                    <input type="range" class="form-range" id="qualityThreshold" min="0" max="100" value="70">
                                    <div class="d-flex justify-content-between">
                                        <small>0%</small>
                                        <small id="qualityValue">70%</small>
                                        <small>100%</small>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="autoSaveReports" checked>
                                        <label class="form-check-label" for="autoSaveReports">
                                            Guardar reportes automáticamente
                                        </label>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="darkMode">
                                        <label class="form-check-label" for="darkMode">
                                            Modo oscuro
                                        </label>
                                    </div>
                                </div>

                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Guardar Configuración
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-info-circle"></i> Información del Sistema</h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-unstyled">
                                <li><strong>Versión:</strong> 1.0.0</li>
                                <li><strong>Documentos procesados:</strong> ${this.reports.length}</li>
                                <li><strong>Última actualización:</strong> ${new Date().toLocaleDateString()}</li>
                                <li><strong>Estado del servicio:</strong> <span class="badge bg-success">Activo</span></li>
                            </ul>
                        </div>
                    </div>

                    <div class="card mt-3">
                        <div class="card-header">
                            <h5><i class="fas fa-question-circle"></i> Ayuda</h5>
                        </div>
                        <div class="card-body">
                            <p class="small">¿Necesitas ayuda? Consulta nuestra documentación o contacta al soporte técnico.</p>
                            <button class="btn btn-outline-primary btn-sm w-100">
                                <i class="fas fa-book"></i> Ver Documentación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initViewSpecific(viewName) {
        switch(viewName) {
            case 'dashboard':
                this.initDashboard();
                break;
            case 'upload':
                this.initUpload(); // Now this function sets up the listeners
                break;
            case 'reports':
                this.initReports();
                break;
            case 'analytics':
                this.initAnalytics();
                break;
            case 'settings':
                this.initSettings();
                break;
        }
    }

    initDashboard() {
        this.updateStats(); // Ensure stats are updated when dashboard view is loaded
        this.loadRecentDocuments();
        this.loadRecentActivity();
        this.initPQRSChart();
    }

    initUpload() {
        // Event listeners for file upload should be initialized here
        // because the elements are now present in the DOM.
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', this.handleDragOver);
            uploadArea.addEventListener('dragleave', this.handleDragLeave);
            uploadArea.addEventListener('drop', this.handleDrop.bind(this));
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }
    }

    initReports() {
        this.loadReportsGrid();
    }

    initAnalytics() {
        this.initAnalyticsCharts();
        this.loadAnalyticsTable();
    }

    initSettings() {
        const qualityThreshold = document.getElementById('qualityThreshold');
        const qualityValue = document.getElementById('qualityValue');
        
        if (qualityThreshold && qualityValue) {
            qualityThreshold.addEventListener('input', (e) => {
                qualityValue.textContent = e.target.value + '%';
            });
        }
    }

    // File handling methods
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        if (e.target.files.length > 0) {
            this.processFile(e.target.files[0]);
        }
    }

    processFile(file) {
        if (!file.type.includes('pdf')) {
            this.showNotification('Por favor selecciona un archivo PDF', 'error');
            return;
        }

        this.showLoading('Analizando documento...');

        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            this.hideLoading();
            this.saveReport(data);
            this.showResults(data);
            this.showNotification('Documento analizado exitosamente', 'success');
        })
        .catch(error => {
            this.hideLoading();
            this.showNotification('Error al procesar el archivo: ' + error.message, 'error');
        });
    }

    saveReport(data) {
        data.id = Date.now();
        data.timestamp = new Date().toISOString();
        this.reports.unshift(data);
        localStorage.setItem('pqrs_reports', JSON.stringify(this.reports));
        this.updateStats(); // Update stats immediately after saving a report
    }

    showResults(data) {
        // Cambiar a vista de dashboard y mostrar resultados
        this.loadView('dashboard');
        // Aquí podrías mostrar un modal con los resultados
        this.showResultModal(data);
    }

    showResultModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Resultado del Análisis</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Datos Personales</h6>
                                <p><strong>Nombre:</strong> ${data.datos_personales?.nombre_completo || 'No identificado'}</p>
                                <p><strong>Cédula:</strong> ${data.datos_personales?.cedula || 'No identificada'}</p>
                                <p><strong>Correo:</strong> ${data.datos_personales?.correo || 'No identificado'}</p>
                                <p><strong>Teléfono:</strong> ${data.datos_personales?.telefono || 'No identificado'}</p>
                                <p><strong>Dirección:</strong> ${data.datos_personales?.direccion || 'No identificada'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Análisis</h6>
                                <p><strong>Tipo:</strong> <span class="badge bg-info">${data.tipo_requerimiento || 'No identificado'}</span></p>
                                <p><strong>Procedente:</strong> 
                                    <span class="badge ${data.analisis_profundo?.procedente ? 'bg-success' : 'bg-danger'}">
                                        ${data.analisis_profundo?.procedente ? 'SÍ' : 'NO'}
                                    </span>
                                </p>
                                <p><strong>Calidad:</strong> ${data.calidad_documento?.puntuacion || 0}/100</p>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6>Resumen de la Petición</h6>
                                <p>${data.resumen_peticion || 'No disponible'}</p>
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6>Justificación y Recomendación</h6>
                                <p><strong>Justificación:</strong> ${data.analisis_profundo?.justificacion || 'No disponible'}</p>
                                <p><strong>Recomendación:</strong> ${data.analisis_profundo?.recomendacion || 'No disponible'}</p>
                            </div>
                        </div>
                        ${data.errores_encontrados && data.errores_encontrados.length > 0 ? `
                        <div class="row mt-3">
                            <div class="col-12">
                                <h6>Errores Encontrados</h6>
                                <ul>
                                    ${data.errores_encontrados.map(error => `<li>${error}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="dashboard.generateReport(${data.id})">
                            <i class="fas fa-download"></i> Descargar Reporte
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Utility methods
    updateStats() {
        const totalEl = document.getElementById('totalDocuments');
        const approvedEl = document.getElementById('approvedCount');
        const pendingEl = document.getElementById('pendingCount');
        const avgQualityEl = document.getElementById('avgQuality');

        if (totalEl) totalEl.textContent = this.reports.length;
        if (approvedEl) approvedEl.textContent = this.reports.filter(r => r.analisis_profundo?.procedente).length;
        if (pendingEl) pendingEl.textContent = this.reports.filter(r => !r.analisis_profundo?.procedente).length;
        if (avgQualityEl) avgQualityEl.textContent = this.getAverageQuality() + '%';
    }

    getAverageQuality() {
        if (this.reports.length === 0) return 0;
        const total = this.reports.reduce((sum, report) => sum + (report.calidad_documento?.puntuacion || 0), 0);
        return Math.round(total / this.reports.length);
    }

    showLoading(message = 'Cargando...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.remove();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 10000; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    loadRecentDocuments() {
        const tbody = document.getElementById('recentDocuments');
        if (!tbody) return;

        const recent = this.reports.slice(0, 5);
        tbody.innerHTML = recent.map(report => `
            <tr>
                <td>${report.metadata?.filename || 'Documento'}</td>
                <td><span class="badge bg-info">${report.tipo_requerimiento || 'N/A'}</span></td>
                <td>
                    <span class="badge ${report.analisis_profundo?.procedente ? 'bg-success' : 'bg-danger'}">
                        ${report.analisis_profundo?.procedente ? 'Procedente' : 'No Procedente'}
                    </span>
                </td>
                <td>${report.calidad_documento?.puntuacion || 0}/100</td>
                <td>${new Date(report.timestamp).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="dashboard.viewReport(${report.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const activities = this.reports.slice(0, 5).map(report => `
            <div class="d-flex align-items-center mb-3">
                <div class="flex-shrink-0">
                    <i class="fas fa-file-alt text-primary"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                    <h6 class="mb-0">${report.metadata?.filename || 'Documento'}</h6>
                    <small class="text-muted">${new Date(report.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `).join('');

        container.innerHTML = activities || '<p class="text-muted">No hay actividad reciente</p>';
    }

    // Chart initialization methods
    initPQRSChart() {
        const ctx = document.getElementById('pqrsChart');
        if (!ctx) return;

        const typeCounts = this.reports.reduce((acc, report) => {
            const type = report.tipo_requerimiento || 'Desconocido';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{
                    label: 'Número de PQRS',
                    data: Object.values(typeCounts),
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)', // Petición (secondary-color)
                        'rgba(243, 156, 18, 0.8)', // Queja (warning-color)
                        'rgba(231, 76, 60, 0.8)',  // Reclamo (danger-color)
                        'rgba(39, 174, 96, 0.8)',  // Sugerencia (success-color)
                        'rgba(149, 165, 166, 0.8)' // Desconocido (grey)
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(243, 156, 18, 1)',
                        'rgba(231, 76, 60, 1)',
                        'rgba(39, 174, 96, 1)',
                        'rgba(149, 165, 166, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Distribución de PQRS por Tipo'
                    }
                }
            }
        });
    }

    initAnalyticsCharts() {
        // Distribución por Tipo (Pie Chart)
        const typeDistributionCtx = document.getElementById('typeDistributionChart');
        if (typeDistributionCtx) {
            const typeCounts = this.reports.reduce((acc, report) => {
                const type = report.tipo_requerimiento || 'Desconocido';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});

            new Chart(typeDistributionCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(typeCounts),
                    datasets: [{
                        data: Object.values(typeCounts),
                        backgroundColor: [
                            'rgba(52, 152, 219, 0.8)', 
                            'rgba(243, 156, 18, 0.8)', 
                            'rgba(231, 76, 60, 0.8)', 
                            'rgba(39, 174, 96, 0.8)', 
                            'rgba(149, 165, 166, 0.8)'
                        ],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Distribución de Documentos por Tipo de PQRS'
                        }
                    }
                }
            });
        }

        // Tendencia de Calidad (Line Chart)
        const qualityTrendCtx = document.getElementById('qualityTrendChart');
        if (qualityTrendCtx) {
            // Sort reports by timestamp to show trend
            const sortedReports = [...this.reports].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            const labels = sortedReports.map(report => new Date(report.timestamp).toLocaleDateString());
            const data = sortedReports.map(report => report.calidad_documento?.puntuacion || 0);

            new Chart(qualityTrendCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Puntuación de Calidad',
                        data: data,
                        borderColor: 'rgba(39, 174, 96, 1)',
                        backgroundColor: 'rgba(39, 174, 96, 0.2)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Tendencia de Calidad de los Documentos'
                        }
                    }
                }
            });
        }
    }

    loadAnalyticsTable() {
        const tbody = document.getElementById('analyticsTable');
        if (!tbody) return;

        const metrics = [
            { metric: 'Total de documentos', value: this.reports.length, description: 'Documentos procesados en total' },
            { metric: 'Calidad promedio', value: this.getAverageQuality() + '%', description: 'Puntuación promedio de calidad' },
            { metric: 'Tasa de aprobación', value: this.reports.length > 0 ? Math.round((this.reports.filter(r => r.analisis_profundo?.procedente).length / this.reports.length) * 100) + '%' : 'N/A', description: 'Porcentaje de documentos procedentes' }
        ];

        tbody.innerHTML = metrics.map(m => `
            <tr>
                <td><strong>${m.metric}</strong></td>
                <td><span class="badge bg-primary">${m.value}</span></td>
                <td>${m.description}</td>
            </tr>
        `).join('');
    }

    loadReportsGrid() {
        const container = document.getElementById('reportsGrid');
        if (!container) return;

        // Apply filters
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        const filteredReports = this.reports.filter(report => {
            const matchesType = typeFilter === '' || (report.tipo_requerimiento && report.tipo_requerimiento.toLowerCase() === typeFilter.toLowerCase());
            const matchesStatus = statusFilter === '' || 
                                  (statusFilter === 'procedente' && report.analisis_profundo?.procedente) ||
                                  (statusFilter === 'no-procedente' && !report.analisis_profundo?.procedente);
            return matchesType && matchesStatus;
        });


        if (filteredReports.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No hay reportes que coincidan con los filtros.</p>';
            return;
        }

        container.innerHTML = filteredReports.map(report => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6>${report.metadata?.filename || 'Documento'}</h6>
                            <p class="mb-1">
                                <span class="badge bg-info me-2">${report.tipo_requerimiento || 'N/A'}</span>
                                <span class="badge ${report.analisis_profundo?.procedente ? 'bg-success' : 'bg-danger'}">
                                    ${report.analisis_profundo?.procedente ? 'Procedente' : 'No Procedente'}
                                </span>
                            </p>
                            <small class="text-muted">${new Date(report.timestamp).toLocaleString()}</small>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="mb-2">
                                <small>Calidad: ${report.calidad_documento?.puntuacion || 0}/100</small>
                            </div>
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="dashboard.viewReport(${report.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-primary me-2" onclick="dashboard.generateReport(${report.id})">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteReport(${report.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Report management methods
    viewReport(id) {
        const report = this.reports.find(r => r.id === id);
        if (report) {
            this.showResultModal(report);
        }
    }

    generateReport(id) {
        const report = this.reports.find(r => r.id === id);
        if (report) {
            fetch('/generate_report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_auditoria_${report.metadata?.filename?.replace('.pdf', '') || report.id}.html`;
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                this.showNotification('Error al generar el reporte: ' + error.message, 'error');
            });
        }
    }

    deleteReport(id) {
        if (confirm('¿Estás seguro de eliminar este reporte?')) {
            this.reports = this.reports.filter(r => r.id !== id);
            localStorage.setItem('pqrs_reports', JSON.stringify(this.reports));
            this.loadReportsGrid();
            this.updateStats();
            this.loadRecentDocuments(); // Update recent documents on dashboard
            this.loadRecentActivity(); // Update recent activity on dashboard
            this.initPQRSChart(); // Update dashboard chart
            this.showNotification('Reporte eliminado', 'success');
        }
    }

    clearAllReports() {
        if (confirm('¿Estás seguro de eliminar todos los reportes?')) {
            this.reports = [];
            localStorage.setItem('pqrs_reports', JSON.stringify(this.reports));
            this.loadReportsGrid();
            this.updateStats();
            this.loadRecentDocuments(); // Update recent documents on dashboard
            this.loadRecentActivity(); // Update recent activity on dashboard
            this.initPQRSChart(); // Update dashboard chart
            this.showNotification('Todos los reportes han sido eliminados', 'success');
        }
    }

    exportAllReports() {
        const data = JSON.stringify(this.reports, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reportes_pqrs.json';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    applyFilters() {
        this.loadReportsGrid(); // This will now apply the filters
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});