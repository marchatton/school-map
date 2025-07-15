import { parseSchoolData, ParsedSchoolData } from './dataParser';
import { Gender, Level, SchoolColor, SchoolType, County } from '../types/School';

describe('dataParser', () => {
  const sampleMarkdownData = `
# Complete School Database - Grammar, Private & Primary Schools

### Color Coding System
- **Pink (#FF69B4):** Girls Secondary
- **Dark Blue (#00008B):** Boys Secondary
- **Green (#228B22):** Co-ed Secondary

---

## LONDON SCHOOLS

### BARNET

#### Grammar Schools

**1. The Henrietta Barnett School**
- **School Type:** Grammar
- **Type:** Girls Secondary
- **Color:** #FF69B4 (Pink)
- **Address:** Central Square, Hampstead Garden Suburb, London NW11 7BN
- **Ranking:** 9th nationally, State Secondary School of the Year 2025
- **Annual Cost:** Free (voluntary contributions expected)
- **Competitiveness:** 5/5 (1,900 applications for 93 places)
- **Notes:** No catchment but 3-mile proximity advantage. Two-stage 11+ process.

**2. Queen Elizabeth's School, Barnet**
- **School Type:** Grammar
- **Type:** Boys Secondary
- **Color:** #00008B (Dark Blue)
- **Address:** Queen's Road, Barnet, EN5 4DQ
- **Ranking:** 11th nationally (Sunday Times 2025)
- **Annual Cost:** Free (voluntary fund £360-480/year)
- **Competitiveness:** 5/5 ("Bloodbath" - 3,000+ for 180 places)
- **Notes:** No catchment. Min score ~235. High Barnet (Northern Line) 10 mins.
`;

  let parsedData: ParsedSchoolData;

  beforeEach(() => {
    parsedData = parseSchoolData(sampleMarkdownData);
  });

  describe('parseSchoolData', () => {
    it('should parse color coding system correctly', () => {
      expect(parsedData.colorCoding).toEqual({
        'Pink (#FF69B4)': '#FF69B4',
        'Dark Blue (#00008B)': '#00008B',
        'Green (#228B22)': '#228B22'
      });
    });

    it('should parse school entries correctly', () => {
      expect(parsedData.schools).toHaveLength(2);
    });

    it('should parse first school correctly', () => {
      const school = parsedData.schools[0];
      
      expect(school.id).toBe('1');
      expect(school.name).toBe('The Henrietta Barnett School');
      expect(school.schoolType).toBe(SchoolType.GRAMMAR);
      expect(school.gender).toBe(Gender.GIRLS);
      expect(school.level).toBe(Level.SECONDARY);
      expect(school.color).toBe(SchoolColor.GIRLS_SECONDARY);
      expect(school.address).toBe('Central Square, Hampstead Garden Suburb, London NW11 7BN');
      expect(school.ranking?.position).toBe(9);
      expect(school.ranking?.source).toBe('9th nationally, State Secondary School of the Year 2025');
      expect(school.ranking?.year).toBe(2025);
      expect(school.cost.isFree).toBe(true);
      expect(school.competitiveness).toBe(5);
      expect(school.notes).toBe('No catchment but 3-mile proximity advantage. Two-stage 11+ process.');
    });

    it('should parse second school correctly', () => {
      const school = parsedData.schools[1];
      
      expect(school.id).toBe('2');
      expect(school.name).toBe("Queen Elizabeth's School, Barnet");
      expect(school.schoolType).toBe(SchoolType.GRAMMAR);
      expect(school.gender).toBe(Gender.BOYS);
      expect(school.level).toBe(Level.SECONDARY);
      expect(school.color).toBe(SchoolColor.BOYS_SECONDARY);
      expect(school.competitiveness).toBe(5);
    });

    it('should handle free costs with voluntary contributions', () => {
      const school1 = parsedData.schools[0];
      const school2 = parsedData.schools[1];
      
      expect(school1.cost.isFree).toBe(true);
      expect(school1.cost.amount).toBe(0);
      
      expect(school2.cost.isFree).toBe(true);
      expect(school2.cost.amount).toBe(0);
      expect(school2.cost.voluntaryContribution).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty markdown content', () => {
      const result = parseSchoolData('');
      expect(result.schools).toHaveLength(0);
      expect(result.colorCoding).toEqual({});
    });

    it('should handle incomplete school entries', () => {
      const incompleteData = `
**1. Incomplete School**
- **School Type:** Grammar
- **Address:** Some Address
`;
      const result = parseSchoolData(incompleteData);
      expect(result.schools).toHaveLength(0); // Should not include incomplete schools
    });

    it('should parse private school costs correctly', () => {
      const privateSchoolData = `
## LONDON SCHOOLS

### BARNET

**1. Private School**
- **School Type:** Private
- **Type:** Co-ed Secondary
- **Color:** #228B22 (Green)
- **Address:** School Lane, Barnet, EN5 4DQ
- **Annual Cost:** £25,000 (inc. VAT)
- **Competitiveness:** 4/5
- **Ranking:** Top 10
- **Notes:** Great school
`;
      const result = parseSchoolData(privateSchoolData);
      
      expect(result.schools).toHaveLength(1);
      expect(result.schools[0].cost.isFree).toBe(false);
      expect(result.schools[0].cost.amount).toBe(25000);
      expect(result.schools[0].cost.includesVAT).toBe(true);
    });
  });
});