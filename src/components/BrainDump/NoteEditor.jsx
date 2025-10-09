import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { handleEnterKey } from '../../utils/listContinuation'
import { getUniqueCategories } from '../../utils/brainDump/noteFilters'

/**
 * Component for editing a note's title, category, and markdown content
 */
function NoteEditor({
  currentNote,
  currentNoteId,
  title,
  category,
  content,
  preview,
  notes,
  showNoteList,
  onTitleChange,
  onCategoryChange,
  onContentChange,
  onToggleNoteList,
  onNewNote,
  onImport,
  onExport,
  onDelete,
  onLockToggle,
  onShowDetails
}) {
  const editorRef = useRef(null)
  const previewRef = useRef(null)

  // Sync scroll between editor and preview
  useEffect(() => {
    const editor = editorRef.current
    const preview = previewRef.current

    if (!editor || !preview) return

    const handleScroll = () => {
      const scrollPercentage = editor.scrollTop / editor.scrollHeight
      preview.scrollTop = scrollPercentage * preview.scrollHeight
    }

    editor.addEventListener('scroll', handleScroll)
    return () => editor.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className='brain-dump-main'>
      <div className='card'>
        <div className='card-h'>
          <div className='title-input-wrapper'>
            {!showNoteList && (
              <button
                className='btn btn-icon toggle-notes-btn'
                onClick={onToggleNoteList}
                aria-label='Show notes list'
                title='Show notes list'
              >
                <svg
                  className='icon'
                  viewBox='0 0 24 24'
                  role='img'
                  aria-hidden='true'
                >
                  <line x1='3' y1='12' x2='21' y2='12' />
                  <line x1='3' y1='6' x2='21' y2='6' />
                  <line x1='3' y1='18' x2='21' y2='18' />
                </svg>
              </button>
            )}
            <input
              type='text'
              className='note-title-input'
              placeholder='Note title...'
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              disabled={!currentNoteId || currentNote?.locked}
              aria-label='Note title'
            />
            <input
              type='text'
              className='note-category-input'
              placeholder='Category...'
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              disabled={!currentNoteId || currentNote?.locked}
              list='category-suggestions'
              aria-label='Note category'
            />
            <datalist id='category-suggestions'>
              {getUniqueCategories(notes).map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div className='toolbar'>
            <label className='btn' aria-label='Import' title='Import'>
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='17 8 12 3 7 8' />
                <line x1='12' y1='3' x2='12' y2='15' />
              </svg>
              <input
                type='file'
                accept='.md,.markdown,.txt'
                onChange={onImport}
                style={{ display: 'none' }}
                aria-label='Import markdown file'
              />
            </label>
            <button
              className='btn'
              onClick={onExport}
              aria-label='Export'
              title='Export'
              disabled={!currentNoteId}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='7 10 12 15 17 10' />
                <line x1='12' y1='15' x2='12' y2='3' />
              </svg>
            </button>
            <button
              className='btn btn-delete'
              onClick={onDelete}
              aria-label='Delete'
              title='Delete'
              disabled={!currentNoteId || currentNote?.locked}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
                <path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
              </svg>
            </button>
            <button
              className='btn'
              onClick={onNewNote}
              aria-label='New note'
              title='New note'
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <path d='M12 5v14M5 12h14' />
              </svg>
            </button>
            <button
              className='btn'
              onClick={onLockToggle}
              aria-label={
                currentNote?.locked ? 'Unlock note' : 'Lock note'
              }
              title={currentNote?.locked ? 'Unlock note' : 'Lock note'}
              disabled={!currentNoteId}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                {currentNote?.locked ? (
                  <>
                    <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
                    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                  </>
                ) : (
                  <>
                    <rect x='5' y='11' width='14' height='10' rx='2' ry='2' />
                    <path d='M7 11V7a5 5 0 0 1 9.9-1' />
                  </>
                )}
              </svg>
            </button>
            <button
              className='btn'
              onClick={onShowDetails}
              aria-label='Show note details'
              title='Show note details'
              disabled={!currentNoteId}
            >
              <svg className='icon' viewBox='0 0 24 24'>
                <circle cx='12' cy='12' r='10' />
                <line x1='12' y1='16' x2='12' y2='12' />
                <line x1='12' y1='8' x2='12.01' y2='8' />
              </svg>
            </button>
          </div>
        </div>
        <div className='card-b'>
          <div className='editor-container'>
            <textarea
              ref={editorRef}
              className='editor'
              placeholder='Start writing your note in Markdown...'
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              onKeyDown={(e) => {
                const cursorPosition = e.target.selectionStart;
                const handled = handleEnterKey(content, cursorPosition);
                if (!handled && e.ctrlKey && e.key === 's') {
                  e.preventDefault()
                }
              }}
              disabled={!currentNoteId || currentNote?.locked}
              aria-label='Markdown editor'
            />
            <div
              ref={previewRef}
              className='preview'
              dangerouslySetInnerHTML={{ __html: preview }}
              aria-label='Markdown preview'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

NoteEditor.propTypes = {
  currentNote: PropTypes.object,
  currentNoteId: PropTypes.string,
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  preview: PropTypes.string.isRequired,
  notes: PropTypes.array.isRequired,
  showNoteList: PropTypes.bool.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onContentChange: PropTypes.func.isRequired,
  onToggleNoteList: PropTypes.func.isRequired,
  onNewNote: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onLockToggle: PropTypes.func.isRequired,
  onShowDetails: PropTypes.func.isRequired
}

export default NoteEditor
