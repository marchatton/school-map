## Relevant Files

- `src/index.html` - Main HTML entry point for the application
- `src/components/Map.tsx` - Main map component displaying all schools
- `src/components/Map.test.tsx` - Unit tests for Map component
- `src/components/SchoolMarker.tsx` - Individual school marker component
- `src/components/SchoolMarker.test.tsx` - Unit tests for SchoolMarker
- `src/components/SchoolDetails.tsx` - Modal/sidebar for detailed school information
- `src/components/SchoolDetails.test.tsx` - Unit tests for SchoolDetails
- `src/components/FilterPanel.tsx` - Filtering interface component
- `src/components/FilterPanel.test.tsx` - Unit tests for FilterPanel
- `src/components/SearchBar.tsx` - School search functionality
- `src/components/SearchBar.test.tsx` - Unit tests for SearchBar
- `src/utils/dataParser.ts` - Parse markdown file into structured data
- `src/utils/dataParser.test.ts` - Unit tests for data parser
- `src/utils/geocoder.ts` - Geocoding utilities for school addresses
- `src/utils/geocoder.test.ts` - Unit tests for geocoder
- `src/data/schoolData.ts` - Structured school data after parsing
- `src/styles/main.css` - Main stylesheet including print styles
- `src/types/School.ts` - TypeScript interfaces for school data

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Set up project foundation and parse school data
  - [x] 1.1 Initialize React/TypeScript project with necessary dependencies (leaflet, react-leaflet, etc.)
  - [x] 1.2 Create TypeScript interfaces for School data matching the markdown structure
  - [ ] 1.3 Implement markdown parser to extract school data into structured format
  - [ ] 1.4 Create geocoding utility to convert school addresses to coordinates
  - [ ] 1.5 Build data validation to ensure all schools have valid coordinates
  - [ ] 1.6 Set up basic CSS structure with color constants matching PRD specifications

- [ ] 2.0 Implement core map functionality with school markers
  - [ ] 2.1 Set up Leaflet/OpenStreetMap base map component centered on London
  - [ ] 2.2 Create SchoolMarker component with color coding based on school type/gender
  - [ ] 2.3 Implement marker clustering for better performance at zoomed-out levels
  - [ ] 2.4 Add hover effects showing school names on markers
  - [ ] 2.5 Configure map controls (zoom, pan) and set appropriate initial bounds
  - [ ] 2.6 Add map legend showing color coding scheme

- [ ] 3.0 Build school information display and interaction
  - [ ] 3.1 Create SchoolDetails modal/sidebar component structure
  - [ ] 3.2 Implement click handler on markers to show detailed information
  - [ ] 3.3 Display all school data fields (ranking, cost, competitiveness, notes)
  - [ ] 3.4 Format costs properly (free vs paid, voluntary contributions)
  - [ ] 3.5 Add external link to school website with proper icon/styling
  - [ ] 3.6 Implement close functionality and keyboard accessibility

- [ ] 4.0 Create comprehensive filtering system
  - [ ] 4.1 Build FilterPanel component with collapsible design
  - [ ] 4.2 Implement school type filter (Grammar/Private/State Primary)
  - [ ] 4.3 Add gender filter (Boys/Girls/Co-ed) with multi-select
  - [ ] 4.4 Create cost range slider (£0 to £50,000) with proper formatting
  - [ ] 4.5 Add competitiveness rating filter (1-5 scale)
  - [ ] 4.6 Implement additional filters (ranking, distance, transport, religious, boarding)
  - [ ] 4.7 Add filter reset button and active filter indicators
  - [ ] 4.8 Ensure real-time map updates when filters change

- [ ] 5.0 Implement search functionality and success rate displays
  - [ ] 5.1 Create SearchBar component with autocomplete for school names
  - [ ] 5.2 Implement postcode/address search with geocoding
  - [ ] 5.3 Add search results highlighting on map and results list
  - [ ] 5.4 Parse and display primary school success rates/feeder information
  - [ ] 5.5 Create success rate badges ("High Success", "Grammar Feeder")
  - [ ] 5.6 Add borough boundary toggle functionality
  - [ ] 5.7 Implement print stylesheet and print button for filtered results
  - [ ] 5.8 Add accessibility features (ARIA labels, keyboard navigation, shape differentiation)