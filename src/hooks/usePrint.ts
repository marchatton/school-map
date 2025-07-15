import { useState, useCallback, useEffect } from 'react';
import { School } from '../types/School';

export interface PrintOptions {
  title?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'A4' | 'Letter';
}

export function usePrint() {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSchools, setPrintSchools] = useState<School[]>([]);
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    title: 'School Information',
    includeHeader: true,
    includeFooter: true,
    orientation: 'portrait',
    paperSize: 'A4'
  });

  // Listen for print events
  useEffect(() => {
    const handleBeforePrint = () => {
      // Additional setup before printing
      document.title = printOptions.title || 'School Information';
    };

    const handleAfterPrint = () => {
      setIsPrinting(false);
      setPrintSchools([]);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [printOptions.title]);

  const printSchool = useCallback((school: School, options?: Partial<PrintOptions>) => {
    const finalOptions = { ...printOptions, ...options };
    setPrintOptions(finalOptions);
    setPrintSchools([school]);
    setIsPrinting(true);
  }, [printOptions]);

  const printMultipleSchools = useCallback((schools: School[], options?: Partial<PrintOptions>) => {
    const finalOptions = { ...printOptions, ...options };
    setPrintOptions(finalOptions);
    setPrintSchools(schools);
    setIsPrinting(true);
  }, [printOptions]);

  const printFavorites = useCallback((favoriteSchools: School[], options?: Partial<PrintOptions>) => {
    const finalOptions = { 
      ...printOptions, 
      title: 'Favorite Schools',
      ...options 
    };
    setPrintOptions(finalOptions);
    setPrintSchools(favoriteSchools);
    setIsPrinting(true);
  }, [printOptions]);

  const printComparison = useCallback((comparisonSchools: School[], options?: Partial<PrintOptions>) => {
    const finalOptions = { 
      ...printOptions, 
      title: 'School Comparison',
      orientation: 'landscape' as const,
      ...options 
    };
    setPrintOptions(finalOptions);
    setPrintSchools(comparisonSchools);
    setIsPrinting(true);
  }, [printOptions]);

  const printSearchResults = useCallback((searchResults: School[], searchQuery: string, options?: Partial<PrintOptions>) => {
    const finalOptions = { 
      ...printOptions, 
      title: `Search Results: "${searchQuery}"`,
      ...options 
    };
    setPrintOptions(finalOptions);
    setPrintSchools(searchResults);
    setIsPrinting(true);
  }, [printOptions]);

  const printFilteredResults = useCallback((filteredSchools: School[], filterDescription: string, options?: Partial<PrintOptions>) => {
    const finalOptions = { 
      ...printOptions, 
      title: `Filtered Schools: ${filterDescription}`,
      ...options 
    };
    setPrintOptions(finalOptions);
    setPrintSchools(filteredSchools);
    setIsPrinting(true);
  }, [printOptions]);

  const cancelPrint = useCallback(() => {
    setIsPrinting(false);
    setPrintSchools([]);
  }, []);

  const updatePrintOptions = useCallback((newOptions: Partial<PrintOptions>) => {
    setPrintOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Generate print preview URL (for PDF generation)
  const generatePrintPreviewURL = useCallback((schools: School[], options?: Partial<PrintOptions>) => {
    const finalOptions = { ...printOptions, ...options };
    const params = new URLSearchParams({
      print: 'true',
      schools: schools.map(s => s.id).join(','),
      title: finalOptions.title || 'School Information',
      orientation: finalOptions.orientation || 'portrait',
      paperSize: finalOptions.paperSize || 'A4'
    });
    
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [printOptions]);

  // Download as PDF (using browser print to PDF)
  const downloadAsPDF = useCallback(async (schools: School[], filename?: string, options?: Partial<PrintOptions>) => {
    try {
      // Set up print options
      const finalOptions = { ...printOptions, ...options };
      setPrintOptions(finalOptions);
      setPrintSchools(schools);
      setIsPrinting(true);

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Trigger print dialog with PDF option
      window.print();
      
      // Note: Actual PDF download depends on user selecting "Save as PDF" in print dialog
      // For programmatic PDF generation, you'd need a library like jsPDF or Puppeteer
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      setIsPrinting(false);
      setPrintSchools([]);
    }
  }, [printOptions]);

  return {
    isPrinting,
    printSchools,
    printOptions,
    printSchool,
    printMultipleSchools,
    printFavorites,
    printComparison,
    printSearchResults,
    printFilteredResults,
    cancelPrint,
    updatePrintOptions,
    generatePrintPreviewURL,
    downloadAsPDF
  };
}