export interface Job {
    _id: string;
    title: string;
    description: string;
    department: {
      _id: string;
      name: string;
    };
    role: {
      _id: string;
      title: string;
    };
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    status: "open" | "closed";
    createdAt: string;
    companyName: string; // Added companyName field
    updatedAt?: string;
  }

  export interface Interview {
    _id: string;
    application: Application;
    interviewer: any;
    candidateEmail: string;
    scheduledAt: string;
    scorecard?: {
      generatedQuestions?: string[];
      notes?: string;
      rating?: number;
    };
  }
  
  export interface Application {
    _id: string;
    name: string;
    email: string;
    phone: string;
    job?: {
        title: string;
        department: { name: string };
      };
    matchScore?: number;
    resumeUrl: string;
    matchInsights?: {
      explanation: string;
      matchingSkills: string[];
      missingSkills: string[];
      tags: string[];
    };
    status: string;
    candidate: { name: string; email: string };
    resume?: string; // Added resume property
  
  }
  
  
  export interface User {
    name: string;
    role: string;
  }