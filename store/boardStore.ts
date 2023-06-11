import { databases, storage } from "@/appwrite";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import { Board, Column, Todo, TypedColumn } from "@/types/boardTypes";
import { create } from "zustand";

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateTodoDatabase: (todo: Todo, columnId: TypedColumn) => void;
  handledDeleteTask: (index: number, todoId: Todo, id: TypedColumn) => void;

  searchContent: string;
  setSearchContent: (searchContent: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  searchContent: "",
  setSearchContent: (searchContent: string) => set({ searchContent }),
  getBoard: async () => {
    const board = await getTodosGroupedByColumn();
    set({ board });
  },

  setBoardState: (board) => set({ board }),

  handledDeleteTask: async (index: number, todo: Todo, id: TypedColumn) => {
    const newColumns = new Map(get().board.columns);
    newColumns.get(id)?.todos.splice(index, 1);
    set({ board: { columns: newColumns } });

    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },

  updateTodoDatabase: async (todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },
}));
