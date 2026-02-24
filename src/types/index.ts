export interface Category {
  id: number;
  order_num: number;
  name: string;
  pledge_count: number;
  color: string;
  icon: string;
}

export interface Pledge {
  id: number;
  category_id: number;
  number: number;
  title: string;
  like_count: number;
  category?: Category;
}

export interface Vote {
  id: string;
  pledge_id: number;
  fingerprint: string;
  created_at: string;
}

export interface ToggleVoteResult {
  liked: boolean;
  like_count: number;
}
