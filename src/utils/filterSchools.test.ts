import { filterSchools, getFilterSummary } from './filterSchools';
import { School, SchoolType, Gender, Level, County, SchoolColor, SchoolFilters } from '../types/School';

const createMockSchool = (overrides: Partial<School> = {}): School => ({
  id: '1',
  name: 'Test School',
  address: '123 Test Street',
  postcode: 'TS1 1ST',
  borough: 'Test Borough',
  county: County.LONDON,
  schoolType: SchoolType.GRAMMAR,
  gender: Gender.COED,
  level: Level.SECONDARY,
  color: SchoolColor.COED_SECONDARY,
  coordinates: { lat: 51.5, lng: -0.1 },
  cost: { amount: 0, currency: 'GBP', period: 'year', isFree: true },
  competitiveness: 3,
  notes: 'Test notes',
  ...overrides
});

describe('filterSchools', () => {
  it('returns all schools when no filters are provided', () => {
    const schools = [
      createMockSchool({ id: '1' }),
      createMockSchool({ id: '2' })
    ];
    
    const result = filterSchools(schools, {});
    expect(result).toEqual(schools);
  });

  it('filters by school type', () => {
    const schools = [
      createMockSchool({ id: '1', schoolType: SchoolType.GRAMMAR }),
      createMockSchool({ id: '2', schoolType: SchoolType.PRIVATE }),
      createMockSchool({ id: '3', schoolType: SchoolType.COMPREHENSIVE })
    ];
    
    const filters: SchoolFilters = {
      schoolTypes: [SchoolType.GRAMMAR, SchoolType.PRIVATE]
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.id)).toEqual(['1', '2']);
  });

  it('filters by gender', () => {
    const schools = [
      createMockSchool({ id: '1', gender: Gender.BOYS }),
      createMockSchool({ id: '2', gender: Gender.GIRLS }),
      createMockSchool({ id: '3', gender: Gender.COED })
    ];
    
    const filters: SchoolFilters = {
      genders: [Gender.BOYS]
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by level', () => {
    const schools = [
      createMockSchool({ id: '1', level: Level.PRIMARY }),
      createMockSchool({ id: '2', level: Level.SECONDARY })
    ];
    
    const filters: SchoolFilters = {
      levels: [Level.PRIMARY]
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by county', () => {
    const schools = [
      createMockSchool({ id: '1', county: County.LONDON }),
      createMockSchool({ id: '2', county: County.KENT }),
      createMockSchool({ id: '3', county: County.BUCKINGHAMSHIRE })
    ];
    
    const filters: SchoolFilters = {
      counties: [County.LONDON, County.KENT]
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.id)).toEqual(['1', '2']);
  });

  it('filters by cost range', () => {
    const schools = [
      createMockSchool({ id: '1', cost: { amount: 0, currency: 'GBP', period: 'year', isFree: true } }),
      createMockSchool({ id: '2', cost: { amount: 15000, currency: 'GBP', period: 'year', isFree: false } }),
      createMockSchool({ id: '3', cost: { amount: 30000, currency: 'GBP', period: 'year', isFree: false } })
    ];
    
    const filters: SchoolFilters = {
      costRange: { min: 10000, max: 20000 }
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by competitiveness', () => {
    const schools = [
      createMockSchool({ id: '1', competitiveness: 1 }),
      createMockSchool({ id: '2', competitiveness: 3 }),
      createMockSchool({ id: '3', competitiveness: 5 })
    ];
    
    const filters: SchoolFilters = {
      competitiveness: [3, 5]
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.id)).toEqual(['2', '3']);
  });

  it('filters by ranking range', () => {
    const schools = [
      createMockSchool({ id: '1', ranking: { position: 5, source: 'Test', year: 2023 } }),
      createMockSchool({ id: '2', ranking: { position: 15, source: 'Test', year: 2023 } }),
      createMockSchool({ id: '3', ranking: { position: 25, source: 'Test', year: 2023 } }),
      createMockSchool({ id: '4' }) // No ranking
    ];
    
    const filters: SchoolFilters = {
      rankingRange: { min: 10, max: 20 }
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by boarding options', () => {
    const schools = [
      createMockSchool({ id: '1', boardingOptions: 'Day' }),
      createMockSchool({ id: '2', boardingOptions: 'Boarding' }),
      createMockSchool({ id: '3', boardingOptions: 'Both' }),
      createMockSchool({ id: '4' }) // No boarding info
    ];
    
    const filters: SchoolFilters = {
      boardingOptions: ['Day', 'Both']
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(2);
    expect(result.map(s => s.id)).toEqual(['1', '3']);
  });

  it('applies multiple filters together', () => {
    const schools = [
      createMockSchool({ 
        id: '1', 
        schoolType: SchoolType.GRAMMAR,
        gender: Gender.BOYS,
        cost: { amount: 0, currency: 'GBP', period: 'year', isFree: true }
      }),
      createMockSchool({ 
        id: '2', 
        schoolType: SchoolType.PRIVATE,
        gender: Gender.BOYS,
        cost: { amount: 25000, currency: 'GBP', period: 'year', isFree: false }
      }),
      createMockSchool({ 
        id: '3', 
        schoolType: SchoolType.GRAMMAR,
        gender: Gender.GIRLS,
        cost: { amount: 0, currency: 'GBP', period: 'year', isFree: true }
      })
    ];
    
    const filters: SchoolFilters = {
      schoolTypes: [SchoolType.GRAMMAR],
      genders: [Gender.BOYS]
    };
    
    const result = filterSchools(schools, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

describe('getFilterSummary', () => {
  it('returns zero count for empty filters', () => {
    const summary = getFilterSummary({});
    expect(summary.activeCount).toBe(0);
    expect(summary.description).toEqual([]);
  });

  it('counts school type filters', () => {
    const filters: SchoolFilters = {
      schoolTypes: [SchoolType.GRAMMAR, SchoolType.PRIVATE]
    };
    
    const summary = getFilterSummary(filters);
    expect(summary.activeCount).toBe(2);
    expect(summary.description).toContain('2 school type(s)');
  });

  it('describes gender filters', () => {
    const filters: SchoolFilters = {
      genders: [Gender.BOYS, Gender.GIRLS]
    };
    
    const summary = getFilterSummary(filters);
    expect(summary.activeCount).toBe(2);
    expect(summary.description).toContain('Boys, Girls');
  });

  it('describes level filters', () => {
    const filters: SchoolFilters = {
      levels: [Level.PRIMARY, Level.SECONDARY]
    };
    
    const summary = getFilterSummary(filters);
    expect(summary.activeCount).toBe(2);
    expect(summary.description).toContain('Primary & Secondary');
  });

  it('describes cost range', () => {
    const filters: SchoolFilters = {
      costRange: { min: 10000, max: 30000 }
    };
    
    const summary = getFilterSummary(filters);
    expect(summary.activeCount).toBe(1);
    expect(summary.description[0]).toMatch(/£10,000-£30,000\/year/);
  });

  it('describes open-ended cost range', () => {
    const filters: SchoolFilters = {
      costRange: { min: 20000 }
    };
    
    const summary = getFilterSummary(filters);
    expect(summary.description[0]).toMatch(/£20,000\+\/year/);
  });

  it('combines multiple filter descriptions', () => {
    const filters: SchoolFilters = {
      schoolTypes: [SchoolType.GRAMMAR],
      genders: [Gender.BOYS],
      levels: [Level.SECONDARY],
      costRange: { min: 0, max: 0 }
    };
    
    const summary = getFilterSummary(filters);
    expect(summary.activeCount).toBe(4);
    expect(summary.description).toHaveLength(4);
  });
});