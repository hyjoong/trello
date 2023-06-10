"use client";
import { useBoardStore } from "@/store/boardStore";
import React, { useEffect } from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import { Column } from "@/types/boardTypes";
import BoardColumn from "./Column";

const Board = () => {
  const { board, getBoard, setBoardState, updateTodoDatabase } = useBoardStore(
    (state) => state
  );
  useEffect(() => {
    getBoard();
  }, [getBoard]);

  const handleDrag = (result: DropResult) => {
    const { destination, source, type } = result;
    // destination.dropableId = column index
    // destination.index = todo index

    if (!destination) return;

    if (type === "column") {
      const entries = Array.from(board.columns.entries());
      const [removedColumn] = entries.splice(source.index, 1);

      entries.splice(destination.index, 0, removedColumn);
      const newColumns = new Map(entries);
      setBoardState({
        ...board,
        columns: newColumns,
      });
    }

    const columns = Array.from(board.columns);
    const startColumnIndex = columns[Number(source.droppableId)];
    const finishColumnIndex = columns[Number(destination.droppableId)];

    const startColumn: Column = {
      id: startColumnIndex[0],
      todos: startColumnIndex[1].todos,
    };

    const finishColumn: Column = {
      id: finishColumnIndex[0],
      todos: finishColumnIndex[1].todos,
    };

    if (!startColumn || !finishColumn) return;

    if (source.index === destination.index && startColumn === finishColumn)
      return;

    const newTodoItem = startColumn.todos;
    const [movedItem] = newTodoItem.splice(source.index, 1);

    if (startColumn.id === finishColumn.id) {
      newTodoItem.splice(destination.index, 0, movedItem);
      const newColumn = {
        id: startColumn.id,
        todos: newTodoItem,
      };
      const newColumns = new Map(board.columns);
      newColumns.set(startColumn.id, newColumn);
      setBoardState({ ...board, columns: newColumns });
    } else {
      const finishTodos = Array.from(finishColumn.todos);
      finishTodos.splice(destination.index, 0, movedItem);

      const newColumns = new Map(board.columns);
      const newColumn = {
        id: startColumn.id,
        todos: newTodoItem,
      };

      newColumns.set(startColumn.id, newColumn);
      newColumns.set(finishColumn.id, {
        id: finishColumn.id,
        todos: finishTodos,
      });

      updateTodoDatabase(movedItem, finishColumn.id);

      setBoardState({ ...board, columns: newColumns });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDrag}>
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(proviced) => (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
            {...proviced.droppableProps}
            ref={proviced.innerRef}
          >
            {Array.from(board.columns.entries()).map(([id, column], index) => (
              <BoardColumn
                key={id}
                id={id}
                todos={column.todos}
                index={index}
              />
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;
