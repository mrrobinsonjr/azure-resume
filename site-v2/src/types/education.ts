export type Education = {
  id: string;
  school: string;
  location: string;
  degree: { level: string; field: string };
  minor?: string;
  start?: string;
  end?: string;
  honors?: string[];
};
