import React, { useState, useEffect, useMemo } from 'react';
import { Download, Calendar, Users, Folder, CheckSquare, TrendingUp } from 'lucide-react';
import { taskService } from '../../tasks/services/taskService';

const ReportPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('overall');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [quickDate, setQuickDate] = useState('custom');

  const getDateRange = (type) => {
    const now = new Date();
    const start = new Date(now);
    switch (type) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
      case 'thisweek': {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        const weekEnd = new Date(start);
        weekEnd.setDate(start.getDate() + 6);
        return { start: start.toISOString().split('T')[0], end: weekEnd.toISOString().split('T')[0] };
      }
      case 'thismonth': {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: start.toISOString().split('T')[0], end: monthEnd.toISOString().split('T')[0] };
      }
      default:
        return { start: null, end: null };
    }
  };

  const handleQuickDate = (type) => {
    setQuickDate(type);
    if (type !== 'custom') {
      const range = getDateRange(type);
      setDateRange(range);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardData] = await Promise.all([taskService.getDashboardTasks()]);
        setData(dashboardData);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allTasks = useMemo(() => {
    if (!data?.groups) return [];
    return data.groups.flatMap((group) =>
      (group.projects || []).flatMap((project) =>
        (project.tasks || []).map((task) => ({
          ...task,
          projectName: project.name,
          projectId: project.id,
          groupName: group.name,
        }))
      )
    );
  }, [data]);

  const projects = useMemo(() => {
    if (!data?.groups) return [];
    return data.groups.flatMap((group) => group.projects || []);
  }, [data]);

  const users = useMemo(() => {
    const userSet = new Set();
    allTasks.forEach((task) => {
      (task.members || []).forEach((member) => {
        const name =
          typeof member === 'object'
            ? `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email
            : member;
        if (name) userSet.add(name);
      });
    });
    return Array.from(userSet);
  }, [allTasks]);

  const statuses = useMemo(() => {
    const statusSet = new Set();
    allTasks.forEach((task) => {
      const status = task.status_name || task.status;
      if (status) statusSet.add(status);
    });
    return Array.from(statusSet);
  }, [allTasks]);

  const filteredTasks = useMemo(() => {
    let filtered = [...allTasks];

    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((task) => {
        const taskDate = task.start_date ? new Date(task.start_date) : null;
        if (!taskDate) return false;
        return taskDate >= start && taskDate <= end;
      });
    }

    switch (activeFilter) {
      case 'byProject':
        if (selectedProject !== 'all') {
          filtered = filtered.filter((task) => task.projectId === Number(selectedProject));
        }
        break;
      case 'byUser':
        if (selectedUser !== 'all') {
          filtered = filtered.filter((task) =>
            (task.members || []).some((member) => {
              const name =
                typeof member === 'object'
                  ? `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email
                  : member;
              return name === selectedUser;
            })
          );
        }
        break;
      case 'byStatus':
        if (selectedStatus !== 'all') {
          filtered = filtered.filter(
            (task) => (task.status_name || task.status) === selectedStatus
          );
        }
        break;
    }

    return filtered;
  }, [allTasks, dateRange, activeFilter, selectedProject, selectedUser, selectedStatus]);

  const groupedData = useMemo(() => {
    const grouped = {};
    filteredTasks.forEach((task) => {
      const projName = task.projectName || 'Unassigned';
      if (!grouped[projName]) grouped[projName] = {};

      (task.members || []).forEach((member) => {
        const userName =
          typeof member === 'object'
            ? `${member.first_name || ''} ${member.last_name || ''}`.trim() ||
              member.email ||
              'Unknown User'
            : member;
        if (!grouped[projName][userName]) grouped[projName][userName] = [];
        grouped[projName][userName].push(task);
      });

      if ((task.members || []).length === 0) {
        if (!grouped[projName]['Unassigned']) grouped[projName]['Unassigned'] = [];
        grouped[projName]['Unassigned'].push(task);
      }
    });
    return grouped;
  }, [filteredTasks]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch (e) {
      return '-';
    }
  };

  const getMemberNames = (members) => {
    if (!members?.length) return '-';
    return members
      .map((m) =>
        typeof m === 'object'
          ? `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email
          : m
      )
      .join(', ');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // EXCEL GENERATION — Professional styled output using sheetjs-style
  // Install: npm install xlsx-js-style
  // ─────────────────────────────────────────────────────────────────────────────
  const generateExcel = async () => {
    const XLSX = await import('xlsx-js-style');

    // ── Colour palette ──────────────────────────────────────────────────────────
    const C = {
      projHeaderBg:   'D1D5DB',
      projHeaderFg:   '111827',
      userHeaderBg:   'E5E7EB',
      userHeaderFg:   '374151',
      colHeaderBg:    'F3F4F6',
      colHeaderFg:    '374151',
      rowEvenBg:      'FFFFFF',
      rowOddBg:       'F9FAFB',
      rowFg:          '111827',
      totalsBg:       'E5E7EB',
      totalsFg:       '1F2937',
      summaryHeaderBg:'D1D5DB',
      summaryHeaderFg:'111827',
      summaryRowBg:   'F9FAFB',
      summaryTotalBg: '9CA3AF',
      summaryTotalFg: 'FFFFFF',
      metaBg:         'F3F4F6',
      metaFg:         '6B7280',
      border:         'E5E7EB',
      borderDark:     'D1D5DB',
    };

    // ── Border helpers ──────────────────────────────────────────────────────────
    const border = (colorHex = C.border) => ({
      top:    { style: 'thin',   color: { rgb: colorHex } },
      bottom: { style: 'thin',   color: { rgb: colorHex } },
      left:   { style: 'thin',   color: { rgb: colorHex } },
      right:  { style: 'thin',   color: { rgb: colorHex } },
    });

    const borderMedium = (colorHex = C.borderDark) => ({
      top:    { style: 'medium', color: { rgb: colorHex } },
      bottom: { style: 'medium', color: { rgb: colorHex } },
      left:   { style: 'medium', color: { rgb: colorHex } },
      right:  { style: 'medium', color: { rgb: colorHex } },
    });

    // ── Style definitions ───────────────────────────────────────────────────────
    const s = {
      projHeader: {
        font:      { bold: true, sz: 14, color: { rgb: C.projHeaderFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.projHeaderBg }, patternType: 'solid' },
        alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
        border:    borderMedium(),
      },
      metaCell: {
        font:      { italic: true, sz: 10, color: { rgb: C.metaFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.metaBg }, patternType: 'solid' },
        alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
        border:    border(C.border),
      },
      userHeader: {
        font:      { bold: true, sz: 11, color: { rgb: C.userHeaderFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.userHeaderBg }, patternType: 'solid' },
        alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
        border:    borderMedium(C.userHeaderBg),
      },
      colHeader: {
        font:      { bold: true, sz: 9, color: { rgb: C.colHeaderFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.colHeaderBg }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border:    border(C.borderDark),
      },
      colHeaderLeft: {
        font:      { bold: true, sz: 9, color: { rgb: C.colHeaderFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.colHeaderBg }, patternType: 'solid' },
        alignment: { horizontal: 'left', vertical: 'center', indent: 1, wrapText: true },
        border:    border(C.borderDark),
      },
      dataEven: {
        font:      { sz: 9, color: { rgb: C.rowFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.rowEvenBg }, patternType: 'solid' },
        alignment: { vertical: 'center', wrapText: false },
        border:    border(),
      },
      dataEvenCenter: {
        font:      { sz: 9, color: { rgb: C.rowFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.rowEvenBg }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border:    border(),
      },
      dataOdd: {
        font:      { sz: 9, color: { rgb: C.rowFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.rowOddBg }, patternType: 'solid' },
        alignment: { vertical: 'center', wrapText: false },
        border:    border(),
      },
      dataOddCenter: {
        font:      { sz: 9, color: { rgb: C.rowFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.rowOddBg }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border:    border(),
      },
      totalsLabel: {
        font:      { bold: true, sz: 9, color: { rgb: C.totalsFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.totalsBg }, patternType: 'solid' },
        alignment: { horizontal: 'right', vertical: 'center', indent: 1 },
        border:    border(C.totalsFg),
      },
      totalsValue: {
        font:      { bold: true, sz: 9, color: { rgb: C.totalsFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.totalsBg }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border:    border(C.totalsFg),
      },
      totalsEmpty: {
        fill:   { fgColor: { rgb: C.totalsBg }, patternType: 'solid' },
        border: border(C.totalsFg),
      },
      summaryHeader: {
        font:      { bold: true, sz: 11, color: { rgb: C.summaryHeaderFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.summaryHeaderBg }, patternType: 'solid' },
        alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
        border:    borderMedium(C.summaryHeaderBg),
      },
      summaryColHeader: {
        font:      { bold: true, sz: 9, color: { rgb: C.colHeaderFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.colHeaderBg }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border:    border(C.borderDark),
      },
      summaryRow: {
        font:      { sz: 9, color: { rgb: C.rowFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.summaryRowBg }, patternType: 'solid' },
        alignment: { vertical: 'center', indent: 1 },
        border:    border(),
      },
      summaryRowCenter: {
        font:      { sz: 9, color: { rgb: C.rowFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.summaryRowBg }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border:    border(),
      },
      summaryTotal: {
        font:      { bold: true, sz: 10, color: { rgb: C.summaryTotalFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.summaryTotalBg }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border:    borderMedium(C.summaryTotalBg),
      },
      summaryTotalLabel: {
        font:      { bold: true, sz: 10, color: { rgb: C.summaryTotalFg }, name: 'Arial' },
        fill:      { fgColor: { rgb: C.summaryTotalBg }, patternType: 'solid' },
        alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
        border:    borderMedium(C.summaryTotalBg),
      },
    };

    // ── Low-level cell helpers ──────────────────────────────────────────────────
    const cell = (v, style, t) => ({
      v,
      t: t ?? (typeof v === 'number' ? 'n' : 's'),
      s: style,
    });

    const merge = (ws, sr, sc, er, ec) => {
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({ s: { r: sr, c: sc }, e: { r: er, c: ec } });
    };

    const fillMerge = (ws, rowIdx, fromCol, toCol, style) => {
      for (let c = fromCol; c <= toCol; c++) {
        const addr = XLSX.utils.encode_cell({ r: rowIdx, c });
        if (!ws[addr]) ws[addr] = cell('', style);
        else ws[addr].s = style;
      }
    };

    // ── Column config (9 cols for project sheets) ───────────────────────────────
    const COLS = 9;
    const COL_WIDTHS = [32, 38, 14, 10, 12, 12, 10, 10, 30];
    const COL_HEADERS = [
      'Task Title', 'Description', 'Status', 'Priority',
      'Start Date', 'Due Date', 'Est. Hours', 'Act. Hours',
      'Remark'
    ];

    // ── Build one project sheet ─────────────────────────────────────────────────
    const buildProjectSheet = (projName, usersData) => {
      const ws = {};
      ws['!cols'] = COL_WIDTHS.map(w => ({ wch: w }));
      let r = 0;

      // Project header
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(`  ${projName}`, s.projHeader);
      merge(ws, r, 0, r, COLS - 1);
      fillMerge(ws, r, 1, COLS - 1, s.projHeader);
      r++;

      // Period / generated row
      const periodLabel =
        dateRange.start && dateRange.end
          ? `  Period: ${formatDate(dateRange.start)}  →  ${formatDate(dateRange.end)}     |     Generated: ${new Date().toLocaleString()}`
          : `  Generated: ${new Date().toLocaleString()}`;
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(periodLabel, s.metaCell);
      merge(ws, r, 0, r, COLS - 1);
      fillMerge(ws, r, 1, COLS - 1, s.metaCell);
      r++;

      r++; // spacer row

      // Per-user tables
      Object.entries(usersData).forEach(([userName, tasks]) => {
        // User header
        ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(`  ${userName}`, s.userHeader);
        merge(ws, r, 0, r, COLS - 1);
        fillMerge(ws, r, 1, COLS - 1, s.userHeader);
        r++;

        // Column headers
        COL_HEADERS.forEach((h, ci) => {
          ws[XLSX.utils.encode_cell({ r, c: ci })] = cell(h, ci === 0 ? s.colHeaderLeft : s.colHeader);
        });
        r++;

        // Task rows
        tasks.forEach((task, idx) => {
          const isEven  = idx % 2 === 0;
          const dStyle  = isEven ? s.dataEven       : s.dataOdd;
          const dcStyle = isEven ? s.dataEvenCenter  : s.dataOddCenter;

          [
            { v: task.title || task.name || '-',              s: dStyle  },
            { v: task.description || '-',                     s: dStyle  },
            { v: task.status_name || task.status || '-',      s: dcStyle },
            { v: task.priority || '-',                        s: dcStyle },
            { v: formatDate(task.start_date),                 s: dcStyle },
            { v: formatDate(task.due_date),                   s: dcStyle },
            {
              v: task.estimated_hours != null ? Number(task.estimated_hours) : '-',
              s: dcStyle,
              t: task.estimated_hours != null ? 'n' : 's',
            },
            { v: Number(task.actual_hours) || 0, s: dcStyle, t: 'n' },
            { v: task.remark || '-', s: dStyle },
          ].forEach((cd, ci) => {
            ws[XLSX.utils.encode_cell({ r, c: ci })] = {
              v: cd.v,
              t: cd.t ?? (typeof cd.v === 'number' ? 'n' : 's'),
              s: cd.s,
            };
          });
          r++;
        });

        // User subtotal row
        const userEst    = tasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
        const userActual = tasks.reduce((sum, t) => sum + (Number(t.actual_hours)    || 0), 0);

        for (let ci = 0; ci < COLS; ci++) {
          ws[XLSX.utils.encode_cell({ r, c: ci })] = cell('', s.totalsEmpty);
        }
        ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(
          `Subtotal — ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`,
          s.totalsLabel
        );
        merge(ws, r, 0, r, COLS - 4);
        fillMerge(ws, r, 1, COLS - 4, s.totalsEmpty);
        // Re-set col 0 after fillMerge overwrites it
        ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(
          `Subtotal — ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`,
          s.totalsLabel
        );
        ws[XLSX.utils.encode_cell({ r, c: COLS - 3 })] = cell(userEst,    s.totalsValue, 'n');
        ws[XLSX.utils.encode_cell({ r, c: COLS - 2 })] = cell(userActual, s.totalsValue, 'n');
        r++;

        r++; // spacer between users
      });

      r++; // extra spacer before summary

      // ── Project summary table at bottom ──────────────────────────────────────
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell('  PROJECT SUMMARY', s.summaryHeader);
      merge(ws, r, 0, r, COLS - 1);
      fillMerge(ws, r, 1, COLS - 1, s.summaryHeader);
      r++;

      // Summary column headers
      [
        { label: 'User / Assignee', col: 0, span: 6 },
        { label: 'Tasks',           col: 6, span: 1 },
        { label: 'Est. Hours',      col: 7, span: 1 },
        { label: 'Act. Hours',      col: 8, span: 1 },
      ].forEach(({ label, col, span }) => {
        ws[XLSX.utils.encode_cell({ r, c: col })] = cell(label, s.summaryColHeader);
        if (span > 1) {
          merge(ws, r, col, r, col + span - 1);
          fillMerge(ws, r, col + 1, col + span - 1, s.summaryColHeader);
        }
      });
      r++;

      // Summary rows
      let grandTasks = 0, grandEst = 0, grandActual = 0;
      Object.entries(usersData).forEach(([userName, tasks]) => {
        const est    = tasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
        const actual = tasks.reduce((sum, t) => sum + (Number(t.actual_hours)    || 0), 0);
        grandTasks  += tasks.length;
        grandEst    += est;
        grandActual += actual;

        ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(userName, s.summaryRow);
        merge(ws, r, 0, r, 5);
        fillMerge(ws, r, 1, 5, s.summaryRow);
        ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(userName, s.summaryRow);
        ws[XLSX.utils.encode_cell({ r, c: 6 })] = cell(tasks.length, s.summaryRowCenter, 'n');
        ws[XLSX.utils.encode_cell({ r, c: 7 })] = cell(est,          s.summaryRowCenter, 'n');
        ws[XLSX.utils.encode_cell({ r, c: 8 })] = cell(actual,       s.summaryRowCenter, 'n');
        r++;
      });

      // Grand total row
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell('GRAND TOTAL', s.summaryTotalLabel);
      merge(ws, r, 0, r, 5);
      fillMerge(ws, r, 1, 5, s.summaryTotal);
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell('GRAND TOTAL', s.summaryTotalLabel);
      ws[XLSX.utils.encode_cell({ r, c: 6 })] = cell(grandTasks,  s.summaryTotal, 'n');
      ws[XLSX.utils.encode_cell({ r, c: 7 })] = cell(grandEst,    s.summaryTotal, 'n');
      ws[XLSX.utils.encode_cell({ r, c: 8 })] = cell(grandActual, s.summaryTotal, 'n');
      r++;

      ws['!ref'] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: r - 1, c: COLS - 1 });
      return ws;
    };

    // ── Build Summary (overview) sheet ──────────────────────────────────────────
    const buildSummarySheet = () => {
      const ws = {};
      ws['!cols'] = [{ wch: 36 }, { wch: 10 }, { wch: 16 }, { wch: 16 }];
      let r = 0;

      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell('  TASK REPORT — ALL PROJECTS SUMMARY', s.projHeader);
      merge(ws, r, 0, r, 3);
      fillMerge(ws, r, 1, 3, s.projHeader);
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell('  TASK REPORT — ALL PROJECTS SUMMARY', s.projHeader);
      r++;

      const periodLabel =
        dateRange.start && dateRange.end
          ? `  Period: ${formatDate(dateRange.start)}  →  ${formatDate(dateRange.end)}     |     Generated: ${new Date().toLocaleString()}`
          : `  Generated: ${new Date().toLocaleString()}`;
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(periodLabel, s.metaCell);
      merge(ws, r, 0, r, 3);
      fillMerge(ws, r, 1, 3, s.metaCell);
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(periodLabel, s.metaCell);
      r++;
      r++; // spacer

      ['Project Name', 'Total Tasks', 'Est. Hours', 'Act. Hours'].forEach((h, ci) => {
        ws[XLSX.utils.encode_cell({ r, c: ci })] = cell(h, ci === 0 ? s.colHeaderLeft : s.colHeader);
      });
      r++;

      let grandTasks = 0, grandEst = 0, grandActual = 0;
      Object.entries(groupedData).forEach(([projName, usersData], idx) => {
        const isEven  = idx % 2 === 0;
        const dStyle  = isEven ? s.dataEven       : s.dataOdd;
        const dcStyle = isEven ? s.dataEvenCenter  : s.dataOddCenter;

        let totalTasks = 0, totalEst = 0, totalActual = 0;
        Object.values(usersData).forEach((tasks) => {
          totalTasks  += tasks.length;
          totalEst    += tasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
          totalActual += tasks.reduce((sum, t) => sum + (Number(t.actual_hours)    || 0), 0);
        });
        grandTasks  += totalTasks;
        grandEst    += totalEst;
        grandActual += totalActual;

        ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(projName,    dStyle);
        ws[XLSX.utils.encode_cell({ r, c: 1 })] = cell(totalTasks,  dcStyle, 'n');
        ws[XLSX.utils.encode_cell({ r, c: 2 })] = cell(totalEst,    dcStyle, 'n');
        ws[XLSX.utils.encode_cell({ r, c: 3 })] = cell(totalActual, dcStyle, 'n');
        r++;
      });

      r++; // spacer before grand total
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell('GRAND TOTAL', s.summaryTotalLabel);
      ws[XLSX.utils.encode_cell({ r, c: 1 })] = cell(grandTasks,  s.summaryTotal, 'n');
      ws[XLSX.utils.encode_cell({ r, c: 2 })] = cell(grandEst,    s.summaryTotal, 'n');
      ws[XLSX.utils.encode_cell({ r, c: 3 })] = cell(grandActual, s.summaryTotal, 'n');
      r++;

      ws['!ref'] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: r - 1, c: 3 });
      return ws;
    };

    // ── Build single-filter sheet (byProject / byUser / byStatus) ──────────────
    const buildSingleSheet = () => {
      const SCOLS = 11;
      const ws = {};
      ws['!cols'] = [28, 34, 20, 18, 12, 10, 12, 12, 10, 10, 30].map(w => ({ wch: w }));
      let r = 0;

      let filterLabel = '  All Tasks';
      if (activeFilter === 'byProject' && selectedProject !== 'all') {
        const proj = projects.find(p => p.id === Number(selectedProject));
        filterLabel = `  Project: ${proj?.name || selectedProject}`;
      } else if (activeFilter === 'byUser' && selectedUser !== 'all') {
        filterLabel = `  User: ${selectedUser}`;
      } else if (activeFilter === 'byStatus' && selectedStatus !== 'all') {
        filterLabel = `  Status: ${selectedStatus}`;
      }

      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(`  TASK REPORT — ${filterLabel.trim()}`, s.projHeader);
      merge(ws, r, 0, r, SCOLS - 1);
      fillMerge(ws, r, 1, SCOLS - 1, s.projHeader);
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(`  TASK REPORT — ${filterLabel.trim()}`, s.projHeader);
      r++;

      const periodLabel =
        dateRange.start && dateRange.end
          ? `  Period: ${formatDate(dateRange.start)}  →  ${formatDate(dateRange.end)}     |     Generated: ${new Date().toLocaleString()}`
          : `  Generated: ${new Date().toLocaleString()}`;
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(periodLabel, s.metaCell);
      merge(ws, r, 0, r, SCOLS - 1);
      fillMerge(ws, r, 1, SCOLS - 1, s.metaCell);
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(periodLabel, s.metaCell);
      r++;
      r++; // spacer

      ['Task Title', 'Description', 'Project', 'Assigned To', 'Status', 'Priority', 'Start Date', 'Due Date', 'Est.Hrs', 'Act.Hrs', 'Remark']
        .forEach((h, ci) => {
          ws[XLSX.utils.encode_cell({ r, c: ci })] = cell(h, ci === 0 ? s.colHeaderLeft : s.colHeader);
        });
      r++;

      filteredTasks.forEach((task, idx) => {
        const isEven  = idx % 2 === 0;
        const dStyle  = isEven ? s.dataEven       : s.dataOdd;
        const dcStyle = isEven ? s.dataEvenCenter  : s.dataOddCenter;

        [
          { v: task.title || task.name || '-',              s: dStyle  },
          { v: task.description || '-',                     s: dStyle  },
          { v: task.projectName || '-',                     s: dStyle  },
          { v: getMemberNames(task.members),                s: dStyle  },
          { v: task.status_name || task.status || '-',      s: dcStyle },
          { v: task.priority || '-',                        s: dcStyle },
          { v: formatDate(task.start_date),                 s: dcStyle },
          { v: formatDate(task.due_date),                   s: dcStyle },
          {
            v: task.estimated_hours != null ? Number(task.estimated_hours) : '-',
            s: dcStyle,
            t: task.estimated_hours != null ? 'n' : 's',
          },
          { v: Number(task.actual_hours) || 0, s: dcStyle, t: 'n' },
          { v: task.remark || '-', s: dStyle },
        ].forEach((cd, ci) => {
          ws[XLSX.utils.encode_cell({ r, c: ci })] = {
            v: cd.v,
            t: cd.t ?? (typeof cd.v === 'number' ? 'n' : 's'),
            s: cd.s,
          };
        });
        r++;
      });

      r++; // spacer before totals
      const totalEst    = filteredTasks.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);
      const totalActual = filteredTasks.reduce((sum, t) => sum + (Number(t.actual_hours)    || 0), 0);

      for (let ci = 0; ci < SCOLS; ci++) {
        ws[XLSX.utils.encode_cell({ r, c: ci })] = cell('', s.totalsEmpty);
      }
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(
        `TOTAL — ${filteredTasks.length} tasks`,
        s.summaryTotalLabel
      );
      merge(ws, r, 0, r, SCOLS - 4);
      fillMerge(ws, r, 1, SCOLS - 4, s.summaryTotal);
      ws[XLSX.utils.encode_cell({ r, c: 0 })] = cell(
        `TOTAL — ${filteredTasks.length} tasks`,
        s.summaryTotalLabel
      );
      ws[XLSX.utils.encode_cell({ r, c: SCOLS - 3 })] = cell(totalEst,    s.summaryTotal, 'n');
      ws[XLSX.utils.encode_cell({ r, c: SCOLS - 2 })] = cell(totalActual, s.summaryTotal, 'n');
      r++;

      ws['!ref'] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: r - 1, c: SCOLS - 1 });
      return ws;
    };

    // ── Assemble workbook ────────────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();

    if (activeFilter === 'overall') {
      XLSX.utils.book_append_sheet(wb, buildSummarySheet(), 'Summary');
      Object.entries(groupedData).forEach(([projName, usersData]) => {
        const safeName = projName.replace(/[\\/*?[\]]/g, '').substring(0, 28);
        XLSX.utils.book_append_sheet(wb, buildProjectSheet(projName, usersData), safeName);
      });
    } else {
      XLSX.utils.book_append_sheet(wb, buildSingleSheet(), 'Report');
    }

    const fileName = `Task_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  // ─────────────────────────────────────────────────────────────────────────────
  // END EXCEL GENERATION
  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Loading Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
          <p className="text-slate-500">Generate detailed task reports and export to Excel</p>
        </div>
        <button
          onClick={generateExcel}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
        >
          <Download className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Quick Date Filters */}
          <div className="lg:col-span-4">
            <label className="text-sm font-semibold text-slate-900 mb-2 block">Quick Range</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'today',     label: 'Today'      },
                { id: 'thisweek',  label: 'This Week'  },
                { id: 'thismonth', label: 'This Month' },
                { id: 'custom',    label: 'Custom'     },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => handleQuickDate(range.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    quickDate === range.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateRange.start || ''}
                  onChange={(e) => { setDateRange({ ...dateRange, start: e.target.value }); setQuickDate('custom'); }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => { setDateRange({ ...dateRange, end: e.target.value }); setQuickDate('custom'); }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-8">
            {[
              { id: 'overall',   label: 'Overall',    icon: TrendingUp  },
              { id: 'byProject', label: 'By Project', icon: Folder      },
              { id: 'byUser',    label: 'By Users',   icon: Users       },
              { id: 'byStatus',  label: 'By Status',  icon: CheckSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-bold transition-colors ${
                  activeFilter === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab-specific selects */}
        <div className="flex flex-wrap gap-4">
          {activeFilter === 'byProject' && (
            <div className="w-full md:w-80">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Projects</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeFilter === 'byUser' && (
            <div className="w-full md:w-80">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Users</option>
                {users.map((user, idx) => (
                  <option key={idx} value={user}>{user}</option>
                ))}
              </select>
            </div>
          )}

          {activeFilter === 'byStatus' && (
            <div className="w-full md:w-80">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Statuses</option>
                {statuses.map((status, idx) => (
                  <option key={idx} value={status}>{status}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-end ml-auto">
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-bold">{filteredTasks.length}</span> tasks
            </p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        {activeFilter === 'overall' ? (
          <div className="p-6">
            {Object.entries(groupedData).map(([projName, usersData]) => (
              <div key={projName} className="mb-12 last:mb-0">
                <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Project: {projName}
                </h2>

                {Object.entries(usersData).map(([userName, tasks]) => (
                  <div key={userName} className="mb-8 last:mb-0">
                    <h3 className="text-md font-semibold text-slate-700 mb-4 pl-4 border-l-4 border-slate-300">
                      {userName}
                    </h3>

                    <div className="overflow-x-auto rounded-lg border border-slate-100">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            {['Task Title', 'Description', 'Status', 'Priority', 'Start Date', 'Due Date', 'Hours', 'Remark'].map((h) => (
                              <th key={h} className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {tasks.map((task, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-6 py-4 text-sm font-medium text-slate-900">{task.title || task.name || '-'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{task.description || '-'}</td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{task.status_name || task.status || '-'}</td>
                              <td className="px-6 py-4 text-xs font-semibold text-slate-700">{task.priority || '-'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{formatDate(task.start_date)}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{formatDate(task.due_date)}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {task.actual_hours || 0}h / {task.estimated_hours || '-'}h
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">{task.remark || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {Object.keys(groupedData).length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No tasks found for the selected filters
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  {['Task Title', 'Project', 'Assigned To', 'Status', 'Priority', 'Start Date', 'Due Date'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredTasks.map((task, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{task.title || task.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{task.projectName || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{getMemberNames(task.members)}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">{task.status_name || task.status || '-'}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700">{task.priority || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(task.start_date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(task.due_date)}</td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;