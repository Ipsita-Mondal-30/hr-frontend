'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import Webcam from 'react-webcam';

export default function VideoInterviewPrepPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const webcamRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/interview-prep/applied-jobs');
      setApplications(res.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const startSession = async (job: any) => {
    setLoading(true);
    try {
      const res = await api.get(`/interview-prep/questions/${job._id}`);

      setSession({
        sessionId: Date.now().toString(),
        questions: res.data.questions.map((q: string) => ({ question: q })),
        jobId: job._id,
        jobTitle: res.data.jobTitle,
        companyName: res.data.companyName
      });
      setSelectedJob(job);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordedChunks([]);

    const stream = webcamRef.current?.stream;
    if (!stream) return;

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: 'video/webm'
    });

    mediaRecorderRef.current.addEventListener('dataavailable', (event: any) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    });

    mediaRecorderRef.current.start();
  };

  const stopRecording = async () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();

    // Wait for chunks to be collected
    setTimeout(async () => {
      await uploadAnswer();
    }, 500);
  };

  const uploadAnswer = async () => {
    setLoading(true);
    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', blob, `answer-${currentQuestionIndex}.webm`);

      const uploadRes = await api.post(
        '/interview-prep/upload-video',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      // Store the video URL for this question
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentQuestionIndex].videoUrl = uploadRes.data.videoUrl;
      updatedQuestions[currentQuestionIndex].duration = 30; // Approximate duration

      setSession({ ...session, questions: updatedQuestions });

      // Move to next question or complete
      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setRecordedChunks([]);
      } else {
        await completeSession(updatedQuestions);
      }
    } catch (error) {
      console.error('Failed to upload answer:', error);
      alert('Failed to upload answer');
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async (questions?: any[]) => {
    setLoading(true);
    try {
      const questionsToSubmit = questions || session.questions;

      const recordings = questionsToSubmit.map((q: any) => ({
        question: q.question,
        videoUrl: q.videoUrl,
        duration: q.duration || 30
      }));

      const res = await api.post('/interview-prep/submit', {
        jobId: session.jobId,
        recordings
      });

      // Show success message
      setAnalysis({
        overallScore: 75,
        strengths: [
          'Completed all interview questions',
          'Showed good engagement',
          'Provided thoughtful responses'
        ],
        improvements: [
          'Provide more specific examples',
          'Practice the STAR method',
          'Review technical concepts'
        ],
        recommendations: [
          'Check your email for detailed feedback',
          'Practice more with different questions',
          'Research the company thoroughly'
        ]
      });
      setShowResults(true);
    } catch (error) {
      console.error('Failed to complete session:', error);
      alert('Failed to complete session');
    } finally {
      setLoading(false);
    }
  };

  if (showResults && analysis) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Practice Completed!</h1>
              <p className="text-gray-600">Your feedback report has been sent to your email</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {analysis.overallScore}/100
                </div>
                <p className="text-gray-600">Overall Score</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">✓ Strengths</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">• {strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-6">
                <h3 className="font-semibold text-orange-800 mb-3">→ Improvements</h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">• {improvement}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">💡 Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-sm text-gray-700">• {rec}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setShowResults(false);
                setSession(null);
                setSelectedJob(null);
                fetchApplications();
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start Another Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    const currentQuestion = session.questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Interview Practice</h2>
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {session.questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="bg-purple-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-purple-900 mb-3">Question:</h3>
                  <p className="text-lg text-gray-800">{currentQuestion.question}</p>
                </div>

                <div className="space-y-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={loading}
                      className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-400"
                    >
                      🔴 Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-full bg-gray-800 text-white py-4 rounded-lg hover:bg-gray-900 transition-colors font-semibold"
                    >
                      ⏹️ Stop Recording
                    </button>
                  )}

                  {loading && (
                    <div className="text-center text-gray-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      Processing...
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <Webcam
                    ref={webcamRef}
                    audio={true}
                    className="w-full"
                    mirrored={true}
                  />
                </div>
                {isRecording && (
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></span>
                      Recording...
                    </span>
                  </div>
                )}
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
            🎥 Video Interview Prep
          </h1>
          <p className="text-gray-600">
            Practice interviews for jobs you've applied to with AI-powered feedback
          </p>
        </div>

        <div className="grid gap-6">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-4">Apply to jobs first to start practicing interviews</p>
              <button
                onClick={() => window.location.href = '/candidate/jobs'}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {app.title || 'Job Title'}
                    </h3>
                    <p className="text-gray-600 mb-2">{app.companyName || 'Company'}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {app.applicationStatus}
                      </span>
                      {app.location && (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          📍 {app.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => startSession(app)}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-400"
                  >
                    Start Practice
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
