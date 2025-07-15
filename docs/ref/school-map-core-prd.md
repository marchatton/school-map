# School Mapping Tool - Product Requirements Document (PRD)

## 1. Executive Summary

### 1.1 Product Overview
The School Mapping Tool is an interactive web-based application that visualizes grammar schools, private schools, and primary schools across London, Buckinghamshire, and Kent on an interactive map. The tool helps families make informed decisions about education and relocation by providing geographical context to school locations, rankings, and key information.

### 1.2 Vision Statement
To create the most comprehensive and user-friendly school visualization tool that empowers families to make data-driven decisions about their children's education and residential choices.

### 1.3 Key Objectives
- Visualize 100+ schools on an interactive map with color-coded pins
- Enable quick identification of school types, genders, and quality rankings
- Support family decision-making for school selection and relocation
- Provide filtering and search capabilities for specific requirements
- Display commute times and catchment areas where applicable

## 2. User Personas

### 2.1 Primary Persona: "The Strategic Parent"
- **Demographics**: Parents aged 30-45 with children aged 0-10
- **Goals**: Find the best schools for their children while considering commute and housing costs
- **Pain Points**: Overwhelmed by spreadsheets, difficulty visualizing geographical relationships
- **Needs**: Visual representation of options, easy comparison, commute calculations

### 2.2 Secondary Persona: "The Relocating Family"
- **Demographics**: Families currently in London considering moves to suburbs
- **Goals**: Identify areas with good schools and reasonable commutes
- **Pain Points**: Unfamiliar with areas outside current location
- **Needs**: Catchment area visibility, transport links, housing cost context

### 2.3 Tertiary Persona: "The Education Consultant"
- **Demographics**: Professional advisors helping families with school placement
- **Goals**: Provide data-driven recommendations to clients
- **Pain Points**: Need to present complex information clearly
- **Needs**: Professional presentation tools, export capabilities

## 3. Core Features

### 3.1 Map Visualization

#### 3.1.1 Base Map
- **Technology**: Google Maps API (alternative: Mapbox)
- **Default View**: Greater London area with zoom to show all data points
- **Map Types**: Standard, Satellite, Terrain options
- **Controls**: Zoom, pan, fullscreen, map type selector

