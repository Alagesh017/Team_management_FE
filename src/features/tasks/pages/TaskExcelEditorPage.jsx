import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSidebar } from '../../../common/components/ui/sidebar';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule } from 'ag-grid-community';

const agGridModules = [AllCommunityModule];
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as XLSX from 'xlsx';
import { Button } from '../../../common/components/ui/button';
import { ArrowLeft, Save, Plus, Trash2, Loader2, FileSpreadsheet, Download } from 'lucide-react';
import { projectExcelService } from '../services/projectExcelService';
import { projectTaskService } from '../services/projectTaskService';
import { useToast } from '../../../common/hooks/use-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Custom Select Cell Editor — works for both Status and Members
// Stores "id|name" in cell; displays just the name label.
// ─────────────────────────────────────────────────────────────────────────────
const SelectCellEditor = forwardRef(({ value, stopEditing, options, multi = false }, ref) => {
  const [selected, setSelected] = useState(() => {
    if (!value) return multi ? [] : null;
    if (multi) {
      return value.split(';').map((v) => v.trim()).filter(Boolean);
    }
    return value;
  });
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getValue() {
      if (multi) return Array.isArray(selected) ? selected.join('; ') : '';
      return selected || '';
    },
    isPopup() { return true; },
  }));

  const toggleMulti = (optValue) => {
    setSelected((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(optValue) ? arr.filter((v) => v !== optValue) : [...arr, optValue];
    });
  };

  const selectSingle = (optValue) => {
    setSelected(optValue);
    setTimeout(() => stopEditing(), 50);
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: '#fff',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        minWidth: 200,
        maxHeight: 260,
        overflowY: 'auto',
        zIndex: 9999,
        padding: '4px 0',
      }}
    >
      {multi && (
        <div style={{ padding: '6px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <button
            style={{
              fontSize: 11,
              color: '#16a34a',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onClick={() => stopEditing()}
          >
            ✓ Done
          </button>
        </div>
      )}

      {options.map((opt) => {
        const isSelected = multi
          ? Array.isArray(selected) && selected.includes(opt.value)
          : selected === opt.value;

        return (
          <div
            key={opt.value}
            onClick={() => multi ? toggleMulti(opt.value) : selectSingle(opt.value)}
            style={{
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: isSelected ? 600 : 400,
              background: isSelected ? '#f0fdf4' : 'transparent',
              color: isSelected ? '#16a34a' : '#374151',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
          >
            {multi && (
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: `2px solid ${isSelected ? '#16a34a' : '#9ca3af'}`,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isSelected ? '#16a34a' : 'transparent',
                  color: '#fff',
                  fontSize: 9,
                }}
              >
                {isSelected ? '✓' : ''}
              </span>
            )}
            {opt.color && (
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: opt.color,
                  flexShrink: 0,
                }}
              />
            )}
            <span>{opt.label}</span>
          </div>
        );
      })}
    </div>
  );
});

SelectCellEditor.displayName = 'SelectCellEditor';

// ─────────────────────────────────────────────────────────────────────────────
// Cell Renderer — shows nice badge/chips from stored "id|name" values
// ─────────────────────────────────────────────────────────────────────────────
const StatusCellRenderer = ({ value, statusOptions }) => {
  if (!value) return <span style={{ color: '#9ca3af', fontSize: 12 }}>— select —</span>;
  const opt = statusOptions.find((o) => o.value === value);
  const label = opt?.label || value.split('|')[1] || value;
  const color = opt?.color || '#6b7280';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        borderRadius: 12,
        background: color + '22',
        border: `1px solid ${color}44`,
        fontSize: 12,
        fontWeight: 600,
        color,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
};

