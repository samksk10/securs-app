import { useState, useEffect } from 'react';
import { qrService } from '../../services/qr';
import { QrCode, Download, Clock, RefreshCw, CheckCircle, Printer } from 'lucide-react';

const QRGenerator = () => {
    const [ loading, setLoading ] = useState(false);
    const [ generating, setGenerating ] = useState(false);
    const [ todayQR, setTodayQR ] = useState(null);
    const [ message, setMessage ] = useState('');
    const [ error, setError ] = useState('');

    // Charger le QR code du jour au démarrage
    useEffect(() => {
        loadTodayQR();
    }, []);

    const loadTodayQR = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await qrService.getTodayQR();
            if (result.success) {
                setTodayQR(result.data);
            } else {
                setTodayQR(null);
                if (result.error) setError(result.error);
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
            setTodayQR(null);
        } finally {
            setLoading(false);
        }
    };

    const generateQR = async () => {
        if (!window.confirm('Générer un nouveau QR code pour aujourd\'hui ? L\'ancien sera remplacé.')) {
            return;
        }

        setGenerating(true);
        setError('');
        setMessage('');

        try {
            const result = await qrService.generateDailyQR();
            if (result.success) {
                setTodayQR(result.data);
                setMessage('QR code généré avec succès !');

                // Message temporaire
                setTimeout(() => setMessage(''), 3000);
            } else {
                setError(result.error || 'Erreur lors de la génération');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setGenerating(false);
        }
    };

    const disableQR = async () => {
        if (!window.confirm('Désactiver le QR code pour aujourd\'hui ? Les agents ne pourront plus pointer.')) {
            return;
        }

        try {
            const result = await qrService.disableQR();
            if (result.success) {
                setTodayQR(null);
                setMessage('QR code désactivé');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setError('Erreur lors de la désactivation');
        }
    };

    const downloadQR = () => {
        if (!todayQR?.qrCode) return;

        const link = document.createElement('a');
        link.href = todayQR.qrCode;
        link.download = `securis-qr-${ todayQR.date }.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printQR = () => {
        if (!todayQR?.qrCode) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>Sécuris - QR Code ${ todayQR.date }</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            h1 { color: #1e3a8a; }
            .info { margin: 20px 0; }
            .instructions { text-align: left; max-width: 400px; margin: 20px auto; }
          </style>
        </head>
        <body>
          <h1>Sécuris - QR Code du jour</h1>
          <div class="info">
            <p><strong>Date:</strong> ${ todayQR.date }</p>
            <p><strong>Valide de:</strong> ${ todayQR.validFrom } à ${ todayQR.validTo }</p>
            <p><strong>Leon Hôtel Kinshasa</strong></p>
          </div>
          <img src="${ todayQR.qrCode }" style="width: 300px; height: 300px;" />
          <div class="instructions">
            <h3>Instructions:</h3>
            <ol>
              <li>Afficher ce QR code dans les zones de ronde</li>
              <li>Les agents scanneront ce code pour pointer</li>
              <li>Ce code est valide uniquement le ${ todayQR.date } de ${ todayQR.validFrom } à ${ todayQR.validTo }</li>
            </ol>
          </div>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="card card-securs">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    <QrCode className="me-2" />
                    Gestion des QR Codes
                </h5>
                <button
                    onClick={ loadTodayQR }
                    className="btn btn-outline-primary btn-sm"
                    disabled={ loading }
                >
                    <RefreshCw size={ 16 } className={ loading ? 'spin' : '' } />
                </button>
            </div>

            <div className="card-body">
                {/* Messages */ }
                { message && (
                    <div className="alert alert-success alert-dismissible fade show">
                        { message }
                        <button type="button" className="btn-close" onClick={ () => setMessage('') }></button>
                    </div>
                ) }

                { error && (
                    <div className="alert alert-danger alert-dismissible fade show">
                        { error }
                        <button type="button" className="btn-close" onClick={ () => setError('') }></button>
                    </div>
                ) }

                {/* QR Code existant */ }
                { loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                ) : todayQR ? (
                    <div className="text-center">
                        <div className="mb-4">
                            <img
                                src={ todayQR.qrCode }
                                alt="QR Code du jour"
                                className="img-fluid rounded border"
                                style={ { maxWidth: '250px' } }
                            />
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-6 mb-3">
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <h6 className="card-title">
                                            <CheckCircle size={ 18 } className="me-2 text-success" />
                                            QR Code Actif
                                        </h6>
                                        <p className="mb-1"><strong>Date:</strong> { todayQR.date }</p>
                                        <p className="mb-1"><strong>Token:</strong> <code>{ todayQR.token.substring(0, 15) }...</code></p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6 mb-3">
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <h6 className="card-title">
                                            <Clock size={ 18 } className="me-2 text-primary" />
                                            Plage horaire
                                        </h6>
                                        <p className="mb-1"><strong>Valide de:</strong> { todayQR.validFrom }</p>
                                        <p className="mb-0"><strong>Valide jusqu'à:</strong> { todayQR.validTo }</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            <button onClick={ downloadQR } className="btn btn-primary">
                                <Download size={ 18 } className="me-2" />
                                Télécharger
                            </button>

                            <button onClick={ printQR } className="btn btn-outline-primary">
                                <Printer size={ 18 } className="me-2" />
                                Imprimer
                            </button>

                            <button onClick={ disableQR } className="btn btn-outline-danger">
                                Désactiver
                            </button>
                        </div>

                        <div className="mt-4 alert alert-info">
                            <small>
                                <strong>Instructions:</strong> Imprimez ce QR code et affichez-le dans la zone de ronde.
                                Les agents le scanneront avec leur téléphone entre { todayQR.validFrom } et { todayQR.validTo }.
                            </small>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <div className="mb-4">
                            <QrCode size={ 80 } className="text-muted" />
                        </div>
                        <h5 className="text-muted mb-3">Aucun QR code pour aujourd'hui</h5>
                        <p className="text-muted mb-4">
                            Générez un QR code pour permettre aux agents de pointer aujourd'hui.
                        </p>
                        <button
                            onClick={ generateQR }
                            className="btn btn-securs-blue btn-lg"
                            disabled={ generating }
                        >
                            { generating ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Génération...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={ 20 } className="me-2" />
                                    Générer QR Code du jour
                                </>
                            ) }
                        </button>
                    </div>
                ) }
            </div>

            <div className="card-footer text-muted small">
                <div className="row">
                    <div className="col-md-6">
                        <i className="bi bi-info-circle me-1"></i>
                        Un QR code par jour maximum
                    </div>
                    <div className="col-md-6 text-md-end">
                        <i className="bi bi-clock me-1"></i>
                        Plage horaire fixe: 00h00 - 05h30
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRGenerator;