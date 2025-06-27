import React, { useState, useRef } from "react";
import "./NotesEditor.css";

const BLOCK_TYPES = [
  { type: "h1", label: "Heading 1", placeholder: "Heading 1" },
  { type: "h2", label: "Heading 2", placeholder: "Heading 2" },
  { type: "h3", label: "Heading 3", placeholder: "Heading 3" },
  { type: "paragraph", label: "Text", placeholder: "Text" },
  { type: "quote", label: "Quote", placeholder: "Quote..." },
  { type: "code", label: "Code", placeholder: "Code..." }
];

const getPlaceholder = type =>
  BLOCK_TYPES.find(t => t.type === type)?.placeholder || "";

export default function NotesEditor() {
  const [blocks, setBlocks] = useState([
    { id: Date.now().toString(), type: "paragraph", content: "" }
  ]);
  const blockRefs = useRef({});

  // Formatting
  const format = cmd => document.execCommand(cmd, false, null);

  // Block input handler
  const handleInput = (e, id) => {
    let html = e.currentTarget.innerHTML;
    if (html === "<br>" || html.trim() === "") html = "";
    setBlocks(blocks =>
      blocks.map(b => (b.id === id ? { ...b, content: html } : b))
    );
  };

  // Block keydown handler
  const handleKeyDown = (e, id, idx) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newId = Date.now().toString();
      const newBlock = { id: newId, type: "paragraph", content: "" };
      setBlocks(blocks => {
        const newBlocks = [...blocks];
        newBlocks.splice(idx + 1, 0, newBlock);
        return newBlocks;
      });
      setTimeout(() => blockRefs.current[newId]?.focus(), 0);
    }
    // Backspace on empty block deletes it
    if (
      e.key === "Backspace" &&
      blocks[idx].content === "" &&
      blocks.length > 1
    ) {
      e.preventDefault();
      setBlocks(blocks => {
        const newBlocks = blocks.filter((b, i) => i !== idx);
        setTimeout(() => {
          const prev = newBlocks[idx - 1] || newBlocks[0];
          blockRefs.current[prev.id]?.focus();
        }, 0);
        return newBlocks;
      });
    }
  };

  // Block type switcher
  const setBlockType = (id, type) => {
    setBlocks(blocks =>
      blocks.map(b => (b.id === id ? { ...b, type } : b))
    );
  };

  return (
    <div>
      {/* Formatting Toolbar */}
      <div className="toolbar">
        <button onMouseDown={e => { e.preventDefault(); format("bold"); }}>
          <b>B</b>
        </button>
        <button onMouseDown={e => { e.preventDefault(); format("italic"); }}>
          <i>I</i>
        </button>
        <button onMouseDown={e => { e.preventDefault(); format("hiliteColor", "yellow"); }}>
          <span style={{ background: "yellow" }}>H</span>
        </button>
      </div>
      {/* Blocks */}
      <div className="blocks-container">
        {blocks.map((block, idx) => (
          <div key={block.id} className="block-row">
            {/* Block type dropdown */}
            <select
              className="block-type-select"
              value={block.type}
              onChange={e => setBlockType(block.id, e.target.value)}
            >
              {BLOCK_TYPES.map(bt => (
                <option key={bt.type} value={bt.type}>
                  {bt.label}
                </option>
              ))}
            </select>
            {/* ContentEditable block */}
            <div
              className={`block-input ${block.type}`}
              contentEditable
              suppressContentEditableWarning
              spellCheck={true}
              data-placeholder={getPlaceholder(block.type)}
              ref={el => (blockRefs.current[block.id] = el)}
              onInput={e => handleInput(e, block.id)}
              onKeyDown={e => handleKeyDown(e, block.id, idx)}
              style={{ minHeight: "1.5em", position: "relative" }}
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 