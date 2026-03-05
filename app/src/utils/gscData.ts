import type {
  CTROptimizerRow,
  GSCCSVParseResult,
  GSCOpportunityRow,
  GSCOverviewMetrics,
  GSCPerformanceRow,
  GSCTrendPoint,
  QueryIntent,
} from '@/types';

type GSCRequiredColumn = 'query' | 'page' | 'clicks' | 'impressions' | 'ctr' | 'position';
type GSCColumn = GSCRequiredColumn | 'date';

const REQUIRED_COLUMNS: GSCRequiredColumn[] = [
  'query',
  'page',
  'clicks',
  'impressions',
  'ctr',
  'position',
];

const COLUMN_LABELS: Record<GSCRequiredColumn, string> = {
  query: 'Query',
  page: 'Page',
  clicks: 'Clicks',
  impressions: 'Impressions',
  ctr: 'CTR',
  position: 'Position',
};

const COLUMN_ALIASES: Record<GSCColumn, string[]> = {
  query: ['query', 'queries', 'topquery'],
  page: ['page', 'url', 'landingpage'],
  clicks: ['clicks', 'click'],
  impressions: ['impressions', 'impression'],
  ctr: ['ctr', 'clickthroughrate'],
  position: ['position', 'avgposition', 'averageposition'],
  date: ['date', 'day'],
};

function normalizeHeader(header: string): string {
  return header
    .replace('\uFEFF', '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCtr(value: string): number {
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) return 0;

  const hasPercent = cleaned.includes('%');
  const parsed = Number.parseFloat(cleaned.replace('%', ''));
  if (!Number.isFinite(parsed)) return 0;

  if (hasPercent) return parsed / 100;
  if (parsed > 1) return parsed / 100;
  return parsed;
}

function safeDate(dateString: string): string {
  const trimmed = dateString.trim();
  if (!trimmed) return '';
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toISOString().slice(0, 10);
}

function findColumnIndex(headers: string[], column: GSCColumn): number {
  return headers.findIndex((header) => COLUMN_ALIASES[column].includes(header));
}

export function parseGscCsv(csvText: string): GSCCSVParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      missingColumns: REQUIRED_COLUMNS.map((column) => COLUMN_LABELS[column]),
    };
  }

  const rawHeaders = parseCsvLine(lines[0]).map(normalizeHeader);
  const columnMap = Object.fromEntries(
    (['query', 'page', 'clicks', 'impressions', 'ctr', 'position', 'date'] as GSCColumn[]).map((column) => [
      column,
      findColumnIndex(rawHeaders, column),
    ]),
  ) as Record<GSCColumn, number>;

  const missingColumns = REQUIRED_COLUMNS
    .filter((column) => columnMap[column] < 0)
    .map((column) => COLUMN_LABELS[column]);

  if (missingColumns.length > 0) {
    return { rows: [], missingColumns };
  }

  const rows: GSCPerformanceRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const cells = parseCsvLine(lines[lineIndex]);
    if (cells.every((cell) => !cell.trim())) continue;

    const query = cells[columnMap.query]?.trim() ?? '';
    const page = cells[columnMap.page]?.trim() ?? '';
    const clicks = parseNumber(cells[columnMap.clicks] ?? '');
    const impressions = parseNumber(cells[columnMap.impressions] ?? '');
    const position = parseNumber(cells[columnMap.position] ?? '');
    const rawCtr = parseCtr(cells[columnMap.ctr] ?? '');
    const ctr = rawCtr > 0 ? rawCtr : impressions > 0 ? clicks / impressions : 0;
    const dateCell = columnMap.date >= 0 ? cells[columnMap.date] ?? '' : '';
    const date = dateCell ? safeDate(dateCell) : undefined;

    rows.push({
      query,
      page,
      clicks,
      impressions,
      ctr,
      position,
      date,
    });
  }

  return { rows, missingColumns: [] };
}

