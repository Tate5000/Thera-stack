import os
import json
import logging
from typing import Dict, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In a real application, we would use a proper speech-to-text API like AWS Transcribe
# or Google Speech-to-Text. This is a simplified mock implementation.

class MP3Transcriber:
    """Service for transcribing MP3 audio files to text"""
    
    def __init__(self, s3_client=None):
        """Initialize the transcriber with optional S3 client"""
        self.s3_client = s3_client
    
    def transcribe_file(self, file_path: str) -> Dict[str, Any]:
        """
        Transcribe an MP3 file to text
        
        Args:
            file_path: Local path to the MP3 file
            
        Returns:
            Dictionary containing the transcript and metadata
        """
        logger.info(f"Transcribing file: {file_path}")
        
        try:
            # In a real application, this would call a speech-to-text API
            # For demo purposes, we'll return mock data
            
            # Extract filename without extension
            filename = os.path.basename(file_path)
            filename_without_ext = os.path.splitext(filename)[0]
            
            # Generate a mock transcript based on the filename
            # In a real app, this would be the result of the speech-to-text API
            transcript = self._generate_mock_transcript(filename_without_ext)
            
            result = {
                "transcript": transcript,
                "metadata": {
                    "file_name": filename,
                    "file_path": file_path,
                    "duration_seconds": 300,  # Mock 5-minute duration
                    "confidence": 0.95,
                    "language": "en-US"
                }
            }
            
            logger.info(f"Transcription completed for {file_path}")
            return result
            
        except Exception as e:
            logger.error(f"Error transcribing file {file_path}: {str(e)}")
            raise
    
    def transcribe_s3_file(self, bucket: str, key: str) -> Dict[str, Any]:
        """
        Transcribe an MP3 file stored in S3
        
        Args:
            bucket: S3 bucket name
            key: S3 object key
            
        Returns:
            Dictionary containing the transcript and metadata
        """
        logger.info(f"Transcribing S3 file: s3://{bucket}/{key}")
        
        if not self.s3_client:
            raise ValueError("S3 client not provided")
        
        try:
            # In a real app, we would download the file from S3 or directly use the S3 URI
            # with a service like AWS Transcribe
            
            # For demo purposes, we'll just use the key as our input for the mock
            filename = os.path.basename(key)
            filename_without_ext = os.path.splitext(filename)[0]
            
            # Generate a mock transcript
            transcript = self._generate_mock_transcript(filename_without_ext)
            
            result = {
                "transcript": transcript,
                "metadata": {
                    "bucket": bucket,
                    "key": key,
                    "duration_seconds": 300,  # Mock 5-minute duration
                    "confidence": 0.95,
                    "language": "en-US"
                }
            }
            
            logger.info(f"Transcription completed for s3://{bucket}/{key}")
            return result
            
        except Exception as e:
            logger.error(f"Error transcribing S3 file s3://{bucket}/{key}: {str(e)}")
            raise
    
    def _generate_mock_transcript(self, session_identifier: str) -> str:
        """Generate a mock transcript for demo purposes"""
        
        # In a real app, this would be the result from speech-to-text API
        if "anxiety" in session_identifier.lower():
            return """
Doctor: Hello, how have you been feeling since our last session?
Patient: Better than last week. I tried the breathing exercises you suggested.
Doctor: That's excellent progress. How did you find them?
Patient: They helped when I felt anxious at work. It was easier to refocus.
Doctor: I'm glad to hear that. What situations triggered anxiety this week?
Patient: Mainly the presentation I had to give. But I used the techniques before and during.
Doctor: And how did the presentation go?
Patient: Actually, it went really well. My manager complimented me afterwards.
Doctor: That's wonderful. How did that make you feel?
Patient: Proud of myself. Like I'm making progress.
Doctor: You absolutely should feel proud. Would you like to expand the techniques for this week?
Patient: Yes, I'd like that.
Doctor: Let's add a simple mindfulness exercise to your daily routine...
"""
        elif "depression" in session_identifier.lower():
            return """
Doctor: How have you been feeling this week?
Patient: Still pretty low. I've been having trouble getting out of bed.
Doctor: I understand that can be difficult. Have you been able to try any of the activities we discussed?
Patient: I did manage to go for a short walk twice, like we talked about.
Doctor: That's actually a significant step. How did you feel during or after those walks?
Patient: A little better, I guess. At least for a short while.
Doctor: Even temporary relief is valuable. Did you notice anything while you were outside?
Patient: I noticed the trees are starting to bloom. I hadn't realized it was already that time of year.
Doctor: That moment of connection is important. It suggests you're still able to observe and appreciate things around you.
Patient: I hadn't thought of it that way.
Doctor: For this week, could we try adding one more small activity to your routine?
"""
        else:
            return """
Doctor: Welcome to today's session. How have things been going for you?
Patient: It's been a mixed week. Some good days, some challenging ones.
Doctor: Could you tell me more about the challenging days?
Patient: I had some conflict with a coworker that was stressful.
Doctor: How did you handle that situation?
Patient: I tried using the communication techniques we discussed. They helped somewhat.
Doctor: That's good to hear. What parts worked well, and what was still difficult?
Patient: Being clear about my needs worked well. Not getting defensive is still hard.
Doctor: That's very insightful. Changing response patterns takes practice.
Patient: I'd like to get better at that.
Doctor: Let's work through some scenarios today that might help with that skill.
"""

def lambda_handler(event: Dict[str, Any], context: Optional[Any] = None) -> Dict[str, Any]:
    """AWS Lambda handler for MP3 transcription"""
    logger.info("Starting MP3 transcription Lambda function")
    logger.info(f"Event: {json.dumps(event)}")
    
    try:
        transcriber = MP3Transcriber()
        
        # Check if this is an S3 event or direct invocation
        if 'Records' in event and event['Records'][0].get('eventSource') == 'aws:s3':
            # S3 event
            record = event['Records'][0]
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            
            result = transcriber.transcribe_s3_file(bucket, key)
        else:
            # Direct invocation with file path
            file_path = event.get('file_path')
            if not file_path:
                raise ValueError("file_path not provided in event")
                
            result = transcriber.transcribe_file(file_path)
        
        logger.info("Transcription completed successfully")
        return {
            'statusCode': 200,
            'body': result
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
    test_event = {
        'file_path': '/tmp/test_session_anxiety.mp3'
    }
    result = lambda_handler(test_event)
    print(json.dumps(result, indent=2))