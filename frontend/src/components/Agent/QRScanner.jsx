import { useState, useEffect, useRef } from 'react';
import { qrService } from '../../services/qr';
import { QrCode, Camera, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const QRScanner = ({ onScanComplete }) => {
    const [ scanning, setScanning ] = useState(false);
    const [ result, setResult ] = useState(null);
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Pour simplifier, on utilise une bibliothèque de scan QR
    // En production, utiliser react-qr-scanner ou jsQR

    const simulateScan = () => {
        // Simulation de scan pour développement
        const mockQRData = JSON.stringify({
            system: 'SECURIS',
            date: new Date().toISOString().split('T')[ 0 ],
            token: 'SECURIS-' + new Date().toISOString().split('T')[ 0 ] + '-test123',
            validFrom: "00:00",
            validTo: "05:30",
            type: "agent_checkin",
            hotel: "Leon_Kinshasa"
        });

        validateQR(mockQRData);
    };

    const validateQR = async (qrData) => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const validationResult = await qrService.validateQR(qrData);

            if (validationResult.success) {
                setResult(validationResult);
                if (onScanComplete) {
                    onScanComplete(validationResult);
                }
            } else {
                setError(validationResult.error || 'QR code invalide');
            }
        } catch (err) {
            setError('Erreur de validation: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
            setScanning(false);
        }
    };

    const startCamera = async () => {
        setScanning(true);
        setError('');
        setResult(null);

        try {
            // En développement, on simule
            setTimeout(() => {
                simulateScan();
            }, 1500);

            // En production, activer la vraie caméra:
            /*
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'environment' } 
            });
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            */
        } catch (err) {
            setError('Impossible d\'accéder à la caméra: ' + err.message);
            setScanning(false);
        }
    };

    const resetScanner = () => {
        setScanning(false);
        setResult(null);
        setError('');

        // Arrêter la caméra en production
        /*
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        */
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [ hours, minutes ] = timeStr.split(':');
        return `${ hours }h${ minutes }`;
    };

    return (
        <div className="card card-securs">
            <div className="card-header">
                <h5 className="mb-0">
                    <QrCode className="me-2" />
                    Scanner QR Code
                </h5>
            </div>

            <div className="card-body">
                {/* Instructions */ }
                <div className="alert alert-info mb-4">
                    <div className="d-flex">
                        <AlertTriangle size={ 20 } className="me-2 flex-shrink-0" />
                        <div>
                            <strong>Instructions de pointage:</strong>
                            <ol className="mb-0 mt-2">
                                <li>Scanner le QR code affiché dans votre zone de ronde</li>
                                <li>Validez votre identité avec reconnaissance faciale</li>
                                <li>Le pointage sera enregistré automatiquement</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Zone de scan */ }
                <div className="text-center mb-4">
                    { scanning ? (
                        <div className="position-relative">
                            {/* Zone caméra simulée */ }
                            <div
                                className="border border-3 border-primary rounded mx-auto d-flex align-items-center justify-content-center"
                                style={ { width: '300px', height: '300px', backgroundColor: '#f8f9fa' } }
                            >
                                <div className="text-center">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Scan en cours...</span>
                                    </div>
                                    <p className="text-muted">Scan en cours...</p>
                                </div>
                            </div>

                            {/* Overlay pour aide au cadrage */ }
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                <div className="border border-2 border-success rounded" style={ { width: '200px', height: '200px' } }></div>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="mx-auto" style={ { maxWidth: '300px' } }>
                            <div className={ `card ${ result.valid ? 'border-success' : 'border-danger' }` }>
                                <div className="card-body text-center">
                                    <div className="mb-3">
                                        { result.valid ? (
                                            <CheckCircle size={ 64 } className="text-success" />
                                        ) : (
                                            <XCircle size={ 64 } className="text-danger" />
                                        ) }
                                    </div>
                                    <h5 className={ result.valid ? 'text-success' : 'text-danger' }>
                                        { result.valid ? 'QR Code Valide' : 'QR Code Invalide' }
                                    </h5>
                                    <p className="text-muted">{ result.message || result.error }</p>

                                    { result.data && (
                                        <div className="text-start small mt-3">
                                            <p><strong>Date:</strong> { result.data.date }</p>
                                            <p><strong>Heure:</strong> { result.data.time }</p>
                                            <p><strong>Lieu:</strong> { result.data.location }</p>
                                        </div>
                                    ) }
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-2 border-dashed rounded p-5 mx-auto" style={ { maxWidth: '300px' } }>
                            <QrCode size={ 80 } className="text-muted mb-3" />
                            <p className="text-muted">Prêt à scanner</p>
                        </div>
                    ) }
                </div>

                {/* Contrôles */ }
                <div className="d-grid gap-2">
                    { !scanning && !result ? (
                        <button
                            onClick={ startCamera }
                            className="btn btn-securs-blue btn-lg py-3"
                            disabled={ loading }
                        >
                            <Camera size={ 20 } className="me-2" />
                            { loading ? 'Chargement...' : 'Démarrer le Scan' }
                        </button>
                    ) : result ? (
                        <button
                            onClick={ resetScanner }
                            className="btn btn-outline-primary btn-lg py-3"
                        >
                            Scanner un autre QR Code
                        </button>
                    ) : (
                        <button
                            onClick={ resetScanner }
                            className="btn btn-outline-secondary btn-lg py-3"
                        >
                            Annuler le Scan
                        </button>
                    ) }
                </div>

                {/* Message d'erreur */ }
                { error && (
                    <div className="alert alert-danger mt-3">
                        <XCircle size={ 20 } className="me-2" />
                        { error }
                    </div>
                ) }

                {/* Info plage horaire */ }
                <div className="mt-4 p-3 bg-light rounded">
                    <div className="d-flex align-items-center">
                        <Clock size={ 18 } className="me-2 text-primary" />
                        <div>
                            <small className="text-muted">
                                <strong>Plage horaire des rondes:</strong> 00h00 - 05h30
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-footer text-muted small">
                <div className="row">
                    <div className="col-6">
                        <i className="bi bi-camera me-1"></i>
                        Utilisez la caméra arrière
                    </div>
                    <div className="col-6 text-end">
                        <i className="bi bi-lightbulb me-1"></i>
                        Bien éclairer le QR code
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;