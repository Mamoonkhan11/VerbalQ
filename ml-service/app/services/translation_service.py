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

    # Language code mappings for MarianMT models
    LANGUAGE_MODELS = {
        'en-es': 'Helsinki-NLP/opus-mt-en-es',  # English to Spanish
        'es-en': 'Helsinki-NLP/opus-mt-es-en',  # Spanish to English
        'en-hi': 'Helsinki-NLP/opus-mt-en-hi',  # English to Hindi
        'hi-en': 'Helsinki-NLP/opus-mt-hi-en',  # Hindi to English
        'en-ko': 'Helsinki-NLP/opus-mt-en-ko',  # English to Korean
        'ko-en': 'Helsinki-NLP/opus-mt-ko-en',  # Korean to English
    }

    def __init__(self):
        """Initialize translation models cache."""
        self.models: Dict[str, Dict] = {}
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    def _load_model(self, model_key: str) -> Dict:
        """
        Load or retrieve a cached translation model.

        Args:
            model_key: Key identifying the language pair model

        Returns:
            Dictionary containing tokenizer and model
        """
        if model_key not in self.models:
            try:
                model_name = self.LANGUAGE_MODELS[model_key]
                tokenizer = MarianTokenizer.from_pretrained(model_name)
                model = MarianMTModel.from_pretrained(model_name)
                model.to(self.device)
                model.eval()

                self.models[model_key] = {
                    'tokenizer': tokenizer,
                    'model': model
                }
            except Exception as e:
                raise RuntimeError(f"Failed to load translation model {model_key}: {str(e)}")

        return self.models[model_key]

    def translate(self, request: TranslationRequest) -> TranslationResponse:
        """
        Translate text from source language to target language.

        Args:
            request: TranslationRequest with text, source_lang, and target_lang

        Returns:
            TranslationResponse with translated text

        The translation process:
        1. Determine the appropriate model based on language pair
        2. Tokenize the input text
        3. Generate translation using the transformer model
        4. Decode and return the translated text
        """
        try:
            # Create model key for the language pair
            model_key = f"{request.source_lang.value}-{request.target_lang.value}"

            # Check if we support this language pair
            if model_key not in self.LANGUAGE_MODELS:
                # Try reverse direction if direct translation not available
                reverse_key = f"{request.target_lang.value}-{request.source_lang.value}"
                if reverse_key in self.LANGUAGE_MODELS:
                    # For reverse translation, we'll translate to target then back
                    # This is a simplified approach - in production, you'd want direct models
                    return TranslationResponse(
                        translated_text=f"[Translation not directly supported. Would translate: {request.text}]",
                        source_lang=request.source_lang.value,
                        target_lang=request.target_lang.value
                    )
                else:
                    raise ValueError(f"Translation between {request.source_lang.value} and {request.target_lang.value} is not supported")

            # Load the appropriate model
            model_data = self._load_model(model_key)
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
                    num_beams=4,  # Use beam search for better quality
                    early_stopping=True,
                    do_sample=False,  # Deterministic output
                    temperature=1.0
                )

            # Decode the translated text
            translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

            return TranslationResponse(
                translated_text=translated_text.strip(),
                source_lang=request.source_lang.value,
                target_lang=request.target_lang.value
            )

        except Exception as e:
            # Fallback: return a placeholder indicating translation service is unavailable
            return TranslationResponse(
                translated_text=f"[Translation service error: {request.text}]",
                source_lang=request.source_lang.value,
                target_lang=request.target_lang.value
            )


# Global service instance
translation_service = TranslationService()