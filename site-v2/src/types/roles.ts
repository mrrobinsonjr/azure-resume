export type SortKey = "newest" | "oldest" | "company_az" | "title_az";

export type Role = {
  id: string;
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  il_levels: string[];
  tags: string[];
  tech: string[];
  highlights: string[];
  bodyHtml: string;
};

export type FilterState = {
  q: string;
  tech: Set<string>;
  tags: Set<string>;
  il: Set<string>;
  sort: SortKey;
};

