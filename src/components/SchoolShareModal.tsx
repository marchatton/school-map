import React, { useState } from 'react';
import { School } from '../types/School';
import {
  isWebShareSupported,
  shareViaWebAPI,
  generateSchoolURL,
  generateSchoolShareText,
  copyToClipboard,
  shareViaEmail,
  shareViaSMS,
  shareViaWhatsApp,
  shareViaTwitter,
  shareViaFacebook,
  shareViaLinkedIn,
  generateQRCodeData,
  downloadSchoolInfo,
  downloadSchoolJSON
} from '../utils/shareUtils';
import './SchoolShareModal.css';

interface SchoolShareModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
}

const SchoolShareModal: React.FC<SchoolShareModalProps> = ({
  school,
  isOpen,
  onClose
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [shareMethod, setShareMethod] = useState<'link' | 'text' | 'qr' | 'download'>('link');

  if (!isOpen || !school) return null;

  const schoolUrl = generateSchoolURL(school);
  const schoolText = generateSchoolShareText(school);

  const handleWebShare = async () => {
    const success = await shareViaWebAPI({
      title: `School Information: ${school.name}`,
      text: `Check out ${school.name} - ${school.schoolType} in ${school.borough}`,
      url: schoolUrl
    });

    if (!success) {
      // Fallback to copy URL
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(schoolUrl);
    setCopyFeedback(success ? 'Link copied!' : 'Failed to copy');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const handleCopyText = async () => {
    const success = await copyToClipboard(schoolText);
    setCopyFeedback(success ? 'Text copied!' : 'Failed to copy');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="share-modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="share-modal-content">
        <div className="share-modal-header">
          <h2 id="share-modal-title" className="share-modal-title">
            Share {school.name}
          </h2>
          <button
            className="share-modal-close"
            onClick={onClose}
            aria-label="Close share dialog"
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="share-modal-body">
          {/* Share Method Tabs */}
          <div className="share-tabs">
            <button
              className={`share-tab ${shareMethod === 'link' ? 'active' : ''}`}
              onClick={() => setShareMethod('link')}
            >
              🔗 Link
            </button>
            <button
              className={`share-tab ${shareMethod === 'text' ? 'active' : ''}`}
              onClick={() => setShareMethod('text')}
            >
              📝 Text
            </button>
            <button
              className={`share-tab ${shareMethod === 'qr' ? 'active' : ''}`}
              onClick={() => setShareMethod('qr')}
            >
              📱 QR Code
            </button>
            <button
              className={`share-tab ${shareMethod === 'download' ? 'active' : ''}`}
              onClick={() => setShareMethod('download')}
            >
              💾 Download
            </button>
          </div>

          {/* Quick Share (Web Share API or Social) */}
          <div className="share-section">
            <h3 className="share-section-title">Quick Share</h3>
            <div className="share-quick-buttons">
              {isWebShareSupported() ? (
                <button
                  className="share-btn share-btn-system"
                  onClick={handleWebShare}
                  title="Share via system dialog"
                >
                  📤 Share
                </button>
              ) : (
                <>
                  <button
                    className="share-btn share-btn-whatsapp"
                    onClick={() => shareViaWhatsApp(school)}
                    title="Share via WhatsApp"
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    className="share-btn share-btn-twitter"
                    onClick={() => shareViaTwitter(school)}
                    title="Share via Twitter"
                  >
                    🐦 Twitter
                  </button>
                  <button
                    className="share-btn share-btn-facebook"
                    onClick={() => shareViaFacebook(school)}
                    title="Share via Facebook"
                  >
                    📘 Facebook
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content based on selected method */}
          {shareMethod === 'link' && (
            <div className="share-section">
              <h3 className="share-section-title">Share Link</h3>
              <div className="share-content-box">
                <div className="share-url-container">
                  <input
                    type="text"
                    value={schoolUrl}
                    readOnly
                    className="share-url-input"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    className="share-copy-btn"
                    onClick={handleCopyLink}
                    title="Copy link"
                  >
                    📋
                  </button>
                </div>
                {copyFeedback && (
                  <div className="share-feedback">{copyFeedback}</div>
                )}
              </div>
            </div>
          )}

          {shareMethod === 'text' && (
            <div className="share-section">
              <h3 className="share-section-title">Share Text</h3>
              <div className="share-content-box">
                <textarea
                  value={schoolText}
                  readOnly
                  className="share-text-area"
                  rows={8}
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  className="share-copy-btn share-copy-text"
                  onClick={handleCopyText}
                  title="Copy text"
                >
                  📋 Copy Text
                </button>
                {copyFeedback && (
                  <div className="share-feedback">{copyFeedback}</div>
                )}
              </div>
            </div>
          )}

          {shareMethod === 'qr' && (
            <div className="share-section">
              <h3 className="share-section-title">QR Code</h3>
              <div className="share-content-box">
                <div className="share-qr-container">
                  <img
                    src={generateQRCodeData(school)}
                    alt={`QR code for ${school.name}`}
                    className="share-qr-code"
                  />
                  <p className="share-qr-description">
                    Scan with your phone to view school details
                  </p>
                </div>
              </div>
            </div>
          )}

          {shareMethod === 'download' && (
            <div className="share-section">
              <h3 className="share-section-title">Download</h3>
              <div className="share-content-box">
                <div className="share-download-buttons">
                  <button
                    className="share-download-btn"
                    onClick={() => downloadSchoolInfo(school)}
                    title="Download as text file"
                  >
                    📄 Text File
                  </button>
                  <button
                    className="share-download-btn"
                    onClick={() => downloadSchoolJSON(school)}
                    title="Download as JSON data"
                  >
                    📊 JSON Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Additional Share Options */}
          <div className="share-section">
            <h3 className="share-section-title">More Options</h3>
            <div className="share-more-buttons">
              <button
                className="share-btn share-btn-email"
                onClick={() => shareViaEmail(school)}
                title="Share via email"
              >
                📧 Email
              </button>
              <button
                className="share-btn share-btn-sms"
                onClick={() => shareViaSMS(school)}
                title="Share via SMS"
              >
                💬 SMS
              </button>
              <button
                className="share-btn share-btn-linkedin"
                onClick={() => shareViaLinkedIn(school)}
                title="Share via LinkedIn"
              >
                💼 LinkedIn
              </button>
            </div>
          </div>
        </div>

        <div className="share-modal-footer">
          <button 
            className="btn btn-primary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolShareModal;