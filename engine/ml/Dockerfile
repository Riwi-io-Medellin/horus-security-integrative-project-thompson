FROM python:3.12-slim

WORKDIR /workspace

COPY api/requirements-unified.txt /workspace/requirements.txt
RUN pip install --no-cache-dir -r /workspace/requirements.txt

COPY . /workspace

CMD ["python", "engine/ml/trainer_entrypoint.py"]
