"""
Ollama LLM client for grammar correction and humanization.

This service uses a local Ollama server to perform grammar correction
and text humanization using LLMs (mistral).
"""

import requests
from typing import Dict, Optional
import json
import re
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
        self.timeout = 120  # 120 seconds timeout for LLM generation
        
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
        except requests.exceptions.Timeout as e:
            raise TimeoutError("LLM generation timeout - request took too long") from e
        except requests.exceptions.ConnectionError as e:
            raise ConnectionError(f"Cannot connect to Ollama server at {self.base_url}") from e
        except RuntimeError:
            raise
        except Exception as e:
            raise RuntimeError(f"LLM generation failed: {str(e)}") from e
    
    def correct_grammar(self, text: str, language: str) -> Dict:
        """
        Correct grammar using LLM with structured JSON response.
        
        Args:
            text: Text to correct
            language: Language code (e.g., 'en', 'es', 'hi')
            
        Returns:
            Dict with:
              - corrected_text: str
              - corrections: List[{"incorrect", "correction", "explanation"}]
        """
        # Structured prompt as requested so the model returns detailed grammar fixes
        prompt = f"""You are a professional grammar correction system.

Analyze the text and identify all grammar mistakes.

Return ONLY JSON in this format:

{{
  "corrected_text": "...",
  "corrections": [
    {{
      "incorrect": "...",
      "correction": "...",
      "explanation": "..."
    }}
  ]
}}

Rules:
- Only include real grammar mistakes
- Do not rewrite the sentence unnecessarily
- Keep meaning unchanged
- Return valid JSON only

Text:
\"\"\"{text}\"\"\""""

        # Call Ollama directly so we can safely parse possible JSON-with-extra-text
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "top_p": 0.9,
                },
            }

            response = requests.post(
                self.generate_url,
                json=payload,
                timeout=self.timeout,
            )

            if response.status_code != 200:
                raise RuntimeError(f"Ollama returned status {response.status_code}: {response.text}")

            data = response.json()
            response_text = data.get("response", "").strip()

            # Try to extract JSON object from the response (in case model wraps it in prose)
            json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
            json_str = json_match.group() if json_match else response_text

            parsed = json.loads(json_str)

            corrected_text = str(parsed.get("corrected_text", "")).strip()
            corrections = parsed.get("corrections", []) or []

            # Fallback if corrected_text somehow missing/empty
            if not corrected_text:
                corrected_text = text.strip()

            return {
                "corrected_text": corrected_text,
                "corrections": corrections,
            }

        except (json.JSONDecodeError, ValueError, RuntimeError):
            # Parsing failed or model returned something unexpected:
            # fall back to best-effort plain correction using generic generate()
            fallback_prompt = f"""You are a professional grammar corrector.

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

            corrected = self.generate(fallback_prompt).strip()

            if corrected.startswith('"') and corrected.endswith('"'):
                corrected = corrected[1:-1]
            if corrected.startswith("'") and corrected.endswith("'"):
                corrected = corrected[1:-1]

            return {
                "corrected_text": corrected or text.strip(),
                "corrections": [],
            }
    
    def humanize_text(self, text: str, language: str, tone: str = "casual", strengthen_human_style: bool = False) -> str:
        """
        Humanize text using LLM.

        Args:
            text: Text to humanize
            language: Language code
            tone: Desired tone (casual, professional, academic, creative)
            strengthen_human_style: Add stronger anti-template instructions

        Returns:
            Humanized text
        """
        tone_instructions = {
            "casual": "conversational and friendly, like talking to a friend",
            "professional": "formal and business-appropriate",
            "academic": "scholarly and formal with academic language",
            "creative": "engaging and imaginative with creative flair",
        }

        tone_desc = tone_instructions.get(tone, tone_instructions["casual"])

        extra_rules = ""
        if strengthen_human_style:
            extra_rules = """
- Vary sentence lengths and rhythm across the paragraph
- Prefer concrete phrasing over generic filler
- Avoid repetitive transition phrases and template-like structure
- Keep wording slightly imperfect and natural, not overly polished
- Keep length close to the original (about +/- 20%)
- Return one coherent paragraph (not bullet points)
"""

        prompt = f"""Rewrite this text to sound natural and human-like in a {tone_desc} tone.

Rules:
- Preserve the original meaning
- Use natural language
- Make it sound authentic
- Avoid robotic or overly uniform phrasing
- Language: {language}
{extra_rules}

Original text: {text}

Rewritten text:"""

        humanized = self.generate(prompt)

        # Clean up response
        humanized = humanized.strip()
        if humanized.startswith("\"") and humanized.endswith("\""):
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

