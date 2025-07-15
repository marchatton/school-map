import { 
  School, 
  SchoolType, 
  Gender, 
  Level, 
  County,
  Competitiveness, 
  SchoolColor,
  SchoolFilters 
} from './School';

describe('School Types', () => {
  test('SchoolType enum contains all expected values', () => {
    expect(SchoolType.GRAMMAR).toBe('Grammar');
    expect(SchoolType.PRIVATE).toBe('Private');
    expect(SchoolType.STATE_PRIMARY).toBe('State Primary');
    expect(SchoolType.STATE_PRIMARY_FAITH).toBe('State Primary (Faith)');
    expect(SchoolType.COMPREHENSIVE).toBe('Comprehensive');
  });

  test('Gender enum contains all expected values', () => {
    expect(Gender.BOYS).toBe('Boys');
    expect(Gender.GIRLS).toBe('Girls');
    expect(Gender.COED).toBe('Co-ed');
  });

  test('Level enum contains all expected values', () => {
    expect(Level.PRIMARY).toBe('Primary');
    expect(Level.SECONDARY).toBe('Secondary');
  });

  test('Competitiveness enum contains numeric values 1-5', () => {
    expect(Competitiveness.ONE).toBe(1);
    expect(Competitiveness.TWO).toBe(2);
    expect(Competitiveness.THREE).toBe(3);
    expect(Competitiveness.FOUR).toBe(4);
    expect(Competitiveness.FIVE).toBe(5);
  });

  test('SchoolColor enum contains valid hex colors', () => {
    expect(SchoolColor.GIRLS_SECONDARY).toBe('#FF69B4');
    expect(SchoolColor.GIRLS_PRIMARY).toBe('#9370DB');
    expect(SchoolColor.BOYS_SECONDARY).toBe('#00008B');
    expect(SchoolColor.BOYS_PRIMARY).toBe('#87CEEB');
    expect(SchoolColor.COED_SECONDARY).toBe('#228B22');
    expect(SchoolColor.COED_PRIMARY).toBe('#FFD700');
    expect(SchoolColor.OTHER).toBe('#FF0000');
  });

  test('School interface structure is valid', () => {
    const mockSchool: School = {
      id: 'test-1',
      name: 'Test School',
      schoolType: SchoolType.GRAMMAR,
      gender: Gender.COED,
      level: Level.SECONDARY,
      address: '123 Test Street',
      postcode: 'TW1 1AA',
      cost: {
        amount: 0,
        currency: 'GBP',
        period: 'year',
        isFree: true
      },
      competitiveness: Competitiveness.THREE,
      notes: 'Test notes',
      borough: 'Test Borough',
      county: County.LONDON,
      color: SchoolColor.COED_SECONDARY
    };

    expect(mockSchool.id).toBe('test-1');
    expect(mockSchool.name).toBe('Test School');
    expect(mockSchool.schoolType).toBe(SchoolType.GRAMMAR);
    expect(mockSchool.cost.isFree).toBe(true);
  });

  test('SchoolFilters interface allows optional filtering', () => {
    const filters: SchoolFilters = {
      schoolTypes: [SchoolType.GRAMMAR, SchoolType.PRIVATE],
      genders: [Gender.COED],
      costRange: {
        min: 0,
        max: 25000
      }
    };

    expect(filters.schoolTypes).toHaveLength(2);
    expect(filters.costRange?.max).toBe(25000);
    expect(filters.levels).toBeUndefined();
  });
});