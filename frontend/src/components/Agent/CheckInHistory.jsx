import { useEffect, useState } from "react";
import axios from "../../services/api";
import { Button } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";

const CheckInHistory = () => {
	const { user } = useAuth();
	const [ rows, setRows ] = useState([]);
	const [ loading, setLoading ] = useState(false);
	const [ error, setError ] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await axios.get("/api/checkin/history");
				setRows(response.data.data || []);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const formatRow = (row) => {
		return {
			"Date": new Date(row.check_in_time).toLocaleString(),
			"Statut": row.status === 'validated' ? "Validé" : row.status === 'pending' ? "En attente" : "Rejeté",
			"Confiance faciale": row.face_match_confidence ? `${ (row.face_match_confidence * 100).toFixed(1) }%` : "N/A",
			"Localisation": row.location || "N/A",
		};
	};

	const exportExcel = async () => {
		if (!rows || rows.length === 0) return;
		const sheetData = rows.map(formatRow);
		try {
			// dynamic import so Vite doesn't fail when 'xlsx' is not installed
			const XLSX = await import('xlsx');
			const ws = XLSX.utils.json_to_sheet(sheetData);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Historique');
			const filename = `checkins_${ new Date().toISOString().slice(0, 10) }.xlsx`;
			XLSX.writeFile(wb, filename);
		} catch (err) {
			// fallback to CSV download if xlsx is unavailable
			console.warn('xlsx not available, falling back to CSV export', err);
			const csv = [
				Object.keys(sheetData[ 0 ]).join(','),
				...sheetData.map(r => Object.values(r).map(v => `"${ String(v).replace(/"/g, '""') }"`).join(','))
			].join('\n');
			const blob = new Blob([ csv ], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `checkins_${ new Date().toISOString().slice(0, 10) }.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			alert('Export XLSX non disponible (package "xlsx" manquant). Un CSV a été généré. Pour XLSX, installez : npm install xlsx');
		}
	};

	return (
		<div className="card card-securs p-3">
			<h2 className="h5 fw-bold mb-3">Historique des pointages</h2>

			<div className="mb-3">
				<Button variant="primary" onClick={ exportExcel }>
					Exporter en XLSX/CSV
				</Button>
			</div>

			{ error && <div className="alert alert-danger">{ error.message }</div> }

			<table className="table table-hover table-striped">
				<thead>
					<tr>
						<th>Date</th>
						<th>Statut</th>
						<th>Confiance faciale</th>
						<th>Localisation</th>
					</tr>
				</thead>
				<tbody>
					{ loading ? (
						<tr>
							<td colSpan="4" className="text-center">
								Chargement...
							</td>
						</tr>
					) : rows.length === 0 ? (
						<tr>
							<td colSpan="4" className="text-center text-muted">
								Aucun pointage trouvé
							</td>
						</tr>
					) : (
						rows.map((row) => (
							<tr key={ row.id }>
								<td>{ new Date(row.check_in_time).toLocaleString() }</td>
								<td>
									<span className={ `badge ${ row.status === 'validated' ? 'bg-success' :
										row.status === 'pending' ? 'bg-warning' : 'bg-danger'
										}` }>
										{ row.status === 'validated' ? 'Validé' :
											row.status === 'pending' ? 'En attente' : 'Rejeté' }
									</span>
								</td>
								<td>{ row.face_match_confidence ? `${ (row.face_match_confidence * 100).toFixed(1) }%` : 'N/A' }</td>
								<td>{ row.location || '-' }</td>
							</tr>
						))
					) }
				</tbody>
			</table>
		</div>
	);
};

export default CheckInHistory;