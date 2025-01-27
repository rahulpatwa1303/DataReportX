import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "./ui/textarea";

type FormData = {
  query: string;
};

const SQLQueryEditor: React.FC<SQLQueryEditorProps> = ({
  suggestionsData,
  setParentFormData,
  parentFormData,
}) => {
  const [formData, setFormData] = useState<FormData>({
    query: "",
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [coord, setCoord] = useState<{ x: number; y: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function getSuggestionKeys(refState: any, input: string) {
    if (!refState || !refState.tables) return [];

    const state = structuredClone(refState);
    const suggestionList: string[] = [];

    // Split the input into table part and column part (based on dot)
    const [tableInput, columnInput] = input.split(".");

    // If a dot is typed, suggest columns based on the columnInput
    if (columnInput !== undefined) {
      // Find tables matching the table part before the dot
      const matchingTables = Object.keys(state.tables).filter((table) =>
        table.includes(tableInput)
      );

      // For each matching table, suggest matching columns
      matchingTables.forEach((table) => {
        const columns = state.tables[table].columns || [];
        const matchingColumns = columns.filter((column: string) =>
          column.includes(columnInput)
        );

        // Add matching columns without including the table name
        matchingColumns.forEach((column: string) => {
          suggestionList.push(column);
        });
      });
    } else {
      // If no dot is typed, suggest matching tables
      const matchingTables = Object.keys(state.tables).filter((table) =>
        table.includes(tableInput)
      );

      matchingTables.forEach((table) => {
        suggestionList.push(table);
      });
    }

    return suggestionList;
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newQuery = e.target.value;

    setFormData({ query: newQuery });

    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }

    const textBeforeCursor = newQuery.slice(0, e.target.selectionStart);
    const match = textBeforeCursor.match(/\${([^}]*)$/);

    if (match) {
      const userQuery = match[1].trim();
      const sug = getSuggestionKeys(suggestionsData, userQuery);

      setSuggestions(sug);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % suggestions.length;
        scrollToHighlightedIndex(newIndex); // Scroll to the new index
        return newIndex;
      });
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) => {
        const newIndex =
          (prevIndex - 1 + suggestions.length) % suggestions.length;
        scrollToHighlightedIndex(newIndex); // Scroll to the new index
        return newIndex;
      });
      e.preventDefault();
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      insertSuggestion(suggestions[highlightedIndex]);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = formData.query.slice(0, cursorPosition);
    const textAfterCursor = formData.query.slice(cursorPosition);

    const match = textBeforeCursor.match(/\${([^}]*)$/);
    if (match) {
      const newTextBeforeCursor =
        textBeforeCursor.slice(0, match.index) +
        `\${${match[0].replace(/\$\{|\}/g, "")}${suggestion}}`;

      const updatedQuery = newTextBeforeCursor + textAfterCursor;
      setFormData({ query: updatedQuery });
      setSuggestions([]);
      setHighlightedIndex(-1);

      setCursorPosition(newTextBeforeCursor.length);
    }
  };

  const getCaretCoordinates = (
    textarea: HTMLTextAreaElement,
    position: number
  ) => {
    const div = document.createElement("div");
    const style = window.getComputedStyle(textarea);

    for (const prop of style) {
      div.style.setProperty(prop, style.getPropertyValue(prop));
    }

    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";

    div.textContent = textarea.value.slice(0, position);

    const span = document.createElement("span");
    span.textContent = textarea.value.slice(position) || ".";
    div.appendChild(span);

    document.body.appendChild(div);
    const { offsetLeft, offsetTop } = span;

    document.body.removeChild(div);

    return {
      x: offsetLeft,
      y: offsetTop + parseInt(style.lineHeight, 10),
    };
  };

  const scrollToHighlightedIndex = (index: number) => {
    const suggestionContainer = document.querySelector(
      ".suggestion-container"
    ) as HTMLElement;
    const highlightedItem = suggestionContainer?.children[index] as HTMLElement;

    if (suggestionContainer && highlightedItem) {
      const containerTop = suggestionContainer.scrollTop;
      const containerHeight = suggestionContainer.clientHeight;
      const itemTop = highlightedItem.offsetTop;
      const itemHeight = highlightedItem.clientHeight;

      if (itemTop + itemHeight > containerTop + containerHeight) {
        // Scroll down if item is below the visible area
        suggestionContainer.scrollTop = itemTop + itemHeight - containerHeight;
      } else if (itemTop < containerTop) {
        // Scroll up if item is above the visible area
        suggestionContainer.scrollTop = itemTop;
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current && cursorPosition >= 0) {
      const { x, y } = getCaretCoordinates(textareaRef.current, cursorPosition);
      setCoord({ x, y });
    }
  }, [cursorPosition]);

  useEffect(() => {
    if (parentFormData.query !== "") {
      setFormData({ query: parentFormData.query });
    }
  }, [parentFormData.query]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={formData.query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter your SQL query"
        className="mt-1 block w-full rounded-md border-gray-300  sm:text-sm p-2"
        rows={14}
        name="query"
        onBlur={() =>
          setParentFormData((prev: any) => ({ ...prev, query: formData.query }))
        }
      />

      {suggestions.length > 0 && coord && (
        <div
          className="absolute bg-white border border-gray-300 mt-2 p-2 max-h-40 overflow-y-auto w-60 rounded-md shadow-lg z-10 suggestion-container"
          style={{ top: coord.y, left: coord.x }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              className={`p-2 cursor-pointer ${
                index === highlightedIndex ? "bg-blue-100" : ""
              }`}
              onClick={() => insertSuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SQLQueryEditor;
