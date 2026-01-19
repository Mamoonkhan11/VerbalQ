# NLP Services API

A FastAPI-based microservice providing AI-powered NLP operations for text processing.

## Features

- **Grammar Checking**: Uses LanguageTool to detect and correct grammatical errors
- **Text Translation**: Multi-language translation using MarianMT transformer models
- **Text Humanization**: Rewrite AI text in different tones (professional, casual, academic, creative)
- **Plagiarism Detection**: Compare text against reference corpus using TF-IDF and cosine similarity
- **RESTful API**: Clean, well-documented endpoints with Pydantic validation
- **Health Monitoring**: Service health checks and performance metrics

## Supported Languages

### Translation
- English (en)
- Spanish (es)
- Hindi (hi)
- Korean (ko)

## Supported Tones

### Text Humanization
- **Professional**: Formal, business-appropriate language
- **Casual**: Conversational, friendly tone
- **Academic**: Scholarly, formal academic writing
- **Creative**: Imaginative, engaging expression

## API Endpoints

### Grammar Checking
```http
POST /grammar/check
Content-Type: application/json

{
  "text": "This are a example of bad grammar."
}
```

Response:
```json
{
  "corrected_text": "This is an example of bad grammar.",
  "issues": [
    {
      "message": "Possible agreement error.",
      "offset": 5,
      "length": 3,
      "rule_id": "AGREEMENT",
      "suggestions": ["is"]
    }
  ]
}
```

### Text Translation
```http
POST /translate
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "source_lang": "en",
  "target_lang": "es"
}
```

Response:
```json
{
  "translated_text": "Hola, ¿cómo estás?",
  "source_lang": "en",
  "target_lang": "es"
}
```

### Text Humanization
```http
POST /humanize
Content-Type: application/json

{
  "text": "The weather is nice today.",
  "tone": "casual"
}
```

Response:
```json
{
  "rewritten_text": "Hey, the weather's really nice today!",
  "tone": "casual"
}
```

### Plagiarism Detection
```http
POST /plagiarism/check
Content-Type: application/json

{
  "text": "Artificial intelligence is transforming various industries."
}
```

Response:
```json
{
  "similarity_score": 85.5,
  "matched_sentences": [
    {
      "text": "Artificial intelligence is transforming various industries.",
      "similarity": 0.92,
      "source": "AI Overview Article"
    }
  ],
  "is_plagiarized": true
}
```

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "OK",
  "version": "1.0.0",
  "services": {
    "grammar": "LanguageTool",
    "translation": "MarianMT",
    "humanization": "BART",
    "plagiarism": "TF-IDF + Cosine Similarity"
  }
}
```

## Installation

1. **Create virtual environment:**
   ```bash
   cd ml-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Download NLTK data (for plagiarism detection):**
   ```python
   import nltk
   nltk.download('punkt')
   ```

## Running the Service

### Development Mode
```bash
# Using uvicorn directly
uvicorn app.main:app --reload --port 8001

# Or using the run script
python run.py
```

### Production Mode
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
```

The service will be available at: `http://localhost:8001`

## API Documentation

- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

## Architecture

```
ml-service/
├── app/
│   ├── main.py           # FastAPI application setup
│   ├── routers/          # API route handlers
│   │   ├── grammar.py
│   │   ├── translation.py
│   │   ├── humanize.py
│   │   └── plagiarism.py
│   ├── services/         # Business logic and ML models
│   │   ├── grammar_service.py
│   │   ├── translation_service.py
│   │   ├── humanize_service.py
│   │   └── plagiarism_service.py
│   ├── models/           # Pydantic schemas
│   │   └── schemas.py
│   └── utils/            # Utility functions
├── requirements.txt      # Python dependencies
└── README.md
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (validation error)
- `422`: Validation error (Pydantic)
- `500`: Internal server error

Error responses include detailed error messages for debugging.

## Model Details

### Grammar Checking
- **Library**: LanguageTool Python
- **Features**: Spelling, grammar, style, and punctuation checking
- **Language**: American English

### Translation
- **Model**: MarianMT (Helsinki-NLP)
- **Approach**: Transformer-based neural machine translation
- **Quality**: High-quality translations for supported language pairs

### Text Humanization
- **Model**: BART Large CNN (fine-tuned for summarization/rewriting)
- **Approach**: Prompt-based text rewriting with tone adaptation
- **Styles**: 4 distinct tones with appropriate language patterns

### Plagiarism Detection
- **Method**: TF-IDF vectorization + cosine similarity
- **Corpus**: Local reference documents (expandable)
- **Threshold**: 30% similarity for sentence matching, 40% for overall text

## Performance Considerations

- Models are loaded once and cached for reuse
- GPU acceleration when available
- Efficient vectorization for plagiarism detection
- Connection pooling for external services

## Monitoring

- Health check endpoint for service monitoring
- Processing time headers on all responses
- Structured logging for debugging
- Error tracking and reporting

## Security

- Input validation and sanitization
- Rate limiting (implement at API gateway level)
- CORS configuration for allowed origins
- No sensitive data logging

## Future Enhancements

- Additional language support for translation
- Custom model fine-tuning
- Real-time model updates
- Advanced plagiarism detection with external databases
- Performance metrics and analytics