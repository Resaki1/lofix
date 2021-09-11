export type Movie = {
  id: number;
  name: string;
  poster: void | Blob;
  backdrop: void | Blob;
  fileHandle: FileSystemFileHandle;
};
