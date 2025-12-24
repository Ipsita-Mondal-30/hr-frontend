'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import Webcam from 'react-webcam';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location?: string;
  skills?: string[];
}

interface FinalResults {
  prepScore: number;
  status: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
}

interface BodyLanguageSignals {
  eye_contact: 'high' | 'medium' | 'low';
  movement: 'low' | 'medium' | 'high';
  posture: 'stable' | 'unstable';
}

export default function VoiceInterviewPrepPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalResults, setFinalResults] = useState<FinalResults | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const bodyLanguageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [bodyLanguageSignals, setBodyLanguageSignals] = useState<BodyLanguageSignals | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [studioLightOn, setStudioLightOn] = useState(false);
  const movementTrackerRef = useRef<{ prevX: number; prevY: number; movements: number[] }>({
    prevX: 0,
    prevY: 0,
    movements: []
  });

  console.log('User:', user); // Prevent unused warning

  useEffect(() => {
    fetchAllJobs();
    initializeSpeechRecognition();
    initializeSpeechSynthesis();
    
    // Start body language detection when interview starts
    if (interviewStarted) {
      startBodyLanguageDetection();
    } else {
      stopBodyLanguageDetection();
    }
    
    return () => {
      stopBodyLanguageDetection();
    };
  }, [interviewStarted]);

  const fetchAllJobs = async () => {
    try {
      const res = await api.get('/voice-interview/all-jobs');
      setJobs(res.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
      }
    }
  };

  const initializeSpeechSynthesis = () => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  };

  const startInterview = async (job: Job) => {
    setLoading(true);
    try {
      const res = await api.post('/voice-interview/start', {
        jobId: job._id,
        jobRole: job.title,
        skills: job.skills || []
      });

      setSessionId(res.data.sessionId);
      setSelectedJob(job);
      setInterviewStarted(true);
      setQuestionCount(1);
      // Camera will start automatically via useEffect
      
      // Greet first
      const greeting = `Hello! Welcome to the interview preparation for ${job.title}. I'll ask you a few questions, and you can answer them at your own pace. Let's begin.`;
      await speakText(greeting);
      
      // Wait a moment after greeting before asking first question (gives time to process)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set and speak first question
      setCurrentQuestion(res.data.firstQuestion);
      await speakText(res.data.firstQuestion);
      
      // Question is now ready - user can click to answer
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }

      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    setIsListening(true);
    
    recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log('Transcript:', transcript);
      
      setIsListening(false);
      await handleAnswer(transcript);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      alert('Could not capture your voice. Please try again.');
    };

    recognitionRef.current.start();
  };

  // Simple body language detection (client-side estimation)
  const detectBodyLanguage = (): BodyLanguageSignals => {
    // Simplified detection based on basic heuristics
    // In a real implementation, you'd use pose detection libraries like MediaPipe or TensorFlow.js
    
    // Estimate eye contact (simplified - assumes user is looking at screen if camera is on)
    // Low: frequent head movements, High: stable head position
    const eyeContact: 'high' | 'medium' | 'low' = 
      movementTrackerRef.current.movements.length > 0
        ? movementTrackerRef.current.movements.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, movementTrackerRef.current.movements.length) > 15
          ? 'low'
          : movementTrackerRef.current.movements.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, movementTrackerRef.current.movements.length) > 8
          ? 'medium'
          : 'high'
        : 'medium';
    
    // Estimate movement (based on head position changes)
    const avgMovement = movementTrackerRef.current.movements.length > 0
      ? movementTrackerRef.current.movements.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, movementTrackerRef.current.movements.length)
      : 5;
    const movement: 'low' | 'medium' | 'high' = 
      avgMovement > 15 ? 'high' : avgMovement > 8 ? 'medium' : 'low';
    
    // Estimate posture (simplified - stable if low movement variance)
    const movementVariance = movementTrackerRef.current.movements.length > 5
      ? calculateVariance(movementTrackerRef.current.movements.slice(-10))
      : 5;
    const posture: 'stable' | 'unstable' = movementVariance > 20 ? 'unstable' : 'stable';
    
    return { eye_contact: eyeContact, movement, posture };
  };

  const calculateVariance = (values: number[]): number => {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  };

  const startBodyLanguageDetection = () => {
    // Clear any existing interval first
    if (bodyLanguageIntervalRef.current) {
      clearInterval(bodyLanguageIntervalRef.current);
      bodyLanguageIntervalRef.current = null;
    }
    
    setIsCameraOn(true);
    // Reset movement tracker
    movementTrackerRef.current = { prevX: 0, prevY: 0, movements: [] };
    
    // Simple periodic movement tracking (simplified - in real app use pose detection)
    const interval = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        // Estimate head position based on video center (simplified approach)
        // In real implementation, use MediaPipe Face Mesh or similar
        const centerX = video.videoWidth / 2;
        const centerY = video.videoHeight / 2;
        
        if (movementTrackerRef.current.prevX > 0) {
          const movement = Math.sqrt(
            Math.pow(centerX - movementTrackerRef.current.prevX, 2) +
            Math.pow(centerY - movementTrackerRef.current.prevY, 2)
          );
          movementTrackerRef.current.movements.push(movement);
          // Keep only last 20 readings
          if (movementTrackerRef.current.movements.length > 20) {
            movementTrackerRef.current.movements.shift();
          }
        }
        movementTrackerRef.current.prevX = centerX;
        movementTrackerRef.current.prevY = centerY;
        
        // Update body language signals
        setBodyLanguageSignals(detectBodyLanguage());
      }
    }, 500); // Check every 500ms
    
    // Store interval ID for cleanup
    bodyLanguageIntervalRef.current = interval;
  };

  const stopBodyLanguageDetection = () => {
    setIsCameraOn(false);
    if (bodyLanguageIntervalRef.current) {
      clearInterval(bodyLanguageIntervalRef.current);
      bodyLanguageIntervalRef.current = null;
    }
    movementTrackerRef.current = { prevX: 0, prevY: 0, movements: [] };
    setBodyLanguageSignals(null);
  };

  const handleAnswer = async (transcript: string) => {
    setLoading(true);
    try {
      // Get current body language signals
      const bodyLanguage = bodyLanguageSignals || detectBodyLanguage();
      
      const res = await api.post(`/voice-interview/answer/${sessionId}`, {
        transcript,
        bodyLanguage // Include body language signals
      });

      if (res.data.endInterview) {
        // Interview completed
        setFinalResults(res.data.finalResults);
        setShowResults(true);
        await speakText(res.data.closingMessage || 'Thank you for completing the interview. Check your email for detailed feedback.');
      } else {
        // Small pause before next question (feels more natural)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Next question
        setQuestionCount(prev => prev + 1);
        setCurrentQuestion(res.data.nextQuestion);
        await speakText(res.data.nextQuestion);
        
        // Question is now ready - user can click to answer
      }
    } catch (error) {
      console.error('Failed to process answer:', error);
      alert('Failed to process your answer');
    } finally {
      setLoading(false);
    }
  };

  if (showResults && finalResults) {
    const statusColor = finalResults.status === 'READY' ? 'green' : finalResults.status === 'NEEDS PRACTICE' ? 'orange' : 'red';
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h1>
              <p className="text-gray-600">Detailed feedback has been sent to your email</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {finalResults.prepScore}/100
                </div>
                <p className="text-gray-600">Preparation Score</p>
                <div className={`mt-4 inline-block px-6 py-2 rounded-full text-white font-semibold bg-${statusColor}-600`}>
                  {finalResults.status}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">✓ Strengths</h3>
                <ul className="space-y-2">
                  {finalResults.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">• {strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-semibold text-orange-800 mb-3">→ Weak Areas</h3>
                <ul className="space-y-2">
                  {finalResults.weaknesses.map((weakness: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">• {weakness}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">💡 Learning Suggestions</h3>
              <ul className="space-y-2">
                {finalResults.improvementTips.map((tip: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">• {tip}</li>
                ))}
              </ul>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 mb-6 text-center">
              <p className="text-purple-900 font-semibold mb-2">📧 Check your email for the complete feedback report!</p>
              <p className="text-purple-700 text-sm">Feel free to retry the interview prep anytime to improve your score.</p>
            </div>

            <button
              onClick={() => {
                setShowResults(false);
                setInterviewStarted(false);
                setSessionId(null);
                setSelectedJob(null);
                setCurrentQuestion('');
                setQuestionCount(0);
                stopBodyLanguageDetection();
                fetchAllJobs();
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Practice Another Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (interviewStarted && selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">🎙️ Voice Interview</h2>
                <span className="text-sm text-gray-600 bg-purple-100 px-4 py-2 rounded-full">
                  Question {questionCount}
                </span>
              </div>
              <p className="text-gray-600">{selectedJob.title} at {selectedJob.companyName}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {/* Question Display */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  {isSpeaking && (
                    <div className="mb-4">
                      <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                        <span className="text-4xl">🤖</span>
                      </div>
                      <p className="mt-4 text-purple-900 font-semibold">AI is speaking...</p>
                    </div>
                  )}
                  
                  {!isSpeaking && currentQuestion && (
                    <div>
                      <div className="text-6xl mb-4">💬</div>
                      <p className="text-xl text-gray-800 font-medium mb-6">{currentQuestion}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera Feed */}
              <div className="bg-gray-900 rounded-lg overflow-hidden relative">
                {isCameraOn ? (
                  <div className="relative w-full" style={{ minHeight: '480px' }}>
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: 'user'
                      }}
                      className={`w-full h-full object-cover ${studioLightOn ? 'brightness-150 contrast-125' : ''}`}
                      mirrored={true}
                    />
                    {/* Studio Light Overlay */}
                    {studioLightOn && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                          mixBlendMode: 'screen'
                        }}
                      />
                    )}
                    {/* Studio Light Toggle Button */}
                    <button
                      onClick={() => setStudioLightOn(!studioLightOn)}
                      className={`absolute top-4 right-4 z-10 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        studioLightOn 
                          ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50' 
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                      title={studioLightOn ? 'Turn off studio light' : 'Turn on studio light for dark rooms'}
                    >
                      {studioLightOn ? '💡 Light On' : '💡 Light Off'}
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-2">📹</div>
                      <p className="text-sm">Camera will start automatically</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {!isSpeaking && !loading && (
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className={`w-full py-6 rounded-lg font-semibold text-lg transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isListening ? '🎤 Listening... Speak now!' : '🎤 Click to Answer'}
                </button>
              )}

              {loading && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing your answer...</p>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> Speak clearly and take your time. The AI will analyze your response and ask the next question.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎙️ Voice Interview Prep
          </h1>
          <p className="text-gray-600">
            Practice interviews for ALL HR-posted jobs with AI voice bot and get feedback via email
          </p>
        </div>

        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Available</h3>
              <p className="text-gray-600 mb-4">Check back later for interview prep opportunities</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{job.companyName}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {job.location && (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          📍 {job.location}
                        </span>
                      )}
                      {job.skills && job.skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span key={idx} className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => startInterview(job)}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-400"
                  >
                    🎤 Start Voice Interview
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
