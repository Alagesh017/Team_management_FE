import ExcelJS from 'exceljs';

// ─── Theme ────────────────────────────────────────────────────────────────────
const THEME = {
  headerBg:      'FF1E3A5F',   // deep navy
  headerFg:      'FFFFFFFF',   // white
  subHeaderBg:   'FF2E6DA4',   // medium blue
  subHeaderFg:   'FFFFFFFF',
  altRowBg:      'FFF0F5FB',   // soft blue-tint
  borderColor:   'FFB0C4DE',   // steel blue
  accentGreen:   'FF217346',   // Excel-green for locked ID cols
  lockedBg:      'FFF5F5F5',   // light grey for read-only cells
  font:          'Arial',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const workbookToBase64 = async (workbook) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
};

const border = (color = THEME.borderColor) => ({
  top:    { style: 'thin', color: { argb: color } },
  left:   { style: 'thin', color: { argb: color } },
  bottom: { style: 'thin', color: { argb: color } },
  right:  { style: 'thin', color: { argb: color } },
});

const applyHeaderStyle = (cell, bg = THEME.headerBg, fg = THEME.headerFg) => {
  cell.font      = { name: THEME.font, bold: true, color: { argb: fg }, size: 11 };
  cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  cell.border    = border('FF003366');
};

const applyDataRowStyle = (row, rowIndex, isLocked = false) => {
  const isAlt = rowIndex % 2 === 0;
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const locked = isLocked && (colNumber === 3 || colNumber === 9); // Status ID & Member IDs
    cell.font      = { name: THEME.font, size: 10, color: { argb: locked ? THEME.accentGreen : 'FF1A1A1A' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: locked ? THEME.lockedBg : (isAlt ? THEME.altRowBg : 'FFFFFFFF') } };
    cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center', wrapText: false };
    cell.border    = border();
  });
  row.height = 22;
};

