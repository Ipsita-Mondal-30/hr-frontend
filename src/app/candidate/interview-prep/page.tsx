'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import Webcam from 'react-webcam';
import { downloadInterviewReport } from '@/lib/downloadInterviewReport';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

interface SpeechSynthesisEvent extends Event {
  charIndex: number;
  charLength: number;
  elapsedTime: number;
  name: string;
}

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  error: 'network' | 'synthesis' | 'synthesis-unavailable' | 'audio-busy' | 'audio-hardware' | 'canceled' | 'interrupted' | 'not-allowed' | 'invalid-argument' | 'language-unavailable' | 'service-not-allowed' | 'bad-grammar' | 'bad-xml';
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives?: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
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

interface JobScore {
  sessionId: string;
  prepScore: number;
  status: string;
  completedAt: string;
}

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location?: string;
  skills?: string[];
}

interface FinalResults {
  sessionId?: string;
  jobRole?: string;
  prepScore: number;
  status: string;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  summary?: string;
  resources?: { title?: string; url?: string; type?: string }[];
  courses?: { title?: string; url?: string; platform?: string }[];
  questions?: { number: number; question: string; answer: string; evaluation?: string }[];
  completedAt?: string;
  emailSent?: boolean;
}

interface BodyLanguageSignals {
  eye_contact: 'high' | 'medium' | 'low';
  movement: 'low' | 'medium' | 'high';
  posture: 'stable' | 'unstable';
}

