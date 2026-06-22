import { GraphData, Equipment } from '../types';

export const MOCK_EQUIPMENT: Equipment[] = [
  { tag: 'P-201', name: 'Cooling Water Main Pump', status: 'warning', lastMaintenance: '2026-05-10', type: 'Centrifugal Pump' },
  { tag: 'V-104', name: 'Pressure Relief Valve', status: 'operational', lastMaintenance: '2026-01-22', type: 'Valve' },
  { tag: 'HX-305', name: 'Heat Exchanger', status: 'critical', lastMaintenance: '2025-11-05', type: 'Exchanger' },
  { tag: 'C-410', name: 'Gas Compressor', status: 'offline', lastMaintenance: '2026-06-20', type: 'Compressor' },
];

export const MOCK_GRAPH: GraphData = {
  nodes: [
    { id: 'P-201', group: 1, label: 'Pump P-201', type: 'equipment' },
    { id: 'V-104', group: 1, label: 'Valve V-104', type: 'equipment' },
    { id: 'Doc-Manual-55A', group: 2, label: 'OEM Manual P-Series', type: 'document' },
    { id: 'PID-1020', group: 2, label: 'Cooling Sys P&ID', type: 'document' },
    { id: 'WO-8834', group: 3, label: 'Work Order #8834', type: 'work_order' },
    { id: 'WO-9102', group: 3, label: 'Work Order #9102', type: 'work_order' },
    { id: 'ISO-9001', group: 4, label: 'Safety Guidelines', type: 'regulation' },
    { id: 'Vibration', group: 5, label: 'Vibration Issue', type: 'concept' },
    { id: 'Seal Leak', group: 5, label: 'Seal Leakage', type: 'concept' },
  ],
  links: [
    { source: 'P-201', target: 'Doc-Manual-55A', label: 'referenced_in', value: 2 },
    { source: 'P-201', target: 'PID-1020', label: 'shown_in', value: 2 },
    { source: 'V-104', target: 'PID-1020', label: 'shown_in', value: 2 },
    { source: 'WO-8834', target: 'P-201', label: 'maintenance_for', value: 1 },
    { source: 'WO-9102', target: 'P-201', label: 'maintenance_for', value: 1 },
    { source: 'WO-8834', target: 'Vibration', label: 'reported_issue', value: 1 },
    { source: 'WO-9102', target: 'Seal Leak', label: 'reported_issue', value: 1 },
    { source: 'Doc-Manual-55A', target: 'Vibration', label: 'troubleshoots', value: 3 },
    { source: 'ISO-9001', target: 'P-201', label: 'compliance_rule_for', value: 1 },
  ]
};

export const MOCK_RCA_RESPONSES: Record<string, string> = {
  'P-201': JSON.stringify({
    equipmentTag: 'P-201',
    issueDescription: 'Chronic high vibration leading to seal degradation over the last 30 days.',
    likelyCauses: [
      {
        cause: 'Cavitation due to insufficient net positive suction head (NPSH).',
        probability: 0.85,
        supportingEvidence: [
          { id: 'c1', source: 'WO-8834', type: 'work_order', snippet: 'Operator noted rattling sound and unsteady discharge pressure.' },
          { id: 'c2', source: 'OEM Manual P-Series', type: 'manual', snippet: 'Section 4.1: Vibration near the impeller housing indicates cavitation if NPSHA < NPSHR.' }
        ]
      },
      {
        cause: 'Misalignment between motor and pump shaft.',
        probability: 0.60,
        supportingEvidence: [
          { id: 'c3', source: 'WO-9102', type: 'work_order', snippet: 'Replaced mechanical seal, noted uneven wear pattern on shaft sleeve.' }
        ]
      }
    ],
    recommendedActions: [
      'Verify suction line strainer is clear (PID-1020).',
      'Perform laser alignment on motor/pump shaft.',
      'Check reservoir level to ensure adequate suction head.'
    ]
  })
};
