export interface Job {
    _id: string;
    title: string;
    description: string;
    companyName: string;
    location?: string;
    remote?: boolean;
    employmentType?: "full-time" | "part-time" | "internship";
    experienceRequired?: number;
    minSalary?: number;
    maxSalary?: number;
    companySize?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
    skills?: string[];
    tags?: string[];
    rating?: number;
    status: "open" | "closed" | "active" | "pending" | "rejected";
    isApproved?: boolean;
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
    createdAt: string;
    updatedAt?: string;
  }

  export interface Interview {
    _id: string;
    application: {
      _id: string;
      job: {
        title: string;
        companyName: string;
      };
      candidate: {
        name: string;
        email: string;
      };
    };
    interviewer: {
      _id: string;
      name: string;
      email: string;
    };
    scheduledAt: string;
    status: string;
    type: string;
    duration?: number;
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
        companyName: string;
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