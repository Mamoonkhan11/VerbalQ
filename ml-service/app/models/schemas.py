from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from enum import Enum


class ToneEnum(str, Enum):
    professional = "professional"
    casual = "casual"
    academic = "academic"
    creative = "creative"


class LanguageEnum(str, Enum):
    en = "en"  # English
    hi = "hi"  # Hindi
    es = "es"  # Spanish
    fr = "fr"  # French
    de = "de"  # German
    ko = "ko"  # Korean
    ar = "ar"  # Arabic
    zh = "zh"  # Chinese


# Grammar Checking Schemas
class GrammarCheckRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to check for grammar issues")
    language: LanguageEnum = Field(default=LanguageEnum.en, description="Language code for grammar checking")

    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        return v.strip()


class GrammarIssue(BaseModel):
    message: str = Field(..., description="Description of the grammar issue")
    offset: int = Field(..., ge=0, description="Position in text where issue starts")
    length: Optional[int] = Field(None, description="Length of the problematic text segment")
    rule_id: Optional[str] = Field(None, description="LanguageTool rule identifier")
    suggestions: List[str] = Field(default_factory=list, description="Suggested corrections")


class GrammarCheckResponse(BaseModel):
    corrected_text: str = Field(..., description="Text with grammar corrections applied")
    method: str = Field(default="llm", description="Method used for correction (llm)")


# Translation Schemas
class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to translate")
    source_lang: LanguageEnum = Field(..., description="Source language code")
    target_lang: LanguageEnum = Field(..., description="Target language code")

    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        return v.strip()

    @validator('target_lang')
    def validate_different_languages(cls, v, values):
        if 'source_lang' in values and v == values['source_lang']:
            raise ValueError('Source and target languages must be different')
        return v


class TranslationResponse(BaseModel):
    translated_text: str = Field(..., description="Translated text")
    source_lang: str = Field(..., description="Source language used")
    target_lang: str = Field(..., description="Target language used")
    method: str = Field(default="opus", description="Method used for translation (opus)")


# Humanization Schemas
class HumanizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to humanize")
    tone: ToneEnum = Field(..., description="Desired tone for humanization")
    language: LanguageEnum = Field(default=LanguageEnum.en, description="Language code for humanization")

    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        return v.strip()


class HumanizeResponse(BaseModel):
    rewritten_text: str = Field(..., description="Humanized version of the input text")
    tone: str = Field(..., description="Tone applied to the text")
    method: str = Field(default="llm", description="Method used for humanization (llm)")


# Plagiarism Detection Schemas
class PlagiarismCheckRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000, description="Text to check for plagiarism")
    language: LanguageEnum = Field(default=LanguageEnum.en, description="Language code for plagiarism checking")

    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        return v.strip()


class MatchedSentence(BaseModel):
    text: str = Field(..., description="Matching sentence from reference corpus")
    similarity: float = Field(..., ge=0.0, le=1.0, description="Similarity score (0-1)")


class PlagiarismCheckResponse(BaseModel):
    success: bool = Field(default=True, description="Operation success status")
    plagiarismScore: float = Field(..., ge=0.0, le=100.0, description="Overall plagiarism percentage")
    riskLevel: str = Field(..., description="Risk level: Low, Medium, High, Severe")
    matchedSentences: List[MatchedSentence] = Field(default_factory=list, description="List of matched sentences")
    totalSentences: int = Field(..., description="Total number of sentences in input text")


# AI Detection Schemas
class AIDetectionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to analyze for AI generation detection")

    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or only whitespace')
        return v.strip()


class AIDetectionResponse(BaseModel):
    success: bool = Field(default=True, description="Operation success status")
    aiProbability: float = Field(..., ge=0.0, le=100.0, description="Probability that text is AI-generated (0-100%)")
    humanProbability: float = Field(..., ge=0.0, le=100.0, description="Probability that text is human-written (0-100%)")
    label: str = Field(..., description="Classification label: 'AI' or 'Human'")
    confidence: str = Field(..., description="Confidence level: 'Low', 'Medium', or 'High'")


# Language Response Schemas
class LanguageInfo(BaseModel):
    code: str
    name: str


class LanguageResponse(BaseModel):
    success: bool
    languages: List[LanguageInfo]


class TranslationLanguagePair(BaseModel):
    from_lang: str = Field(alias="from")
    to_lang: str = Field(alias="to")
    
    class Config:
        allow_population_by_field_name = True


class TranslationLanguagesResponse(BaseModel):
    success: bool
    supportedPairs: List[TranslationLanguagePair]


# Health Check Schema
class HealthResponse(BaseModel):
    status: str = Field(..., description="Service health status")
    version: str = Field(..., description="API version")
    services: dict = Field(default_factory=dict, description="Status of individual services")


# Error Response Schema
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    code: Optional[str] = Field(None, description="Error code")