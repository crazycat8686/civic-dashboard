export interface Complaint {
  id: string;
  criticality: 'high' | 'medium' | 'low';
  departments: string[];
  location: string | { latitude: number; longitude: number } | any;
  locationName: string;
  description: string;
  photoUrl: string;
  status: 'submitted' | 'in-progress' | 'resolved';
  synopsis: string;
  estimatedWorkers: number;
  isOpen: boolean;
  timeOfComplaint: string;
  timestamp: string;
}

export interface Department {
  id: string;
  name: string;
  rating: number;
  totalIssues: number;
  solvedIssues: number;
  efficiency: number;
}

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  criticality: 'high' | 'medium' | 'low';
  description: string;
  departments: string[];
  locationName: string;
}