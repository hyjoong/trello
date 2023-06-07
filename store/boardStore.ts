import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import { Models } from "appwrite";
import { create } from "zustand";

export type TypedColumn = "todo" | "inprogress" | "done";

interface Todo extends Models.Document {
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

interface Board {
  columns: Map<TypedColumn, Column>;
}

interface BoardState {
  board: Board;
  getBoard: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    const board = await getTodosGroupedByColumn();
    set({ board });
  },
}));
