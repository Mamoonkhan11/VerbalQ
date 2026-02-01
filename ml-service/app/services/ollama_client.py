"""
Ollama LLM client for grammar correction and humanization.

This service uses a local Ollama server to perform grammar correction
and text humanization using LLMs (mistral).
"""

import requests
from typing import Dict, Optional
import json
from ..config import OLLAMA_URL, OLLAMA_MODEL


class OllamaClient:
    """Client for interacting with local Ollama LLM server."""

    def __init__(self, base_url: str = OLLAMA_URL, model: str = OLLAMA_MODEL):
        """
        Initialize Ollama client.
        
        Args:
            base_url: Ollama server URL
            model: Default model to use (mistral)
        """
        self.base_url = base_url.rstrip('/')
        self.model = model
        self.generate_url = f"{self.base_url}/api/generate"
        self.timeout = 60  # 60 seconds timeout for LLM generation
        
    def check_health(self) -> bool:
        """Check if Ollama server is available."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    def generate(self, prompt: str, model: Optional[str] = None) -> str:
        """
        Generate text completion using Ollama.
        
        Args:
            prompt: Input prompt for the LLM
            model: Model to use (defaults to configured model)
            
        Returns:
            Generated text response
            
        Raises:
            ConnectionError: If Ollama server is unavailable
            RuntimeError: If generation fails
        """
        try:
            payload = {
                "model": model or self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,  # Low temperature for more deterministic output
                    "top_p": 0.9,
                }
            }
            
            response = requests.post(
                self.generate_url,
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code != 200:
                raise RuntimeError(f"Ollama returned status {response.status_code}: {response.text}")
            
            data = response.json()
            generated_text = data.get("response", "").strip()
            
            if not generated_text:
                raise RuntimeError("Ollama returned empty response")
            
            return generated_text
            
        except requests.exceptions.Timeout:
            raise RuntimeError("LLM generation timeout - request took too long")
        except requests.exceptions.ConnectionError:
            raise ConnectionError(f"Cannot connect to Ollama server at {self.base_url}")
        except Exception as e:
            raise RuntimeError(f"LLM generation failed: {str(e)}")
    
    def correct_grammar(self, text: str, language: str) -> str:
        """
        Correct grammar using LLM.
        
        Args:
            text: Text to correct
            language: Language code (e.g., 'en', 'es', 'hi')
            
        Returns:
            Grammar-corrected text
        """
        prompt = f"""You are a professional grammar corrector.

Rules:
- Correct ONLY grammar mistakes
- Do NOT change meaning
- Do NOT paraphrase
- Do NOT add extra words
- Keep sentence structure same
- Return ONLY the corrected text without explanations

Language: {language}
Text: {text}

Corrected text:"""
        
        corrected = self.generate(prompt)
        
        # Clean up response (remove quotes if LLM wrapped it)
        corrected = corrected.strip()
        if corrected.startswith('"') and corrected.endswith('"'):
            corrected = corrected[1:-1]
        if corrected.startswith("'") and corrected.endswith("'"):
            corrected = corrected[1:-1]
            
        return corrected
    
    def humanize_text(self, text: str, language: str, tone: str = "casual") -> str:
        """
        Humanize text using LLM.
        
        Args:
            text: Text to humanize
            language: Language code
            tone: Desired tone (casual, professional, academic, creative)
            
        Returns:
            Humanized text
        """
        tone_instructions = {
            "casual": "conversational and friendly, like talking to a friend",
            "professional": "formal and business-appropriate",
            "academic": "scholarly and formal with academic language",
            "creative": "engaging and imaginative with creative flair"
        }
        
        tone_desc = tone_instructions.get(tone, tone_instructions["casual"])
        
        prompt = f"""Rewrite this text to sound natural and human-like in a {tone_desc} tone.

Rules:
- Preserve the original meaning
- Use natural language
- Make it sound authentic
- Language: {language}

Original text: {text}

Rewritten text:"""
        
        humanized = self.generate(prompt)
        
        # Clean up response
        humanized = humanized.strip()
        if humanized.startswith('"') and humanized.endswith('"'):
            humanized = humanized[1:-1]
        if humanized.startswith("'") and humanized.endswith("'"):
            humanized = humanized[1:-1]
            
        return humanized

    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translate text using LLM fallback.
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            Translated text
            
        Raises:
            ConnectionError: If Ollama server is unavailable
            RuntimeError: If translation fails
        """
        prompt = f"""You are a professional translator.

Translate ONLY.
Do not paraphrase.
Do not add or remove meaning.
Preserve exact intent.

From {source_lang} to {target_lang}:

{text}

Return ONLY translated text."""
        
        translated = self.generate(prompt)
        
        # Clean up response
        translated = translated.strip()
        if translated.startswith('"') and translated.endswith('"'):
            translated = translated[1:-1]
        if translated.startswith("'") and translated.endswith("'"):
            translated = translated[1:-1]
            
        return translated


# Global Ollama client instance
ollama_client = OllamaClient()
print("Using Ollama model:", OLLAMA_MODEL)