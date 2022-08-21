export type Movie = {
  id: number;
  name: string;
  date: string;
  genres: { id: number; name: string }[];
  overview: string;
  rating: number;
  fileHandle: FileSystemFileHandle;
  duration: number;
  alternatives?: any[];
  streamProviders?: {
    display_priority?: number;
    logo_path?: string;
    provider_id?: number;
    provider_name?: string;
  }[];
};
