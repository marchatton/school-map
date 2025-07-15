import { School, SchoolType, Gender, Level, County, Competitiveness, Cost, SchoolColor } from '../types/School';

export interface ParsedSchoolData {
  schools: School[];
  colorCoding: Record<string, string>;
}

/**
 * Parses the markdown school data file and extracts structured school information
 */
export function parseSchoolData(markdownContent: string): ParsedSchoolData {
  const schools: School[] = [];
  const colorCoding: Record<string, string> = {};
  
  const lines = markdownContent.split('\n');
  let currentSchool: Partial<School> | null = null;
  let schoolIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Parse color coding system
    if (line.startsWith('- **') && line.includes('(#') && line.includes('):**')) {
      const colorMatch = line.match(/\(#([A-F0-9]{6})\)/);
      const typeMatch = line.match(/\*\*([^*]+)\*\*/);
      if (colorMatch && typeMatch) {
        // Remove the trailing colon from the type name
        const typeName = typeMatch[1].replace(/:$/, '');
        colorCoding[typeName] = `#${colorMatch[1]}`;
      }
      continue;
    }
    
    // Detect start of a school entry (numbered schools)
    const schoolHeaderMatch = line.match(/^\*\*(\d+)\.\s+(.+?)\*\*$/);
    if (schoolHeaderMatch) {
      // Save previous school if exists
      if (currentSchool && isValidSchool(currentSchool)) {
        schools.push(currentSchool as School);
      }
      
      // Start new school
      schoolIndex = parseInt(schoolHeaderMatch[1]);
      currentSchool = {
        id: schoolHeaderMatch[1],
        name: schoolHeaderMatch[2],
        address: '',
        postcode: '',
        borough: '',
        county: County.LONDON,
        schoolType: SchoolType.GRAMMAR,
        gender: Gender.COED,
        level: Level.SECONDARY,
        color: SchoolColor.OTHER,
        cost: { amount: 0, currency: 'GBP', period: 'year', isFree: true },
        competitiveness: 3,
        notes: '',
        website: '',
        coordinates: { lat: 0, lng: 0 }
      };
      continue;
    }
    
    // Parse school properties
    if (currentSchool && line.startsWith('- **')) {
      const propertyMatch = line.match(/^- \*\*([^*]+):\*\*\s*(.+)$/);
      if (propertyMatch) {
        const [, key, value] = propertyMatch;
        
        switch (key) {
          case 'School Type':
            currentSchool.schoolType = parseSchoolType(value);
            break;
          case 'Type':
            currentSchool.gender = parseGender(value);
            currentSchool.level = parseLevel(value);
            break;
          case 'Color':
            currentSchool.color = parseColor(value);
            break;
          case 'Address':
            currentSchool.address = value;
            // Extract postcode, borough, and county from address
            const addressInfo = parseAddressInfo(value, i, lines);
            currentSchool.postcode = addressInfo.postcode;
            currentSchool.borough = addressInfo.borough;
            currentSchool.county = addressInfo.county;
            break;
          case 'Ranking':
            currentSchool.ranking = parseRanking(value);
            break;
          case 'Annual Cost':
            currentSchool.cost = parseCost(value);
            break;
          case 'Competitiveness':
            currentSchool.competitiveness = parseCompetitiveness(value);
            break;
          case 'Notes':
            currentSchool.notes = value;
            break;
        }
      }
    }
  }
  
  // Add the last school if valid
  if (currentSchool && isValidSchool(currentSchool)) {
    schools.push(currentSchool as School);
  }
  
  return { schools, colorCoding };
}

function parseSchoolType(value: string): SchoolType {
  if (value.includes('Grammar')) return SchoolType.GRAMMAR;
  if (value.includes('Private')) return SchoolType.PRIVATE;
  if (value.includes('State Primary (Faith)')) return SchoolType.STATE_PRIMARY_FAITH;
  if (value.includes('State Primary')) return SchoolType.STATE_PRIMARY;
  if (value.includes('Comprehensive')) return SchoolType.COMPREHENSIVE;
  return SchoolType.GRAMMAR; // Default fallback
}

function parseGender(value: string): Gender {
  if (value.includes('Boys')) return Gender.BOYS;
  if (value.includes('Girls')) return Gender.GIRLS;
  return Gender.COED;
}

function parseLevel(value: string): Level {
  return value.includes('Primary') ? Level.PRIMARY : Level.SECONDARY;
}

function parseColor(value: string): SchoolColor {
  const colorMatch = value.match(/#([A-F0-9]{6})/);
  if (!colorMatch) return SchoolColor.OTHER;
  
  const color = `#${colorMatch[1]}`;
  
  // Find matching enum value
  for (const [key, enumValue] of Object.entries(SchoolColor)) {
    if (enumValue === color) {
      return enumValue as SchoolColor;
    }
  }
  
  return SchoolColor.OTHER;
}

function parseCost(value: string): Cost {
  if (value.toLowerCase().includes('free')) {
    const voluntaryMatch = value.match(/voluntary[^£]*£([\d,]+)/i);
    const voluntaryAmount = voluntaryMatch ? parseInt(voluntaryMatch[1].replace(/,/g, '')) : undefined;
    
    return {
      amount: 0,
      currency: 'GBP',
      period: 'year',
      isFree: true,
      voluntaryContribution: voluntaryAmount,
      includesVAT: false
    };
  }
  
  const costMatch = value.match(/£([\d,]+)/);
  if (costMatch) {
    const amount = parseInt(costMatch[1].replace(/,/g, ''));
    const includesVAT = value.includes('(inc. VAT)');
    
    return {
      amount,
      currency: 'GBP',
      period: 'year',
      isFree: false,
      includesVAT
    };
  }
  
  return { 
    amount: 0, 
    currency: 'GBP', 
    period: 'year', 
    isFree: true 
  };
}

function parseRanking(value: string): { position: number; total?: number; source: string; year?: number } | undefined {
  if (!value || value.trim() === '') return undefined;
  
  // Extract position from patterns like "9th nationally", "Top 50 nationally", etc.
  const positionMatch = value.match(/(\d+)(?:st|nd|rd|th)?/);
  const topMatch = value.match(/top\s+(\d+)/i);
  const yearMatch = value.match(/(\d{4})/);
  
  let position: number;
  if (positionMatch) {
    position = parseInt(positionMatch[1]);
  } else if (topMatch) {
    position = parseInt(topMatch[1]);
  } else {
    // Default position for qualitative rankings
    position = 50;
  }
  
  return {
    position,
    source: value,
    year: yearMatch ? parseInt(yearMatch[1]) : undefined
  };
}

function parseAddressInfo(address: string, currentLineIndex: number, lines: string[]): { postcode: string; borough: string; county: County } {
  // Extract postcode from address (UK postcode pattern)
  const postcodeMatch = address.match(/([A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2})/);
  const postcode = postcodeMatch ? postcodeMatch[1] : '';
  
  // Determine county and borough based on context from the markdown structure
  let county: County = County.LONDON;
  let borough = '';
  
  // Look backwards through lines to find section headers
  for (let i = currentLineIndex; i >= 0; i--) {
    const line = lines[i].trim();
    
    // Check for county headers
    if (line.includes('LONDON SCHOOLS')) {
      county = County.LONDON;
    } else if (line.includes('BUCKINGHAMSHIRE SCHOOLS')) {
      county = County.BUCKINGHAMSHIRE;
    } else if (line.includes('KENT SCHOOLS')) {
      county = County.KENT;
    }
    
    // Check for borough headers (### level headers)
    if (line.startsWith('### ') && !line.includes('SCHOOLS')) {
      borough = line.replace(/^###\s+/, '').trim();
      break;
    }
  }
  
  return { postcode, borough, county };
}

function parseCompetitiveness(value: string): Competitiveness {
  const ratingMatch = value.match(/(\d)\/5/);
  if (ratingMatch) {
    return parseInt(ratingMatch[1]) as Competitiveness;
  }
  return 3; // Default to medium competitiveness
}

function isValidSchool(school: Partial<School>): school is School {
  return !!(
    school.id &&
    school.name &&
    school.address &&
    school.postcode &&
    school.borough &&
    school.county &&
    school.schoolType &&
    school.gender &&
    school.level &&
    school.color &&
    school.cost &&
    school.competitiveness !== undefined &&
    school.notes !== undefined
  );
}

/**
 * Loads and parses school data from the markdown file
 */
export async function loadSchoolData(): Promise<ParsedSchoolData> {
  try {
    // In a real app, this would fetch from the file system or an API
    // For now, we'll need to import the data directly
    const response = await fetch('/docs/ref/school-data.md');
    const markdownContent = await response.text();
    return parseSchoolData(markdownContent);
  } catch (error) {
    console.error('Failed to load school data:', error);
    return { schools: [], colorCoding: {} };
  }
}