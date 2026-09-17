export type Rarity = "COMUN" | "POCO_COMUN" | "ENDEMICA" | "PROTEGIDA" | "CASI_EXTINTA";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  esAdmin: boolean;
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
  privado: boolean;
  identifiedAt: string;
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
