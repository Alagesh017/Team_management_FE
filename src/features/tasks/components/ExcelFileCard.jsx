import React from 'react'
import { FileSpreadsheet } from 'lucide-react'

const ExcelFileCard = ({ excelFile, onClick }) => {
  return (
    <div 
      className="group flex flex-col items-center gap-2 cursor-pointer outline-none p-2"
      onClick={onClick}
    >
      <div className="relative transition-all duration-300 group-hover:scale-105 active:scale-95 group-hover:-translate-y-1">
        <div className="h-32 w-32 md:h-40 md:w-40 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-200 group-hover:shadow-lg group-hover:border-slate-300">
          <div className="relative">
            <FileSpreadsheet className="h-20 w-20 text-green-600" />
          </div>
        </div>
      </div>

      <div className="w-full text-center max-w-[160px] mt-2">
        <span 
          className="text-[12px] font-medium text-slate-600 leading-tight line-clamp-2 break-all transition-colors group-hover:text-slate-80"
          title={excelFile.file_name}
        >
          {excelFile.file_name}
        </span>
      </div>
    </div>
  )
}

export default ExcelFileCard
