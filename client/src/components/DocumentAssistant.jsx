import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Loader2,
  FileCheck
} from 'lucide-react';

export default function DocumentAssistant() {
  const [selectedService, setSelectedService] = useState("ration");
  const [uploading, setUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const services = {
    ration: {
      name: "Ration Card",
      category: "Food & Civil Supplies",
      timeline: "15-30 working days",
      officialLink: "https://nfsa.gov.in",
      eligibility: [
        "Must be a citizen of India",
        "Must not possess any other active Ration Card in the state",
        "Must fall within BPL/APL family income thresholds"
      ],
      documents: [
        { name: "Aadhaar Card of all family members", mandatory: true },
        { name: "Current Residence Proof (Electricity/Water bill)", mandatory: true },
        { name: "Income Certificate from local Tehsildar", mandatory: true },
        { name: "Passport size photograph of Family Head", mandatory: true },
        { name: "Bank account passbook copy", mandatory: false }
      ]
    },
    passport: {
      name: "Indian Passport",
      category: "Ministry of External Affairs",
      timeline: "10-20 working days (Normal)",
      officialLink: "https://passportindia.gov.in",
      eligibility: [
        "Must be a citizen of India",
        "Must be above 18 years (or minors with parent consent)",
        "No active criminal cases under court trials"
      ],
      documents: [
        { name: "Aadhaar Card / E-Aadhaar", mandatory: true },
        { name: "Proof of Date of Birth (Birth Certificate or PAN)", mandatory: true },
        { name: "Address Proof (Active bank passbook or Utility bills)", mandatory: true },
        { name: "Non-ECR Proof (10th Standard passing certificate)", mandatory: false }
      ]
    },
    ayushman: {
      name: "Ayushman Bharat Card",
      category: "National Health Authority",
      timeline: "Instant (online verification)",
      officialLink: "https://mera.pmjay.gov.in",
      eligibility: [
        "Must be listed in SECC-2011 database of deprived households",
        "Active members of Rashtriya Swasthya Bima Yojana (RSBY)",
        "Must not possess luxury vehicles or large corporate land"
      ],
      documents: [
        { name: "Aadhaar Card", mandatory: true },
        { name: "Ration Card (NFSA list name matches)", mandatory: true },
        { name: "Active Mobile Number", mandatory: true }
      ]
    },
    pan: {
      name: "PAN Card",
      category: "Income Tax Department",
      timeline: "5-10 working days (e-PAN is instant)",
      officialLink: "https://www.onlineservices.nsdl.com",
      eligibility: [
        "Individual citizens, companies, partnerships",
        "Minors can apply via representative assessees"
      ],
      documents: [
        { name: "Identity Proof (Aadhaar Card / Voter ID)", mandatory: true },
        { name: "Address Proof (Electricity bill / Passport)", mandatory: true },
        { name: "Date of Birth Proof (School leaving / Aadhaar)", mandatory: true }
      ]
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVerifyDocument(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleVerifyDocument(e.target.files[0]);
    }
  };

  const handleVerifyDocument = async (file) => {
    setUploading(true);
    setUploadedFile(file);
    setVerificationResult(null);

    const formData = new FormData();
    formData.append("document", file);
    // Maps react service ids to back-end document requirements
    const typeMapping = {
      ration: "ration",
      passport: "passport",
      ayushman: "aadhaar",
      pan: "pan"
    };
    formData.append("documentType", typeMapping[selectedService] || "aadhaar");

    try {
      const response = await fetch('https://smart-bharat-civic-companion-rk6z.onrender.com/api/chat', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setVerificationResult(result);
      } else {
        throw new Error("Validation failed");
      }
    } catch (err) {
      console.error(err);
      setVerificationResult({
        isValid: false,
        detectedType: "Unknown",
        confidence: "Low",
        errors: ["System error contacting verification microservice."],
        feedback: "Could not evaluate document details. Offline mockup loaded.",
        tips: ["Please ensure your backend server is running and Gemini API credentials are set."]
      });
    } finally {
      setUploading(false);
    }
  };

  const current = services[selectedService];

  return (
    <div className="page-container">
      {/* Title block */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
          Document Requirements Assistant
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Identify necessary documentation for public applications and scan uploads using our GenAI Document Verifier.
        </p>
      </div>

      <div className="document-doc-assistant">

        {/* Left Side: Services lists & Requirements checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Select Civic Service</h3>

            {/* Service buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }} className="grid-cols-2">
              {Object.keys(services).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedService(key);
                    setVerificationResult(null);
                    setUploadedFile(null);
                  }}
                  className="btn"
                  style={{
                    backgroundColor: selectedService === key ? 'var(--accent-ashoka-glow)' : 'var(--bg-tertiary)',
                    color: selectedService === key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: selectedService === key ? 'var(--accent-primary)' : 'var(--border-color)',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  {services[key].name}
                </button>
              ))}
            </div>

            {/* Checklist requirements detail */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-saffron)', backgroundColor: 'var(--accent-saffron-glow)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                  {current.category}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Clock size={14} /> Process Time: {current.timeline}
                </span>
              </div>

              {/* Eligibility rules */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Eligibility Criteria</h4>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {current.eligibility.map((rule, idx) => (
                    <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', listStyleType: 'square' }}>{rule}</li>
                  ))}
                </ul>
              </div>

              {/* Documents check list */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Mandatory Documents</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {current.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                        {doc.name}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: doc.mandatory ? 'var(--accent-danger)' : 'var(--text-muted)'
                      }}>
                        {doc.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <a
                  href={current.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>Go to Official Portal</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Document Verifier Dropzone & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="glass-card" onDragEnter={handleDrag} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>GenAI Requirements Scanner</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Upload your digital copy (Aadhaar, PAN, Passport mock scans) to cross-check formatting criteria and name mismatches.
            </p>

            {/* Dropzone container */}
            <div
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className="upload-dropzone"
              style={{
                borderColor: dragActive ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: dragActive ? 'var(--accent-ashoka-glow)' : 'var(--bg-secondary)',
                marginBottom: '1.5rem'
              }}
            >
              {uploading ? (
                <>
                  <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>AI reading document structures...</p>
                </>
              ) : (
                <>
                  <UploadCloud size={36} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Drag and drop file here</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>PNG, JPG or PDF up to 2MB</p>
                  </div>
                  <label htmlFor="scan-upload" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Select Document
                  </label>
                  <input type="file" id="scan-upload" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </>
              )}
            </div>

            {/* Results pane */}
            {verificationResult && (
              <div
                className="verification-result-panel"
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                {/* Result header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {verificationResult.isValid ? (
                      <CheckCircle2 size={20} style={{ color: 'var(--accent-success)' }} />
                    ) : (
                      <XCircle size={20} style={{ color: 'var(--accent-danger)' }} />
                    )}
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {verificationResult.isValid ? 'VALID STRUCTURE' : 'INCOMPLETE/INVALID'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Confidence: {verificationResult.confidence}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Detected Document Type</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{verificationResult.detectedType}</span>
                  </div>

                  {/* Extracted JSON data */}
                  {Object.keys(verificationResult.extractedData || {}).length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Extracted Metadata</span>
                      <div style={{
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        padding: '0.65rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--accent-primary)',
                        border: '1px solid var(--border-light)'
                      }}>
                        {Object.keys(verificationResult.extractedData).map(key => (
                          <div key={key}><strong>{key}:</strong> {verificationResult.extractedData[key]}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {verificationResult.errors && verificationResult.errors.length > 0 && (
                    <div style={{ color: 'var(--accent-danger)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {verificationResult.errors.map((err, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldAlert size={14} /> <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary Feedback */}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {verificationResult.feedback}
                  </p>

                  {/* Tips array */}
                  {verificationResult.tips && verificationResult.tips.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>Assistant Recommendations</span>
                      <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {verificationResult.tips.map((tip, idx) => (
                          <li key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>
            )}

            {!verificationResult && !uploading && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={14} /> Select a service on the left and upload your file.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
