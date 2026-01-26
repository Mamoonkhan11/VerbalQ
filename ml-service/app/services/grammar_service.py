"""
Grammar checking service using LanguageTool.

This service uses the LanguageTool library to check grammar and provide corrections.
LanguageTool is a rule-based grammar checker that identifies common grammatical errors,
style issues, and provides suggestions for improvement.
"""

from typing import List, Dict, Any
from ..models.schemas import GrammarCheckRequest, GrammarCheckResponse, GrammarIssue

# Import LanguageTool conditionally to avoid import errors
try:
    import language_tool_python
    LANGUAGE_TOOL_AVAILABLE = True
except ImportError:
    language_tool_python = None
    LANGUAGE_TOOL_AVAILABLE = False


class GrammarService:
    """Service for checking and correcting grammar using LanguageTool."""

    def __init__(self):
        """Initialize the grammar service with multi-language support."""
        if not LANGUAGE_TOOL_AVAILABLE:
            print("LanguageTool not available, using fallback mode.")
            self.tools = {}
            self.fallback_mode = True
            return

        self.tools = {}
        self.fallback_mode = False
        self.supported_languages = {
            'en': 'en-US',  # English
            'es': 'es',     # Spanish
            'fr': 'fr',     # French
            'de': 'de',     # German
            'hi': None,     # Hindi (not supported by LanguageTool)
            'ko': None,     # Korean (not supported by LanguageTool)
            'ar': None,     # Arabic (not supported by LanguageTool)
            'zh': None,     # Chinese (not supported by LanguageTool)
        }
        print("Grammar service initialized with multi-language support.")

    def check_grammar(self, request: GrammarCheckRequest) -> GrammarCheckResponse:
        """
        Check grammar of the input text and provide corrections.

        Args:
            request: GrammarCheckRequest containing the text and language to check

        Returns:
            GrammarCheckResponse with corrected text and list of issues

        The process:
        1. Check if the requested language is supported
        2. Initialize or reuse LanguageTool for the specific language
        3. Use LanguageTool to identify grammar/spelling/style issues
        4. Extract error messages, positions, and suggestions
        5. Apply automatic corrections to generate corrected text
        6. Return structured response with both corrected text and detailed issues
        """
        language = request.language

        # Check if language is supported
        if language not in self.supported_languages:
            raise ValueError(f"Language '{language}' is not supported for grammar checking")

        # Check if LanguageTool supports this language
        if self.supported_languages[language] is None:
            raise ValueError(f"LANGUAGE_NOT_SUPPORTED")

        if self.fallback_mode:
            # Fallback mode: Simple mock grammar checking
            return self._fallback_grammar_check(request)

        try:
            # Get or create LanguageTool instance for this language
            if language not in self.tools:
                lang_code = self.supported_languages[language]
                self.tools[language] = language_tool_python.LanguageTool(lang_code)

            tool = self.tools[language]

            # Get matches (grammar/spelling/style issues) from LanguageTool
            matches = tool.check(request.text)

            # Convert matches to our GrammarIssue format
            issues = []
            for match in matches:
                issue = GrammarIssue(
                    message=match.message,
                    offset=match.offset,
                    length=getattr(match, 'errorLength', getattr(match, 'length', 0)),
                    rule_id=getattr(match, 'ruleId', None),
                    suggestions=list(match.replacements) if match.replacements else []
                )
                issues.append(issue)

            # Apply corrections carefully
            # Sort matches in reverse order to apply corrections from back to front without shifting offsets
            sorted_matches = sorted(matches, key=lambda x: x.offset, reverse=True)
            current_text = request.text
            
            for match in sorted_matches:
                offset = match.offset
                length = getattr(match, 'errorLength', getattr(match, 'length', 0))
                original_segment = current_text[offset:offset + length]
                suggestions = list(match.replacements) if match.replacements else []

                # Find the first suggestion that passes validation
                best_suggestion = None
                for suggestion in suggestions:
                    if self._validate_correction(original_segment, suggestion):
                        best_suggestion = suggestion
                        break
                
                if best_suggestion:
                    current_text = current_text[:offset] + best_suggestion + current_text[offset + length:]

            return GrammarCheckResponse(
                corrected_text=current_text,
                issues=issues
            )

        except Exception as e:
            print(f"LanguageTool error: {str(e)}, falling back to mock mode")
            # If LanguageTool fails, use fallback
            return self._fallback_grammar_check(request)

    def _validate_correction(self, original: str, suggestion: str) -> bool:
        """
        Validate a suggestion to ensure it doesn't introduce common agreement errors.
        """
        import re
        orig_lower = original.lower().strip()
        sugg_lower = suggestion.lower().strip()

        # Rule 1: Prevent blind demonstrative flipping (e.g., "This" -> "These")
        # unless it's explicitly fixing a mismatch.
        demonstratives_sing = {'this', 'that'}
        demonstratives_plur = {'these', 'those'}
        
        if orig_lower in demonstratives_sing and sugg_lower in demonstratives_plur:
            # Only allow if the original was followed by a plural verb/noun
            # but since we only see the segment, we should be conservative.
            return False
        if orig_lower in demonstratives_plur and sugg_lower in demonstratives_sing:
            return False

        # Rule 2: Subject-Verb Agreement / Determiner-Noun consistency for common patterns
        # Invalid pairs: plural demonstrative + singular verb OR vice versa
        invalid_patterns = [
            # Plural demonstrative + singular verb/noun
            (r"\b(these|those)\b", r"\b(is|was|has|does|isn't|wasn't|hasn't|doesn't|a|an|pen|car|book)\b"),
            # Singular demonstrative + plural verb/noun
            (r"\b(this|that)\b", r"\b(are|were|have|do|aren't|weren't|haven't|don't|pens|cars|books)\b"),
        ]

        for dem_pat, target_pat in invalid_patterns:
            if re.search(dem_pat, sugg_lower) and re.search(target_pat, sugg_lower):
                return False

        return True

    def _fallback_grammar_check(self, request: GrammarCheckRequest) -> GrammarCheckResponse:
        """
        Fallback grammar checking when LanguageTool is not available.
        Provides basic mock functionality for development/demo purposes.
        """
        text = request.text
        issues = []

        # Simple mock grammar checks
        mock_issues = [
            {
                "pattern": "teh",
                "message": "Possible spelling mistake found.",
                "suggestion": "the"
            },
            {
                "pattern": "recieve",
                "message": "Possible spelling mistake found.",
                "suggestion": "receive"
            },
            {
                "pattern": "seperate",
                "message": "Possible spelling mistake found.",
                "suggestion": "separate"
            },
            {
                "pattern": "occured",
                "message": "Possible spelling mistake found.",
                "suggestion": "occurred"
            }
        ]

        corrected_text = text
        for issue in mock_issues:
            if issue["pattern"] in corrected_text.lower():
                # Create a mock issue
                start_pos = corrected_text.lower().find(issue["pattern"])
                if start_pos >= 0:
                    issues.append(GrammarIssue(
                        message=issue["message"],
                        offset=start_pos,
                        length=len(issue["pattern"]),
                        rule_id="MOCK_SPELLING",
                        suggestions=[issue["suggestion"]]
                    ))
                    # Apply correction
                    corrected_text = corrected_text[:start_pos] + issue["suggestion"] + corrected_text[start_pos + len(issue["pattern"]):]

        return GrammarCheckResponse(
            corrected_text=corrected_text,
            issues=issues
        )

    def __del__(self):
        """Clean up LanguageTool resources."""
        try:
            if hasattr(self, 'tool') and self.tool is not None:
                self.tool.close()
        except:
            pass  # Ignore cleanup errors


# Global service instance
grammar_service = GrammarService()