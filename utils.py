"""
Utilidades para el sistema Auditor PQRS
"""
import os
import re
import json
from datetime import datetime
from werkzeug.utils import secure_filename

def allowed_file(filename, allowed_extensions):
    """Verifica si el archivo tiene una extensión permitida"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def clean_text(text):
    """Limpia y normaliza texto extraído de PDFs"""
    if not text:
        return ""

    # Remover caracteres especiales y normalizar espacios
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    return text

def extract_email(text):
    """Extrae direcciones de email del texto"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else None

def extract_phone(text):
    """Extrae números de teléfono del texto"""
    phone_patterns = [
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # 123-456-7890
        r'\b\d{10}\b',  # 1234567890
        r'\(\d{3}\)\s*\d{3}[-.]?\d{4}',  # (123) 456-7890
    ]

    for pattern in phone_patterns:
        phones = re.findall(pattern, text)
        if phones:
            return phones[0]
    return None

def extract_id_number(text):
    """Extrae números de cédula del texto"""
    # Patrones comunes para cédulas
    id_patterns = [
        r'\b\d{8,12}\b',  # 8-12 dígitos
        r'\b\d{1,3}[.,]\d{3}[.,]\d{3}\b',  # Formato con puntos/comas
    ]

    for pattern in id_patterns:
        ids = re.findall(pattern, text)
        if ids:
            return ids[0]
    return None

def generate_report_id():
    """Genera un ID único para reportes"""
    return f"RPT_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"

def save_json_report(data, filename):
    """Guarda un reporte en formato JSON"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error guardando reporte JSON: {e}")
        return False

def load_json_report(filename):
    """Carga un reporte desde archivo JSON"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error cargando reporte JSON: {e}")
        return None

def format_file_size(size_bytes):
    """Formatea el tamaño de archivo en formato legible"""
    if size_bytes == 0:
        return "0B"

    size_names = ["B", "KB", "MB", "GB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1

    return f"{size_bytes:.1f}{size_names[i]}"

def validate_pqrs_data(data):
    """Valida la estructura de datos de un análisis PQRS"""
    required_fields = [
        'datos_personales',
        'tipo_requerimiento', 
        'resumen_peticion',
        'analisis_profundo',
        'calidad_documento'
    ]

    for field in required_fields:
        if field not in data:
            return False, f"Campo requerido faltante: {field}"

    return True, "Datos válidos"

def calculate_quality_score(analysis_data):
    """Calcula una puntuación de calidad basada en el análisis"""
    score = 0
    max_score = 100

    # Datos personales completos (30 puntos)
    personal_data = analysis_data.get('datos_personales', {})
    personal_fields = ['nombre_completo', 'cedula', 'correo']
    completed_fields = sum(1 for field in personal_fields if personal_data.get(field) and personal_data[field] != 'No identificado')
    score += (completed_fields / len(personal_fields)) * 30

    # Tipo de requerimiento identificado (20 puntos)
    if analysis_data.get('tipo_requerimiento') and analysis_data['tipo_requerimiento'] != 'No identificado':
        score += 20

    # Resumen de petición presente (25 puntos)
    if analysis_data.get('resumen_peticion') and len(analysis_data['resumen_peticion']) > 50:
        score += 25

    # Análisis de procedencia (25 puntos)
    if analysis_data.get('analisis_profundo', {}).get('justificacion'):
        score += 25

    return min(int(score), max_score)

class ReportGenerator:
    """Generador de reportes en diferentes formatos"""

    @staticmethod
    def generate_html_report(data):
        """Genera reporte en formato HTML"""
        # Implementación del generador HTML
        pass

    @staticmethod
    def generate_pdf_report(data):
        """Genera reporte en formato PDF"""
        # Implementación del generador PDF
        pass

    @staticmethod
    def generate_excel_report(data_list):
        """Genera reporte en formato Excel con múltiples registros"""
        # Implementación del generador Excel
        pass
