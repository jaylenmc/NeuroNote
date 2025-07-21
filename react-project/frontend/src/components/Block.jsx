import React from 'react';
import useAutoResizeTextarea from './useAutoResizeTextarea';

const Block = ({ 
    block, 
    index, 
    blocks, 
    activeBlockId, 
    hoveredBlockId, 
    editingContent, 
    blockTypes,
    onBlockChange,
    onBlockBlur,
    onBlockKeyDown,
    onBlockMenuClick,
    onMouseEnter,
    onMouseLeave,
    createNewBlock,
    deleteBlock,
    updateBlockContent,
    setActiveBlockId,
    setEditingBlockId,
    setEditingContent,
    setHoveredBlockId,
    blockRefs
}) => {
    const autoResizeRef = useAutoResizeTextarea(block.content);
    const prevBlock = blocks[index - 1];
    let paragraphStyle = {};
    let paragraphClass = 'block-input paragraph';
    if (block.type === 'paragraph' && prevBlock && ['h1', 'h2', 'h3'].includes(prevBlock.type)) {
        paragraphStyle.marginTop = 0;
        paragraphClass += ' paragraph-after-heading';
    }
    
    // Block type label for tag
    const blockTypeObj = blockTypes.find(t => t.type === block.type);
    const blockTypeLabel = blockTypeObj ? blockTypeObj.label : block.type;
    
    // Show tag if block is empty
    const isFocused = activeBlockId === block.id;
    const liveContent = isFocused ? editingContent : block.content;
    const isEmpty = !liveContent || liveContent.replace(/<[^>]+>/g, '').trim() === '';

    function handleBlockFocus(e, blockId) {
        setActiveBlockId(blockId);
        const el = e.currentTarget;
        if (!el.innerText.trim()) {
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    return (
        <div
            key={block.id}
            className={`block-wrapper ${activeBlockId === block.id ? 'active' : ''}`}
            onMouseEnter={() => onMouseEnter(block.id)}
            onMouseLeave={() => onMouseLeave(null)}
            style={{ position: 'relative' }}
        >
            {/* Block Type Tag (absolutely positioned, not a flex child) */}
            {isEmpty && (
                <span className="block-type-tag">{blockTypeLabel}</span>
            )}
            {/* Menu button and content */}
            {(hoveredBlockId === block.id || activeBlockId === block.id) && (
                <button
                    className="block-menu-button"
                    onClick={(e) => onBlockMenuClick(e, block.id)}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    +
                </button>
            )}
            {block.type === 'paragraph' && (
                <textarea
                    className={paragraphClass}
                    value={block.content || ''}
                    data-block-id={block.id}
                    ref={autoResizeRef}
                    onFocus={e => {
                        handleBlockFocus(e, block.id);
                        setEditingBlockId(block.id);
                        setEditingContent(e.target.value);
                    }}
                    onChange={e => {
                        setEditingContent(e.target.value);
                        updateBlockContent(block.id, e.target.value);
                    }}
                    onBlur={e => {
                        updateBlockContent(block.id, e.target.value);
                        setEditingBlockId(null);
                        setEditingContent('');
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Backspace' && e.target.value.length === 0) {
                            e.preventDefault();
                            if (blocks.length > 1) {
                                const idx = blocks.findIndex(b => b.id === block.id);
                                if (idx > 0) {
                                    const prevBlockId = blocks[idx - 1].id;
                                    deleteBlock(block.id);
                                    setTimeout(() => {
                                        const prevEl = blockRefs.current[prevBlockId];
                                        if (prevEl) {
                                            prevEl.focus();
                                        }
                                    }, 0);
                                }
                            }
                        } else {
                            onBlockKeyDown(e, block.id, block.type);
                        }
                    }}
                />
            )}
            {block.type === 'h1' && (
                <textarea
                    className="block-input heading-1"
                    value={block.content || ''}
                    data-block-id={block.id}
                    ref={autoResizeRef}
                    onFocus={e => {
                        handleBlockFocus(e, block.id);
                        setEditingBlockId(block.id);
                        setEditingContent(e.target.value);
                    }}
                    onChange={e => {
                        setEditingContent(e.target.value);
                        updateBlockContent(block.id, e.target.value);
                    }}
                    onBlur={e => {
                        updateBlockContent(block.id, e.target.value);
                        setEditingBlockId(null);
                        setEditingContent('');
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Backspace' && e.target.value.length === 0) {
                            e.preventDefault();
                            if (blocks.length > 1) {
                                const idx = blocks.findIndex(b => b.id === block.id);
                                if (idx > 0) {
                                    const prevBlockId = blocks[idx - 1].id;
                                    deleteBlock(block.id);
                                    setTimeout(() => {
                                        const prevEl = blockRefs.current[prevBlockId];
                                        if (prevEl) {
                                            prevEl.focus();
                                        }
                                    }, 0);
                                }
                            }
                        } else {
                            onBlockKeyDown(e, block.id, block.type);
                        }
                    }}
                />
            )}
            {block.type === 'h2' && (
                <textarea
                    className="block-input heading-2"
                    value={block.content || ''}
                    data-block-id={block.id}
                    ref={autoResizeRef}
                    onFocus={e => {
                        handleBlockFocus(e, block.id);
                        setEditingBlockId(block.id);
                        setEditingContent(e.target.value);
                    }}
                    onChange={e => {
                        setEditingContent(e.target.value);
                        updateBlockContent(block.id, e.target.value);
                    }}
                    onBlur={e => {
                        updateBlockContent(block.id, e.target.value);
                        setEditingBlockId(null);
                        setEditingContent('');
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Backspace' && e.target.value.length === 0) {
                            e.preventDefault();
                            if (blocks.length > 1) {
                                const idx = blocks.findIndex(b => b.id === block.id);
                                if (idx > 0) {
                                    const prevBlockId = blocks[idx - 1].id;
                                    deleteBlock(block.id);
                                    setTimeout(() => {
                                        const prevEl = blockRefs.current[prevBlockId];
                                        if (prevEl) {
                                            prevEl.focus();
                                        }
                                    }, 0);
                                }
                            }
                        } else {
                            onBlockKeyDown(e, block.id, block.type);
                        }
                    }}
                />
            )}
            {block.type === 'h3' && (
                <textarea
                    className="block-input heading-3"
                    value={block.content || ''}
                    data-block-id={block.id}
                    ref={autoResizeRef}
                    onFocus={e => {
                        handleBlockFocus(e, block.id);
                        setEditingBlockId(block.id);
                        setEditingContent(e.target.value);
                    }}
                    onChange={e => {
                        setEditingContent(e.target.value);
                        updateBlockContent(block.id, e.target.value);
                    }}
                    onBlur={e => {
                        updateBlockContent(block.id, e.target.value);
                        setEditingBlockId(null);
                        setEditingContent('');
                    }}
                    onKeyDown={e => {
                        if (e.key === 'Backspace' && e.target.value.length === 0) {
                            e.preventDefault();
                            if (blocks.length > 1) {
                                const idx = blocks.findIndex(b => b.id === block.id);
                                if (idx > 0) {
                                    const prevBlockId = blocks[idx - 1].id;
                                    deleteBlock(block.id);
                                    setTimeout(() => {
                                        const prevEl = blockRefs.current[prevBlockId];
                                        if (prevEl) {
                                            prevEl.focus();
                                        }
                                    }, 0);
                                }
                            }
                        } else {
                            onBlockKeyDown(e, block.id, block.type);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default Block; 