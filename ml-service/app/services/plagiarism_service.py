"""
Plagiarism detection service using TF-IDF and cosine similarity.

This service compares input text against a local reference corpus using
traditional NLP techniques to detect potential plagiarism.
"""

import os
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Tuple, Dict, Any
import re
from ..models.schemas import PlagiarismCheckRequest, PlagiarismCheckResponse, MatchedSentence


class PlagiarismService:
    """Service for detecting plagiarism using TF-IDF and cosine similarity."""

    def __init__(self):
        """Initialize the plagiarism detection service."""
        self.vectorizer = None
        self.corpus_sentences: List[str] = []
        self.corpus_sources: List[str] = []

        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', quiet=True)

        # Initialize with sample reference corpus
        self._initialize_corpus()

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

        # Initialize TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),  # Include both unigrams and bigrams
            max_features=5000,   # Limit vocabulary size
            strip_accents='unicode',
            lowercase=True
        )

        # Fit the vectorizer on the corpus
        if self.corpus_sentences:
            self.vectorizer.fit(self.corpus_sentences)

    def check_plagiarism(self, request: PlagiarismCheckRequest) -> PlagiarismCheckResponse:
        """
        Check input text for plagiarism against the reference corpus.

        Args:
            request: PlagiarismCheckRequest containing the text to check

        Returns:
            PlagiarismCheckResponse with similarity score and matched sentences

        The plagiarism detection process:
        1. Split input text into sentences
        2. Calculate TF-IDF vectors for both input and corpus sentences
        3. Compute cosine similarity between each input sentence and corpus sentences
        4. Identify highly similar sentence pairs
        5. Calculate overall similarity score
        6. Return results with matched sentences
        """
        try:
            # Split input text into sentences
            input_sentences = nltk.sent_tokenize(request.text)

            if not input_sentences:
                return PlagiarismCheckResponse(
                    similarity_score=0.0,
                    matched_sentences=[],
                    is_plagiarized=False
                )

            # Vectorize input sentences
            input_vectors = self.vectorizer.transform(input_sentences)

            # Vectorize corpus sentences
            corpus_vectors = self.vectorizer.transform(self.corpus_sentences)

            # Calculate similarities
            similarities = cosine_similarity(input_vectors, corpus_vectors)

            # Find matches above threshold
            matched_sentences = []
            threshold = 0.3  # 30% similarity threshold

            for i, input_sentence in enumerate(input_sentences):
                # Find best matches for this input sentence
                sentence_similarities = similarities[i]

                # Get top matches above threshold
                above_threshold = sentence_similarities >= threshold
                if above_threshold.any():
                    # Find the best match
                    best_match_idx = sentence_similarities.argmax()
                    best_similarity = sentence_similarities[best_match_idx]

                    matched_sentences.append(MatchedSentence(
                        text=self.corpus_sentences[best_match_idx],
                        similarity=float(best_similarity),
                        source=self.corpus_sources[best_match_idx]
                    ))

            # Calculate overall similarity score
            if similarities.size > 0:
                # Use average of top similarities as overall score
                top_similarities = []
                for similarities_row in similarities:
                    max_sim = similarities_row.max()
                    if max_sim >= threshold:
                        top_similarities.append(max_sim)

                if top_similarities:
                    overall_similarity = sum(top_similarities) / len(top_similarities)
                    similarity_score = min(overall_similarity * 100, 100.0)  # Convert to percentage
                else:
                    similarity_score = 0.0
            else:
                similarity_score = 0.0

            # Determine if text is plagiarized (above 40% overall similarity)
            is_plagiarized = similarity_score >= 40.0

            return PlagiarismCheckResponse(
                similarity_score=round(similarity_score, 1),
                matched_sentences=matched_sentences[:5],  # Limit to top 5 matches
                is_plagiarized=is_plagiarized
            )

        except Exception as e:
            # Return safe default if processing fails
            return PlagiarismCheckResponse(
                similarity_score=0.0,
                matched_sentences=[],
                is_plagiarized=False
            )


# Global service instance
plagiarism_service = PlagiarismService()