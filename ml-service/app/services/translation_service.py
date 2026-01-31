"""
Translation service with hybrid OPUS + Ollama fallback.

This service uses:
1. OPUS MarianMT models for explicitly supported language pairs
2. Ollama LLM as fallback for unsupported pairs
"""

from transformers import MarianMTModel, MarianTokenizer
from typing import Dict, Optional, Tuple
import torch
from ..models.schemas import TranslationRequest, TranslationResponse
from .ollama_client import ollama_client


class TranslationService:
    """Hybrid translation service using OPUS models with Ollama fallback."""

    # EXPLICIT OPUS REGISTRY - Only these pairs use OPUS
    TRANSLATION_MODELS = {
        ("en", "fr"): "Helsinki-NLP/opus-mt-en-fr",
        ("en", "de"): "Helsinki-NLP/opus-mt-en-de",
        ("en", "es"): "Helsinki-NLP/opus-mt-en-es",
        ("en", "hi"): "Helsinki-NLP/opus-mt-en-hi",
        ("hi", "en"): "Helsinki-NLP/opus-mt-hi-en",
        ("fr", "en"): "Helsinki-NLP/opus-mt-fr-en",
        ("de", "en"): "Helsinki-NLP/opus-mt-de-en",
        ("es", "en"): "Helsinki-NLP/opus-mt-es-en"
    }

    def __init__(self):
        """Initialize translation models cache."""
        self.models: Dict[Tuple[str, str], Dict] = {}
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def _load_model(self, lang_pair: Tuple[str, str]) -> Dict:
        """
        Load or retrieve a cached translation model.
        Lazy-loading implementation.
        """
        if lang_pair not in self.models:
            if lang_pair not in self.TRANSLATION_MODELS:
                raise ValueError(f"Translation between {lang_pair[0]} and {lang_pair[1]} is not supported in OPUS registry.")

            try:
                model_name = self.TRANSLATION_MODELS[lang_pair]
                print(f"Loading translation model: {model_name}...")
                tokenizer = MarianTokenizer.from_pretrained(model_name)
                model = MarianMTModel.from_pretrained(model_name)
                model.to(self.device)
                model.eval()

                self.models[lang_pair] = {
                    'tokenizer': tokenizer,
                    'model': model
                }
            except Exception as e:
                print(f"Error loading model {lang_pair}: {str(e)}")
                raise RuntimeError(f"Translation model for {lang_pair} failed to load.")

        return self.models[lang_pair]

    def translate_with_opus(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translate using OPUS MarianMT model.
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            Translated text
            
        Raises:
            ValueError: If language pair not in registry
            RuntimeError: If model loading fails
        """
        lang_pair = (source_lang, target_lang)
        
        # Validate language pair exists in registry
        if lang_pair not in self.TRANSLATION_MODELS:
            raise ValueError(f"Translation between {source_lang} and {target_lang} is not supported in OPUS registry.")
        
        # Load the appropriate model (lazy-load)
        model_data = self._load_model(lang_pair)
        tokenizer = model_data['tokenizer']
        model = model_data['model']

        # Tokenize input text
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Generate translation
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=512,
                num_beams=4,
                early_stopping=True
            )

        # Decode the translated text
        translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return translated_text.strip()

    def translate_with_llm(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translate using Ollama LLM fallback.
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            Translated text
            
        Raises:
            ConnectionError: If Ollama is unavailable
            RuntimeError: If translation fails
        """
        if not ollama_client.check_health():
            raise ConnectionError("LLM service unavailable")
        
        return ollama_client.translate_text(text, source_lang, target_lang)

    def translate(self, request: TranslationRequest) -> TranslationResponse:
        """
        Hybrid translation with OPUS + Ollama fallback.
        
        Args:
            request: Translation request with source/target languages and text
            
        Returns:
            Translation response with method indicator
            
        Raises:
            ValueError: For unsupported language pairs
            ConnectionError: If LLM fallback is unavailable
            RuntimeError: For other service errors
        """
        src = request.source_lang.value if hasattr(request.source_lang, 'value') else request.source_lang
        tgt = request.target_lang.value if hasattr(request.target_lang, 'value') else request.target_lang
        lang_pair = (src, tgt)

        # HYBRID ROUTING LOGIC
        try:
            if lang_pair in self.TRANSLATION_MODELS:
                # Use OPUS for supported pairs
                translated_text = self.translate_with_opus(request.text, src, tgt)
                method = "opus"
            else:
                # Use Ollama fallback for unsupported pairs
                translated_text = self.translate_with_llm(request.text, src, tgt)
                method = "llm"
                
        except ConnectionError:
            # LLM unavailable - critical error
            raise ConnectionError("LLM_UNAVAILABLE: Translation service unavailable")
        except Exception as e:
            # Other errors
            raise RuntimeError(f"Translation failed: {str(e)}")

        return TranslationResponse(
            translated_text=translated_text,
            source_lang=src,
            target_lang=tgt,
            method=method
        )

    def get_supported_languages(self):
        """Return a list of supported translation language pairs."""
        return [{"from": pair[0], "to": pair[1]} for pair in self.TRANSLATION_MODELS.keys()]


# Global service instance
translation_service = TranslationService()