export default function VoiceInterviewPrepPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobScores, setJobScores] = useState<Record<string, JobScore>>({});
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
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastFeedback, setLastFeedback] = useState('');
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isListeningRef = useRef(false);
  const transcriptBufferRef = useRef('');
  const speechUnlockedRef = useRef(false);
  const webcamRef = useRef<Webcam>(null);
  const bodyLanguageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef<number>(0);
  const lastErrorTimeRef = useRef<number>(0);
  const [bodyLanguageSignals, setBodyLanguageSignals] = useState<BodyLanguageSignals | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [studioLightOn, setStudioLightOn] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resumeSessionData, setResumeSessionData] = useState<{
    sessionId: string;
    jobRole: string;
    jobId?: string;
    questionCount: number;
    totalQuestions: number;
    currentQuestion: string;
  } | null>(null);
  const movementTrackerRef = useRef<{ prevX: number; prevY: number; movements: number[] }>({
    prevX: 0,
    prevY: 0,
    movements: []
  });

  console.log('User:', user); // Prevent unused warning

  const checkForResumeSession = async () => {
    if (sessionId || interviewStarted) return; // Don't check if already in interview
    
    try {
      const res = await api.get('/voice-interview/resume', { skipAuthRedirect: true });
      if (res.data.hasResumeSession) {
        setResumeSessionData({
          sessionId: res.data.sessionId,
          jobRole: res.data.jobRole,
          jobId: res.data.jobId,
          questionCount: res.data.questionCount,
          totalQuestions: res.data.totalQuestions,
          currentQuestion: res.data.currentQuestion
        });
      }
    } catch (error) {
      console.error('Failed to check resume session:', error);
      // Don't show error - just continue normally
    }
  };

  const handleResumeInterview = () => {
    if (!resumeSessionData) return;
    unlockSpeechAudio();
    localStorage.removeItem('dismissedResumeSession');
    
    setSessionId(resumeSessionData.sessionId);
    setInterviewStarted(true);
    setQuestionCount(resumeSessionData.questionCount);
    setCurrentQuestion(resumeSessionData.currentQuestion);
    
    // Find the job if possible
    const job = jobs.find(j => j._id === resumeSessionData.jobId || j.title === resumeSessionData.jobRole);
    if (job) {
      setSelectedJob(job);
    }
    
    // Start body language detection
    startBodyLanguageDetection();
    // Speak the current question with greeting
    speakText(`Hi again! I'm your AI interviewer. Let's continue where we left off. ${resumeSessionData.currentQuestion}`).then(() => {
      // Auto-start listening after a short delay
      setTimeout(() => startListening(), 800);
    });
  };

  // Bootstrap once on mount
  useEffect(() => {
    initializeSpeechRecognition();
    initializeSpeechSynthesis();
    fetchAllJobs();
    checkForResumeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-start from ?jobId= after jobs load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');
    if (jobId && jobs.length > 0 && !sessionId && !interviewStarted) {
      const job = jobs.find(j => j._id === jobId);
      if (job) {
        startInterview(job);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  useEffect(() => {
    if (interviewStarted) {
      startBodyLanguageDetection();
    } else {
      stopBodyLanguageDetection();
    }

    return () => {
      stopBodyLanguageDetection();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewStarted]);

  const fetchInterviewScores = async () => {
    try {
      const res = await api.get('/voice-interview/history', { skipAuthRedirect: true });
      const sessions = res.data.sessions || [];
      const scores: Record<string, JobScore> = {};
      for (const session of sessions) {
        const key = session.jobId || session.jobRole;
        if (!key || scores[key]) continue; // keep latest (history is sorted desc)
        scores[key] = {
          sessionId: session._id,
          prepScore: session.prepScore ?? 0,
          status: session.status,
          completedAt: session.completedAt,
        };
      }
      setJobScores(scores);
    } catch (error) {
      console.error('Failed to fetch interview scores:', error);
    }
  };

  const fetchAllJobs = async () => {
    try {
      setApiError(null);
      const res = await api.get('/voice-interview/all-jobs', { skipAuthRedirect: true });
      setJobs(res.data.jobs || []);
      await fetchInterviewScores();
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setApiError(
        'Could not load jobs. Make sure you are logged in and the backend is running on port 8080.'
      );
    } finally {
      setLoading(false);
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
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  };

  /** Chrome/Safari require a user gesture before speech audio plays */
  const unlockSpeechAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.resume();
    if (!speechUnlockedRef.current) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0.01;
      u.onend = () => {
        speechUnlockedRef.current = true;
      };
      synth.speak(u);
    }
    speechUnlockedRef.current = true;
  };

  const pickVoice = (utterance: SpeechSynthesisUtterance) => {
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.lang.startsWith('en') && v.localService) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
  };

  const startInterview = async (job: Job) => {
    unlockSpeechAudio();
    setResumeSessionData(null);
    localStorage.removeItem('dismissedResumeSession');
    
    setLoading(true);
    try {
      const res = await api.post(
        '/voice-interview/start',
        { jobId: job._id, jobRole: job.title, skills: job.skills || [] },
        { skipAuthRedirect: true }
      );

      setSessionId(res.data.sessionId);
      setSelectedJob(job);
      setInterviewStarted(true);
      setQuestionCount(1);
      // Camera will start automatically via useEffect
      
      // Greet first with proper introduction
      const greeting = `Hi! I'm your AI interviewer, and I'll be helping you practice for the ${job.title} role. I'll ask you a few questions, and you can answer them at your own pace. Take your time, and let's begin.`;
      await speakText(greeting);
      
      // Wait a moment after greeting before asking first question (gives time to process)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set and speak first question
      setCurrentQuestion(res.data.firstQuestion);
      await speakText(res.data.firstQuestion);
      
      // Wait longer after question before starting to listen (gives candidate time to process)
      await new Promise(resolve => setTimeout(resolve, 1500));
      startListening();
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const speakOneChunk = (chunk: string): Promise<void> =>
    new Promise((resolve) => {
      if (!chunk.trim()) {
        resolve();
        return;
      }
      const synth = window.speechSynthesis;
      synth.resume();
      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.lang = 'en-US';
      pickVoice(utterance);

      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        clearInterval(resumeTick);
        resolve();
      };

      const resumeTick = setInterval(() => synth.resume(), 250);

      utterance.onend = done;
      utterance.onerror = done;
      synth.speak(utterance);

      setTimeout(done, Math.max(12000, chunk.length * 80));
    });

  const speakText = async (text: string): Promise<void> => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !text?.trim()) {
      setIsSpeaking(false);
      return;
    }

    unlockSpeechAudio();
    setIsSpeaking(true);
    const synth = window.speechSynthesis;
    synth.cancel();
    await new Promise((r) => setTimeout(r, 50));
    synth.resume();

    const chunks =
      text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) || [text.trim()];

    try {
      for (const chunk of chunks) {
        await speakOneChunk(chunk);
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  };

  const submitCurrentAnswer = async () => {
    if (loading || isSpeaking) return;
    stopListening();
    const transcript = transcriptBufferRef.current.trim();
    if (transcript.length > 0) {
      await handleAnswer(transcript);
    } else {
      await speakText("I didn't catch your answer. Please try again when you're ready.");
      startListening();
    }
  };

  const startListening = () => {
    if (loading || isSpeaking) return;

    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionAPI) {
      alert('Speech recognition is not supported. Please use Chrome or Edge.');
      return;
    }

    stopListening();
    transcriptBufferRef.current = '';
    setLiveTranscript('');

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    isListeningRef.current = true;
    setIsListening(true);
    errorCountRef.current = 0;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += piece;
        } else {
          interim += piece;
        }
      }
      if (finalText) {
        transcriptBufferRef.current = `${transcriptBufferRef.current} ${finalText}`.trim();
      }
      setLiveTranscript((transcriptBufferRef.current + ' ' + interim).trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
        alert('Microphone access is blocked. Allow the mic in your browser settings and try again.');
        return;
      }
      if (event.error === 'no-speech' && isListeningRef.current) {
        return;
      }
      if (isListeningRef.current && errorCountRef.current < 8) {
        errorCountRef.current += 1;
        setTimeout(() => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch {
              // will retry on onend
            }
          }
        }, 400);
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current && !loading) {
        try {
          recognition.start();
        } catch {
          isListeningRef.current = false;
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      isListeningRef.current = false;
      setIsListening(false);
    }
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
      
      if (!sessionId) {
        throw new Error('Interview session not found');
      }

      const res = await api.post(
        `/voice-interview/answer/${sessionId}`,
        { transcript, bodyLanguage },
        { skipAuthRedirect: true }
      );

      transcriptBufferRef.current = '';
      setLiveTranscript('');

      if (res.data.endInterview) {
        // Interview completed - clear resume session data and re-check
        setResumeSessionData(null);
        localStorage.removeItem('dismissedResumeSession');
        // Re-check for resume sessions to update state
        checkForResumeSession();
        // Interview completed
        setFinalResults(res.data.finalResults);
        setEmailSent(res.data.emailSent ?? res.data.finalResults?.emailSent ?? null);
        setShowResults(true);
        await speakText(
          res.data.closingMessage ||
            'Thank you for completing the interview. Your full report is ready below.'
        );
      } else {
        const feedback = res.data.feedbackMessage as string | undefined;
        if (feedback) {
          setLastFeedback(feedback);
          await speakText(feedback);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        setQuestionCount((prev) => prev + 1);
        setCurrentQuestion(res.data.nextQuestion);
        await speakText(res.data.nextQuestion);

        await new Promise((resolve) => setTimeout(resolve, 800));
        if (interviewStarted && sessionId) {
          startListening();
        }
      }
    } catch (error) {
      console.error('Failed to process answer:', error);
      await speakText(
        'Sorry, I had trouble processing that. Please click Done answering and try again, or check that the backend is running.'
      );
      startListening();
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadReport = () => {
    if (!finalResults) return;
    downloadInterviewReport(
      {
        ...finalResults,
        jobRole: finalResults.jobRole || selectedJob?.title || 'Interview Prep',
      },
      user?.name,
      selectedJob?.companyName
    );
  };

  const handleResendEmail = async () => {
    const id = finalResults?.sessionId || sessionId;
    if (!id) return;
    setResendingEmail(true);
    try {
      const res = await api.post(`/voice-interview/resend-email/${id}`, {}, { skipAuthRedirect: true });
      setEmailSent(res.data.success);
      alert(res.data.message);
    } catch {
      alert('Could not send email. Please download your report instead.');
    } finally {
      setResendingEmail(false);
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
              <p className="text-gray-600">
                Your full feedback report is ready below
                {emailSent ? ' and has been sent to your email' : ''}.
              </p>
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
                {(finalResults.jobRole || selectedJob) && (
                  <p className="mt-3 text-sm text-gray-500">
                    {finalResults.jobRole || selectedJob?.title}
                    {selectedJob?.companyName ? ` at ${selectedJob.companyName}` : ''}
                  </p>
                )}
              </div>
            </div>

            {finalResults.summary && (
              <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-indigo-800 mb-2">Summary</h3>
                <p className="text-sm text-gray-700">{finalResults.summary}</p>
              </div>
            )}

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

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleDownloadReport}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                📥 Download Full Report
              </button>
              {!emailSent && (
                <button
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {resendingEmail ? 'Sending…' : '📧 Send Report to Email'}
                </button>
              )}
            </div>

            <div className="bg-purple-50 rounded-lg p-4 mb-6 text-center">
              <p className="text-purple-800 text-sm">
                {emailSent
                  ? 'A copy was also emailed to you. You can re-download anytime from your Profile → Interview Reports.'
                  : 'Email delivery failed — use Download above. Reports are saved in your Profile → Interview Reports.'}
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('dismissedResumeSession');
                setShowResults(false);
                setInterviewStarted(false);
                setSessionId(null);
                setSelectedJob(null);
                setCurrentQuestion('');
                setQuestionCount(0);
                setEmailSent(null);
                stopBodyLanguageDetection();
                fetchAllJobs();
                checkForResumeSession();
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Take Interview Again
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
                <div className="text-center w-full">
                  {isSpeaking && (
                    <div className="mb-4">
                      <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                        <span className="text-4xl">🤖</span>
                      </div>
                      <p className="mt-4 text-purple-900 font-semibold">AI is speaking… (check volume)</p>
                    </div>
                  )}
                  {currentQuestion && (
                    <div>
                      {!isSpeaking && <div className="text-6xl mb-4">💬</div>}
                      <p className="text-xl text-gray-800 font-medium">{currentQuestion}</p>
                    </div>
                  )}
                  {lastFeedback && !isListening && !loading && (
                    <p className="mt-4 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      ✓ {lastFeedback}
                    </p>
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
              {isListening && (
                <>
                  <div className="w-full py-4 rounded-lg font-semibold text-lg bg-red-600 text-white text-center">
                    🎤 Listening… speak your answer, then click Done
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[80px]">
                    <p className="text-xs text-gray-500 mb-1">What we heard:</p>
                    <p className="text-gray-800">
                      {liveTranscript || 'Start speaking…'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={submitCurrentAnswer}
                    disabled={loading}
                    className="w-full py-4 rounded-lg font-semibold text-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Done answering
                  </button>
                </>
              )}

              {!isSpeaking && !loading && !isListening && (
                <button
                  type="button"
                  onClick={startListening}
                  className="w-full py-6 rounded-lg font-semibold text-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
                >
                  🎤 Start answering
                </button>
              )}

              {loading && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Analyzing your answer…</p>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-900">
                  💡 Use <strong>Chrome</strong>, allow <strong>microphone</strong>, turn up system volume.
                  When finished speaking, click <strong>Done answering</strong>.
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

        {apiError && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
            {apiError}
          </div>
        )}

        <div className="grid gap-6">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Available</h3>
              <p className="text-gray-600 mb-4">Check back later for interview prep opportunities</p>
            </div>
          ) : (
            jobs.map((job) => {
              const completed = jobScores[job._id] || jobScores[job.title];
              const statusStyles =
                completed?.status === 'READY'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : completed?.status === 'NEEDS PRACTICE'
                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                  : 'bg-red-100 text-red-700 border-red-200';

              return (
              <div key={job._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start gap-4">
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
                  <div className="flex flex-col items-end gap-2 min-w-[180px]">
                    {completed && (
                      <div className="w-full text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                        <div className="text-3xl font-bold text-purple-600">
                          {completed.prepScore}/100
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Last score</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles}`}>
                          {completed.status}
                        </span>
                        {completed.completedAt && (
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(completed.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    )}

                    {resumeSessionData && (resumeSessionData.jobId === job._id || resumeSessionData.jobRole === job.title) && !interviewStarted && !sessionId ? (
                      <button
                        onClick={handleResumeInterview}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
                      >
                        🔄 Resume (Q{resumeSessionData.questionCount}/{resumeSessionData.totalQuestions})
                      </button>
                    ) : (
                      <button
                        onClick={() => startInterview(job)}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-400"
                      >
                        🎤 {completed ? 'Practice Again' : 'Start Voice Interview'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>
    </div>
  );
}
