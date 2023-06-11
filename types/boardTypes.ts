import { Models } from "appwrite";

export type TypedColumn = "todo" | "inprogress" | "done";

export interface Todo {
  $id: string;
  $createdAt: string;
  title: string;
  status: TypedColumn;
  image?: ImageType;
}

export interface Column {
  id: TypedColumn;
  todos: Todo[];
}

export interface ImageType {
  bucketId: string;
  fileId: string;
}

export interface Board {
  columns: Map<TypedColumn, Column>;
}
