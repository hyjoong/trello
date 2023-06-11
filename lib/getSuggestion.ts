import { Board } from "@/types/boardTypes";
import { formatTodosForAI } from "./formatTodosForAI";

const getSuggestion = async (board: Board) => {
  const todos = formatTodosForAI(board);

  const res = await fetch("/api/generateSummary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ todos }),
  });

  const data = await res.json();
  const { content } = data;

  return content;
};

export default getSuggestion;
