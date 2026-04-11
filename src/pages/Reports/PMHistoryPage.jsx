import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button     from '@/components/common/Button';
import DataTable  from '@/components/table/DataTable';
import Modal      from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/Badge';
import { usePMHistory } from '@/hooks/usePMHistory';

// ── tiny svg icon — same pattern as original ──────────────────────────────
const S = ({ d, size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

// ── date helpers ──────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0];
}
// function monthAgoStr() {
//   const d = new Date();
//   d.setMonth(d.getMonth() - 1);
//   return d.toISOString().split('T')[0];
// }


// ── mock summary data — replace with API: pr_fetch_lerp_Mould_CheckSheet_Summary ──
const MOCK_SUMMARY = [
  { TransId: 1, ReportNo: 'MCK-2025-001', Mould: 'MLD-A001', MouldName: 'Cover Panel Mould', Date: '10/03/2025', TargetDate: '15/03/2025', Prepared: 'Ramesh K.',  Checked: 'Suresh M.', Approved: 'Vijay R.' },
  { TransId: 2, ReportNo: 'MCK-2025-002', Mould: 'MLD-B002', MouldName: 'Base Plate Mould',  Date: '12/03/2025', TargetDate: '18/03/2025', Prepared: 'Anand P.',   Checked: 'Suresh M.', Approved: 'Vijay R.' },
  { TransId: 3, ReportNo: 'MCK-2025-003', Mould: 'MLD-C003', MouldName: 'Housing Mould',     Date: '14/03/2025', TargetDate: '20/03/2025', Prepared: 'Ramesh K.',  Checked: 'Kumar S.',  Approved: 'Vijay R.' },
  { TransId: 4, ReportNo: 'MCK-2025-004', Mould: 'MLD-D004', MouldName: 'Bracket Mould',     Date: '16/03/2025', TargetDate: '22/03/2025', Prepared: 'Anand P.',   Checked: 'Kumar S.',  Approved: 'Vijay R.' },
  { TransId: 5, ReportNo: 'MCK-2025-005', Mould: 'MLD-E005', MouldName: 'Gear Box Mould',    Date: '18/03/2025', TargetDate: '25/03/2025', Prepared: 'Ramesh K.',  Checked: 'Suresh M.', Approved: 'Vijay R.' },
];

// ── mock detail data — replace with API: pr_fetch_Mould_PM_CheckSheet_Entry ──
const MOCK_DETAIL = {
  1: [
    { sno: 1, CheckArea: 'Cavity',       CheckPoint: 'Surface Finish',    ImageName: 'img_001.jpg', RequiredCondition: 'No scratches',    CheckingMethod: 'Visual',          CurrentStatus: 'OK',  CorrectiveAction: '-',        Remarks: 'Good condition'    },
    { sno: 2, CheckArea: 'Core',         CheckPoint: 'Cooling Lines',     ImageName: 'img_002.jpg', RequiredCondition: 'No blockage',     CheckingMethod: 'Air blow',        CurrentStatus: 'NOK', CorrectiveAction: 'Cleaned',  Remarks: 'Scale removed'     },
    { sno: 3, CheckArea: 'Ejector',      CheckPoint: 'Pin Alignment',     ImageName: 'img_003.jpg', RequiredCondition: 'Aligned',         CheckingMethod: 'Gauge',           CurrentStatus: 'OK',  CorrectiveAction: '-',        Remarks: 'No action needed'  },
  ],
  2: [
    { sno: 1, CheckArea: 'Sprue',        CheckPoint: 'Gate Size',         ImageName: 'img_011.jpg', RequiredCondition: '2.5mm ± 0.1',    CheckingMethod: 'Vernier',         CurrentStatus: 'OK',  CorrectiveAction: '-',        Remarks: 'Within tolerance'  },
    { sno: 2, CheckArea: 'Parting Line', CheckPoint: 'Flash Check',       ImageName: 'img_012.jpg', RequiredCondition: 'No flash',        CheckingMethod: 'Visual',          CurrentStatus: 'NOK', CorrectiveAction: 'Polished', Remarks: 'Minor flash rework'},
  ],
  3: [
    { sno: 1, CheckArea: 'Cavity',       CheckPoint: 'Dimensional Check', ImageName: 'img_021.jpg', RequiredCondition: 'As per drawing', CheckingMethod: 'CMM',             CurrentStatus: 'OK',  CorrectiveAction: '-',        Remarks: 'Approved'          },
    { sno: 2, CheckArea: 'Venting',      CheckPoint: 'Vent Depth',        ImageName: 'img_022.jpg', RequiredCondition: '0.02–0.04mm',    CheckingMethod: 'Depth gauge',     CurrentStatus: 'OK',  CorrectiveAction: '-',        Remarks: 'OK'                },
    { sno: 3, CheckArea: 'Water Lines',  CheckPoint: 'Leak Test',         ImageName: 'img_023.jpg', RequiredCondition: 'No leak',         CheckingMethod: 'Pressure test',   CurrentStatus: 'NOK', CorrectiveAction: 'Sealed',   Remarks: 'O-ring replaced'   },
  ],
  4: [
    { sno: 1, CheckArea: 'Core Insert',  CheckPoint: 'Wear Check',        ImageName: 'img_031.jpg', RequiredCondition: '< 0.1mm wear',   CheckingMethod: 'Mic',             CurrentStatus: 'OK',  CorrectiveAction: '-',        Remarks: 'Acceptable'        },
  ],
  5: [
    { sno: 1, CheckArea: 'Runner',       CheckPoint: 'Runner Balance',    ImageName: 'img_041.jpg', RequiredCondition: 'Balanced flow',  CheckingMethod: 'Flow simulation', CurrentStatus: 'OK',  CorrectiveAction: '-',        Remarks: 'Balanced'          },
    { sno: 2, CheckArea: 'Ejector',      CheckPoint: 'Return Pin',        ImageName: 'img_042.jpg', RequiredCondition: 'Smooth return',  CheckingMethod: 'Manual test',     CurrentStatus: 'OK',  CorrectiveAction: '-',        Remarks: 'Good'              },
  ],
};

// ── detail columns for the modal DataTable ────────────────────────────────
const detailColumns = [
  { key: 'sno',               label: 'S.No'               },
  { key: 'CheckArea',         label: 'Area'               },
  { key: 'CheckPoint',        label: 'Check Point'        },
  { key: 'ImageName',         label: 'Image Name'         },
  { key: 'RequiredCondition', label: 'Required Condition' },
  { key: 'CheckingMethod',    label: 'Checking Method'    },
  { key: 'CurrentStatus',     label: 'Current Status', render: v => <StatusBadge status={v} /> },
  { key: 'CorrectiveAction',  label: 'Corrective Action'  },
  { key: 'Remarks',           label: 'Remarks / Spares'   },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function MouldCheckSheetSummaryPage() {
const [fromDate, setFromDate] = useState(todayStr());
const [toDate,   setToDate]   = useState(todayStr());
  // const [searched, setSearched] = useState(false);
  // const [summaryRows,  setSummaryRows]  = useState(MOCK_SUMMARY);
const { data: summaryRows = [], isLoading, refetch } =
  usePMHistory(fromDate, toDate);

  // print-icon modal state
  const [printRec,     setPrintRec]     = useState(null);   // selected summary row
  const [detailRows,   setDetailRows]   = useState([]);
  const [printOpen,    setPrintOpen]    = useState(false);

  // view-button modal state
  const [viewRecord,   setViewRecord]   = useState(null);

  // excel confirm
  const [excelConfirm, setExcelConfirm] = useState(false);

  // ── search ────────────────────────────────────────────────────────────────
function handleSearch() {
  refetch();
}
const handleReset = () => {
  setFromDate(todayStr());  // was monthAgoStr()
  setToDate(todayStr());
};
  // ── print icon → open detail modal + auto-trigger PDF confirm ────────────
  function handlePrintClick(row) {
    setPrintRec(row);
    setDetailRows(MOCK_DETAIL[row.TransId] || []);
    setPrintOpen(true);
  }

  // ── pdf export (called from modal footer) ─────────────────────────────────
  function exportPdf() {
    setPrintOpen(false);
    if (!printRec) return;
    // const Data = `MouldCheckSheet$!...`; window.open(`frmExportPDF.aspx?str=${Data}`, '_blank');
    alert(`PDF export triggered for ${printRec.ReportNo}`);
  }

  // ── excel export ──────────────────────────────────────────────────────────
  function exportExcel() {
    setExcelConfirm(false);
    // window.open('frmExportExcel.aspx?str=...', 'Download');
    alert('Excel export triggered');
  }

  // ── summary columns ───────────────────────────────────────────────────────
  const summaryColumns = [
  {
  key: '_print',
  label: 
  (
    <S d={
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    } />
  ),
  render: (_, row) => (
    <button
      // onClick={() => handlePrintClick(row)}
      title="View Details"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        color: 'var(--cyan)',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <S d={
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      } size={15} />
    </button>
  ),
},
    {
      key: 'ReportNo',
      label: 'Report No',
      render: v => (
        <code style={{
          fontFamily: "'Geist Mono',monospace", fontSize: 12,
          background: 'var(--bg3)', padding: '2px 8px', borderRadius: 5,
          color: 'var(--cyan)', border: '1px solid rgba(6,182,212,0.15)',
        }}>{v}</code>
      ),
    },
    { key: 'Mould',      label: 'Mold Code'    },
    { key: 'MouldName',  label: 'Mold Name'    },
    { key: 'Date',       label: 'PM Done Date' },
    { key: 'TargetDate', label: 'Target Date'  },
    { key: 'Prepared',   label: 'Prepared'     },
    { key: 'Checked',    label: 'Checked'      },
    { key: 'Approved',   label: 'Approved'     },
    // {
    //   key: '_view',
    //   label: '',
    //   render: (_, row) => (
    //     <button
    //       onClick={() => setViewRecord(row)}
    //       style={{
    //         display: 'flex', alignItems: 'center', gap: 6,
    //         padding: '5px 12px', borderRadius: 7,
    //         background: 'var(--bg3)', border: '1px solid var(--border2)',
    //         color: 'var(--text2)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
    //         transition: 'all var(--trans)',
    //       }}
    //     >
    //       <S d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />
    //       View
    //     </button>
    //   ),
    // },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── page header ── */}
      <PageHeader
        title="PM Report"
        subtitle="Reports → PM Report"
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleSearch}>
              <S d={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>} />
              Refresh
            </Button>

             
            <Button variant="secondary" size="sm" onClick={() => setExcelConfirm(true)}>
              <S d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>} />
              Excel
            </Button>
          </>
        }
      />

      {/* ── date filter row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0 20px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text)' }}>
          <span style={{ color: '#ef4444' }}>*</span>
          From Date:
          <input
            type="date" value={fromDate} max={toDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ marginLeft: 6, fontSize: 13, padding: '4px 8px', height: 32, borderRadius: 6, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text)' }}>
          <span style={{ color: '#ef4444' }}>*</span>
          To Date:
          <input
            type="date" value={toDate} min={fromDate}
            onChange={e => setToDate(e.target.value)}
            style={{ marginLeft: 6, fontSize: 13, padding: '4px 8px', height: 32, borderRadius: 6, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)' }}
          />
        </label>

        <Button size="sm" onClick={handleSearch}>
          <S d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />
          SEARCH
        </Button>
        <Button variant="secondary" onClick={handleReset}>
                          <S size={13} d={<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>}/> Reset
                        </Button>
      </div>

      {/* ── Summary grid — only grid on this page ── */}
      <DataTable
        columns={summaryColumns}
        data={summaryRows}
        searchKeys={['ReportNo', 'Mould', 'MouldName', 'Prepared', 'Checked', 'Approved']}
        pageSize={15}
      />

      {/* ── Print / Detail modal — opens on print icon click ── */}
      <Modal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        title={`Check Sheet Detail — ${printRec?.ReportNo}`}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPrintOpen(false)}>Close</Button>
            <Button onClick={exportPdf}>
              <S d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>} />
              Export PDF
            </Button>
          </>
        }
      >
        {printRec && (
          <div>
            {/* record meta strip */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              {[
                ['Mold Code',    printRec.Mould],
                ['Mold Name',    printRec.MouldName],
                ['PM Done Date', printRec.Date],
                ['Target Date',  printRec.TargetDate],
                ['Prepared',     printRec.Prepared],
                ['Checked',      printRec.Checked],
                ['Approved',     printRec.Approved],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* detail data table */}
            <DataTable
              columns={detailColumns}
              data={detailRows}
              searchKeys={['CheckArea', 'CheckPoint', 'CurrentStatus', 'CorrectiveAction']}
              pageSize={10}
            />
          </div>
        )}
      </Modal>

      {/* ── View modal — identical structure to original PMHistoryPage ── */}
      <Modal
        open={!!viewRecord}
        onClose={() => setViewRecord(null)}
        title={`Record — ${viewRecord?.ReportNo}`}
        size="sm"
        footer={<Button variant="secondary" onClick={() => setViewRecord(null)}>Close</Button>}
      >
        {viewRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Report No',    viewRecord.ReportNo],
              ['Mold Code',    viewRecord.Mould],
              ['Mold Name',    viewRecord.MouldName],
              ['PM Done Date', viewRecord.Date],
              ['Target Date',  viewRecord.TargetDate],
              ['Prepared',     viewRecord.Prepared],
              ['Checked',      viewRecord.Checked],
              ['Approved',     viewRecord.Approved],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ── Excel confirm modal ── */}
      <Modal
        open={excelConfirm}
        onClose={() => setExcelConfirm(false)}
        title="Export Excel"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExcelConfirm(false)}>No</Button>
            <Button onClick={exportExcel}>Yes, Export</Button>
          </>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          Do you want to export the summary grid as Excel?
        </p>
      </Modal>
    </div>
  );
}