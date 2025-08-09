import sys
import os
import types
import importlib

# Ensure backend directory on path
sys.path.append(os.path.dirname(__file__))

# Create a mock llm_service module to avoid external dependencies
mock_llm_service = types.ModuleType("llm_service")

class DummyLLMService:
    def run(self, message, ui_context):
        return {"answer": "mocked response"}

mock_llm_service.LLMService = lambda: DummyLLMService()

# Insert mock into sys.modules so app.py uses it during import
sys.modules['llm_service'] = mock_llm_service

# Now import the Flask app from app.py
app_module = importlib.import_module('app')
app = app_module.app


def test_root_endpoint():
    client = app.test_client()
    resp = client.get('/')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get('service') == 'ROI Calculator Backend'


def test_chat_endpoint_returns_mocked_response():
    client = app.test_client()
    resp = client.post('/api/chat', json={'message': 'hi', 'ui_context': {}})
    assert resp.status_code == 200
    assert resp.get_json() == {"answer": "mocked response"}