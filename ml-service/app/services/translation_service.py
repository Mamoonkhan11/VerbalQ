"""
Translation service using Hugging Face transformers.

This service uses pre-trained MarianMT models for machine translation.
MarianMT provides high-quality translation between multiple language pairs.
"""

from transformers import MarianMTModel, MarianTokenizer
from typing import Dict, Optional
import torch
from ..models.schemas import TranslationRequest, TranslationResponse


class TranslationService:
    """Service for translating text between languages using MarianMT."""

    # Explicit Model Registry (Source -> Target)
    TRANSLATION_MODELS = {
        ("en", "es"): "Helsinki-NLP/opus-mt-en-es",
        ("es", "en"): "Helsinki-NLP/opus-mt-es-en",
        ("en", "hi"): "Helsinki-NLP/opus-mt-en-hi",
        ("hi", "en"): "Helsinki-NLP/opus-mt-hi-en",
        ("en", "ko"): "Helsinki-NLP/opus-mt-en-ko",
        ("ko", "en"): "Helsinki-NLP/opus-mt-ko-en",
        ("en", "fr"): "Helsinki-NLP/opus-mt-en-fr",
        ("fr", "en"): "Helsinki-NLP/opus-mt-fr-en",
        ("en", "de"): "Helsinki-NLP/opus-mt-en-de",
        ("de", "en"): "Helsinki-NLP/opus-mt-de-en",
        ("en", "zh"): "Helsinki-NLP/opus-mt-en-zh",
        ("zh", "en"): "Helsinki-NLP/opus-mt-zh-en",
        ("en", "ar"): "Helsinki-NLP/opus-mt-en-ar",
        ("ar", "en"): "Helsinki-NLP/opus-mt-ar-en",
    }

    def __init__(self):
        """Initialize translation models cache."""
        self.models: Dict[tuple, Dict] = {}
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def _load_model(self, lang_pair: tuple) -> Dict:
        """
        Load or retrieve a cached translation model.
        Lazy-loading implementation.
        """
        if lang_pair not in self.models:
            if lang_pair not in self.TRANSLATION_MODELS:
                raise ValueError(f"Translation between {lang_pair[0]} and {lang_pair[1]} is not supported.")

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

    def translate(self, request: TranslationRequest) -> TranslationResponse:
        """
        Translate text from source language to target language.
        Raises exceptions for routers to handle with appropriate status codes.
        """
        src = request.source_lang.value if hasattr(request.source_lang, 'value') else request.source_lang
        tgt = request.target_lang.value if hasattr(request.target_lang, 'value') else request.target_lang
        lang_pair = (src, tgt)

        # Validate language pair exists in registry
        if lang_pair not in self.TRANSLATION_MODELS:
            raise ValueError(f"Translation between {src} and {tgt} is not supported.")

        # Load the appropriate model (lazy-load)
        model_data = self._load_model(lang_pair)
        tokenizer = model_data['tokenizer']
        model = model_data['model']

        # Tokenize input text
        inputs = tokenizer(request.text, return_tensors="pt", padding=True, truncation=True, max_length=512)
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

        return TranslationResponse(
            translated_text=translated_text.strip(),
            source_lang=src,
            target_lang=tgt,
            method="opus"
        )

    def get_supported_languages(self):
        """Return a list of supported translation language pairs."""
        return [{"from": pair[0], "to": pair[1]} for pair in self.TRANSLATION_MODELS.keys()]


# Global service instance
translation_service = TranslationService()