from flask import Flask, render_template, request, jsonify, send_file
import os
import PyPDF2
import google.generativeai as genai
from werkzeug.utils import secure_filename
import json
import demjson3
from datetime import datetime
import re
from pdf2image import convert_from_path
import pytesseract
from PIL import Image, ImageEnhance
import io
import pdfplumber

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))


tessdata_dir = r'C:/Program Files/Tesseract-OCR/tessdata'
os.environ['TESSDATA_PREFIX'] = tessdata_dir
pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'

poppler_path = r'C:/Users/pc/Desktop/Release-24.08.0-0/poppler-24.08.0/Library/bin'

if not os.path.exists(os.path.join(tessdata_dir, 'spa.traineddata')):
    print(f"Error: spa.traineddata no encontrado en {tessdata_dir}.")

# Crear directorios
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('temp_reports', exist_ok=True)

def preprocess_image(image):
    """Preprocesa la imagen para mejorar la precisión del OCR"""
    image = image.convert('L')
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(1.5)
    image = image.point(lambda x: 0 if x < 128 else 255, '1')
    return image

def clean_extracted_text(text):
    """Limpia el texto extraído y valida datos personales"""
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    
    # Validar cédula
    cedula_match = re.search(r'\b\d{1,3}(?:\.\d{3})*\d{3}\b', text)
    if cedula_match:
        cedula = cedula_match.group(0).replace('.', '')
        if 6 <= len(cedula) <= 10: 
            text += f"\n[Cédula identificada: {cedula}]"
    
    # Validar correo
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    if email_match:
        text += f"\n[Correo identificado: {email_match.group(0)}]"
    
    phone_text = ""
    telefono_match = re.search(r'\btelefono\b(?:\s*:\s*|\s+)([\d\s+-]+)', text, re.IGNORECASE)
    if telefono_match:
        phone_candidate = re.sub(r'[^\d]', '', telefono_match.group(1)) 
        if len(phone_candidate) == 10 and phone_candidate.startswith('3'):
            phone_text = f"\n[Teléfono identificado: {phone_candidate}]"
        elif phone_candidate.startswith('57') and len(phone_candidate) == 12 and phone_candidate[2:].startswith('3'):
            phone_text = f"\n[Teléfono identificado: +{phone_candidate}]"

    if not phone_text:
        phone_match = re.search(r'\b(\+57\s?)?3\d{9}\b', text)
        if phone_match:
            phone_text = f"\n[Teléfono identificado: {phone_match.group(0)}]"
    
    text += phone_text
    return text.strip()



def extract_text_from_pdf(pdf_path):
    """Extrae texto de un archivo PDF, usando OCR o pdfplumber si es necesario"""
    text = ""
    errors = []

    # Intentar extraer texto nativo con PyPDF2
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        errors.append(f"Error con PyPDF2: {str(e)}")

    # Intentar con pdfplumber
    if not text.strip() or len(text.strip()) < 50:
        print("Texto nativo insuficiente, intentando con pdfplumber...")
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            errors.append(f"Error con pdfplumber: {str(e)}")

    # Intentar OCR con pdf2image
    if not text.strip() or len(text.strip()) < 50:
        print("Texto nativo insuficiente, aplicando OCR...")
        if os.path.exists(os.path.join(tessdata_dir, 'spa.traineddata')):
            try:
                images = convert_from_path(pdf_path, dpi=300, poppler_path=poppler_path)
                for image in images:
                    image = preprocess_image(image)
                    ocr_text = pytesseract.image_to_string(image, lang='spa', config='--psm 6')
                    text += ocr_text + "\n"
            except Exception as e:
                errors.append(f"Error con pdf2image (OCR): {str(e)}")
        else:
            errors.append(f"OCR no disponible: spa.traineddata no encontrado en {tessdata_dir}")

    if text.strip():
        text = clean_extracted_text(text)
    else:
        text = "No se pudo extraer texto del PDF"
        errors.append("No se extrajo texto incluso con OCR")

    return text.strip(), errors

