.PHONY: test backend-test frontend-test

backend-test:
	backend\venv\Scripts\activate && python -m pytest backend/test_app.py

frontend-test:
	npm test --prefix value-core-frontend -- --watchAll=false

test: backend-test frontend-test