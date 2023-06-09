"use client";
import { useBoardStore } from "@/store/boardStore";
import React, { useEffect } from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import Column from "./Column";

const Board = () => {
  const { board, getBoard, setBoardState } = useBoardStore((state) => state);
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
              <Column key={id} id={id} todos={column.todos} index={index} />
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;