def calculate_quality_score(text, analysis, errors):
    """Calcula la puntuación de calidad del documento con criterios más granulares"""
    score = 0
    if len(text) > 500:
        score += 20
    if not errors:
        score += 20
    for field in analysis["datos_personales"].values():
        if field != "No identificado" and "Error" not in field:
            score += 5
    if analysis["tipo_requerimiento"] != "Requiere análisis manual":
        score += 15
    if text.count('.') > 5: 
        score += 20
    score -= len(errors) * 5
    return min(max(score, 0), 100)

def clean_json_string(text):
    # Eliminar marcadores de código
    if text.startswith('```json'):
        text = text[7:]
    if text.endswith('```'):
        text = text[:-3]
    text = text.strip()

    # Reemplazar comillas curvas y simples por dobles normales
    text = text.replace('“', '"').replace('”', '"').replace("'", '"')

    # Reemplazar comillas dobles dentro de paréntesis mal formateados
    # Ejemplo: (ej":) → (ej:)
    text = re.sub(r'\(([^)]*?)"([^)]*?)\)', lambda m: '(' + m.group(1) + m.group(2) + ')', text)

    # También podrías reemplazar directamente lo que causa el error si es común
    text = text.replace('(ej":)', '(ej:)')

    # Normalizar propiedades JSON sin comillas (fallback)
    text = re.sub(r'(\w+)\s*:', r'"\1":', text)

    return text


def is_valid_json(json_str):
    """Verifica si una cadena es un JSON válido"""
    try:
        json.loads(json_str)
        return True
    except ValueError:
        return False

