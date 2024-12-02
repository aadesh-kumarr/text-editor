"use client";
import TextBox from "@/types";

import { useState, useRef, MouseEvent } from "react";
import { GrUndo, GrRedo } from "react-icons/gr";



export default function Home() {
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [activeBoxId, setActiveBoxId] = useState<number | null>(null);
  const [draggingBoxId, setDraggingBoxId] = useState<number | null>(null);
  const [initialPosition, setInitialPosition] = useState<{ x: number; y: number } | null>(null);

  const historyRef = useRef<TextBox[][]>([]);
  const redoStackRef = useRef<TextBox[][]>([]);

  const saveStateToHistory = () => {
    console.log("Saving state to history");
    historyRef.current.push([...textBoxes]);
    redoStackRef.current = [];
  };

  const undo = () => {
    console.log("Undo button clicked");
    if (historyRef.current.length > 0) {
      const previousState = historyRef.current.pop()!;
      redoStackRef.current.push([...textBoxes]);
      setTextBoxes(previousState);
    }
  };

  const redo = () => {
    console.log("Redo button clicked");
    if (redoStackRef.current.length > 0) {
      const nextState = redoStackRef.current.pop()!;
      historyRef.current.push([...textBoxes]);
      setTextBoxes(nextState);
    }
  };

  const addTextBox = () => {
    saveStateToHistory();
    const newBox: TextBox = {
      id: Date.now(),
      x: 50,
      y: 50,
      content: "New Text",
      fontSize: 16,
      fontFamily: "Arial",
      bold: false,
      italic: false,
      underline: false,
      alignment: "Left",
    };
    setTextBoxes([...textBoxes, newBox]);
  };

  const updatePosition = (id: number, x: number, y: number) => {
    setTextBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, x, y } : box))
    );
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>, id: number) => {
    e.stopPropagation();
    setActiveBoxId(id);
    setDraggingBoxId(id);

    const box = textBoxes.find((box) => box.id === id);
    if (box) {
      setInitialPosition({ x: box.x, y: box.y });
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (draggingBoxId !== null) {
      const canvas = document.getElementById("canvas")!;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updatePosition(draggingBoxId, x, y);
    }
  };

  const handleMouseUp = () => {
    if (initialPosition && draggingBoxId !== null) {
      const box = textBoxes.find((box) => box.id === draggingBoxId);
      if (box && (box.x !== initialPosition.x || box.y !== initialPosition.y)) {
        saveStateToHistory();
      }
    }
    setDraggingBoxId(null);
    setInitialPosition(null);
  };

  const updateTextBox = (id: number, changes: Partial<TextBox>) => {
    saveStateToHistory();
    setTextBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, ...changes } : box))
    );
  };

  const activeBox = textBoxes.find((box) => box.id === activeBoxId);

  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="relative">
      {/* Navigation Bar */}
      <div className="nav w-full bg-white p-2 h-[10dvh]">
        <div className="icons text-slate-600 flex flex-row justify-center gap-4 my-3">
          <button className="flex flex-col items-center hover:cursor-pointer" onClick={undo}>
            <GrUndo />
            <p>Undo</p>
          </button>
          <button className="flex flex-col items-center hover:cursor-pointer" onClick={redo}>
            <GrRedo />
            <p>Redo</p>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        id="canvas"
        className="bg-slate-200 h-[80dvh] rounded-md relative overflow-hidden"
        onMouseDown={() => setActiveBoxId(null)}
      >
        {textBoxes.map((box) => (
          <div
            key={box.id}
            style={{
              position: "absolute",
              top: `${box.y}px`,
              left: `${box.x}px`,
              fontSize: `${box.fontSize}px`,
              fontFamily: box.fontFamily,
              fontWeight: box.bold ? "bold" : "normal",
              fontStyle: box.italic ? "italic" : "normal",
              textDecoration: box.underline ? "underline" : "none",
              textAlign: box.alignment.toLowerCase() as React.CSSProperties["textAlign"],
              cursor: "move",
              border: activeBoxId === box.id ? "1px solid blue" : "none",
              padding: "4px",
            }}
            contentEditable={activeBoxId === box.id}
            suppressContentEditableWarning
            onMouseDown={(e) => handleMouseDown(e, box.id)}
            onInput={(e) =>
              updateTextBox(box.id, { content: (e.target as HTMLDivElement).ariaValueText || "" })
            }
          >
            {box.content}
          </div>
        ))}
      </div>

      {/* Option Menu */}
      <div className="mt-4 flex items-center gap-4 justify-center" id="optionmenu">
        {activeBox ? (
          <>
            <select
              className="border rounded px-2 py-1"
              value={activeBox.fontFamily}
              onChange={(e) => updateTextBox(activeBox.id, { fontFamily: e.target.value })}
              title="Select Font"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
            </select>

            <input
              type="number"
              className="border rounded px-2 py-1 w-16"
              min={8}
              max={72}
              value={activeBox.fontSize}
              onChange={(e) =>
                updateTextBox(activeBox.id, { fontSize: parseInt(e.target.value, 10) })
              }
              title="Font Size"
            />

            <button
              className={`border px-4 py-1 rounded ${activeBox.bold ? "bg-gray-300" : "hover:bg-gray-200"}`}
              title="Bold"
              onClick={() => updateTextBox(activeBox.id, { bold: !activeBox.bold })}
            >
              B
            </button>

            <button
              className={`border px-4 py-1 rounded ${activeBox.italic ? "bg-gray-300" : "hover:bg-gray-200"}`}
              title="Italic"
              onClick={() => updateTextBox(activeBox.id, { italic: !activeBox.italic })}
            >
              I
            </button>

            <button
              className={`border px-4 py-1 rounded ${activeBox.underline ? "bg-gray-300" : "hover:bg-gray-200"}`}
              title="Underline"
              onClick={() => updateTextBox(activeBox.id, { underline: !activeBox.underline })}
            >
              U
            </button>

            <button
              className="border px-4 py-1 rounded hover:bg-gray-200"
              title="Toggle Alignment"
              onClick={() => {
                const alignments = ["Left", "Center", "Right", "Justify"];
                const currentIndex = alignments.indexOf(activeBox.alignment);
                const nextIndex = (currentIndex + 1) % alignments.length;
                updateTextBox(activeBox.id, { alignment: alignments[nextIndex] });
              }}
            >
              {activeBox.alignment}
            </button>
          </>
        ) : (
          <p className="text-gray-500">Select a text box to edit its properties.</p>
        )}

        <button className="border px-4 py-1 rounded hover:bg-gray-200" onClick={addTextBox}>
          + Add Text
        </button>
      </div>
    </div>
  );
}
