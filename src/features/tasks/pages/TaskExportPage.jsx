import React from 'react'
import { useSidebar } from '../../../common/components/ui/sidebar'
import { Button } from '../../../common/components/ui/button'
import { FileSpreadsheet, Plus, Loader2 } from 'lucide-react'
import ExcelFileCard from '../components/ExcelFileCard'
import { useTaskExport } from '../hooks/useTaskExport'

const TaskExportPage = () => {
  const { sidebarWidth } = useSidebar()
  const {
    excelFiles,
    loading,
    creating,
    projectId,
    handleCreateExcel,
    handleDownloadExcel,
  } = useTaskExport()

  return (
    <div 
      className="p-4 md:p-6 space-y-8 bg-white min-h-screen"
      style={{ width: `calc(100vw - ${sidebarWidth}px)` }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div className="min-w-0 space-y-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 truncate">
            <FileSpreadsheet className="h-5 w-5 md:h-6 md:w-6 text-green-600 shrink-0" />
            Excel Files
          </h1>
          <p className="text-sm text-slate-500 font-medium hidden md:block">Create and manage your task Excel sheets.</p>
        </div>
        
        <Button 
          onClick={handleCreateExcel}
          disabled={creating || !projectId}
          className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 px-6 transition-all active:scale-95 w-full sm:w-auto"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create Excel File
        </Button>
      </div>

      {/* Grid View of Excel Files */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading files...</p>
        </div>
      ) : excelFiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-8 gap-y-12">
          {excelFiles.map((excelFile) => (
            <ExcelFileCard 
              key={excelFile.id} 
              excelFile={excelFile}
              onClick={() => handleDownloadExcel(excelFile)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] p-12 text-center gap-6">
          <div className="h-40 w-40 md:h-48 md:w-48 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
            <FileSpreadsheet className="h-20 w-20 md:h-24 md:w-24 text-green-600" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-xl font-semibold text-slate-800">No Excel files yet</h3>
            <p className="text-slate-500 text-sm">
              Click "Create Excel File" to get started!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskExportPage
