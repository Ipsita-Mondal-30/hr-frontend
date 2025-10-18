"use client";
import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/Custom3DCard";
import Link from "next/link";

const roleData = [
  {
    title: "Candidate (Job Seeker)",
    description: "Find your dream job with advanced search and tracking features",
    icon: "🎯",
    color: "from-blue-500 to-blue-600",
    features: [
      "Create & manage profile with skills and resume",
      "Advanced job search with multiple filters",
      "Apply to jobs directly from dashboard",
      "Track application status in real-time",
      "Get salary insights by role & location",
      "Save jobs and ask for referrals"
    ],
    ctaText: "Start Job Search",
    ctaLink: "/login",
    bgImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop"
  },
  {
    title: "HR (Recruiter)",
    description: "Streamline your hiring process with powerful recruitment tools",
    icon: "👔",
    color: "from-green-500 to-green-600",
    features: [
      "Post detailed job descriptions easily",
      "Manage and update job postings",
      "View and review candidate applications",
      "Shortlist or reject candidates efficiently",
      "Schedule interviews and provide feedback",
      "Track job performance analytics"
    ],
    ctaText: "Post Jobs",
    ctaLink: "/login",
    bgImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop"
  },
  {
    title: "Admin (Platform Owner)",
    description: "Complete platform control with advanced management features",
    icon: "⚙️",
    color: "from-purple-500 to-purple-600",
    features: [
      "Manage entire platform ecosystem",
      "Approve HR registrations and job postings",
      "Manage all users across roles",
      "Access comprehensive analytics",
      "Handle disputes and configure system",
      "Assign roles and permissions"
    ],
    ctaText: "Admin Panel",
    ctaLink: "/login",
    bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop"
  },
  {
    title: "Employee (Support Staff)",
    description: "Provide internal support and maintain platform quality",
    icon: "🤝",
    color: "from-orange-500 to-orange-600",
    features: [
      "Assist HR with job posting processes",
      "Moderate and quality-check job listings",
      "Support candidates with technical issues",
      "Generate reports for admin review",
      "Manage expired jobs and housekeeping",
      "Handle internal communications"
    ],
    ctaText: "Support Center",
    ctaLink: "/login",
    bgImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop"
  }
];

export function RoleCards3D() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
      {roleData.map((role, index) => (
        <CardContainer key={index} className="inter-var">
          <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border hover:shadow-xl transition-all duration-300">
            <CardItem
              translateZ="50"
              className="text-xl font-bold text-neutral-600 dark:text-white flex items-center gap-3 mb-2"
            >
              <span className="text-2xl">{role.icon}</span>
              {role.title}
            </CardItem>

            <CardItem
              as="p"
              translateZ="60"
              className="text-neutral-500 text-sm mt-2 dark:text-neutral-300 mb-4"
            >
              {role.description}
            </CardItem>

            <CardItem translateZ="100" className="w-full mb-4">
              <div
                className={`h-32 w-full bg-gradient-to-r ${role.color} rounded-xl relative overflow-hidden group-hover/card:shadow-xl transition-all duration-300`}
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${role.bgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold opacity-80">
                    {role.icon}
                  </span>
                </div>
              </div>
            </CardItem>

            <CardItem translateZ="80" className="mb-6">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-3">
                  Key Features:
                </h4>
                <div className="grid grid-cols-1 gap-1">
                  {role.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 text-xs mt-1">✓</span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  +{role.features.length - 3} more features...
                </div>
              </div>
            </CardItem>

            <div className="flex justify-between items-center">
              <CardItem
                translateZ={20}
                className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white text-neutral-600"
              >
                Learn more →
              </CardItem>
              <CardItem
                translateZ={20}
                as={Link}
                href={role.ctaLink}
                className={`px-6 py-2 rounded-xl bg-gradient-to-r ${role.color} text-white text-xs font-bold hover:shadow-lg transition-all duration-300`}
              >
                {role.ctaText}
              </CardItem>
            </div>
          </CardBody>
        </CardContainer>
      ))}
    </div>
  );
}