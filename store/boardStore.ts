import { databases, storage } from "@/appwrite";
import { getTodosGroupedByColumn } from "@/lib/getTodosGroupedByColumn";
import { uploadImage } from "@/lib/uploadImage";
import {
  Board,
  Column,
  ImageType,
  Todo,
  TypedColumn,
} from "@/types/boardTypes";
import { ID } from "appwrite";
import { create } from "zustand";

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateTodoDatabase: (todo: Todo, columnId: TypedColumn) => void;
  handledDeleteTask: (index: number, todoId: Todo, id: TypedColumn) => void;
  addTask: (todo: string, columnId: TypedColumn, image?: File | null) => void;

  newTaskInput: string;
  newTaskType: TypedColumn;
  setNewTaskInput: (newTaskInput: string) => void;
  setNewTaskType: (columnId: TypedColumn) => void;

  searchContent: string;
  setSearchContent: (searchContent: string) => void;

  image: File | null;
  setImage: (image: File | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  searchContent: "",
  newTaskInput: "",
  newTaskType: "todo",
  image: null,
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

  setNewTaskInput: (newTaskInput: string) => set({ newTaskInput }),
  setNewTaskType: (columnId: TypedColumn) => set({ newTaskType: columnId }),
  setImage: (image: File | null) => set({ image }),

  addTask: async (todo: string, columnId: TypedColumn, image?: File | null) => {
    let file: ImageType | undefined;

    if (image) {
      const fileUploaded = await uploadImage(image);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
      }
    }

    const { $id } = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        ...(file && { image: JSON.stringify(file) }),
      }
    );

    set({ newTaskInput: "" });

    set((state) => {
      const newColumns = new Map(state.board.columns);

      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        ...(file && { image: file }),
      };

      const column = newColumns.get(columnId);

      if (!column) {
        newColumns.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      } else {
        newColumns.get(columnId)?.todos.push(newTodo);
      }

      return {
        board: { columns: newColumns },
      };
    });
  },
}));