def analyze_pqrs_with_ai(text, extraction_errors):
    """Analiza el documento PQRS usando Gemini"""
    prompt = f"""
    Analiza el siguiente documento PQRS y extrae la información según estos criterios:

    CRITERIOS DE AUDITORÍA:
    1. Datos personales del usuario (nombre, cédula, correo, teléfono, dirección)
    2. Tipo de requerimiento (Petición, Queja, Reclamo o Sugerencia)
    3. Redacción (resumen de la petición, incluyendo detalles específicos como NIC, montos de facturas, lecturas de medidor, etc.)
    4. Análisis profundo (determinar si es procedente o no procedente, utilizando detalles específicos del documento)

    DOCUMENTO:
    {text}

    Instrucciones adicionales:
    - Incluye en el resumen detalles clave como el NIC, montos de facturas, lecturas de medidor, y cualquier evidencia adjunta.
    - En el análisis, utiliza estos detalles para justificar la procedencia o no procedencia.
    - Si el texto es incoherente o insuficiente, indícalo en 'errores_encontrados' y sugiere revisión manual.
    - Identifica el tipo de requerimiento buscando palabras clave como 'petición', 'queja', 'reclamo' o 'sugerencia' (case-insensitive).
    - Si no se encuentran datos personales, usa 'No identificado' en los campos correspondientes.
    - Evalúa la procedencia según la normativa colombiana (Ley 142 de 1994, Ley 1755 de 2015).
    - Asegúrate de que la respuesta sea un JSON válido.
    - Errores de extracción: {extraction_errors}

    Responde ÚNICAMENTE en formato JSON válido con la siguiente estructura:
    {{
        "datos_personales": {{
            "nombre_completo": "nombre extraído",
            "cedula": "número de cédula",
            "correo": "correo electrónico",
            "telefono": "teléfono",
            "direccion": "dirección"
        }},
        "tipo_requerimiento": "Petición/Queja/Reclamo/Sugerencia",
        "resumen_peticion": "resumen claro y conciso con detalles específicos",
        "analisis_profundo": {{
            "procedente": true,
            "justificacion": "explicación detallada utilizando detalles del documento",
            "recomendacion": "recomendación específica"
        }},
        "errores_encontrados": ["Errores deben redactarse sin usar comillas dobles internas"],
        "calidad_documento": {{
            "puntuacion": 85,
            "observaciones": "observaciones sobre calidad"
        }}
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        result = response.text.strip()

        # Mostrar respuesta cruda para depuración
        print("Respuesta cruda de Gemini:")
        print(repr(result))

        # Limpiar la respuesta
        result = clean_json_string(result)

        # Intentar encontrar JSON dentro del texto si no es válido
        if not is_valid_json(result):
            print("La respuesta no es un JSON válido, intentando extraer JSON...")
            match = re.search(r'\{.*\}', result, re.DOTALL)
            if match:
                result = match.group(0)

        # Intentar parsear como JSON
        try:
            parsed_result = json.loads(result)
        except json.JSONDecodeError as e:
            print(f"Primer intento de parseo fallido: {e}")
            # Intentar eliminar posibles caracteres problemáticos
            result = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', result)
            try:
                parsed_result = json.loads(result)
            except json.JSONDecodeError as e2:
                print(f"Segundo intento de parseo fallido: {e2}")
                # Intentar con demjson3 como último recurso
                try:
                    parsed_result = demjson3.decode(result)
                except Exception as de:
                    print(f"Error parsing JSON con demjson3: {de}")
                    print(f"Raw response: {result}")
                    return {
                        "datos_personales": {
                            "nombre_completo": "Extracción manual requerida",
                            "cedula": "No identificada",
                            "correo": "No identificado",
                            "telefono": "No identificado",
                            "direccion": "No identificada"
                        },
                        "tipo_requerimiento": "Requiere análisis manual",
                        "resumen_peticion": result[:500] if result else "Error en procesamiento",
                        "analisis_profundo": {
                            "procedente": False,
                            "justificacion": "Análisis manual requerido debido a error en JSON",
                            "recomendacion": "Revisar manualmente el documento"
                        },
                        "errores_encontrados": ["Error en procesamiento con IA", f"JSON inválido: {str(e)}"] + extraction_errors,
                        "calidad_documento": {
                            "puntuacion": 10,
                            "observaciones": "Requiere revisión manual debido a error en JSON"
                        }
                    }

        # Ajustar calidad del documento
        if extraction_errors:
            parsed_result["errores_encontrados"].extend(extraction_errors)
            parsed_result["calidad_documento"]["puntuacion"] = max(30, parsed_result["calidad_documento"].get("puntuacion", 0))
            parsed_result["calidad_documento"]["observaciones"] += "; Problemas en extracción: " + ", ".join(extraction_errors)
        elif len(text.strip()) < 100:
            parsed_result["errores_encontrados"].append("Texto extraído insuficiente")
            parsed_result["calidad_documento"]["puntuacion"] = max(50, parsed_result["calidad_documento"].get("puntuacion", 0))
            parsed_result["calidad_documento"]["observaciones"] += "; Texto demasiado corto"
        
        parsed_result["calidad_documento"]["puntuacion"] = calculate_quality_score(text, parsed_result, extraction_errors)
        return parsed_result

    except Exception as e:
        print(f"Error with Gemini API: {e}")
        return {
            "datos_personales": {
                "nombre_completo": "Error en procesamiento",
                "cedula": "Error en procesamiento",
                "correo": "Error en procesamiento",
                "telefono": "Error en procesamiento",
                "direccion": "Error en procesamiento"
            },
            "tipo_requerimiento": "Error",
            "resumen_peticion": "Error en procesamiento con Gemini API",
            "analisis_profundo": {
                "procedente": False,
                "justificacion": f"Error técnico: {str(e)}",
                "recomendacion": "Verificar configuración de API"
            },
            "errores_encontrados": [f"Error técnico: {str(e)}"] + extraction_errors,
            "calidad_documento": {
                "puntuacion": 10,
                "observaciones": "Error en procesamiento con IA"
            }
        }

@app.route('/')
def index():
    return render_template('dashboard.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se seleccionó archivo'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó archivo'}), 400

    if file and file.filename.lower().endswith('.pdf'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        try:
            file.save(filepath)
            text, extraction_errors = extract_text_from_pdf(filepath)
            analysis = analyze_pqrs_with_ai(text, extraction_errors)
            analysis['metadata'] = {
                'filename': filename,
                'upload_time': datetime.now().isoformat(),
                'file_size': os.path.getsize(filepath)
            }
            return jsonify(analysis)
        finally:
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"Error al eliminar archivo temporal: {e}")
    return jsonify({'error': 'Solo se permiten archivos PDF'}), 400

@app.route('/generate_report', methods=['POST'])
def generate_report():
    """Genera un reporte detallado de la auditoría"""
    data = request.json
    report_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Reporte de Auditoría PQRS</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .header {{ background: #2c3e50; color: white; padding: 20px; text-align: center; }}
            .section {{ margin: 20px 0; padding: 15px; border: 1px solid #ddd; }}
            .error {{ color: red; }}
            .success {{ color: green; }}
            .warning {{ color: orange; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>REPORTE DE AUDITORÍA PQRS</h1>
            <p>Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>Procesado con Google Gemini AI</p>
        </div>
        <div class="section">
            <h2>Información del Documento</h2>
            <p><strong>Archivo:</strong> {data.get('metadata', {}).get('filename', 'N/A')}</p>
            <p><strong>Fecha de análisis:</strong> {data.get('metadata', {}).get('upload_time', 'N/A')}</p>
        </div>
        <div class="section">
            <h2>Datos Personales Identificados</h2>
            <p><strong>Nombre:</strong> {data.get('datos_personales', {}).get('nombre_completo', 'No identificado')}</p>
            <p><strong>Cédula:</strong> {data.get('datos_personales', {}).get('cedula', 'No identificada')}</p>
            <p><strong>Correo:</strong> {data.get('datos_personales', {}).get('correo', 'No identificado')}</p>
            <p><strong>Teléfono:</strong> {data.get('datos_personales', {}).get('telefono', 'No identificado')}</p>
            <p><strong>Dirección:</strong> {data.get('datos_personales', {}).get('direccion', 'No identificada')}</p>
        </div>
        <div class="section">
            <h2>Tipo de Requerimiento</h2>
            <p><strong>{data.get('tipo_requerimiento', 'No identificado')}</strong></p>
        </div>
        <div class="section">
            <h2>Resumen de la Petición</h2>
            <p>{data.get('resumen_peticion', 'No disponible')}</p>
        </div>
        <div class="section">
            <h2>Análisis de Procedencia</h2>
            <p><strong>Procedente:</strong> <span class="{'success' if data.get('analisis_profundo', {}).get('procedente') else 'error'}">
                {'SÍ' if data.get('analisis_profundo', {}).get('procedente') else 'NO'}
            </span></p>
            <p><strong>Justificación:</strong> {data.get('analisis_profundo', {}).get('justificacion', 'No disponible')}</p>
            <p><strong>Recomendación:</strong> {data.get('analisis_profundo', {}).get('recomendacion', 'No disponible')}</p>
        </div>
        <div class="section">
            <h2>Errores Encontrados</h2>
            <ul>
                {''.join([f'<li class="error">{error}</li>' for error in data.get('errores_encontrados', [])])}
            </ul>
        </div>
        <div class="section">
            <h2>Calidad del Documento</h2>
            <p><strong>Puntuación:</strong> {data.get('calidad_documento', {}).get('puntuacion', 0)}/100</p>
            <p><strong>Observaciones:</strong> {data.get('calidad_documento', {}).get('observaciones', 'No disponible')}</p>
        </div>
        <div class="section">
            <h2>Conclusiones</h2>
            <p>Este documento ha sido analizado automáticamente usando inteligencia artificial. 
            Se recomienda revisión manual para casos complejos o cuando la puntuación de calidad sea baja.</p>
        </div>
    </body>
    </html>
    """
    report_filename = f"reporte_{data.get('id', 'temp')}.html"
    report_path = os.path.join('temp_reports', report_filename)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_html)
    return send_file(report_path, as_attachment=True, download_name=report_filename)


@app.route('/api/stats')
def get_stats():
    """API endpoint para obtener estadísticas del sistema"""
    return jsonify({
        'total_documents': 0,
        'approved_count': 0,
        'pending_count': 0,
        'average_quality': 0
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)