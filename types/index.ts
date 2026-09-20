export type Rarity = "COMUN" | "POCO_COMUN" | "ENDEMICA" | "PROTEGIDA" | "CASI_EXTINTA";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  esAdmin: boolean;
  bio?: string;
  avatarUrl?: string;
  ubicacionTexto?: string;
  compartirPerfil: boolean;
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
  wateringFrequencyDays: number;
}

export interface CollectionEntry {
  id: string;
  userId: string;
  plantId: string;
  photos: string[];
  photoDates: string[];
  notes?: string;
  latitude?: number;
  longitude?: number;
  ubicacionAprox?: string;
  privado: boolean;
  identifiedAt: string;
  lastWatered?: string;
  plant: Plant;
}

export interface IdentifyResult {
  plantId: string;
  photoUrl: string;
  scientificName: string;
  commonName: string;
  confidence: number;
  family?: string;
  rarity: Rarity;
  nativeToChile: boolean;
}

export interface IdentifyResponse {
  photoUrl: string;
  candidatos: IdentifyResult[];
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
