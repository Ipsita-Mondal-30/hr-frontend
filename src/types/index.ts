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
    portfolio: string;
    resumeUrl: string;
    matchScore?: number;
    createdAt: string;
    job: Job;
  }
  