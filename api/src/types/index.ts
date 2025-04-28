export interface YogaAction {
  id: number;
  name: string;
  name_en: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effect: string;
  effect_en: string;
  caution: string;
  caution_en: string;
  image: string;
  video: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Bookmark {
  userId: number;
  itemId: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  sort?: 'id' | 'name' | 'difficulty';
  order?: 'asc' | 'desc';
} 