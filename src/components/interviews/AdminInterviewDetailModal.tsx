'use client';

import Image from 'next/image';

export interface AdminInterview {
  _id: string;
  candidateId?: string | null;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidatePicture?: string | null;
  hrId?: string | null;
  hrName: string;
  hrEmail?: string;
  hrCompany: string;
  hrPicture?: string | null;
  jobId?: string | null;
  jobTitle: string;
  jobCompany?: string;
  scheduledAt: string;
  completedAt?: string | null;
  duration: number;
  status: string;
  type: string;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
  feedback?: string | null;
  rating?: number | null;
  outcome?: string | null;
  createdAt?: string;
}

function isPending(value?: string | null) {
  return !value || value === 'Pending';
}

function DetailValue({ value }: { value?: string | null }) {
  const pending = isPending(value);
  return (
    <p className={`font-medium ${pending ? 'text-amber-600 italic' : 'text-gray-900'}`}>
      {pending ? 'Pending' : value}
    </p>
  );
}

function PersonBlock({
  title,
  name,
  email,
  phone,
  picture,
  extra,
}: {
  title: string;
  name: string;
  email?: string;
  phone?: string;
  picture?: string | null;
  extra?: { label: string; value?: string | null }[];
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="flex items-start gap-3 mb-3">
        {picture ? (
          <Image
            src={picture}
            alt={name}
            width={56}
            height={56}
            unoptimized
            className="w-14 h-14 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center px-1">
            Pending picture
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <DetailValue value={name} />
          </div>
          {email !== undefined && (
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <DetailValue value={email} />
            </div>
          )}
          {phone !== undefined && (
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <DetailValue value={phone} />
            </div>
          )}
          {extra?.map((item) => (
            <div key={item.label}>
              <label className="text-sm text-gray-600">{item.label}</label>
              <DetailValue value={item.value} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminInterviewDetailModal({
  interview,
  title = 'Interview Details',
  onClose,
  showTimeline,
}: {
  interview: AdminInterview;
  title?: string;
  onClose: () => void;
  showTimeline?: boolean;
}) {
  const scheduled = new Date(interview.scheduledAt);
  const isUpcoming = scheduled > new Date() && interview.status === 'scheduled';

  return (
    <div className="talora-modal-overlay flex items-center justify-center z-50 p-4">
      <div className="talora-modal-panel max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Interview Information</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">Job Title</label>
                  <DetailValue value={interview.jobTitle} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Company</label>
                  <DetailValue value={interview.jobCompany || interview.hrCompany} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Type</label>
                  <p className="font-medium capitalize">{interview.type.replace('-', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Duration</label>
                  <p className="font-medium">{interview.duration} minutes</p>
                </div>
                {interview.meetingLink && (
                  <div>
                    <label className="text-sm text-gray-600">Meeting Link</label>
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium break-all"
                    >
                      {interview.meetingLink}
                    </a>
                  </div>
                )}
                {interview.location && (
                  <div>
                    <label className="text-sm text-gray-600">Location</label>
                    <DetailValue value={interview.location} />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Schedule</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">Date</label>
                  <p className="font-medium">{scheduled.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Time</label>
                  <p className="font-medium">{scheduled.toLocaleTimeString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-1 rounded text-sm capitalize ${
                        interview.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : interview.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : isUpcoming
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {interview.status === 'scheduled' && !isUpcoming
                        ? 'Past due'
                        : interview.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                {showTimeline && interview.completedAt && (
                  <div>
                    <label className="text-sm text-gray-600">Completed</label>
                    <p className="font-medium">{new Date(interview.completedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PersonBlock
              title="Candidate"
              name={interview.candidateName}
              email={interview.candidateEmail}
              phone={interview.candidatePhone}
              picture={interview.candidatePicture}
            />
            <PersonBlock
              title="HR Representative"
              name={interview.hrName}
              email={interview.hrEmail}
              picture={interview.hrPicture}
              extra={[{ label: 'Company', value: interview.hrCompany }]}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Notes</h3>
            {interview.notes ? (
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{interview.notes}</p>
            ) : (
              <p className="text-amber-600 italic bg-amber-50 p-3 rounded-lg">Pending — no notes added</p>
            )}
          </div>

          {interview.feedback && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Feedback</h3>
              <p className="text-gray-700 bg-blue-50 p-3 rounded-lg whitespace-pre-wrap">{interview.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
