import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Filter } from 'lucide-react';
import MapView from './MapView';
import DepartmentCard from './DepartmentCard';
import { Complaint, Department, MapPin } from '../types';
import { fetchComplaints, fetchDepartments, parseCoordinates } from '../services/firebaseService';

const Dashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    // Convert complaints to map pins
    const pins: MapPin[] = complaints
      .map(complaint => {
        const coords = parseCoordinates(complaint.location);
        if (!coords) return null;
        
        return {
          id: complaint.id,
          lat: coords.lat,
          lng: coords.lng,
          criticality: complaint.criticality,
          description: complaint.description,
          departments: complaint.departments,
          locationName: complaint.locationName
        };
      })
      .filter(Boolean) as MapPin[];
    
    setMapPins(pins);
  }, [complaints]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [complaintsData, departmentsData] = await Promise.all([
        fetchComplaints(),
        fetchDepartments()
      ]);
      
      setComplaints(complaintsData);
      setDepartments(departmentsData.length > 0 ? departmentsData : getDefaultDepartments(complaintsData));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultDepartments = (complaintsData: Complaint[]): Department[] => {
    const departmentStats: Record<string, { total: number; solved: number }> = {};
    
    complaintsData.forEach(complaint => {
      complaint.departments.forEach(dept => {
        if (!departmentStats[dept]) {
          departmentStats[dept] = { total: 0, solved: 0 };
        }
        departmentStats[dept].total++;
        if (complaint.status === 'resolved') {
          departmentStats[dept].solved++;
        }
      });
    });

    return Object.entries(departmentStats).map(([name, stats], index) => ({
      id: `dept-${index}`,
      name,
      rating: 3.5 + Math.random() * 1.5, // Default rating between 3.5-5.0
      totalIssues: stats.total,
      solvedIssues: stats.solved,
      efficiency: stats.total > 0 ? (stats.solved / stats.total) * 100 : 0
    }));
  };

  const filteredPins = selectedDepartment === 'all' 
    ? mapPins 
    : mapPins.filter(pin => pin.departments.includes(selectedDepartment));

  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.isOpen).length;
  const highPriorityComplaints = complaints.filter(c => c.criticality === 'high' && c.isOpen).length;

  const departmentNames = [...new Set(complaints.flatMap(c => c.departments))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Complaints Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-2xl font-semibold text-gray-900">{totalComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Complaints</p>
                <p className="text-2xl font-semibold text-gray-900">{openComplaints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-semibold text-gray-900">{highPriorityComplaints}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by Department:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departmentNames.map(name => (
                <option key={name} value={name} className="capitalize">
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map */}
        <div className="mb-8">
          <MapView key={filteredPins.map(pin => pin.id).join('-')} pins={filteredPins} />
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              name={department.name}
              totalIssues={department.totalIssues}
              solvedIssues={department.solvedIssues}
              efficiency={department.efficiency}
              rating={department.rating}
            />
          ))}
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex items-center space-x-4">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium text-gray-900">Loading dashboard data...</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;