#### 3.1.2 School Pins
- **Color Coding System**:
  - Pink (#FF69B4): Girls Secondary
  - Purple (#9370DB): Girls Primary
  - Dark Blue (#00008B): Boys Secondary
  - Light Blue (#87CEEB): Boys Primary
  - Green (#228B22): Co-ed Secondary
  - Yellow (#FFD700): Co-ed Primary
  - Red (#FF0000): Special categories

- **Pin Design**:
  - Circular pins with school type icon (mortarboard for secondary, ABC for primary)
  - Size variation based on ranking (larger = higher ranking)
  - Clustering at zoom levels to prevent overcrowding
  - Numbers showing clustered school count

#### 3.1.3 Information Display

**Hover Card (Quick View)**:
- **Trigger**: Mouse hover on pin (desktop) or long press (mobile)
- **Display**: Floating card with shadow, positioned to avoid map edges
- **Animation**: Fade in (200ms delay to prevent flashing)
- **Contents**:
  - School name (bold, prominent)
  - School type badge (Grammar/Private/State)
  - Gender indicator with icon
  - Star rating (1-5) for competitiveness
  - National ranking (if Top 100)
  - Annual cost (formatted with commas)
  - One-line key feature (e.g., "No catchment" or "Metropolitan Line")
- **Design**: 
  - Max width: 300px
  - White background with subtle border
  - Small arrow pointing to pin
  - Semi-transparent backdrop for readability

**Click Action - Detailed Panel**:
- **Display**: Slide-in panel from right (desktop) or bottom sheet (mobile)
- **Contents**:
  - Full school name and crest/logo (if available)
  - Complete address with "Copy" and "Directions" buttons
  - School type, gender, and age range
  - National ranking with source and year
  - Annual costs breakdown (fees, voluntary contributions, extras)
  - Competitiveness rating with explanation
  - Transport information (nearest stations, walking time)
  - Catchment details (if applicable)
  - Key features and notes (bullet points)
  - Quick stats (class sizes, Oxbridge rate, etc.)
  - Action buttons:
    - Visit website
    - View Ofsted report
    - Add to comparison
    - Save to favorites
    - Get directions
  - Related schools section (sister schools, feeders)

### 3.2 Filtering System

#### 3.2.1 Filter Categories
- **School Type**:
  - [ ] Grammar Schools
  - [ ] Private Schools
  - [ ] State Primary Schools
  - [ ] Partially Selective

- **Gender**:
  - [ ] Boys only
  - [ ] Girls only
  - [ ] Co-educational
  - [ ] Mixed sixth form

- **Level**:
  - [ ] Primary (4-11)
  - [ ] Secondary (11-18)
  - [ ] All-through

- **Location**:
  - [ ] London Boroughs (dropdown)
  - [ ] Buckinghamshire
  - [ ] Kent
  - [ ] Within X miles of postcode

- **Cost Range** (Private only):
  - [ ] Under £20,000
  - [ ] £20,000 - £25,000
  - [ ] £25,000 - £30,000
  - [ ] Over £30,000

- **Performance**:
  - [ ] Top 10 nationally
  - [ ] Top 50 nationally
  - [ ] Top 100 nationally
  - [ ] Outstanding Ofsted
  - [ ] Good Ofsted

- **Special Features**:
  - [ ] No catchment area
  - [ ] Faith schools
  - [ ] IB curriculum
  - [ ] Boarding available
  - [ ] Strong SEN support

### 3.3 Search Functionality

#### 3.3.1 Search Types
- **School Name Search**: Auto-complete with fuzzy matching
- **Postcode Search**: Center map on location, show radius
- **Address Search**: Full address lookup with geocoding
- **Advanced Search**: Combine multiple criteria

#### 3.3.2 Search Results
- List view alongside map
- Sort by: Distance, Ranking, Name, Cost
- Quick actions: Zoom to school, Add to comparison

### 3.4 Additional Layers

#### 3.4.1 Catchment Areas
- **Display**: Shaded overlay polygons where applicable
- **Toggle**: On/off visibility
- **Data**: Particularly important for Tiffin schools, grammar schools
- **Interaction**: Click to see schools within catchment

#### 3.4.2 Transport Links
- **Rail Stations**: Pin markers with line information
- **Underground Stations**: Colored by line
- **Commute Times**: Isochrone maps from selected point
- **Information**: Journey times to major stations

#### 3.4.3 House Prices Heat Map
- **Data Source**: Land Registry or Zoopla API
- **Visualization**: Color gradient overlay
- **Controls**: Opacity slider, price range selector
- **Purpose**: Context for relocation decisions

### 3.5 Comparison Tools

#### 3.5.1 School Comparison
- **Selection**: Checkbox on popup or list view
- **Limit**: Compare up to 5 schools
- **Display**: Side-by-side comparison table
- **Metrics**: All available data points
- **Export**: PDF or Excel format

#### 3.5.2 Area Comparison
- **Draw Tool**: Define custom areas on map
- **Metrics**: Number of schools, average rankings, cost ranges
- **Visualize**: Bar charts and statistics

### 3.6 Journey Planning

#### 3.6.1 Commute Calculator
- **Input**: Home postcode + work postcode
- **Output**: Schools accessible within commute tolerance
- **Factors**: Total journey time door-to-door
- **Modes**: Driving, public transport, combined

#### 3.6.2 Multi-child Planning
- **Scenario**: Multiple children, different schools
- **Calculate**: Feasible combinations based on location
- **Optimize**: Suggest best compromise locations

## 4. User Interface Design

### 4.1 Layout Structure
```
+----------------------------------------------------------+
|  Logo/Title    Search Bar                    Filter Toggle |
+----------------------------------------------------------+
|  Filters Panel  |                                          |
|  (Collapsible)  |                                          |
|                 |          Interactive Map                 |
|  □ Grammar      |                                          |
|  □ Private      |         [School Pins]                   |
|  □ Primary      |                                          |
|                 |                                          |
|  Sort By: ▼     |                                          |
|                 +------------------------------------------+
|  Results List   | Legend | Layer Controls | Map Type      |
+----------------------------------------------------------+
```

### 4.2 Mobile Responsive Design
- **Breakpoints**: 320px, 768px, 1024px, 1440px
- **Mobile Features**:
  - Full-screen map mode
  - Bottom sheet for results
  - Simplified filters
  - Touch-optimized controls

### 4.3 Accessibility Requirements
- **WCAG 2.1 AA Compliance**
- **Color Blind Modes**: Patterns in addition to colors
- **Screen Reader Support**: Proper ARIA labels
- **Keyboard Navigation**: Full functionality without mouse
- **High Contrast Mode**: Optional theme

## 5. Technical Requirements

### 5.1 Frontend Technologies
- **Framework**: Next.js 14+ (App Router)
- **Deployment**: Vercel
- **Map Library**: Google Maps JavaScript API via @googlemaps/react-wrapper
- **State Management**: Zustand or React Context API
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Fetching**: SWR or TanStack Query
- **TypeScript**: Full type safety

### 5.2 Next.js Architecture
- **App Structure**:
  ```
  app/
  ├── layout.tsx (root layout with map container)
  ├── page.tsx (main map view)
  ├── api/
  │   ├── schools/route.ts (GET schools data)
  │   ├── geocode/route.ts (address geocoding)
  │   └── search/route.ts (search endpoint)
  ├── components/
  │   ├── Map/
  │   │   ├── SchoolMap.tsx
  │   │   ├── SchoolPin.tsx
  │   │   └── HoverCard.tsx
  │   ├── Filters/
  │   ├── Search/
  │   └── Comparison/
  └── lib/
      ├── db.ts (database connection)
      └── utils.ts (helper functions)
  ```

- **Environment Variables** (.env.local):
  ```
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
  DATABASE_URL=
  VERCEL_URL=
  ```

### 5.3 Backend Architecture
- **API Routes**: Next.js App Router API routes
- **Database**: 
  - Vercel Postgres (PostgreSQL) with PostGIS
  - Alternative: Supabase (includes PostGIS)
- **Edge Functions**: For geocoding and caching
- **Data Storage**: 
  - Static school data in JSON for fast loading
  - Database for dynamic data and spatial queries
- **Caching Strategy**:
  - Static Generation for initial data
  - Incremental Static Regeneration (ISR) for updates
  - Edge caching for API responses

### 5.4 Vercel-Specific Optimizations
- **Image Optimization**: Next/Image for school logos
- **Edge Runtime**: For API routes where applicable
- **Analytics**: Vercel Analytics integration
- **Performance Monitoring**: Vercel Speed Insights
- **Environment Management**: Preview deployments for testing

### 5.5 Performance Requirements
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **Lighthouse Score**: > 90 for Performance
- **Bundle Size**: < 250KB for initial JS
- **API Response**: < 200ms from Edge locations

## 6. Additional Features (Phase 2)

### 6.1 User Accounts
- **Save Searches**: Bookmark filter combinations
- **Favorite Schools**: Create shortlists
- **Notes**: Add personal notes to schools
- **Share**: Generate shareable links

### 6.2 Notifications
- **Open Day Alerts**: School event reminders
- **Application Deadlines**: 11+ and admission dates
- **New Schools**: Alerts for new additions

### 6.3 Community Features
- **Reviews**: Parent reviews and ratings
- **Q&A**: Ask questions about schools
- **Success Stories**: 11+ preparation tips

### 6.4 Premium Features
- **Detailed Analytics**: School trends over time
- **Custom Reports**: Branded PDF exports
- **API Access**: For education consultants
- **Priority Support**: Direct assistance

## 7. Success Metrics

### 7.1 Usage Metrics
- **Daily Active Users**: Target 1,000 within 6 months
- **Session Duration**: Average > 5 minutes
- **Pages per Session**: Average > 10 interactions
- **Bounce Rate**: < 30%

### 7.2 Engagement Metrics
- **Filter Usage**: 80% of users apply filters
- **Search Queries**: Average 3 per session
- **Comparison Tool**: 40% usage rate
- **Mobile Usage**: 60% of traffic

### 7.3 Business Metrics
- **User Acquisition Cost**: < £5 per user
- **Retention Rate**: 40% return within 30 days
- **Premium Conversion**: 5% of regular users
- **Support Tickets**: < 1% of DAU

## 8. Development Roadmap

### Phase 1: MVP (3 months)
- Week 1-2: Technical setup and data preparation
- Week 3-6: Core map functionality and school pins
- Week 7-9: Search and filter implementation
- Week 10-11: Information popups and basic UI
- Week 12: Testing and bug fixes

### Phase 2: Enhanced Features (2 months)
- Week 13-15: Catchment areas and transport layers
- Week 16-17: Comparison tools
- Week 18-19: Journey planning
- Week 20: Mobile optimization

### Phase 3: Advanced Features (2 months)
- Week 21-23: User accounts and saving
- Week 24-25: Community features
- Week 26-27: Analytics and reporting
- Week 28: Premium features launch

## 9. Risks and Mitigation

### 9.1 Technical Risks
- **API Costs**: Google Maps pricing
  - *Mitigation*: Implement caching, consider Mapbox
- **Data Accuracy**: School information changes
  - *Mitigation*: Quarterly review process
- **Performance**: Large dataset rendering
  - *Mitigation*: Clustering, lazy loading

### 9.2 Legal Risks
- **Data Protection**: GDPR compliance
  - *Mitigation*: Privacy by design, legal review
- **Copyright**: School information usage
  - *Mitigation*: Verify public domain status

### 9.3 Business Risks
- **Competition**: Other school finders
  - *Mitigation*: Superior UX and unique features
- **Adoption**: User acquisition
  - *Mitigation*: SEO, parent forum partnerships

## 10. Appendices

### 10.1 Competitor Analysis
- **Locrating**: Basic map, limited filters
- **Good Schools Guide**: Paywall, no visual map
- **Ofsted Website**: No geographical view
- **Rightmove Schools**: Property-focused, basic info

### 10.2 Data Schema
```typescript
// TypeScript interfaces for Next.js app

export interface School {
  schoolId: string;
  name: string;
  type: 'Grammar' | 'Private' | 'State';
  category: 'Primary' | 'Secondary' | 'All-through';
  gender: 'Boys' | 'Girls' | 'Co-ed';
  color: string; // Hex color for pin
  address: {
    street: string;
    city: string;
    postcode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  ranking?: {
    national?: number;
    source: string;
    year: number;
  };
  costs: {
    annual: number;
    includingVAT: boolean;
    voluntary: boolean;
  };
  competitiveness: 1 | 2 | 3 | 4 | 5;
  catchmentArea?: GeoJSON.Polygon;
  transport: {
    nearestStation: string;
    distanceToStation: number; // meters
    walkingTime: number; // minutes
    commuteToLondon?: number; // minutes
    lines?: string[]; // tube/rail lines
  };
  features: string[];
  notes: string[];
  ofstedRating?: 'Outstanding' | 'Good' | 'Requires Improvement';
  lastUpdated: string; // ISO date
}

export interface HoverCardData {
  name: string;
  type: string;
  gender: string;
  ranking?: number;
  competitiveness: number;
  annualCost: string;
  keyFeature: string;
}
```

### 10.3 User Stories
1. As a parent, I want to see all grammar schools within 30 minutes of my workplace
2. As a relocating family, I want to compare areas based on school quality and house prices
3. As an education consultant, I want to export comparison reports for my clients
4. As a parent of multiple children, I want to find areas with good schools for different age groups

### 10.4 Wireframes
[To be added during design phase]

## 11. Implementation Examples

### 11.1 Hover Card Component Example
```typescript
// components/Map/HoverCard.tsx
interface HoverCardProps {
  school: HoverCardData;
  position: { x: number; y: number };
}

export function HoverCard({ school, position }: HoverCardProps) {
  return (
    <div 
      className="absolute z-50 bg-white rounded-lg shadow-lg p-4 max-w-xs"
      style={{ left: position.x, top: position.y }}
    >
      <h3 className="font-bold text-lg">{school.name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <Badge variant={school.type}>{school.type}</Badge>
        <span className="text-sm text-gray-600">{school.gender}</span>
      </div>
      {school.ranking && (
        <p className="text-sm mt-1">
          National Ranking: <strong>#{school.ranking}</strong>
        </p>
      )}
      <div className="flex items-center mt-2">
        <StarRating value={school.competitiveness} />
        <span className="ml-2 text-sm">Competitiveness</span>
      </div>
      <p className="text-lg font-semibold mt-2">{school.annualCost}</p>
      <p className="text-sm text-blue-600 mt-1">{school.keyFeature}</p>
    </div>
  );
}
```

### 11.2 API Route Example
```typescript
// app/api/schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSchools } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filters = {
    type: searchParams.get('type'),
    gender: searchParams.get('gender'),
    maxCost: searchParams.get('maxCost'),
    bounds: searchParams.get('bounds'),
  };

  const schools = await getSchools(filters);
  
  return NextResponse.json(schools, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
```

### 11.3 Deployment Configuration
```json
// vercel.json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["lhr1"],
  "functions": {
    "app/api/schools/route.ts": {
      "maxDuration": 10
    }
  }
}
```