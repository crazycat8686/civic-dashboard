import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Complaint, Department } from '../types';

export const fetchComplaints = async (): Promise<Complaint[]> => {
  try {
    const complaintsRef = collection(db, 'complaints');
    const querySnapshot = await getDocs(complaintsRef);
    
    const complaints = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Complaint));
    
    console.log('Fetched complaints:', complaints.length);
    console.log('Sample complaint:', complaints[0]);
    
    return complaints;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return [];
  }
};

export const fetchDepartments = async (): Promise<Department[]> => {
  try {
    const departmentsRef = collection(db, 'departments');
    const querySnapshot = await getDocs(departmentsRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Department));
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const parseCoordinates = (locationString: any) => {
  try {
    // Check if location is a Firebase GeoPoint object
    if (locationString && typeof locationString === 'object' && 'latitude' in locationString && 'longitude' in locationString) {
      return {
        lat: locationString.latitude,
        lng: locationString.longitude
      };
    }
    
    // Check for Firebase GeoPoint with _lat and _long properties
    if (locationString && typeof locationString === 'object' && '_lat' in locationString && '_long' in locationString) {
      return {
        lat: locationString._lat,
        lng: locationString._long
      };
    }
    
    // Check if locationString is actually a string
    if (typeof locationString !== 'string') {
      return null;
    }
    
    // Parse coordinates like "[16.494764° N, 80.4889513° E]"
    const matches = locationString.match(/\[([\d.]+)°?\s*N,\s*([\d.]+)°?\s*E\]/);
    if (matches) {
      return {
        lat: parseFloat(matches[1]),
        lng: parseFloat(matches[2])
      };
    }
  } catch (error) {
    console.error('Error parsing coordinates:', error);
    return null;
  }
};