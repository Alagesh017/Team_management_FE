import ExcelJS from 'exceljs';

// Helper function to convert ExcelJS workbook to base64
const workbookToBase64 = async (workbook) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = btoa(
    String.fromCharCode(...new Uint8Array(buffer))
  );
  return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
};

export const createExcelFileWithData = async ({ statuses, members, tasks = [] }) => {
  const workbook = new ExcelJS.Workbook();
  
  // Add tasks sheet
  const tasksSheet = workbook.addWorksheet('Tasks');
  
  // Add hidden helper sheet for drop-down options
  const helperSheet = workbook.addWorksheet('Helper', { state: 'hidden' });

  // Write status options to helper sheet (lookup column first: Name then ID)
  helperSheet.getColumn('A').values = ['Status Name', ...statuses.map(s => s.name)];
  helperSheet.getColumn('B').values = ['Status ID', ...statuses.map(s => s.status_id)];
  
  // Write member options to helper sheet (lookup column first: Name then ID)
  helperSheet.getColumn('C').values = ['Member Name', ...members.map(m => `${m.first_name} ${m.last_name}`)];
  helperSheet.getColumn('D').values = ['Member ID', ...members.map(m => m.user_id)];

  // Define columns for tasks sheet
  tasksSheet.columns = [
    { header: 'Task Title', key: 'title', width: 30 },
    { header: 'Priority', key: 'priority', width: 15 },
    { header: 'Status ID', key: 'statusId', width: 10 },
    { header: 'Status Name', key: 'statusName', width: 20 },
    { header: 'Start Date', key: 'startDate', width: 15 },
    { header: 'End Date', key: 'endDate', width: 15 },
    { header: 'Estimated Hours', key: 'estimatedHours', width: 18 },
    { header: 'Actual Hours', key: 'actualHours', width: 15 },
    { header: 'Member IDs', key: 'memberIds', width: 15 },
    { header: 'Member Names', key: 'memberNames', width: 40 }
  ];

  const startRow = 2; // Start from row 2 (after header)
  const maxRows = 100; // Add validation to first 100 rows

  // Status Name drop-down (column D)
  for (let row = startRow; row <= maxRows; row++) {
    const statusCell = tasksSheet.getCell(`D${row}`);
    statusCell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`=Helper!$A$2:$A$${statuses.length + 1}`],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid Status',
      error: 'Please select a status from the drop-down list.'
    };

    // Auto-fill Status ID using VLOOKUP (column C)
    const statusIdCell = tasksSheet.getCell(`C${row}`);
    statusIdCell.value = {
      formula: `=IFERROR(VLOOKUP(D${row}, Helper!$A$2:$B$${statuses.length + 1}, 2, FALSE), "")`
    };
  }

  // Member Names drop-down (column J)
  for (let row = startRow; row <= maxRows; row++) {
    const memberCell = tasksSheet.getCell(`J${row}`);
    memberCell.dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`=Helper!$C$2:$C$${members.length + 1}`],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid Member',
      error: 'Please select a member from the drop-down list.'
    };

    // Auto-fill Member IDs using VLOOKUP (column I)
    const memberIdCell = tasksSheet.getCell(`I${row}`);
    memberIdCell.value = {
      formula: `=IFERROR(VLOOKUP(J${row}, Helper!$C$2:$D$${members.length + 1}, 2, FALSE), "")`
    };
  }

  // Add existing tasks to the sheet
  if (tasks.length > 0) {
    tasks.forEach((task, index) => {
      const rowIndex = index + 2;
      const taskMembers = task.assigned_workers || [];
      
      // Set values (formulas will auto-override ID columns)
      const row = tasksSheet.getRow(rowIndex);
      row.values = [
        task.title || '',
        task.priority || '',
        task.status_id || '',
        statuses.find(s => s.status_id === task.status_id)?.name || '',
        task.start_date || '',
        task.due_date || '',
        task.estimated_hours || '',
        task.actual_hours || '',
        taskMembers.map(m => m.user_id).join(', ') || '',
        taskMembers.map(m => `${m.first_name} ${m.last_name}`).join(', ') || ''
      ];
      
      // Re-apply formulas to ID columns after setting values
      if (statuses.length > 0) {
        row.getCell(3).value = {
          formula: `=IFERROR(VLOOKUP(D${rowIndex}, Helper!$B$2:$A$${statuses.length + 1}, 2, FALSE), "")`
        };
      }
      if (members.length > 0) {
        row.getCell(9).value = {
          formula: `=IFERROR(VLOOKUP(J${rowIndex}, Helper!$D$2:$C$${members.length + 1}, 2, FALSE), "")`
        };
      }
    });
  }

  // Style header row
  const headerRow = tasksSheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Convert to base64
  const base64Data = await workbookToBase64(workbook);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Tasks_${timestamp}.xlsx`;

  return { base64Data, fileName };
};

// For backward compatibility - still exports createPredefinedExcelFile
export const createPredefinedExcelFile = () => {
  return createExcelFileWithData({ statuses: [], members: [], tasks: [] });
};

export const downloadExcelFile = (fileUrl, fileName) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const link = document.createElement('a');
  link.href = fileUrl.startsWith('/') ? `${API_URL}${fileUrl}` : fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
