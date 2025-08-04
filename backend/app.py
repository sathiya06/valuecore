from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from datetime import datetime
from dotenv import load_dotenv
import llm_service  

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure CORS for React frontend
CORS(app, origins=[
    "http://localhost:3000",      # React dev server
    "http://127.0.0.1:3000",      # Alternative localhost
    "http://localhost:3001",      # Alternative React port
], methods=['GET', 'POST', 'OPTIONS'])

# App configuration
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'

# Initialize services
try:
    llm_service = llm_service.LLMService()
    logger.info("✅ LLM services initialized successfully")
except Exception as e:
    logger.error(f"❌ Error initializing services: {str(e)}")
    raise

@app.before_request
def log_request_info():
    """Log incoming requests for debugging"""
    if app.config['DEBUG']:
        logger.info(f"📥 {request.method} {request.path} from {request.remote_addr}")

@app.after_request
def after_request(response):
    """Add security headers and log responses"""
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    if app.config['DEBUG']:
        logger.info(f"📤 Response: {response.status_code}")
    
    return response

@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API info"""
    return jsonify({
        'service': 'ROI Calculator Backend',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'chat': 'POST /api/chat',
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Process chatbot messages from React frontend
    
    Expected payload:
    {
        "message": "Set employees to 150",
        "ui_context": { ... current UI state ... }
    }
    """
    # print("Received chat request")
    # print(f"Request data: {request.json.get('message', 'No message provided')}")
    # print(f"UI context: {request.json.get('ui_context', 'No UI context provided')}")
    response = llm_service.run(
        message=request.json.get('message', 'hi, what do you do?'),
        ui_context=request.json.get('ui_context', {})
    )
    # print(f"Chat response: {response}")
    return response

# Error handlers
@app.errorhandler(404)
def not_found(error):
    logger.warning(f"404 error: {request.path}")
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': f"The requested endpoint '{request.path}' does not exist.",
        'available_endpoints': [
            'GET /',
            'GET /api/health',
            'POST /api/chat',
            'GET /api/ui-state',
            'POST /api/update-fields',
            'POST /api/reset'
        ]
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    logger.warning(f"405 error: {request.method} {request.path}")
    return jsonify({
        'success': False,
        'error': 'Method not allowed',
        'message': f"The method '{request.method}' is not allowed for this endpoint."
    }), 405

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred. Please try again.'
    }), 500

@app.errorhandler(Exception)
def handle_exception(e):
    """Handle any unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({
        'success': False,
        'error': 'Unexpected error',
        'message': 'An unexpected error occurred. Please try again.'
    }), 500

if __name__ == '__main__':
    # Configuration
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'false'
    
    # Startup messages
    print("\n" + "="*50)
    print("🚀 ROI Calculator Backend Starting...")
    print("="*50)
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🐛 Debug: {debug}")
    print(f"🔑 OpenAI API Key: {'✅ Configured' if os.getenv('OPENAI_API_KEY') else '❌ Not configured'}")
    print(f"📱 React Frontend URL: http://localhost:3000")
    print(f"🌐 Backend API URL: http://localhost:{port}")
    print(f"❤️  Health Check: http://localhost:{port}/api/health")
    print("="*50)
    
    # Start the Flask application
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True  # Enable threading for better performance
    )