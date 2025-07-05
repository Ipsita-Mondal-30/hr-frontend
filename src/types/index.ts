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
  }
  
  export interface Application {
    _id: string;
    name: string;
    email: string;
    phone: string;
    job?: {
      title: string;
    };
    matchScore?: number;
    resumeUrl: string;
    matchInsights?: {
      explanation: string;
      matchingSkills: string[];
      missingSkills: string[];
      tags: string[];
    };
  }
  export interface User {
    name: string;
    role: string;
  }