export function aggregateRowsByQueryPage(rows: GSCPerformanceRow[]): GSCPerformanceRow[] {
  const grouped = new Map<
    string,
    {
      query: string;
      page: string;
      clicks: number;
      impressions: number;
      weightedPosition: number;
    }
  >();

  rows.forEach((row) => {
    const key = `${row.query}|||${row.page}`;
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, {
        query: row.query,
        page: row.page,
        clicks: row.clicks,
        impressions: row.impressions,
        weightedPosition: row.position * row.impressions,
      });
      return;
    }

    current.clicks += row.clicks;
    current.impressions += row.impressions;
    current.weightedPosition += row.position * row.impressions;
  });

  return Array.from(grouped.values()).map((group) => {
    const ctr = group.impressions > 0 ? group.clicks / group.impressions : 0;
    const position = group.impressions > 0 ? group.weightedPosition / group.impressions : 0;

    return {
      query: group.query,
      page: group.page,
      clicks: group.clicks,
      impressions: group.impressions,
      ctr,
      position,
    };
  });
}

export function calculateGscOverview(rows: GSCPerformanceRow[]): GSCOverviewMetrics {
  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const weightedPosition = rows.reduce((sum, row) => sum + row.position * row.impressions, 0);

  return {
    totalClicks,
    totalImpressions,
    averageCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
    averagePosition: totalImpressions > 0 ? weightedPosition / totalImpressions : 0,
  };
}

export function buildGscTrends(rows: GSCPerformanceRow[]): GSCTrendPoint[] {
  const datedRows = rows.filter((row) => Boolean(row.date));
  if (datedRows.length === 0) return [];

  const byDate = new Map<
    string,
    {
      date: string;
      clicks: number;
      impressions: number;
      weightedPosition: number;
    }
  >();

  datedRows.forEach((row) => {
    const date = row.date as string;
    const existing = byDate.get(date);

    if (!existing) {
      byDate.set(date, {
        date,
        clicks: row.clicks,
        impressions: row.impressions,
        weightedPosition: row.position * row.impressions,
      });
      return;
    }

    existing.clicks += row.clicks;
    existing.impressions += row.impressions;
    existing.weightedPosition += row.position * row.impressions;
  });

  return Array.from(byDate.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: entry.date,
      clicks: entry.clicks,
      impressions: entry.impressions,
      ctr: entry.impressions > 0 ? entry.clicks / entry.impressions : 0,
      avgPosition: entry.impressions > 0 ? entry.weightedPosition / entry.impressions : 0,
    }));
}

