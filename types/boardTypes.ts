import { Models } from "appwrite";

export type TypedColumn = "todo" | "inprogress" | "done";

export interface Todo extends Models.Document {
  $id: string;
  $createdAt: string;
  title: string;
  status: TypedColumn;
  image?: Image;
}

export interface Column {
  id: TypedColumn;
  todos: Todo[];
}

interface Image {
  bucketId: string;
  fileId: string;
}

export interface Board {
  columns: Map<TypedColumn, Column>;
}
