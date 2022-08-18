export type Movie = {
  id: number;
  name: string;
  poster: void | Blob;
  backdrop: void | Blob;
  date: string;
  genres: number[] | { id: number; name: string }[];
  overview: string;
  rating: number;
  fileHandle: FileSystemFileHandle;
};
