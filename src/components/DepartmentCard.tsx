import React from 'react';
import { Users, CheckCircle, TrendingUp, Star } from 'lucide-react';

interface DepartmentCardProps {
  name: string;
  totalIssues: number;
  solvedIssues: number;
  efficiency: number;
  rating: number;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({
  name,
  totalIssues,
  solvedIssues,
  efficiency,
  rating
}) => {
  const openIssues = totalIssues - solvedIssues;
  
  const getDepartmentColor = (departmentName: string) => {
    switch (departmentName.toLowerCase()) {
      case 'fire': return 'from-red-500 to-red-600';
      case 'electricity': return 'from-yellow-500 to-yellow-600';
      case 'municipality': return 'from-blue-500 to-blue-600';
      case 'safety': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600 bg-green-100';
    if (efficiency >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getDepartmentColor(name)} p-6 text-white`}>
        <h3 className="text-xl font-bold capitalize">{name} Department</h3>
        <div className="flex items-center mt-2">
          <Star className="w-5 h-5 fill-current mr-1" />
          <span className="text-lg font-semibold">{rating.toFixed(1)}</span>
          <span className="text-sm ml-1 opacity-90">/ 5.0</span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{totalIssues}</span>
            </div>
            <p className="text-sm text-gray-600">Total Issues</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">{solvedIssues}</span>
            </div>
            <p className="text-sm text-gray-600">Solved</p>
          </div>
        </div>

        {/* Open Issues */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Open Issues</span>
            <span className="text-lg font-bold text-red-600">{openIssues}</span>
          </div>
        </div>

        {/* Efficiency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Efficiency</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getEfficiencyColor(efficiency)}`}>
            {efficiency.toFixed(1)}%
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round((solvedIssues / totalIssues) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${getDepartmentColor(name)} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${(solvedIssues / totalIssues) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;