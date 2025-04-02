import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isRecording: boolean;
  onRecordingStatusChange?: (isRecording: boolean) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  isRecording,
  onRecordingStatusChange 
}) => {
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize or clean up media recording
  useEffect(() => {
    // Start recording when isRecording becomes true
    if (isRecording) {
      startRecording();
    } 
    // Stop recording when isRecording becomes false
    else if (mediaRecorder && mediaRecorder.state === 'recording') {
      stopRecording();
    }
    
    // Cleanup when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);
  
  const startRecording = async () => {
    setRecordingError(null);
    setAudioChunks([]);
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      // Create media recorder
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      // Set up event listeners
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(chunks => [...chunks, event.data]);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        onRecordingComplete(audioBlob);
      };
      
      // Start recording
      recorder.start(1000); // Capture data in 1-second chunks
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setRecordingError('Could not access microphone. Please check your browser permissions.');
      if (onRecordingStatusChange) {
        onRecordingStatusChange(false);
      }
    }
  };
  
  const stopRecording = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop media recorder
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    // Stop audio tracks
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
  };
  
  // Format recording time as MM:SS
  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="audio-recorder">
      {recordingError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md mb-4">
          {recordingError}
        </div>
      )}
      
      <div className="flex items-center">
        {isRecording ? (
          <div className="flex items-center">
            <div className="animate-pulse w-3 h-3 rounded-full bg-red-500 mr-3"></div>
            <span className="text-lg font-medium">Recording - {formatRecordingTime(recordingTime)}</span>
          </div>
        ) : (
          <div className="flex items-center">
            {recordingTime > 0 ? (
              <>
                <div className="w-3 h-3 rounded-full bg-gray-300 mr-3"></div>
                <span className="text-lg font-medium">Recording complete - {formatRecordingTime(recordingTime)}</span>
              </>
            ) : (
              <span className="text-lg font-medium">Ready to record</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;