const MembersCellRenderer = ({ value, memberOptions }) => {
  if (!value) return <span style={{ color: '#9ca3af', fontSize: 12 }}>— select —</span>;
  const parts = value.split(';').map((v) => v.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', height: '100%' }}>
      {parts.map((p) => {
        const opt = memberOptions.find((o) => o.value === p);
        const label = opt?.label || p.split('|')[1] || p;
        return (
          <span
            key={p}
            style={{
              padding: '1px 7px',
              borderRadius: 10,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              fontSize: 11,
              fontWeight: 600,
              color: '#1d4ed8',
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Priority cell renderer with color coding
// ─────────────────────────────────────────────────────────────────────────────
const PriorityCellRenderer = ({ value }) => {
  if (!value) return <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>;
  const colors = {
    high:   { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
    medium: { bg: '#fffbeb', border: '#fcd34d', text: '#d97706' },
    low:    { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
  };
  const c = colors[value.toLowerCase()] || { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: 10,
      background: c.bg,
      border: `1px solid ${c.border}`,
      fontSize: 12,
      fontWeight: 600,
      color: c.text,
    }}>
      {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────
const TaskExcelEditorPage = () => {
  const { excelId } = useParams();
  const navigate = useNavigate();
  const { sidebarWidth } = useSidebar();
  const { toast } = useToast();
  
  const gridRef = useRef(null);
  const [excelFile, setExcelFile] = useState(null);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [memberOptions, setMemberOptions] = useState([]);

  const priorityOptions = [
    { value: 'high',   label: 'High'   },
    { value: 'medium', label: 'Medium' },
    { value: 'low',    label: 'Low'    },
  ];

  const emptyRow = () => ({
    'Task Title': '',
    'Priority': '',
    'Status ID': '',
    'Status Name': '',
    'Start Date': '',
    'End Date': '',
    'Estimated Hours': '',
    'Actual Hours': '',
    'Member IDs': '',
    'Member Names': '',
    '_status': '',
    '_members': '',
  });

  // Parse base64 Excel file to get rows and metadata
  const parseExcelFile = (base64Data) => {
    try {
      if (!base64Data || !base64Data.includes(',')) {
        return { rows: [], statuses: [], members: [] };
      }
      
      const binaryString = atob(base64Data.split(',')[1]);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      const workbook = XLSX.read(uint8Array, { type: 'array' });
      
      // Get Tasks sheet
      const tasksSheet = workbook.Sheets['Tasks'];
      if (!tasksSheet) return { rows: [], statuses: [], members: [] };
      
      const rows = XLSX.utils.sheet_to_json(tasksSheet, { header: 1 });
      const headers = rows[0] || [];
      const dataRows = rows.slice(1);
      
      // Convert to object format
      const formattedRows = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, idx) => {
          obj[header] = row[idx] !== undefined ? row[idx] : '';
        });
        return obj;
      });
      
      // Get __meta__ sheet if available
      let statuses = [];
      let members = [];
      if (workbook.Sheets['__meta__']) {
        const metaSheet = workbook.Sheets['__meta__'];
        const metaData = XLSX.utils.sheet_to_json(metaSheet);
        metaData.forEach(item => {
          if (item.key === 'statuses') {
            try {
              statuses = JSON.parse(item.value);
            } catch {
              statuses = [];
            }
          }
          if (item.key === 'members') {
            try {
              members = JSON.parse(item.value);
            } catch {
              members = [];
            }
          }
        });
      }
      
      return { rows: formattedRows, statuses, members };
    } catch (err) {
      console.error('Failed to parse Excel file:', err);
      return { rows: [], statuses: [], members: [] };
    }
  };

  // Load Excel file and project data
  const loadExcelFile = async () => {
    if (!excelId) return;
    
    try {
      setLoading(true);
      const data = await projectExcelService.getExcelById(excelId);
      const fileData = data.excel_file;
      
      setExcelFile(fileData);
      
      // Parse Excel file
      const { rows, statuses, members } = parseExcelFile(fileData.file_data);
      
      // If we don't have statuses/members from Excel, load from project
      if ((statuses.length === 0 || members.length === 0) && fileData.project_id) {
        try {
          const projectData = await projectTaskService.getProjectTaskData(fileData.project_id);
          
          if (statuses.length === 0 && projectData.statuses) {
            statuses.push(...projectData.statuses);
          }
          
          if (members.length === 0 && (projectData.allocated_members || projectData.all_admins)) {
            const seen = new Set();
            const combined = [];
            const allAdmins = projectData.all_admins || [];
            const allocatedMembers = projectData.allocated_members || [];
            [...allAdmins, ...allocatedMembers].forEach((m) => {
              const memberType = m.type || (m.is_admin || m.is_superadmin ? 'admin' : 'worker');
              const uniqueKey = `${memberType}-${m.user_id}`;
              if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                combined.push({ ...m, type: memberType });
              }
            });
            members.push(...combined);
          }
        } catch (err) {
          console.error('Failed to load project data:', err);
        }
      }
      
      // Set status and member options
      setStatusOptions(statuses.map(s => ({
        value: `${s.status_id}|${s.name}`,
        label: s.name,
        color: s.color,
      })));
      
      setMemberOptions(members.map(m => ({
        value: `${m.user_id}|${m.first_name} ${m.last_name}`.trim(),
        label: `${m.first_name} ${m.last_name}`.trim(),
      })));
      
      // Store statuses/members on excelFile for later use
      setExcelFile(prev => ({
        ...prev,
        statuses,
        members,
      }));
      
      // Normalize rows
      const normalizedRows = normalizeRows(rows.length > 0 ? rows : [emptyRow()]);
      setRowData(normalizedRows);
      
    } catch (err) {
      console.error('Failed to load Excel file:', err);
      toast({
        title: 'Error',
        description: 'Failed to load Excel file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Normalize rows to add _status and _members fields
  const normalizeRows = useCallback((rows) => {
    return rows.map((r) => {
      const row = { ...r };
      if (!row['_status'] && row['Status ID'] && row['Status Name']) {
        row['_status'] = `${row['Status ID']}|${row['Status Name']}`;
      }
      if (!row['_members'] && row['Member IDs'] && row['Member Names']) {
        const ids = String(row['Member IDs']).split(',').map((v) => v.trim());
        const names = String(row['Member Names']).split(',').map((v) => v.trim());
        row['_members'] = ids.map((id, i) => `${id}|${names[i] || ''}`).join('; ');
      }
      return row;
    });
  }, []);

  useEffect(() => {
    loadExcelFile();
  }, [excelId]);

  // ── Column Definitions ─────────────────────────────────────────────────────
  const columnDefs = [
    {
      headerName: '#',
      valueGetter: 'node.rowIndex + 1',
      width: 50,
      pinned: 'left',
      editable: false,
      sortable: false,
      filter: false,
      cellStyle: { color: '#9ca3af', fontSize: 12, fontWeight: 500 },
      headerClass: 'ag-header-center',
    },
    {
      field: 'Task Title',
      headerName: 'Task Title',
      flex: 2,
      minWidth: 200,
      editable: true,
      cellStyle: { fontWeight: 500, color: '#1e293b' },
    },
    {
      field: 'Priority',
      headerName: 'Priority',
      width: 130,
      editable: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: { options: priorityOptions, multi: false },
      cellEditorPopup: true,
      cellRenderer: PriorityCellRenderer,
    },
    {
      field: '_status',
      headerName: 'Status',
      width: 170,
      editable: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: { options: statusOptions, multi: false },
      cellEditorPopup: true,
      cellRenderer: (params) => (
        <StatusCellRenderer value={params.value} statusOptions={statusOptions} />
      ),
      valueSetter: (params) => {
        params.data['_status'] = params.newValue;
        if (params.newValue) {
          const [id, ...nameParts] = params.newValue.split('|');
          params.data['Status ID'] = id;
          params.data['Status Name'] = nameParts.join('|');
        } else {
          params.data['Status ID'] = '';
          params.data['Status Name'] = '';
        }
        return true;
      },
    },
    {
      field: 'Start Date',
      headerName: 'Start Date',
      width: 130,
      editable: true,
      cellEditor: 'agDateStringCellEditor',
      cellStyle: { color: '#374151' },
    },
    {
      field: 'End Date',
      headerName: 'End Date',
      width: 130,
      editable: true,
      cellEditor: 'agDateStringCellEditor',
      cellStyle: { color: '#374151' },
    },
    {
      field: 'Estimated Hours',
      headerName: 'Est. Hours',
      width: 110,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      type: 'numericColumn',
      cellStyle: { color: '#374151', textAlign: 'right' },
    },
    {
      field: 'Actual Hours',
      headerName: 'Act. Hours',
      width: 110,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      type: 'numericColumn',
      cellStyle: { color: '#374151', textAlign: 'right' },
    },
    {
      field: '_members',
      headerName: 'Members',
      flex: 2,
      minWidth: 220,
      editable: true,
      cellEditor: SelectCellEditor,
      cellEditorParams: { options: memberOptions, multi: true },
      cellEditorPopup: true,
      cellRenderer: (params) => (
        <MembersCellRenderer value={params.value} memberOptions={memberOptions} />
      ),
      valueSetter: (params) => {
        params.data['_members'] = params.newValue;
        if (params.newValue) {
          const entries = params.newValue.split(';').map((v) => v.trim()).filter(Boolean);
          params.data['Member IDs'] = entries.map((e) => e.split('|')[0]).join(', ');
          params.data['Member Names'] = entries.map((e) => {
            const parts = e.split('|');
            parts.shift();
            return parts.join('|');
          }).join(', ');
        } else {
          params.data['Member IDs'] = '';
          params.data['Member Names'] = '';
        }
        return true;
      },
    },
    {
      headerName: '',
      width: 50,
      pinned: 'right',
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <button
          title="Delete row"
          onClick={() => deleteRow(params.node.rowIndex)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#ef4444',
            padding: '2px 4px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      ),
    },
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    suppressMovable: false,
  };

  // ── Add / Delete rows ─────────────────────────────────────────────────────
  const addRow = () => setRowData((prev) => [...prev, emptyRow()]);

  const deleteRow = (index) => {
    setRowData((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated.length > 0 ? updated : [emptyRow()];
    });
  };

  // ── Export / Save ─────────────────────────────────────────────────────────
  const buildWorkbook = () => {
    const exportRows = rowData.map(({ _status, _members, ...rest }) => rest);
    const tasksSheet = XLSX.utils.json_to_sheet(exportRows);
    
    const metaSheet = XLSX.utils.json_to_sheet([
      { key: 'statuses', value: JSON.stringify(excelFile?.statuses || []) },
      { key: 'members', value: JSON.stringify(excelFile?.members || []) },
    ]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');
    XLSX.utils.book_append_sheet(workbook, metaSheet, '__meta__');
    return workbook;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const workbook = buildWorkbook();
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      const base64Data = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;

      await projectExcelService.updateExcel(excelId, {
        file_data: base64Data,
        file_name: excelFile?.file_name || 'Tasks.xlsx',
      });

      setSavedMsg('Saved!');
      toast({
        title: 'Success',
        description: 'Excel file saved successfully',
        variant: 'success',
      });
      setTimeout(() => setSavedMsg(''), 2500);
    } catch (err) {
      console.error('Failed to save:', err);
      setSavedMsg('Save failed.');
      toast({
        title: 'Error',
        description: err.msg || err.error || 'Failed to save Excel file',
        variant: 'destructive',
      });
      setTimeout(() => setSavedMsg(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    const workbook = buildWorkbook();
    XLSX.writeFile(workbook, excelFile?.file_name || 'Tasks.xlsx');
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-white min-h-screen"
        style={{ width: `calc(100vw - ${sidebarWidth}px)` }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Excel file...</p>
        </div>
      </div>
    );
  }

  if (!excelFile) {
    return (
      <div 
        className="flex flex-col items-center justify-center bg-white min-h-screen gap-4 p-8"
        style={{ width: `calc(100vw - ${sidebarWidth}px)` }}
      >
        <h3 className="text-xl font-semibold text-slate-800">Excel file not found</h3>
        <Button onClick={() => navigate('/tasks/export')}>
          Back to Export Page
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col bg-white min-h-screen"
      style={{ width: `calc(100vw - ${sidebarWidth}px)` }}
    >
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b bg-white sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/tasks/export')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <FileSpreadsheet className="h-5 w-5 text-green-600 shrink-0" />
          <span className="font-semibold text-slate-800 text-sm truncate" title={excelFile.file_name}>
            {excelFile.file_name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {savedMsg && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              savedMsg === 'Saved!'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {savedMsg}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5 text-slate-600 border-slate-200 hover:border-slate-300 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white gap-1.5 font-bold text-xs px-4"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-5 py-2 border-b bg-slate-50">
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          className="gap-1.5 text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Row
        </Button>

        <span className="text-xs text-slate-400 ml-2">
          {rowData.filter((r) => r['Task Title']).length} task{rowData.filter((r) => r['Task Title']).length !== 1 ? 's' : ''}
          {' · '}
          <span className="text-slate-500">Click any cell to edit · Status &amp; Members have dropdowns</span>
        </span>
      </div>

      {/* ── AG Grid ── */}
      <div
        className="ag-theme-alpine flex-1"
        style={{
          height: 'calc(100vh - 112px)',
          '--ag-header-background-color': '#f8fafc',
          '--ag-header-foreground-color': '#374151',
          '--ag-header-cell-hover-background-color': '#f1f5f9',
          '--ag-row-hover-color': '#f8fafc',
          '--ag-selected-row-background-color': '#f0fdf4',
          '--ag-range-selection-border-color': '#16a34a',
          '--ag-cell-horizontal-border': 'solid #f1f5f9',
          '--ag-font-size': '13px',
          '--ag-font-family': 'Inter, system-ui, sans-serif',
          '--ag-border-color': '#e2e8f0',
          '--ag-row-border-color': '#f1f5f9',
          '--ag-odd-row-background-color': '#ffffff',
          '--ag-header-column-separator-display': 'block',
          '--ag-header-column-separator-color': '#e2e8f0',
        }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={(e) => {
            const updated = [...rowData];
            updated[e.node.rowIndex] = { ...e.data };
            setRowData(updated);
          }}
          rowHeight={44}
          headerHeight={40}
          suppressRowClickSelection
          enableCellTextSelection
          stopEditingWhenCellsLoseFocus
          animateRows
          domLayout="normal"
          getRowStyle={(params) => ({
            borderBottom: '1px solid #f1f5f9',
          })}
        />
      </div>

      {/* ── Footer Legend ── */}
      <div className="px-5 py-2 border-t bg-slate-50 flex items-center gap-6 flex-wrap">
        <span className="text-[11px] text-slate-400 font-medium">
          📋 Stored format: Status → <code className="bg-slate-100 px-1 rounded text-slate-600">id|name</code>
          {' · '}
          Members → <code className="bg-slate-100 px-1 rounded text-slate-600">id|name; id|name</code>
        </span>
        <span className="text-[11px] text-slate-400">
          {statusOptions.length} statuses · {memberOptions.length} members loaded
        </span>
      </div>
    </div>
  );
};

export default TaskExcelEditorPage;