// ─── Main export ──────────────────────────────────────────────────────────────
export const createExcelFileWithData = async ({ statuses = [], members = [], tasks = [] }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator  = 'Task Manager';
  workbook.created  = new Date();
  workbook.modified = new Date();

  // ── Helper sheet (hidden lookup tables) ─────────────────────────────────────
  const helperSheet = workbook.addWorksheet('Helper', { state: 'veryHidden' });
  helperSheet.getColumn('A').values = ['Status Name', ...statuses.map(s => s.name)];
  helperSheet.getColumn('B').values = ['Status ID',   ...statuses.map(s => s.status_id)];
  helperSheet.getColumn('C').values = ['Member Name', ...members.map(m => `${m.first_name} ${m.last_name}`)];
  helperSheet.getColumn('D').values = ['Member ID',   ...members.map(m => m.user_id)];

  const statusCount = statuses.length;
  const memberCount = members.length;

  // ── Tasks sheet ─────────────────────────────────────────────────────────────
  const tasksSheet = workbook.addWorksheet('📋 Tasks', {
    properties: { tabColor: { argb: THEME.subHeaderBg } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 2, activeCell: 'A3' }],
  });

  // Column definitions
  tasksSheet.columns = [
    { key: 'title',          width: 32 },
    { key: 'priority',       width: 14 },
    { key: 'statusId',       width: 20 },  // C – auto via VLOOKUP (locked)
    { key: 'statusName',     width: 22 },  // D – dropdown
    { key: 'startDate',      width: 14 },
    { key: 'endDate',        width: 14 },
    { key: 'estimatedHours', width: 18 },
    { key: 'actualHours',    width: 14 },
    { key: 'memberIds',      width: 30 },  // I – auto via VLOOKUP (locked)
    { key: 'memberNames',    width: 36 },  // J – dropdown
  ];

  // Row 1 – section labels (merged across groups)
  tasksSheet.mergeCells('A1:B1');
  tasksSheet.mergeCells('C1:D1');
  tasksSheet.mergeCells('E1:H1');
  tasksSheet.mergeCells('I1:J1');

  const sectionLabels = [
    { cell: 'A1', text: '📝  TASK INFO' },
    { cell: 'C1', text: '📊  STATUS' },
    { cell: 'E1', text: '📅  SCHEDULE & HOURS' },
    { cell: 'I1', text: '👤  ASSIGNMENT' },
  ];
  sectionLabels.forEach(({ cell, text }) => {
    const c = tasksSheet.getCell(cell);
    c.value = text;
    applyHeaderStyle(c, THEME.headerBg, THEME.headerFg);
  });
  tasksSheet.getRow(1).height = 28;

  // Row 2 – column headers
  const headers = [
    'Task Title', 'Priority',
    'Status ID ⚙', 'Status Name ▼',
    'Start Date', 'End Date', 'Est. Hours', 'Actual Hrs',
    'Member IDs ⚙', 'Member Name ▼',
  ];
  headers.forEach((text, i) => {
    const cell = tasksSheet.getRow(2).getCell(i + 1);
    cell.value = text;
    applyHeaderStyle(cell, THEME.subHeaderBg, THEME.subHeaderFg);
  });
  tasksSheet.getRow(2).height = 26;

  // ── Data rows ────────────────────────────────────────────────────────────────
  const DATA_START = 3;
  const MAX_ROWS   = 200;

  // Priority dropdown (static list)
  const priorityList = '"High,Medium,Low,Critical"';

  for (let r = DATA_START; r <= MAX_ROWS; r++) {
    const row = tasksSheet.getRow(r);

    // --- Priority dropdown (col B = 2)
    tasksSheet.getCell(`B${r}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [priorityList],
      showErrorMessage: true,
      errorStyle: 'stop',
      errorTitle: 'Invalid Priority',
      error: 'Please select: High, Medium, Low, or Critical.',
    };

    // --- Status Name dropdown (col D = 4)
    if (statusCount > 0) {
      tasksSheet.getCell(`D${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        // FIXED: correct reference – A column = Status Name
        formulae: [`Helper!$A$2:$A$${statusCount + 1}`],
        showErrorMessage: true,
        errorStyle: 'stop',
        errorTitle: 'Invalid Status',
        error: 'Please select a status from the drop-down list.',
      };

      // FIXED: VLOOKUP(lookup_value, table_array, col_index) – col A→B means col_index = 2
      tasksSheet.getCell(`C${r}`).value = {
        formula: `=IFERROR(VLOOKUP(D${r},Helper!$A$2:$B$${statusCount + 1},2,FALSE),"")`,
      };
    }

    // --- Member Name dropdown (col J = 10)
    if (memberCount > 0) {
      tasksSheet.getCell(`J${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        // FIXED: correct reference – C column = Member Name
        formulae: [`Helper!$C$2:$C$${memberCount + 1}`],
        showErrorMessage: true,
        errorStyle: 'stop',
        errorTitle: 'Invalid Member',
        error: 'Please select a member from the drop-down list.',
      };

      // FIXED: VLOOKUP on C column (member name) → D column (member ID), col_index = 2
      tasksSheet.getCell(`I${r}`).value = {
        formula: `=IFERROR(VLOOKUP(J${r},Helper!$C$2:$D$${memberCount + 1},2,FALSE),"")`,
      };
    }

    // Row styling (alternating, locked ID cols highlighted)
    applyDataRowStyle(row, r - DATA_START, true);
    row.height = 22;
  }

  // ── Pre-fill existing tasks ──────────────────────────────────────────────────
  tasks.forEach((task, idx) => {
    const r   = DATA_START + idx;
    const row = tasksSheet.getRow(r);
    const taskMembers = task.assigned_workers || [];

    row.getCell(1).value = task.title          || '';
    row.getCell(2).value = task.priority        || '';
    // col 3 (C) = Status ID → driven by VLOOKUP from col D; just put the name in D
    row.getCell(4).value = statuses.find(s => s.status_id === task.status_id)?.name || '';
    row.getCell(5).value = task.start_date      || '';
    row.getCell(6).value = task.due_date        || '';
    row.getCell(7).value = task.estimated_hours || '';
    row.getCell(8).value = task.actual_hours    || '';
    // col 9 (I) = Member IDs → driven by VLOOKUP from col J; put first member name in J
    // (single-select dropdown; for multi-member you can extend)
    row.getCell(10).value = taskMembers.map(m => `${m.first_name} ${m.last_name}`).join(', ') || '';

    applyDataRowStyle(row, idx, true);
  });

  // ── Conditional formatting: colour Priority cells ────────────────────────────
  const cfRules = [
    { text: 'Critical', color: 'FFFFE0E0' },
    { text: 'High',     color: 'FFFFF3CD' },
    { text: 'Medium',   color: 'FFE3F3FF' },
    { text: 'Low',      color: 'FFE8F5E9' },
  ];
  cfRules.forEach(({ text, color }) => {
    tasksSheet.addConditionalFormatting({
      ref: `B${DATA_START}:B${MAX_ROWS}`,
      rules: [{
        type: 'containsText',
        operator: 'containsText',
        text,
        style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color } } },
      }],
    });
  });

  // ── Freeze, auto-filter, print setup ─────────────────────────────────────────
  tasksSheet.autoFilter = { from: 'A2', to: 'J2' };
  tasksSheet.pageSetup  = { orientation: 'landscape', fitToPage: true, fitToWidth: 1 };

  // ── Legend sheet ─────────────────────────────────────────────────────────────
  const legend = workbook.addWorksheet('ℹ️ Legend', {
    properties: { tabColor: { argb: 'FF6C757D' } },
  });
  legend.columns = [{ width: 22 }, { width: 52 }];

  const legendData = [
    ['Column', 'Description'],
    ['Task Title',       'Name or brief description of the task'],
    ['Priority',         'Select from: Critical / High / Medium / Low'],
    ['Status ID ⚙',     'Auto-filled via VLOOKUP – do not edit'],
    ['Status Name ▼',   'Select from dropdown; Status ID fills automatically'],
    ['Start Date',       'Planned start date (YYYY-MM-DD)'],
    ['End Date',         'Planned completion / due date'],
    ['Est. Hours',       'Estimated effort in hours'],
    ['Actual Hrs',       'Actual hours logged'],
    ['Member IDs ⚙',    'Auto-filled via VLOOKUP – do not edit'],
    ['Member Name ▼',   'Select assignee from dropdown; ID fills automatically'],
  ];

  legendData.forEach((row, i) => {
    const r = legend.addRow(row);
    if (i === 0) {
      r.eachCell(cell => applyHeaderStyle(cell, THEME.headerBg));
    } else {
      r.getCell(1).font = { name: THEME.font, bold: true,  size: 10 };
      r.getCell(2).font = { name: THEME.font, bold: false, size: 10 };
      r.eachCell(cell => {
        cell.border    = border();
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: i % 2 === 0 ? THEME.altRowBg : 'FFFFFFFF' } };
        cell.alignment = { vertical: 'middle', wrapText: true };
      });
    }
    r.height = 22;
  });

  const base64Data = await workbookToBase64(workbook);
  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName   = `Tasks_${timestamp}.xlsx`;

  return { base64Data, fileName };
};

// Backward-compat alias
export const createPredefinedExcelFile = () =>
  createExcelFileWithData({ statuses: [], members: [], tasks: [] });

export const downloadExcelFile = (fileUrl, fileName) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const link    = document.createElement('a');
  link.href     = fileUrl.startsWith('/') ? `${API_URL}${fileUrl}` : fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};