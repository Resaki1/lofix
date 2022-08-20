export type Movie = {
  id: number;
  name: string;
  date: string;
  genres: number[] | { id: number; name: string }[];
  overview: string;
  rating: number;
  fileHandle: FileSystemFileHandle;
  duration: number;
  alternatives?: any[];
};
