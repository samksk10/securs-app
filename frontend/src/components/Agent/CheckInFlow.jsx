import { useState } from 'react';
import {
    Camera,
    CheckCircle,
    QrCode,
    UserCheck,
    Clock,
    AlertCircle
} from 'lucide-react';
import { qrService } from '../../services/qr';
import { faceService } from '../../services/face';
import { checkinService } from '../../services/checkin';

const CheckInFlow = () => {
    const [ step, setStep ] = useState(1); // 1: QR, 2: Face, 3: Confirmation
    const [ loading, setLoading ] = useState(false);
    const [ qrData, setQrData ] = useState(null);
    const [ faceVerified, setFaceVerified ] = useState(false);
    const [ checkInResult, setCheckInResult ] = useState(null);
    const [ error, setError ] = useState('');

    const steps = [
        { id: 1, title: 'Scan QR Code', icon: <QrCode /> },
        { id: 2, title: 'Vérification Faciale', icon: <UserCheck /> },
        { id: 3, title: 'Confirmation', icon: <CheckCircle /> }
    ];

    // Étape 1: Scan QR Code
    const handleQRScan = async (scannedData) => {
        setLoading(true);
        setError('');

        try {
            const result = await qrService.validateQR(scannedData);

            if (result.valid) {
                setQrData(result);
                setStep(2);
            } else {
                setError(result.error || 'QR code invalide');
            }
        } catch (err) {
            setError('Erreur de validation: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Étape 2: Vérification faciale
    const handleFaceVerification = async () => {
        setLoading(true);
        setError('');

        try {
            // Simulation: prendre une photo
            const mockPhoto = `data:image/jpeg;base64,mock-photo-data-${ Date.now() }`;

            const result = await faceService.verifyFace(mockPhoto);

            if (result.match) {
                setFaceVerified(true);
                setStep(3);

                // Automatiquement passer à l'enregistrement
                await completeCheckIn(mockPhoto);
            } else {
                setError('Échec de la vérification faciale');
            }
        } catch (err) {
            setError('Erreur vérification: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Étape 3: Enregistrement final
    const completeCheckIn = async (photoData) => {
        try {
            const result = await checkinService.createCheckIn({
                qrToken: qrData?.data?.token,
                faceConfidence: 0.85, // Simulation
                location: qrData?.data?.location || 'Zone de ronde',
                photoUrl: photoData
            });

            setCheckInResult(result);
        } catch (err) {
            setError('Erreur enregistrement: ' + err.message);
        }
    };

    const resetFlow = () => {
        setStep(1);
        setQrData(null);
        setFaceVerified(false);
        setCheckInResult(null);
        setError('');
    };

    return (
        <div className="card card-securs">
            <div className="card-header">
                <h5 className="mb-0 d-flex align-items-center">
                    <Clock className="me-2" />
                    Pointage de ronde
                </h5>
            </div>

            <div className="card-body">
                {/* Indicateur d'étapes */ }
                <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center">
                        { steps.map((s, index) => (
                            <div key={ s.id } className="text-center" style={ { flex: 1 } }>
                                <div className={ `
                  rounded-circle d-inline-flex align-items-center justify-content-center mb-2
                  ${ step >= s.id ? 'bg-securs-blue text-white' : 'bg-light text-muted' }
                  ${ step === s.id ? 'border border-2 border-primary' : '' }
                `} style={ { width: '50px', height: '50px' } }>
                                    { s.icon }
                                </div>
                                <div className={ `small ${ step >= s.id ? 'fw-medium' : 'text-muted' }` }>
                                    { s.title }
                                </div>
                                { index < steps.length - 1 && (
                                    <div className={ `
                    mt-3 mx-auto
                    ${ step > s.id ? 'bg-securs-blue' : 'bg-light' }
                  `} style={ { width: '50%', height: '2px' } }></div>
                                ) }
                            </div>
                        )) }
                    </div>
                </div>

                {/* Contenu selon l'étape */ }
                <div className="text-center">
                    { step === 1 && (
                        <div>
                            <div className="mb-4">
                                <QrCode size={ 80 } className="text-primary mb-3" />
                                <h5>Étape 1: Scanner le QR Code</h5>
                                <p className="text-muted">
                                    Scannez le QR code affiché dans votre zone de ronde
                                </p>
                            </div>

                            {/* Simulation pour le moment */ }
                            <button
                                onClick={ () => handleQRScan('{"date":"2024-01-01","token":"test"}') }
                                className="btn btn-securs-blue btn-lg"
                                disabled={ loading }
                            >
                                { loading ? 'Validation...' : 'Simuler Scan QR Code' }
                            </button>
                        </div>
                    ) }

                    { step === 2 && (
                        <div>
                            <div className="mb-4">
                                <UserCheck size={ 80 } className="text-primary mb-3" />
                                <h5>Étape 2: Vérification Faciale</h5>
                                <p className="text-muted">
                                    Prenez une photo pour vérifier votre identité
                                </p>
                            </div>

                            <button
                                onClick={ handleFaceVerification }
                                className="btn btn-securs-blue btn-lg mb-3"
                                disabled={ loading }
                            >
                                <Camera className="me-2" />
                                { loading ? 'Vérification...' : 'Prendre une photo' }
                            </button>

                            <div className="alert alert-info">
                                <AlertCircle size={ 18 } className="me-2" />
                                Assurez-vous que votre visage est bien éclairé et visible
                            </div>
                        </div>
                    ) }

                    { step === 3 && (
                        <div>
                            { checkInResult ? (
                                <div className="py-4">
                                    <CheckCircle size={ 80 } className="text-success mb-3" />
                                    <h5 className="text-success">Pointage Réussi !</h5>
                                    <div className="card bg-light mt-4">
                                        <div className="card-body">
                                            <p><strong>Heure:</strong> { new Date().toLocaleTimeString('fr-FR') }</p>
                                            <p><strong>Lieu:</strong> { qrData?.data?.location }</p>
                                            <p><strong>Statut:</strong> <span className="badge bg-warning">En attente de validation</span></p>
                                        </div>
                                    </div>

                                    <button onClick={ resetFlow } className="btn btn-outline-primary mt-4">
                                        Nouveau pointage
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Enregistrement...</span>
                                    </div>
                                    <p className="mt-3">Enregistrement du pointage...</p>
                                </div>
                            ) }
                        </div>
                    ) }
                </div>

                {/* Messages d'erreur */ }
                { error && (
                    <div className="alert alert-danger mt-4">
                        <AlertCircle size={ 18 } className="me-2" />
                        { error }
                        <button
                            onClick={ () => setError('') }
                            className="btn-close float-end"
                        ></button>
                    </div>
                ) }

                {/* Informations importantes */ }
                <div className="mt-5 pt-4 border-top">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center">
                                <Clock size={ 18 } className="me-2 text-muted" />
                                <small className="text-muted">Plage: 00h00 - 05h30</small>
                            </div>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <small className="text-muted">
                                Maximum 2 pointages par jour
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckInFlow;