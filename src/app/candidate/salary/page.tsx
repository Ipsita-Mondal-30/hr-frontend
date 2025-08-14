'use client';

import { useState } from 'react';

interface SalaryData {
  role: string;
  location: string;
  experience: string;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  companies: string[];
}

export default function SalarySearchPage() {
  const [searchParams, setSearchParams] = useState({
    role: '',
    location: '',
    experience: '',
    company: ''
  });
  
  const [salaryData, setSalaryData] = useState<SalaryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Mock salary data - in real app, this would come from an API
  const mockSalaryData: SalaryData[] = [
    {
      role: 'Software Developer',
      location: 'San Francisco, CA',
      experience: '0-2 years',
      minSalary: 90000,
      maxSalary: 130000,
      avgSalary: 110000,
      companies: ['Google', 'Meta', 'Apple', 'Uber']
    },
    {
      role: 'Software Developer',
      location: 'San Francisco, CA',
      experience: '3-5 years',
      minSalary: 130000,
      maxSalary: 180000,
      avgSalary: 155000,
      companies: ['Google', 'Meta', 'Apple', 'Netflix']
    },
    {
      role: 'Frontend Developer',
      location: 'New York, NY',
      experience: '0-2 years',
      minSalary: 75000,
      maxSalary: 110000,
      avgSalary: 92500,
      companies: ['JPMorgan', 'Goldman Sachs', 'Spotify']
    },
    {
      role: 'Full Stack Developer',
      location: 'Austin, TX',
      experience: '3-5 years',
      minSalary: 95000,
      maxSalary: 140000,
      avgSalary: 117500,
      companies: ['Dell', 'IBM', 'Oracle', 'Indeed']
    },
    {
      role: 'Data Scientist',
      location: 'Seattle, WA',
      experience: '2-4 years',
      minSalary: 110000,
      maxSalary: 160000,
      avgSalary: 135000,
      companies: ['Amazon', 'Microsoft', 'Boeing']
    }
  ];

  const handleSearch = () => {
    setLoading(true);
    setSearched(true);
    
    // Simulate API call with more realistic delay
    setTimeout(() => {
      let filtered = mockSalaryData;
      
      if (searchParams.role) {
        filtered = filtered.filter(data => 
          data.role.toLowerCase().includes(searchParams.role.toLowerCase())
        );
      }
      
      if (searchParams.location) {
        filtered = filtered.filter(data => 
          data.location.toLowerCase().includes(searchParams.location.toLowerCase())
        );
      }
      
      if (searchParams.experience) {
        // Handle experience filtering more flexibly
        const expRange = searchParams.experience;
        filtered = filtered.filter(data => {
          if (expRange === '0-2') return data.experience.includes('0-2');
          if (expRange === '3-5') return data.experience.includes('3-5') || data.experience.includes('2-4');
          if (expRange === '5-8') return data.experience.includes('5-8');
          if (expRange === '8+') return data.experience.includes('8+');
          return true;
        });
      }
      
      if (searchParams.company) {
        filtered = filtered.filter(data => 
          data.companies.some(company => 
            company.toLowerCase().includes(searchParams.company.toLowerCase())
          )
        );
      }
      
      setSalaryData(filtered);
      setLoading(false);
    }, 800);
  };

  const handleInputChange = (key: string, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const clearSearch = () => {
    setSearchParams({
      role: '',
      location: '',
      experience: '',
      company: ''
    });
    setSalaryData([]);
    setSearched(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Salary Search</h1>
        <p className="text-gray-600">Research salary ranges for different roles and locations</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Role
            </label>
            <input
              type="text"
              placeholder="e.g., Software Developer"
              value={searchParams.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g., San Francisco, CA"
              value={searchParams.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level
            </label>
            <select
              value={searchParams.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Experience Levels</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-8">5-8 years</option>
              <option value="8+">8+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Google"
              value={searchParams.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Searching...' : 'Search Salaries'}
          </button>
          <button
            onClick={clearSearch}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Searching salary data...</p>
        </div>
      )}

      {searched && !loading && salaryData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No salary data found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}

      {salaryData.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Salary Results ({salaryData.length})
            </h2>
          </div>

          {salaryData.map((data, index) => (
            <SalaryCard key={index} data={data} />
          ))}
        </div>
      )}

      {/* Salary Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Salary Negotiation Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Research Thoroughly</h4>
            <p>Use multiple sources to understand market rates for your role and location.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Consider Total Compensation</h4>
            <p>Factor in benefits, stock options, bonuses, and other perks beyond base salary.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Know Your Worth</h4>
            <p>Highlight your unique skills, achievements, and the value you bring to the company.</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Be Flexible</h4>
            <p>Consider non-salary benefits if the base salary isn't negotiable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalaryCard({ data }: { data: SalaryData }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{data.role}</h3>
          <p className="text-gray-600">{data.location}</p>
          <p className="text-sm text-gray-500">{data.experience} experience</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            ${data.avgSalary.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">Average Salary</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-lg font-semibold text-gray-900">
            ${data.minSalary.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500">Minimum</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="text-lg font-semibold text-green-600">
            ${data.avgSalary.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500">Average</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-lg font-semibold text-gray-900">
            ${data.maxSalary.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500">Maximum</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-900 mb-2">Top Hiring Companies</h4>
        <div className="flex flex-wrap gap-2">
          {data.companies.map((company, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}