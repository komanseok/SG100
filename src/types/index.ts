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

export interface Opinion {
  id: string;
  content: string;
  fingerprint: string;
  like_count: number;
  report_count: number;
  is_hidden: boolean;
  created_at: string;
}

export interface OpinionLike {
  id: string;
  opinion_id: string;
  fingerprint: string;
  created_at: string;
}

export interface OpinionReport {
  id: string;
  opinion_id: string;
  fingerprint: string;
  created_at: string;
}
