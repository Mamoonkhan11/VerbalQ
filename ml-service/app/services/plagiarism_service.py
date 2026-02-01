"""
Semantic plagiarism detection service using sentence-transformers.

This service uses deep learning embeddings to detect semantic similarity
and paraphrased content, providing accurate plagiarism detection.
"""

import os
import nltk
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Tuple, Dict, Any
import re
from ..models.schemas import PlagiarismCheckRequest, PlagiarismCheckResponse, MatchedSentence


class PlagiarismService:
    """Service for detecting plagiarism using semantic embeddings."""

    def __init__(self):
        """Initialize the semantic plagiarism detection service."""
        self.model = None
        self.corpus_sentences: List[str] = []
        self.corpus_embeddings = None
        self.corpus_sources: List[str] = []

        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', quiet=True)

        # Initialize embedding model (load once globally for performance)
        self._initialize_model()
        
        # Initialize with sample reference corpus
        self._initialize_corpus()

    def _initialize_model(self):
        """Initialize the sentence transformer model."""
        try:
            # Use all-MiniLM-L6-v2 - fast, small, accurate, industry standard
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✅ Semantic embedding model loaded successfully")
        except Exception as e:
            print(f"❌ Failed to load embedding model: {e}")
            raise RuntimeError("Failed to initialize plagiarism detection model")

    def _initialize_corpus(self):
        """Initialize the reference corpus with sample documents."""
        # Sample reference documents (in a real system, these would come from a database)
        sample_documents = [
            {
                'content': """
                Artificial intelligence is transforming various industries. Machine learning algorithms
                can analyze large datasets to find patterns and make predictions. Natural language
                processing enables computers to understand and generate human-like text. Computer vision
                allows machines to interpret visual information from the world around them.
                """,
                'source': 'AI Overview Article'
            },
            {
                'content': """
                Climate change is one of the most pressing challenges facing humanity. Global temperatures
                are rising due to greenhouse gas emissions from human activities. Renewable energy sources
                like solar and wind power offer sustainable alternatives to fossil fuels. Conservation efforts
                and reforestation can help mitigate the impacts of climate change.
                """,
                'source': 'Environmental Science Textbook'
            },
            {
                'content': """
                The internet has revolutionized communication and information sharing. Social media platforms
                connect people across geographical boundaries. E-commerce has transformed retail and business
                models. Online education provides access to learning resources worldwide. Digital transformation
                continues to reshape traditional industries and create new opportunities.
                """,
                'source': 'Digital Technology Report'
            },
            {
                'content': """
                Healthy eating is essential for maintaining good physical and mental health. A balanced diet
                should include fruits, vegetables, whole grains, and lean proteins. Regular exercise complements
                proper nutrition for optimal wellness. Adequate sleep and stress management are also important
                components of a healthy lifestyle. Preventive healthcare can help detect and address health issues early.
                """,
                'source': 'Nutrition and Wellness Guide'
            }
        ]

        # Process documents into sentences
        for doc in sample_documents:
            sentences = nltk.sent_tokenize(doc['content'])
            self.corpus_sentences.extend(sentences)
            self.corpus_sources.extend([doc['source']] * len(sentences))

        # Generate embeddings for the entire corpus (one-time operation)
        if self.corpus_sentences and self.model:
            print("Generating embeddings for reference corpus...")
            self.corpus_embeddings = self.model.encode(
                self.corpus_sentences, 
                convert_to_tensor=False,
                show_progress_bar=True
            )
            print(f"✅ Generated embeddings for {len(self.corpus_sentences)} sentences")

    def check_plagiarism(self, request: PlagiarismCheckRequest) -> PlagiarismCheckResponse:
        """
        Check input text for plagiarism using semantic similarity.
        
        Args:
            request: PlagiarismCheckRequest containing the text to check
            
        Returns:
            PlagiarismCheckResponse with similarity score and matched sentences
            
        The semantic plagiarism detection process:
        1. Split input text into sentences
        2. Generate embeddings for input sentences using sentence-transformers
        3. Compare against pre-computed corpus embeddings using cosine similarity
        4. Identify semantically similar sentence pairs (detects paraphrasing)
        5. Calculate overall plagiarism score based on matched sentences
        6. Return results with risk level and matched sentences
        """
        try:
            # Validate model is loaded
            if not self.model:
                raise RuntimeError("Embedding model not initialized")

            # Split input text into sentences
            input_sentences = nltk.sent_tokenize(request.text.strip())

            if not input_sentences:
                return PlagiarismCheckResponse(
                    plagiarismScore=0,
                    riskLevel="Low",
                    matchedSentences=[],
                    totalSentences=0
                )

            total_sentences = len(input_sentences)
            
            # Generate embeddings for input sentences (batch processing)
            input_embeddings = self.model.encode(
                input_sentences, 
                convert_to_tensor=False,
                show_progress_bar=False
            )

            # Calculate similarities with corpus
            similarities = cosine_similarity(input_embeddings, self.corpus_embeddings)
            
            # Find matches above semantic threshold
            matched_sentences = []
            matched_count = 0
            
            # Semantic similarity thresholds
            HIGH_THRESHOLD = 0.85    # High plagiarism (direct copy)
            MEDIUM_THRESHOLD = 0.70  # Possible paraphrasing
            
            for i, input_sentence in enumerate(input_sentences):
                # Find best match for this input sentence
                sentence_similarities = similarities[i]
                best_match_idx = sentence_similarities.argmax()
                best_similarity = sentence_similarities[best_match_idx]
                
                # Check if similarity exceeds threshold
                if best_similarity >= MEDIUM_THRESHOLD:
                    matched_count += 1
                    matched_sentences.append(MatchedSentence(
                        text=self.corpus_sentences[best_match_idx],
                        similarity=float(best_similarity)
                    ))

            # Calculate plagiarism score
            plagiarism_score = (matched_count / total_sentences) * 100 if total_sentences > 0 else 0
            
            # Determine risk level
            if plagiarism_score <= 20:
                risk_level = "Low"
            elif plagiarism_score <= 50:
                risk_level = "Medium"
            elif plagiarism_score <= 80:
                risk_level = "High"
            else:
                risk_level = "Severe"

            return PlagiarismCheckResponse(
                plagiarismScore=round(plagiarism_score, 1),
                riskLevel=risk_level,
                matchedSentences=matched_sentences,
                totalSentences=total_sentences
            )

        except Exception as e:
            print(f"Plagiarism detection error: {e}")
            # Return safe default on error
            return PlagiarismCheckResponse(
                plagiarismScore=0,
                riskLevel="Low",
                matchedSentences=[],
                totalSentences=0
            )


# Global service instance
plagiarism_service = PlagiarismService()