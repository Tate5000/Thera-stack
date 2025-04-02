import logging
from typing import Dict, Any, List, Optional
import json
import re

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AISessionSummarizer:
    """Service for generating AI summaries of therapy session transcripts"""
    
    def __init__(self, llm_service=None):
        """
        Initialize the summarizer with an optional LLM service
        
        In a production app, this would be a connection to an LLM API
        such as OpenAI, Anthropic Claude, etc.
        """
        self.llm_service = llm_service
    
    def generate_summary(self, transcript: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate a summary of a therapy session transcript
        
        Args:
            transcript: The full text transcript of the therapy session
            metadata: Optional metadata about the session and patient
            
        Returns:
            Dictionary containing the summary, key insights, action items, etc.
        """
        logger.info("Generating summary for therapy session transcript")
        
        # In a real app, this would call an LLM API with appropriate prompting
        # For demo purposes, we'll use keyword matching to select a template
        
        # Analyze transcript keywords to determine session type
        session_type = self._determine_session_type(transcript)
        
        # Generate the summary based on session type
        summary_result = self._generate_mock_summary(transcript, session_type)
        
        logger.info(f"Summary generated successfully for {session_type} session")
        return summary_result
    
    def _determine_session_type(self, transcript: str) -> str:
        """Analyze transcript to determine session type/focus"""
        
        # Simple keyword matching for demo purposes
        # In a real app, this would use more sophisticated NLP
        transcript_lower = transcript.lower()
        
        if re.search(r'\banxiety\b|\banxious\b|\bpanic\b|\bworry\b', transcript_lower):
            return "anxiety"
        elif re.search(r'\bdepress\w+\b|\bsad\b|\blow mood\b|\bhopeless\b', transcript_lower):
            return "depression"
        elif re.search(r'\btrauma\b|\bptsd\b|\bflashback\b|\bnightmare\b', transcript_lower):
            return "trauma"
        elif re.search(r'\brelationship\b|\bpartner\b|\bmarriage\b|\bfamily\b', transcript_lower):
            return "relationship"
        else:
            return "general"
    
    def _generate_mock_summary(self, transcript: str, session_type: str) -> Dict[str, Any]:
        """Generate a mock summary based on session type"""
        
        # In a real app, this would be the result from an LLM API call
        if session_type == "anxiety":
            return {
                "summary_text": "Patient reported positive progress with anxiety management techniques, specifically noting success with breathing exercises during a work presentation. The patient expressed feeling proud of their achievements and showed interest in expanding their coping strategies. Overall mood appears improved compared to the previous session.",
                "key_insights": [
                    "Breathing exercises effectively reduced work anxiety",
                    "Successfully managed anxiety during an important presentation",
                    "Received positive feedback from manager, boosting confidence",
                    "Shows motivation to expand coping techniques"
                ],
                "action_items": [
                    "Continue practicing breathing exercises",
                    "Add daily mindfulness practice to routine",
                    "Monitor and record anxiety triggers",
                    "Practice self-affirmation when achieving goals"
                ],
                "mood": "Improved - positive and hopeful",
                "progress": "Good progress since last session, showing practical application of techniques",
                "concerns": [],
                "recommended_resources": [
                    "Mindfulness meditation app",
                    "Anxiety workbook chapter on cognitive restructuring"
                ]
            }
        elif session_type == "depression":
            return {
                "summary_text": "Patient continues to experience depressive symptoms but showed modest engagement with behavioral activation strategies, having completed two short walks as agreed in the previous session. There was a brief moment of connection with the environment (noticing blooming trees), indicating capacity for present-moment awareness despite low mood. Patient remains willing to gradually expand activities.",
                "key_insights": [
                    "Successfully implemented minimal physical activity (two walks)",
                    "Demonstrated ability to notice environmental details despite depression",
                    "Still experiencing significant difficulty with morning activation",
                    "Shows willingness to continue gradual behavioral activation approach"
                ],
                "action_items": [
                    "Continue daily short walks, maintaining current frequency",
                    "Add one additional small pleasurable activity to daily routine",
                    "Create a simplified morning routine to reduce activation barriers",
                    "Practice mindful observation during walks"
                ],
                "mood": "Depressed but with moments of engagement",
                "progress": "Minimal but meaningful progress with behavioral activation",
                "concerns": [
                    "Continued difficulty with basic self-care",
                    "Possible social isolation"
                ],
                "recommended_resources": [
                    "Depression workbook chapter on activation schedules",
                    "Morning routine simplification worksheet"
                ]
            }
        else:  # general or other types
            return {
                "summary_text": "Session focused on interpersonal conflict management, particularly regarding workplace relationships. Patient demonstrated insight by recognizing improvement in expressing needs clearly but continued difficulty with defensive responses. Patient shows motivation to develop better communication skills and engaged collaboratively in scenario-based practice during the session.",
                "key_insights": [
                    "Successfully implemented assertive communication techniques",
                    "Identified defensive responses as a specific challenge area",
                    "Demonstrated self-awareness about communication patterns",
                    "Reports mixed week with both progress and challenges"
                ],
                "action_items": [
                    "Practice pause-and-breathe technique when feeling defensive",
                    "Use journaling to identify emotional triggers in conversations",
                    "Rehearse communication scenarios using DEAR MAN framework",
                    "Schedule one challenging conversation using new skills"
                ],
                "mood": "Variable but generally stable",
                "progress": "Steady progress with communication skills development",
                "concerns": [
                    "Workplace stressors continue to impact well-being"
                ],
                "recommended_resources": [
                    "Communication skills handout",
                    "Worksheet on identifying emotional triggers"
                ]
            }

def lambda_handler(event: Dict[str, Any], context: Optional[Any] = None) -> Dict[str, Any]:
    """AWS Lambda handler for generating session summaries"""
    logger.info("Starting AI session summary Lambda function")
    logger.info(f"Event: {json.dumps(event)}")
    
    try:
        summarizer = AISessionSummarizer()
        
        # Extract transcript from the event
        transcript = event.get('transcript')
        if not transcript:
            raise ValueError("transcript not provided in event")
            
        # Extract optional metadata
        metadata = event.get('metadata', {})
        
        # Generate summary
        summary = summarizer.generate_summary(transcript, metadata)
        
        logger.info("Summary generated successfully")
        return {
            'statusCode': 200,
            'body': summary
        }
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e)
            }
        }

if __name__ == "__main__":
    # For local testing
    test_transcript = """
    Doctor: Hello, how have you been feeling since our last session?
    Patient: Better than last week. I tried the breathing exercises you suggested.
    Doctor: That's excellent progress. How did you find them?
    Patient: They helped when I felt anxious at work. It was easier to refocus.
    """
    
    test_event = {
        'transcript': test_transcript
    }
    
    result = lambda_handler(test_event)
    print(json.dumps(result, indent=2))