export function getExpectedCtrForPosition(position: number): number {
  if (position <= 1) return 0.28;
  if (position <= 2) return 0.15;
  if (position <= 3) return 0.1;
  if (position <= 4) return 0.07;
  if (position <= 5) return 0.05;
  if (position <= 6) return 0.04;
  if (position <= 7) return 0.035;
  if (position <= 8) return 0.03;
  if (position <= 9) return 0.025;
  if (position <= 10) return 0.02;
  if (position <= 15) return 0.015;
  return 0.01;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function buildOpportunities(rows: GSCPerformanceRow[]): GSCOpportunityRow[] {
  const aggregated = aggregateRowsByQueryPage(rows);
  const maxImpressions = Math.max(...aggregated.map((row) => row.impressions), 1);

  return aggregated
    .map((row) => {
      const expectedCtr = getExpectedCtrForPosition(row.position);
      const ctrGap = Math.max(0, expectedCtr - row.ctr);

      const impressionScore = (Math.log10(row.impressions + 1) / Math.log10(maxImpressions + 1)) * 55;
      const positionScore =
        row.position >= 4 && row.position <= 15
          ? 25
          : row.position < 4
            ? 10
            : row.position <= 30
              ? 15
              : 5;
      const ctrGapScore = Math.min(20, ctrGap * 100 * 4);
      const opportunityScore = clamp(Math.round(impressionScore + positionScore + ctrGapScore), 0, 100);

      return {
        ...row,
        expectedCtr,
        ctrGap,
        opportunityScore,
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions);
}

function getPriority(impressions: number, ctrGap: number): 'High' | 'Medium' | 'Low' {
  if (impressions >= 200 && ctrGap >= 0.02) return 'High';
  if (impressions >= 100 && ctrGap >= 0.01) return 'Medium';
  return 'Low';
}

export function buildCtrOptimizerRows(rows: GSCPerformanceRow[]): CTROptimizerRow[] {
  return aggregateRowsByQueryPage(rows)
    .map((row) => {
      const expectedCtr = getExpectedCtrForPosition(row.position);
      const ctrGap = Math.max(0, expectedCtr - row.ctr);
      const opportunityScore = clamp(
        Math.round((row.impressions / Math.max(1, row.impressions + 150)) * 40 + ctrGap * 100 * 6 + (row.position >= 4 && row.position <= 15 ? 20 : 5)),
        0,
        100,
      );

      return {
        ...row,
        expectedCtr,
        ctrGap,
        opportunityScore,
        priority: getPriority(row.impressions, ctrGap),
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions);
}

export function getMockGscRows(): GSCPerformanceRow[] {
  return [
    { date: '2026-02-20', query: 'seo audit checklist', page: '/blog/seo-audit', clicks: 32, impressions: 620, ctr: 0.0516, position: 6.2 },
    { date: '2026-02-21', query: 'seo audit checklist', page: '/blog/seo-audit', clicks: 35, impressions: 640, ctr: 0.0547, position: 6.1 },
    { date: '2026-02-22', query: 'seo audit checklist', page: '/blog/seo-audit', clicks: 33, impressions: 655, ctr: 0.0504, position: 6.4 },
    { date: '2026-02-23', query: 'local seo services', page: '/services/local-seo', clicks: 22, impressions: 540, ctr: 0.0407, position: 9.5 },
    { date: '2026-02-24', query: 'local seo services', page: '/services/local-seo', clicks: 28, impressions: 570, ctr: 0.0491, position: 8.9 },
    { date: '2026-02-25', query: 'local seo services', page: '/services/local-seo', clicks: 30, impressions: 590, ctr: 0.0508, position: 8.4 },
    { date: '2026-02-26', query: 'technical seo agency', page: '/services/technical-seo', clicks: 17, impressions: 390, ctr: 0.0436, position: 11.3 },
    { date: '2026-02-27', query: 'technical seo agency', page: '/services/technical-seo', clicks: 19, impressions: 405, ctr: 0.0469, position: 10.8 },
    { date: '2026-02-28', query: 'technical seo agency', page: '/services/technical-seo', clicks: 21, impressions: 415, ctr: 0.0506, position: 10.5 },
    { date: '2026-03-01', query: 'google search console tips', page: '/blog/gsc-tips', clicks: 14, impressions: 260, ctr: 0.0538, position: 12.8 },
    { date: '2026-03-02', query: 'google search console tips', page: '/blog/gsc-tips', clicks: 16, impressions: 275, ctr: 0.0582, position: 12.1 },
    { date: '2026-03-03', query: 'google search console tips', page: '/blog/gsc-tips', clicks: 18, impressions: 290, ctr: 0.0621, position: 11.6 },
  ];
}

export function classifyQueryIntent(query: string): QueryIntent {
  const normalized = query.toLowerCase();

  const transactionalTerms = ['book', 'buy', 'price', 'near me', 'appointment', 'schedule', 'quote'];
  const commercialTerms = ['best', 'top', 'vs', 'review', 'compare'];
  const navigationalTerms = ['login', 'website', 'address', 'phone'];
  const brandLikePattern = /\b[a-z0-9-]+\.(com|net|org|io|co)\b/i;

  if (transactionalTerms.some((term) => normalized.includes(term))) return 'Transactional';
  if (commercialTerms.some((term) => normalized.includes(term))) return 'Commercial';
  if (navigationalTerms.some((term) => normalized.includes(term)) || brandLikePattern.test(query)) {
    return 'Navigational';
  }
  return 'Informational';
}

export function getSuggestedContentType(intent: QueryIntent): string {
  switch (intent) {
    case 'Transactional':
      return 'Service/Landing page';
    case 'Commercial':
      return 'Comparison/Best-of page';
    case 'Navigational':
      return 'GBP / Contact / About page';
    default:
      return 'Blog/Guide';
  }
}

export function parseQueriesFromText(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

