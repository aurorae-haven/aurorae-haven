/**
 * Library Page - TAB-LIB Implementation
 * Manages reusable Task and Routine templates
 */

import React, { useState, useEffect } from 'react'
import {
  getAllTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  markTemplateUsed,
  filterTemplates,
  sortTemplates,
  exportTemplates,
  importTemplates
} from '../utils/templatesManager'
import { isIndexedDBAvailable } from '../utils/indexedDBManager'
import TemplateCard from '../components/Library/TemplateCard'
import TemplateEditor from '../components/Library/TemplateEditor'
import TemplateToolbar from '../components/Library/TemplateToolbar'
import FilterModal from '../components/Library/FilterModal'

function Library() {
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [useIndexedDB, setUseIndexedDB] = useState(false)

  // UI state
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({
    type: null,
    tags: [],
    durationMin: null,
    durationMax: null
  })

  // Toast state
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      if (!isIndexedDBAvailable()) {
        setLoading(false)
        setUseIndexedDB(false)
        return
      }

      setUseIndexedDB(true)

      try {
        const allTemplates = await getAllTemplates()
        setTemplates(allTemplates)
      } catch (error) {
        console.error('Failed to load templates:', error)
        showToastNotification('Failed to load templates')
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  // Filter and sort templates when dependencies change
  useEffect(() => {
    if (!Array.isArray(templates)) {
      setFilteredTemplates([])
      return
    }

    let result = templates

    // Apply search query
    if (searchQuery) {
      result = filterTemplates(result, { query: searchQuery })
    }

    // Apply filters
    result = filterTemplates(result, filters)

    // Apply sorting
    result = sortTemplates(result, sortBy)

    setFilteredTemplates(result)
  }, [templates, searchQuery, sortBy, filters])

  const showToastNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleNewTemplate = () => {
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData)
        showToastNotification('Template updated')
      } else {
        await saveTemplate(templateData)
        showToastNotification('Template created')
      }

      // Reload templates
      const allTemplates = await getAllTemplates()
      setTemplates(allTemplates)
      setShowEditor(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error('Error saving template:', error)
      showToastNotification('Failed to save template')
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await deleteTemplate(templateId)
      showToastNotification('Template deleted')

      // Reload templates
      const allTemplates = await getAllTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Error deleting template:', error)
      showToastNotification('Failed to delete template')
    }
  }

  const handleDuplicateTemplate = async (templateId) => {
    try {
      await duplicateTemplate(templateId)
      showToastNotification('Template duplicated')

      // Reload templates
      const allTemplates = await getAllTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Error duplicating template:', error)
      showToastNotification('Failed to duplicate template')
    }
  }

  const handleUseTemplate = async (template) => {
    try {
      await markTemplateUsed(template.id)
      showToastNotification(
        template.type === 'task'
          ? 'Template applied — Task created'
          : 'Routine created'
      )

      // TODO: Implement actual task/routine creation logic
      // This would integrate with Tasks or Sequences pages
    } catch (error) {
      console.error('Error using template:', error)
      showToastNotification('Failed to use template')
    }
  }

  const handleExport = async () => {
    try {
      const data = await exportTemplates()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `templates-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToastNotification('Templates exported')
    } catch (error) {
      console.error('Error exporting templates:', error)
      showToastNotification('Failed to export templates')
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const results = await importTemplates(data)

      const allTemplates = await getAllTemplates()
      setTemplates(allTemplates)

      showToastNotification(
        `Imported ${results.imported} templates (${results.skipped} skipped)`
      )
    } catch (error) {
      console.error('Error importing templates:', error)
      showToastNotification('Import failed: Invalid schema')
    }
  }

  if (loading) {
    return (
      <div className='card'>
        <div className='card-h'>
          <strong>Library</strong>
          <span className='small'>Loading templates...</span>
        </div>
        <div className='card-b'>
          <p>Loading your template library...</p>
        </div>
      </div>
    )
  }

  if (!useIndexedDB) {
    return (
      <div className='card'>
        <div className='card-h'>
          <strong>Library</strong>
          <span className='small'>Template management</span>
        </div>
        <div className='card-b'>
          <p>
            Template library requires IndexedDB support. Your browser may not
            support this feature, or it may be disabled.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='library-container'>
      {/* TAB-LIB-03: Toolbar with actions */}
      <TemplateToolbar
        onNewTemplate={handleNewTemplate}
        onExport={handleExport}
        onImport={handleImport}
        onSearch={setSearchQuery}
        onFilter={() => setShowFilterModal(true)}
        onSort={setSortBy}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        sortBy={sortBy}
        viewMode={viewMode}
      />

      {/* TAB-LIB-01: Template grid/list */}
      <div className={`template-${viewMode}`} role={viewMode === 'grid' ? 'grid' : 'list'}>
        {filteredTemplates.length === 0 ? (
          <div className='empty-state'>
            <p>No templates found.</p>
            <p className='small'>
              Create your first template to get started!
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              viewMode={viewMode}
              onUse={() => handleUseTemplate(template)}
              onEdit={() => handleEditTemplate(template)}
              onDelete={() => handleDeleteTemplate(template.id)}
              onDuplicate={() => handleDuplicateTemplate(template.id)}
            />
          ))
        )}
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onClose={() => {
            setShowEditor(false)
            setEditingTemplate(null)
          }}
        />
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          onFilterChange={setFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className='toast' style={{ display: 'block' }}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export default Library
