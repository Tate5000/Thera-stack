import os
import json
import logging
import tempfile
import time
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, Optional, Union, List
import hashlib

# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class TranscriptionError(Exception):
    """Custom exception for transcription-related errors"""
    pass

class MP3Transcriber:
    """Service for transcribing MP3 audio files to text using AWS Transcribe"""
    
    def __init__(self, aws_region: str = None, s3_client = None, transcribe_client = None):
        """
        Initialize the transcriber with configurable AWS clients
        
        Args:
            aws_region: AWS region to use for services (defaults to environment variable or boto3 default)
            s3_client: Optional pre-configured S3 client
            transcribe_client: Optional pre-configured Transcribe client
        """
        self.aws_region = aws_region or os.environ.get('AWS_REGION', 'us-east-1')
        
        # Initialize clients if not provided
        self.s3_client = s3_client or boto3.client('s3', region_name=self.aws_region)
        self.transcribe_client = transcribe_client or boto3.client('transcribe', region_name=self.aws_region)
        
        # Configure temp directory for local operations
        self.temp_dir = os.environ.get('TEMP_DIR', tempfile.gettempdir())
        
        # Define retry parameters
        self.max_retries = int(os.environ.get('TRANSCRIBE_MAX_RETRIES', 5))
        self.retry_delay = int(os.environ.get('TRANSCRIBE_RETRY_DELAY_SECONDS', 10))
        
        logger.info(f"MP3Transcriber initialized in region {self.aws_region}")
    
    def _generate_job_name(self, file_identifier: str) -> str:
        """Generate a unique job name for AWS Transcribe"""
        timestamp = int(time.time())
        name_hash = hashlib.md5(file_identifier.encode()).hexdigest()[:8]
        return f"transcribe-{timestamp}-{name_hash}"
    
    def _upload_to_s3(self, file_path: str, bucket: str) -> str:
        """
        Upload a local file to S3
        
        Args:
            file_path: Path to local file
            bucket: S3 bucket name
            
        Returns:
            S3 object key
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        filename = os.path.basename(file_path)
        key = f"uploads/{filename}"
        
        try:
            logger.info(f"Uploading {file_path} to s3://{bucket}/{key}")
            self.s3_client.upload_file(file_path, bucket, key)
            return key
        except ClientError as e:
            logger.error(f"S3 upload error: {str(e)}")
            raise TranscriptionError(f"Failed to upload file to S3: {str(e)}")
    
    def _start_transcription_job(self, bucket: str, key: str, additional_settings: Dict = None) -> str:
        """
        Start an AWS Transcribe job
        
        Args:
            bucket: S3 bucket containing audio file
            key: S3 object key
            additional_settings: Optional additional Transcribe settings
            
        Returns:
            Job name
        """
        job_name = self._generate_job_name(f"{bucket}/{key}")
        s3_uri = f"s3://{bucket}/{key}"
        
        # Base settings
        job_settings = {
            'TranscriptionJobName': job_name,
            'Media': {'MediaFileUri': s3_uri},
            'LanguageCode': 'en-US',
            'MediaFormat': 'mp3',
            'Settings': {
                'ShowSpeakerLabels': True,
                'MaxSpeakerLabels': 2,  # Assuming doctor-patient conversation
            }
        }
        
        # Add additional settings if provided
        if additional_settings:
            job_settings.update(additional_settings)
        
        try:
            logger.info(f"Starting transcription job {job_name} for {s3_uri}")
            self.transcribe_client.start_transcription_job(**job_settings)
            return job_name
        except ClientError as e:
            logger.error(f"Failed to start transcription job: {str(e)}")
            raise TranscriptionError(f"Failed to start transcription job: {str(e)}")
    
    def _wait_for_transcription_job(self, job_name: str) -> Dict[str, Any]:
        """
        Wait for an AWS Transcribe job to complete
        
        Args:
            job_name: Transcription job name
            
        Returns:
            Job details
        """
        logger.info(f"Waiting for transcription job {job_name} to complete")
        
        for retry in range(self.max_retries):
            try:
                response = self.transcribe_client.get_transcription_job(
                    TranscriptionJobName=job_name
                )
                
                status = response['TranscriptionJob']['TranscriptionJobStatus']
                
                if status == 'COMPLETED':
                    logger.info(f"Transcription job {job_name} completed")
                    return response['TranscriptionJob']
                elif status == 'FAILED':
                    failure_reason = response['TranscriptionJob'].get('FailureReason', 'Unknown reason')
                    logger.error(f"Transcription job {job_name} failed: {failure_reason}")
                    raise TranscriptionError(f"Transcription job failed: {failure_reason}")
                elif status == 'IN_PROGRESS':
                    logger.info(f"Transcription job {job_name} still in progress (attempt {retry+1}/{self.max_retries})")
                    time.sleep(self.retry_delay)
                else:
                    logger.warning(f"Unexpected job status: {status}")
                    time.sleep(self.retry_delay)
            except ClientError as e:
                logger.error(f"Error checking transcription job status: {str(e)}")
                raise TranscriptionError(f"Error checking transcription job: {str(e)}")
        
        raise TranscriptionError(f"Transcription job {job_name} did not complete within the allowed time")
    
    def _get_transcript_from_uri(self, transcript_uri: str) -> Dict[str, Any]:
        """
        Download and parse transcript from AWS Transcribe output URI
        
        Args:
            transcript_uri: URI to transcript JSON file
            
        Returns:
            Parsed transcript data
        """
        try:
            # Parse S3 URI
            if not transcript_uri.startswith('s3://'):
                raise ValueError(f"Invalid transcript URI: {transcript_uri}")
                
            uri_parts = transcript_uri[5:].split('/')
            bucket = uri_parts[0]
            key = '/'.join(uri_parts[1:])
            
            # Download transcript file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.json', dir=self.temp_dir) as temp_file:
                temp_path = temp_file.name
            
            logger.info(f"Downloading transcript from s3://{bucket}/{key} to {temp_path}")
            self.s3_client.download_file(bucket, key, temp_path)
            
            # Parse JSON
            with open(temp_path, 'r') as f:
                transcript_data = json.load(f)
                
            # Clean up temp file
            os.unlink(temp_path)
            
            return transcript_data
        except Exception as e:
            logger.error(f"Error retrieving transcript: {str(e)}")
            raise TranscriptionError(f"Failed to retrieve transcript: {str(e)}")
    
    def _process_transcript(self, transcript_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process and format the AWS Transcribe output
        
        Args:
            transcript_data: Raw AWS Transcribe output
            
        Returns:
            Processed transcript with metadata
        """
        try:
            # Extract the results section
            results = transcript_data.get('results', {})
            
            # Get transcript text
            transcripts = results.get('transcripts', [])
            full_transcript = ' '.join(t.get('transcript', '') for t in transcripts)
            
            # Process speaker labels if available
            items = results.get('items', [])
            speaker_labels = results.get('speaker_labels', {}).get('segments', [])
            
            if speaker_labels:
                # Map words to speakers
                word_speaker_map = {}
                for segment in speaker_labels:
                    for item in segment.get('items', []):
                        word_speaker_map[item['start_time']] = {
                            'speaker': segment['speaker_label'],
                            'end_time': item['end_time']
                        }
                
                # Create conversation format
                conversation = []
                current_speaker = None
                current_text = []
                
                for item in items:
                    # Skip non-pronunciation items like punctuation
                    if item.get('type') != 'pronunciation':
                        continue
                        
                    start_time = item.get('start_time')
                    if start_time in word_speaker_map:
                        speaker = word_speaker_map[start_time]['speaker']
                        
                        # If speaker changed, save the current segment
                        if speaker != current_speaker and current_speaker is not None and current_text:
                            conversation.append({
                                'speaker': current_speaker,
                                'text': ' '.join(current_text)
                            })
                            current_text = []
                        
                        current_speaker = speaker
                    
                    # Get the best alternative
                    alternatives = item.get('alternatives', [])
                    if alternatives:
                        word = alternatives[0].get('content', '')
                        current_text.append(word)
                
                # Add the last segment
                if current_speaker and current_text:
                    conversation.append({
                        'speaker': current_speaker,
                        'text': ' '.join(current_text)
                    })
                
                # Format for output
                formatted_transcript = []
                for segment in conversation:
                    speaker_label = "Doctor" if segment['speaker'] == "spk_0" else "Patient"
                    formatted_transcript.append(f"{speaker_label}: {segment['text']}")
                
                formatted_text = "\n".join(formatted_transcript)
            else:
                # No speaker labels, just use the full transcript
                formatted_text = full_transcript
            
            # Extract metadata
            metadata = {
                'duration_seconds': float(results.get('audio_duration', 0)),
                'language': transcript_data.get('results', {}).get('language_code', 'en-US'),
                'confidence': self._calculate_avg_confidence(items),
                'job_name': transcript_data.get('jobName', ''),
                'job_status': transcript_data.get('status', ''),
                'speakers_identified': len(set(seg['speaker_label'] for seg in speaker_labels)) if speaker_labels else 0
            }
            
            return {
                "transcript": formatted_text,
                "conversation": conversation if speaker_labels else None,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Error processing transcript: {str(e)}")
            raise TranscriptionError(f"Failed to process transcript: {str(e)}")
    
    def _calculate_avg_confidence(self, items: List[Dict[str, Any]]) -> float:
        """Calculate average confidence score from transcript items"""
        confidence_values = []
        
        for item in items:
            if item.get('type') == 'pronunciation':
                alternatives = item.get('alternatives', [])
                if alternatives and 'confidence' in alternatives[0]:
                    confidence_values.append(float(alternatives[0]['confidence']))
        
        return sum(confidence_values) / len(confidence_values) if confidence_values else 0.0
    
    def transcribe_file(self, file_path: str, bucket: str, additional_settings: Dict = None) -> Dict[str, Any]:
        """
        Transcribe a local MP3 file to text
        
        Args:
            file_path: Path to local MP3 file
            bucket: S3 bucket to use for temporary storage
            additional_settings: Optional additional AWS Transcribe settings
            
        Returns:
            Dictionary containing the transcript and metadata
        """
        logger.info(f"Transcribing file: {file_path}")
        
        try:
            # Validate input file
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
                
            if not file_path.lower().endswith('.mp3'):
                raise ValueError(f"File must be an MP3: {file_path}")
            
            # Upload to S3
            key = self._upload_to_s3(file_path, bucket)
            
            # Run transcription
            result = self.transcribe_s3_file(bucket, key, additional_settings)
            
            # Add local file info to metadata
            result['metadata']['file_name'] = os.path.basename(file_path)
            result['metadata']['file_path'] = file_path
            
            return result
            
        except Exception as e:
            logger.error(f"Error transcribing file {file_path}: {str(e)}")
            raise
    
    def transcribe_s3_file(self, bucket: str, key: str, additional_settings: Dict = None) -> Dict[str, Any]:
        """
        Transcribe an MP3 file stored in S3
        
        Args:
            bucket: S3 bucket name
            key: S3 object key
            additional_settings: Optional additional AWS Transcribe settings
            
        Returns:
            Dictionary containing the transcript and metadata
        """
        logger.info(f"Transcribing S3 file: s3://{bucket}/{key}")
        
        try:
            # Validate inputs
            if not bucket or not key:
                raise ValueError("Both bucket and key must be provided")
                
            if not key.lower().endswith('.mp3'):
                raise ValueError(f"File must be an MP3: {key}")
            
            # Start transcription job
            job_name = self._start_transcription_job(bucket, key, additional_settings)
            
            # Wait for completion
            job_details = self._wait_for_transcription_job(job_name)
            
            # Get transcript URI
            transcript_uri = job_details.get('Transcript', {}).get('TranscriptFileUri')
            if not transcript_uri:
                raise TranscriptionError("No transcript URI found in job details")
            
            # Download and process transcript
            transcript_data = self._get_transcript_from_uri(transcript_uri)
            result = self._process_transcript(transcript_data)
            
            # Add S3 info to metadata
            result['metadata']['bucket'] = bucket
            result['metadata']['key'] = key
            
            logger.info(f"Transcription completed for s3://{bucket}/{key}")
            return result
            
        except Exception as e:
            logger.error(f"Error transcribing S3 file s3://{bucket}/{key}: {str(e)}")
            raise

def lambda_handler(event: Dict[str, Any], context: Optional[Any] = None) -> Dict[str, Any]:
    """AWS Lambda handler for MP3 transcription"""
    logger.info("Starting MP3 transcription Lambda function")
    
    # Don't log the full event in production as it might contain sensitive data
    # Instead, log a sanitized version or just the event type
    if 'Records' in event:
        logger.info(f"Processing event with {len(event['Records'])} records")
    else:
        logger.info("Processing direct invocation event")
    
    try:
        # Get default S3 bucket for temporary storage from environment variable
        default_bucket = os.environ.get('TRANSCRIBE_S3_BUCKET')
        if not default_bucket:
            logger.error("TRANSCRIBE_S3_BUCKET environment variable not set")
            raise ValueError("TRANSCRIBE_S3_BUCKET environment variable is required")
        
        # Initialize transcriber
        transcriber = MP3Transcriber()
        
        # Process based on event type
        if 'Records' in event and event['Records'][0].get('eventSource') == 'aws:s3':
            # S3 event
            record = event['Records'][0]
            bucket = record['s3']['bucket']['name']
            key = record['s3']['object']['key']
            
            # Verify file is an MP3
            if not key.lower().endswith('.mp3'):
                logger.warning(f"Skipping non-MP3 file: {key}")
                return {
                    'statusCode': 400,
                    'body': {
                        'error': f"File is not an MP3: {key}"
                    }
                }
            
            # Get additional settings if provided
            additional_settings = event.get('transcribeSettings', None)
            
            result = transcriber.transcribe_s3_file(bucket, key, additional_settings)
        else:
            # Direct invocation with file path
            file_path = event.get('file_path')
            if not file_path:
                raise ValueError("file_path not provided in event")
            
            # Get S3 bucket from event or use default
            bucket = event.get('bucket', default_bucket)
            
            # Get additional settings if provided
            additional_settings = event.get('transcribeSettings', None)
            
            result = transcriber.transcribe_file(file_path, bucket, additional_settings)
        
        logger.info("Transcription completed successfully")
        
        # Handle result based on configuration
        output_bucket = event.get('outputBucket')
        output_prefix = event.get('outputPrefix', 'transcripts/')
        
        if output_bucket:
            # Save result to S3
            output_key = f"{output_prefix}{int(time.time())}-transcript.json"
            
            logger.info(f"Saving transcript to s3://{output_bucket}/{output_key}")
            
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as temp_file:
                json.dump(result, temp_file, indent=2)
                temp_path = temp_file.name
            
            try:
                # Upload to S3
                transcriber.s3_client.upload_file(temp_path, output_bucket, output_key)
                
                # Add output location to result
                result['s3_location'] = {
                    'bucket': output_bucket,
                    'key': output_key
                }
                
                # Clean up temp file
                os.unlink(temp_path)
            except Exception as e:
                logger.error(f"Error saving transcript to S3: {str(e)}")
                # Continue processing to return result even if S3 save fails
        
        return {
            'statusCode': 200,
            'body': result
        }
        
    except FileNotFoundError as e:
        logger.error(f"File not found: {str(e)}")
        return {
            'statusCode': 404,
            'body': {
                'error': str(e)
            }
        }
    except ValueError as e:
        logger.error(f"Invalid input: {str(e)}")
        return {
            'statusCode': 400,
            'body': {
                'error': str(e)
            }
        }
    except TranscriptionError as e:
        logger.error(f"Transcription error: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e)
            }
        }
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': f"An unexpected error occurred: {str(e)}"
            }
        }

if __name__ == "__main__":
    # For local testing
    test_event = {
        'file_path': '/tmp/test_session.mp3',
        'bucket': 'my-test-bucket'
    }
    result = lambda_handler(test_event)
    print(json.dumps(result, indent=2))
