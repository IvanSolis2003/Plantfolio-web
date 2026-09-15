export type Rarity = "COMUN" | "POCO_COMUN" | "ENDEMICA" | "PROTEGIDA" | "CASI_EXTINTA";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  family?: string;
  description?: string;
  rarity: Rarity;
  careInstructions?: string;
  diseases?: string;
  nativeToChile: boolean;
}

export interface CollectionEntry {
  id: string;
  userId: string;
  plantId: string;
  photoUrl: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  identifiedAt: string;
  plant: Plant;
}

export interface IdentifyResult {
  scientificName: string;
  commonName: string;
  confidence: number;
  family?: string;
  description?: string;
  careInstructions?: string;
  diseases?: string;
  rarity: Rarity;
  nativeToChile: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthTokens {
  token: string;
  user: User;
}
