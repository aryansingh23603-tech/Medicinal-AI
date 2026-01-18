export interface MedicineAnalysis {
  name: string;
  genericName: string;
  purpose: string;
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  manufacturer?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MapPlace {
  name: string;
  rating?: number;
  userRatingCount?: number;
  address?: string;
  uri?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        reviewText: string;
      }[]
    }
  };
}

export enum AppRoute {
  HOME = 'home',
  SCAN = 'scan',
  CHAT = 'chat',
  MAP = 'map',
  LIVE = 'live',
}