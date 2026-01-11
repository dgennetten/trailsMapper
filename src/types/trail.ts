export interface Trail {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Moderate' | 'Difficult' | 'Very Difficult';
  length: string;
  elevationGain: string;
  trailheadElevation: string;
  latitude: number;
  longitude: number;
  description: string;
  features: string[];
  season: string;
  permitRequired: boolean;
}

export interface Trip {
  id?: string; // Supabase UUID (optional for backward compatibility)
  date: string;
  trail: string;
  partners: string;
  treesCleared: string;
}