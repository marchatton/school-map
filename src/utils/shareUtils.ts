/**
 * Utility functions for sharing school information
 */

import { School } from '../types/School';

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
}

/**
 * Check if the Web Share API is supported
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share using the Web Share API
 */
export async function shareViaWebAPI(options: ShareOptions): Promise<boolean> {
  if (!isWebShareSupported()) {
    return false;
  }

  try {
    await navigator.share(options);
    return true;
  } catch (error) {
    // User cancelled or error occurred
    console.warn('Web Share API failed:', error);
    return false;
  }
}

/**
 * Generate shareable URL for a school
 */
export function generateSchoolURL(school: School): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    school: school.id,
    name: school.name,
    type: school.schoolType,
    location: `${school.borough}, ${school.county}`
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate school sharing text
 */
export function generateSchoolShareText(school: School): string {
  const cost = school.cost.isFree ? 'Free' : `£${school.cost.amount.toLocaleString()}/${school.cost.period}`;
  const competitiveness = '★'.repeat(school.competitiveness) + '☆'.repeat(5 - school.competitiveness);
  
  let text = `Check out ${school.name}!\n\n`;
  text += `📍 ${school.address}, ${school.postcode}\n`;
  text += `🏫 ${school.schoolType} • ${school.gender} • ${school.level}\n`;
  text += `💰 ${cost}\n`;
  text += `⭐ Competitiveness: ${competitiveness} (${school.competitiveness}/5)\n`;
  
  if (school.ranking) {
    text += `🏆 Ranked #${school.ranking.position}`;
    if (school.ranking.source) {
      text += ` (${school.ranking.source})`;
    }
    text += '\n';
  }
  
  if (school.ofstedRating) {
    text += `✅ Ofsted: ${school.ofstedRating}\n`;
  }
  
  if (school.transport?.nearestStation) {
    text += `🚉 Nearest Station: ${school.transport.nearestStation}`;
    if (school.transport.walkingTime) {
      text += ` (${school.transport.walkingTime})`;
    }
    text += '\n';
  }
  
  return text;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Share school via email
 */
export function shareViaEmail(school: School): void {
  const subject = encodeURIComponent(`School Information: ${school.name}`);
  const body = encodeURIComponent(
    generateSchoolShareText(school) + 
    '\n\nView more details: ' + 
    generateSchoolURL(school)
  );
  
  const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
  window.open(mailtoLink);
}

/**
 * Share school via SMS/Text
 */
export function shareViaSMS(school: School): void {
  const text = encodeURIComponent(
    `${school.name} - ${school.schoolType} in ${school.borough}\n` +
    `${generateSchoolURL(school)}`
  );
  
  const smsLink = `sms:?body=${text}`;
  window.open(smsLink);
}

/**
 * Share school via WhatsApp
 */
export function shareViaWhatsApp(school: School): void {
  const text = encodeURIComponent(
    generateSchoolShareText(school) + 
    '\n' + 
    generateSchoolURL(school)
  );
  
  const whatsappLink = `https://wa.me/?text=${text}`;
  window.open(whatsappLink, '_blank');
}

/**
 * Share school via Twitter
 */
export function shareViaTwitter(school: School): void {
  const text = encodeURIComponent(
    `Found a great school: ${school.name} in ${school.borough}! ` +
    `${school.schoolType} • ${school.gender} • ${school.level}`
  );
  const url = encodeURIComponent(generateSchoolURL(school));
  const hashtags = encodeURIComponent('schools,education,UK');
  
  const twitterLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`;
  window.open(twitterLink, '_blank');
}

/**
 * Share school via Facebook
 */
export function shareViaFacebook(school: School): void {
  const url = encodeURIComponent(generateSchoolURL(school));
  const quote = encodeURIComponent(
    `Check out ${school.name} - ${school.schoolType} in ${school.borough}, ${school.county}`
  );
  
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
  window.open(facebookLink, '_blank');
}

/**
 * Share school via LinkedIn
 */
export function shareViaLinkedIn(school: School): void {
  const url = encodeURIComponent(generateSchoolURL(school));
  const title = encodeURIComponent(`School Information: ${school.name}`);
  const summary = encodeURIComponent(
    `${school.schoolType} in ${school.borough}, ${school.county}. ` +
    `Cost: ${school.cost.isFree ? 'Free' : `£${school.cost.amount.toLocaleString()}/${school.cost.period}`}`
  );
  
  const linkedinLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
  window.open(linkedinLink, '_blank');
}

/**
 * Generate QR code data URL for school information
 */
export function generateQRCodeData(school: School): string {
  // Simple QR code generation - in production, you might want to use a proper QR library
  const url = generateSchoolURL(school);
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  return qrApiUrl;
}

/**
 * Download school information as text file
 */
export function downloadSchoolInfo(school: School): void {
  const content = generateSchoolShareText(school) + '\n\nView online: ' + generateSchoolURL(school);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${school.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_info.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate school information as JSON for developers/API users
 */
export function generateSchoolJSON(school: School): string {
  const shareableData = {
    id: school.id,
    name: school.name,
    address: school.address,
    postcode: school.postcode,
    borough: school.borough,
    county: school.county,
    schoolType: school.schoolType,
    gender: school.gender,
    level: school.level,
    cost: school.cost,
    competitiveness: school.competitiveness,
    ranking: school.ranking,
    ofstedRating: school.ofstedRating,
    coordinates: school.coordinates,
    website: school.website,
    shareUrl: generateSchoolURL(school),
    sharedAt: new Date().toISOString()
  };
  
  return JSON.stringify(shareableData, null, 2);
}

/**
 * Download school information as JSON file
 */
export function downloadSchoolJSON(school: School): void {
  const content = generateSchoolJSON(school);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${school.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}