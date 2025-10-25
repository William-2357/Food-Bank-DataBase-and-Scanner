import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onError?: (error: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');

  const codeReader = new BrowserMultiFormatReader();

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start scanning
        const result = await codeReader.decodeFromVideoElement(videoRef.current);
        if (result) {
          setIsScanning(false);
          onBarcodeDetected(result.getText());
          // Stop camera
          stream.getTracks().forEach(track => track.stop());
        }
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      let errorMessage = 'Camera access denied or not available';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      }

      setError(errorMessage);
      setIsScanning(false);
      onError?.(errorMessage);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onBarcodeDetected(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualSubmit();
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <h2>Barcode Scanner</h2>
        {!isScanning && (
          <button 
            onClick={startScanning}
            className="scan-button"
            disabled={isScanning}
          >
            Start Scanning
          </button>
        )}
        {isScanning && (
          <button 
            onClick={stopScanning}
            className="stop-button"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      )}

      <div className="video-container">
        <video
          ref={videoRef}
          className="scanner-video"
          playsInline
          muted
        />
      </div>

      {/* Manual Input Section */}
      <div className="manual-input-section">
        <h3>Or enter barcode manually:</h3>
        <div className="manual-input-container">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter barcode number"
            className="manual-input"
          />
          <button
            onClick={handleManualSubmit}
            disabled={!manualBarcode.trim()}
            className="manual-submit-button"
          >
            Submit
          </button>
        </div>
      </div>

      <style jsx>{`
        .scanner-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .scan-button, .stop-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }

        .stop-button {
          background: #dc3545;
        }

        .scan-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }

        .video-container {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .scanner-video {
          width: 100%;
          height: auto;
          display: block;
        }

        .manual-input-section {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #dee2e6;
        }

        .manual-input-section h3 {
          margin: 0 0 15px 0;
          color: #495057;
          font-size: 16px;
        }

        .manual-input-container {
          display: flex;
          gap: 10px;
        }

        .manual-input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #ced4da;
          border-radius: 5px;
          font-size: 16px;
          outline: none;
        }

        .manual-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .manual-submit-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }

        .manual-submit-button:hover:not(:disabled) {
          background: #218838;
        }

        .manual-submit-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;