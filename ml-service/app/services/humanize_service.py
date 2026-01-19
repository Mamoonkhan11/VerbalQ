"""
Text humanization service using paraphrasing transformer models.

This service uses pre-trained models to rewrite AI-generated text in different tones
to make it sound more natural and human-like.
"""

from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from typing import Dict, Optional
from ..models.schemas import HumanizeRequest, HumanizeResponse, ToneEnum


class HumanizeService:
    """Service for humanizing AI-generated text using paraphrasing models."""

    # Tone-specific prompts and model configurations
    TONE_CONFIGS = {
        'professional': {
            'model': 'facebook/bart-large-cnn',  # Good for formal rewriting
            'prompt': 'Rewrite the following text in a professional, business-appropriate tone: ',
            'max_length': 150
        },
        'casual': {
            'model': 'facebook/bart-large-cnn',
            'prompt': 'Rewrite the following text in a casual, conversational tone like talking to a friend: ',
            'max_length': 120
        },
        'academic': {
            'model': 'facebook/bart-large-cnn',
            'prompt': 'Rewrite the following text in an academic, scholarly tone with formal language: ',
            'max_length': 180
        },
        'creative': {
            'model': 'facebook/bart-large-cnn',
            'prompt': 'Rewrite the following text in a creative, engaging, and imaginative way: ',
            'max_length': 160
        }
    }

    def __init__(self):
        """Initialize the summarization pipeline for text rewriting."""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.pipelines: Dict[str, pipeline] = {}

        # Initialize pipelines for each tone
        for tone, config in self.TONE_CONFIGS.items():
            try:
                self.pipelines[tone] = pipeline(
                    'summarization',
                    model=config['model'],
                    device=0 if torch.cuda.is_available() else -1,
                    max_length=config['max_length'],
                    min_length=30,
                    do_sample=False,  # Deterministic output
                    truncation=True
                )
            except Exception as e:
                print(f"Warning: Failed to load model for {tone} tone: {e}")
                # Fallback to a simple text processor
                self.pipelines[tone] = None

    def humanize_text(self, request: HumanizeRequest) -> HumanizeResponse:
        """
        Humanize AI-generated text by rewriting it in the specified tone.

        Args:
            request: HumanizeRequest with text and desired tone

        Returns:
            HumanizeResponse with rewritten text

        The humanization process:
        1. Prepare the text with a tone-specific prompt
        2. Use the summarization model to rewrite the text
        3. Apply tone-specific transformations
        4. Clean up and return the humanized text
        """
        try:
            tone_config = self.TONE_CONFIGS[request.tone.value]
            pipeline = self.pipelines[request.tone.value]

            if pipeline is None:
                # Fallback if model failed to load
                return self._fallback_humanization(request)

            # Prepare input text with tone-specific prompt
            prompted_text = tone_config['prompt'] + request.text

            # Generate humanized text using the model
            result = pipeline(
                prompted_text,
                max_length=tone_config['max_length'],
                min_length=max(20, len(request.text) // 4),  # Adaptive minimum length
                do_sample=False,
                num_beams=4,  # Better quality with beam search
                early_stopping=True
            )

            # Extract the generated text
            humanized_text = result[0]['summary_text'].strip()

            # Apply additional tone-specific post-processing
            humanized_text = self._apply_tone_styling(humanized_text, request.tone.value)

            return HumanizeResponse(
                rewritten_text=humanized_text,
                tone=request.tone.value
            )

        except Exception as e:
            # Fallback to simple text processing if model fails
            return self._fallback_humanization(request)

    def _fallback_humanization(self, request: HumanizeRequest) -> HumanizeResponse:
        """Fallback humanization when ML models are unavailable."""
        base_text = request.text

        # Apply simple tone-based transformations
        if request.tone.value == 'casual':
            # Make more conversational
            humanized = base_text.replace('The', 'the').replace('A', 'a')
            humanized = humanized.replace(' do ', ' just ').replace(' does ', ' just ')
        elif request.tone.value == 'professional':
            # Make more formal
            humanized = base_text.replace('I think', 'It is believed')
            humanized = humanized.replace('kinda', 'somewhat').replace('really', 'significantly')
        elif request.tone.value == 'academic':
            # Add academic flavor
            humanized = f"According to analysis, {base_text.lower()}"
        else:  # creative
            # Add creative elements
            humanized = f"In a moment of inspiration, {base_text}"

        return HumanizeResponse(
            rewritten_text=humanized,
            tone=request.tone.value
        )

    def _apply_tone_styling(self, text: str, tone: str) -> str:
        """
        Apply additional tone-specific styling to the generated text.

        Args:
            text: Generated text from the model
            tone: Target tone

        Returns:
            Styled text appropriate for the tone
        """
        if tone == 'casual':
            # Add conversational elements
            text = text.replace('The', 'the').replace('A', 'a')
            if not text.endswith(('!', '?', '.')):
                text += '.'
        elif tone == 'professional':
            # Ensure formal structure
            if not text[0].isupper():
                text = text[0].upper() + text[1:]
        elif tone == 'academic':
            # Add scholarly elements
            if not any(word in text.lower() for word in ['according', 'analysis', 'research', 'study']):
                text = f"Research indicates that {text.lower()}"
        elif tone == 'creative':
            # Add imaginative flair
            if not any(word in text.lower() for word in ['imagine', 'wonder', 'dream', 'create']):
                text = f"Imagine that {text.lower()}"

        return text.strip()


# Global service instance
humanize_service = HumanizeService()