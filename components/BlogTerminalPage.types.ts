export interface BlogInitialPost {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  html: string;
}
