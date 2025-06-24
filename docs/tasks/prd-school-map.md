# Product Requirements Document: School Map Application

## Introduction/Overview

The School Map Application is an interactive web-based mapping tool designed to help parents navigate the complex landscape of school choices across London, Buckinghamshire, and Kent. The application visualizes a comprehensive database of grammar schools, private schools, and primary schools, providing crucial information about rankings, costs, competitiveness, and admissions processes. This tool aims to simplify the school selection process for parents planning their children's educational journey from primary through secondary education.

## Goals

1. **Visualize School Options:** Display all 120+ schools from the database on an interactive map with intuitive color coding
2. **Enable Informed Decisions:** Provide comprehensive school data including rankings, costs, and competitiveness ratings
3. **Simplify School Search:** Offer powerful filtering and search capabilities to find schools matching specific criteria
4. **Support Journey Planning:** Show transport links and accessibility information for each school
5. **Track Success Pathways:** Display success rates showing which primary schools feed into top grammar schools

## User Stories

1. **As a parent planning long-term education**, I want to see both primary and secondary schools on one map so that I can plan my child's complete educational pathway.

2. **As a parent researching schools**, I want to filter schools by type, gender, cost, and competitiveness so that I can find options matching my requirements and budget.

3. **As a parent considering relocation**, I want to see schools near specific postcodes and their transport links so that I can evaluate commute feasibility.

4. **As a parent comparing options**, I want to see detailed information about each school including rankings and costs so that I can make informed decisions.

5. **As a parent tracking grammar school entry**, I want to see which primary schools have the best success rates for grammar school entry so that I can choose the right primary school.

## Functional Requirements

1. **The system must display an interactive map showing all schools from the database**
   - Use OpenStreetMap or similar mapping library
   - Support zoom and pan functionality
   - Show all 120+ schools as clickable markers

2. **The system must implement the specified color coding scheme**
   - Pink (#FF69B4): Girls Secondary
   - Purple (#9370DB): Girls Primary  
   - Dark Blue (#00008B): Boys Secondary
   - Light Blue (#87CEEB): Boys Primary
   - Green (#228B22): Co-ed Secondary
   - Yellow (#FFD700): Co-ed Primary
   - Red (#FF0000): Other (Special categories)

3. **The system must show detailed school information on click**
   - School name and type
   - Address with postcode
   - National ranking (where applicable)
   - Annual cost (including VAT where relevant)
   - Competitiveness rating (1-5 scale)
   - Key notes (catchment areas, transport, special requirements)
   - Link to school website

4. **The system must provide comprehensive filtering options**
   - School type: Grammar/Private/State Primary
   - Gender: Boys/Girls/Co-ed
   - Annual cost range (slider from £0 to £50,000)
   - Competitiveness rating (1-5)
   - National ranking range
   - Distance from a specified location
   - Transport accessibility
   - Religious affiliation
   - Boarding/Day options

5. **The system must enable school search functionality**
   - Search by school name (with autocomplete)
   - Search by postcode or address
   - Show search results both as a list and highlighted on map

6. **The system must show transport information**
   - Display nearest stations for each school
   - Show transport links mentioned in the notes
   - Include journey times where specified in the data

7. **The system must filter schools by catchment area constraints**
   - Clearly indicate schools with strict catchment requirements
   - Show catchment radius where applicable (e.g., Tiffin 10km)

8. **The system must display primary school success rates**
   - Show percentage of students gaining grammar school places
   - Indicate which grammar schools students typically attend
   - Highlight "feeder" relationships between schools

9. **The system must handle school data presentation**
   - Format costs clearly (distinguish free schools from fee-paying)
   - Show "voluntary contribution" amounts for grammar schools
   - Display competitiveness ratings with clear explanations

10. **The system must provide a responsive desktop interface**
    - Optimize for desktop viewing
    - Ensure smooth performance with all schools displayed
    - Support standard browser controls

## Non-Goals (Out of Scope)

1. **User accounts and authentication** - No login required for initial version
2. **Saving favorites or creating lists** - Users cannot save preferences
3. **User-generated content** - No reviews, ratings, or comments
4. **Mobile app or responsive mobile design** - Desktop only for now
5. **Real-time data updates** - Static data from markdown file
6. **Catchment area drawing tools** - No custom area selection
7. **Journey planning** - No detailed route calculation
8. **Application tracking** - No deadline reminders or application management
9. **Community features** - No forums or parent interaction
10. **Data editing interface** - No admin panel for updating school data

## Design Considerations

1. **Map Interface**
   - Clean, uncluttered map focusing on school locations
   - Use simple colored pins (not logos or crests)
   - Implement marker clustering for zoomed-out views
   - Show school name on hover

2. **Information Display**
   - Use modal or sidebar for detailed school information
   - Consistent formatting for all school data
   - Clear visual hierarchy for important information
   - Readable typography for data-heavy content

3. **Color Scheme**
   - Strictly follow the specified color coding
   - Ensure colors are accessible and distinguishable
   - Use consistent colors in filters and legends

4. **Filter Interface**
   - Collapsible filter panel to maximize map space
   - Clear indication of active filters
   - One-click filter reset option
   - Real-time filter updates

## Technical Considerations

1. **Data Source**
   - Parse school data from the markdown file
   - Structure data for efficient filtering and searching
   - Geocode all school addresses for map plotting

2. **Performance**
   - Implement efficient marker clustering for smooth map interaction
   - Lazy load school details to improve initial load time
   - Optimize filter operations for instant results

3. **Browser Compatibility**
   - Support modern desktop browsers (Chrome, Firefox, Safari, Edge)
   - Ensure consistent rendering across browsers

4. **Static Deployment**
   - Build as a static site for easy deployment
   - No backend requirements for initial version

## Success Metrics

1. **Page Load Performance**
   - Initial load time under 3 seconds
   - Smooth map interaction with all schools displayed

2. **Search Effectiveness**
   - Users can find specific schools within 10 seconds
   - Filter combinations produce relevant results

3. **Data Accuracy**
   - All schools correctly plotted on map
   - School information matches source data
   - Success rate calculations are accurate

4. **User Task Completion**
   - Users can identify suitable schools for their criteria
   - Parents can trace primary-to-grammar pathways
   - Transport accessibility is clearly understood

## Open Questions - RESOLVED

1. **Geocoding Accuracy:** ✓ Use OpenStreetMap Nominatim or Google Geocoding API. Include manual verification step and maintain override file for corrections.

2. **Success Rate Calculations:** Show exact percentages where available (e.g., "3% feeder to QE Barnet"). For qualitative descriptions, use badges: "High Success" or "Grammar Feeder".

3. **Annual Updates:** Manually update the markdown file annually with versioning (e.g., school-data-2025.md).

4. **Additional School Data:** No additional exam results for MVP - current rankings are sufficient.

5. **Accessibility Features:** Yes - implement color-blind friendly design with shapes/patterns, visible legend, ARIA labels, and proper contrast ratios.

6. **Print Functionality:** Yes - add print stylesheet and "Print Results" button for filtered school lists.

7. **Map Boundaries:** Yes - add toggleable borough/county boundaries, especially important for residency-restricted schools.

8. **School Capacity:** Only display where mentioned in existing notes - competitiveness rating already captures this.