import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Card, Spinner, Pagination } from 'react-bootstrap';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { downloadExcel } from '../../services/excelExport';
import { getDetailedHistory } from '../../services/api';

const DetailedHistory = () => {
    const [ checkIns, setCheckIns ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ filters, setFilters ] = useState({
        startDate: '',
        endDate: '',
        agentId: '',
        limit: 50
    });
    const [ pagination, setPagination ] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });
    const [ agents, setAgents ] = useState([]);

    // Charger la liste des agents (pour le filtre admin)
    useEffect(() => {
        const loadAgents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users/agents', {
                    headers: {
                        'Authorization': `Bearer ${ localStorage.getItem('token') }`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setAgents(data.data);
                }
            } catch (error) {
                console.error('Erreur chargement agents:', error);
            }
        };
        loadAgents();
    }, []);

    // Charger l'historique
    const loadHistory = async (page = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...filters,
                page: page
            }).toString();

            const response = await getDetailedHistory(queryParams);
            if (response.success) {
                setCheckIns(response.data);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [ name ]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadHistory(1);
    };

    const handleReset = () => {
        setFilters({
            startDate: '',
            endDate: '',
            agentId: '',
            limit: 50
        });
        setTimeout(() => loadHistory(1), 100);
    };

    const handleExport = () => {
        const dataForExport = checkIns.map(checkIn => ({
            'ID Agent': checkIn.user.employeeId,
            'Nom Complet': checkIn.user.fullName,
            'Département': checkIn.user.department,
            'Type': checkIn.type === 'in' ? 'Pointage Entrée' : 'Pointage Sortie',
            'Date': format(new Date(checkIn.createdAt), 'dd/MM/yyyy', { locale: fr }),
            'Heure': format(new Date(checkIn.createdAt), 'HH:mm:ss', { locale: fr }),
            'Statut': checkIn.status === 'success' ? 'Succès' : 'Échec',
            'Méthode': checkIn.method === 'qr' ? 'QR Code' : 'Manuel',
            'Notes': checkIn.notes || ''
        }));

        downloadExcel(dataForExport, `historique-pointage-${ format(new Date(), 'yyyy-MM-dd') }`);
    };

    if (loading && checkIns.length === 0) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Chargement de l'historique...</p>
            </div>
        );
    }

    return (
        <Card>
            <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Historique Détaillé des Pointages</h5>
            </Card.Header>
            <Card.Body>
                {/* Filtres */ }
                <Form onSubmit={ handleSearch } className="mb-4">
                    <Row className="g-3">
                        <Col md={ 3 }>
                            <Form.Group>
                                <Form.Label>Date Début</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={ filters.startDate }
                                    onChange={ handleFilterChange }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={ 3 }>
                            <Form.Group>
                                <Form.Label>Date Fin</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="endDate"
                                    value={ filters.endDate }
                                    onChange={ handleFilterChange }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={ 3 }>
                            <Form.Group>
                                <Form.Label>Agent</Form.Label>
                                <Form.Select
                                    name="agentId"
                                    value={ filters.agentId }
                                    onChange={ handleFilterChange }
                                >
                                    <option value="">Tous les agents</option>
                                    { agents.map(agent => (
                                        <option key={ agent.id } value={ agent.id }>
                                            { agent.fullName } ({ agent.employeeId })
                                        </option>
                                    )) }
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={ 3 }>
                            <Form.Group>
                                <Form.Label>Nombre par page</Form.Label>
                                <Form.Select
                                    name="limit"
                                    value={ filters.limit }
                                    onChange={ handleFilterChange }
                                >
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="200">200</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={ 12 } className="d-flex gap-2">
                            <Button variant="primary" type="submit">
                                <i className="bi bi-search"></i> Rechercher
                            </Button>
                            <Button variant="secondary" onClick={ handleReset }>
                                <i className="bi bi-arrow-clockwise"></i> Réinitialiser
                            </Button>
                            <Button variant="success" onClick={ handleExport }>
                                <i className="bi bi-file-excel"></i> Exporter Excel
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {/* Tableau */ }
                <div className="table-responsive">
                    <Table striped bordered hover>
                        <thead className="table-dark">
                            <tr>
                                <th>Date/Heure</th>
                                <th>Agent</th>
                                <th>Matricule</th>
                                <th>Type</th>
                                <th>Statut</th>
                                <th>Méthode</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            { checkIns.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        <i className="bi bi-inbox" style={ { fontSize: '2rem' } }></i>
                                        <p className="mt-2">Aucun pointage trouvé</p>
                                    </td>
                                </tr>
                            ) : (
                                checkIns.map(checkIn => (
                                    <tr key={ checkIn.id }>
                                        <td>
                                            <div>{ format(new Date(checkIn.createdAt), 'dd/MM/yyyy', { locale: fr }) }</div>
                                            <small className="text-muted">
                                                { format(new Date(checkIn.createdAt), 'HH:mm:ss', { locale: fr }) }
                                            </small>
                                        </td>
                                        <td>{ checkIn.user.fullName }</td>
                                        <td>
                                            <span className="badge bg-secondary">
                                                { checkIn.user.employeeId }
                                            </span>
                                        </td>
                                        <td>
                                            <span className={ `badge ${ checkIn.type === 'in' ? 'bg-success' : 'bg-warning' }` }>
                                                { checkIn.type === 'in' ? 'Entrée' : 'Sortie' }
                                            </span>
                                        </td>
                                        <td>
                                            <span className={ `badge ${ checkIn.status === 'success' ? 'bg-success' : 'bg-danger' }` }>
                                                { checkIn.status === 'success' ? 'Succès' : 'Échec' }
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-info">
                                                { checkIn.method === 'qr' ? 'QR Code' : 'Manuel' }
                                            </span>
                                        </td>
                                        <td>
                                            <small className="text-truncate" style={ { maxWidth: '150px' } }>
                                                { checkIn.notes || '-' }
                                            </small>
                                        </td>
                                    </tr>
                                ))
                            ) }
                        </tbody>
                    </Table>
                </div>

                {/* Pagination */ }
                { pagination.totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            Affichage de { (pagination.page - 1) * pagination.limit + 1 } à { Math.min(pagination.page * pagination.limit, pagination.total) } sur { pagination.total } pointages
                        </div>
                        <Pagination>
                            <Pagination.Prev
                                onClick={ () => pagination.page > 1 && loadHistory(pagination.page - 1) }
                                disabled={ pagination.page === 1 }
                            />
                            { [ ...Array(pagination.totalPages) ].map((_, i) => (
                                <Pagination.Item
                                    key={ i + 1 }
                                    active={ i + 1 === pagination.page }
                                    onClick={ () => loadHistory(i + 1) }
                                >
                                    { i + 1 }
                                </Pagination.Item>
                            )) }
                            <Pagination.Next
                                onClick={ () => pagination.page < pagination.totalPages && loadHistory(pagination.page + 1) }
                                disabled={ pagination.page === pagination.totalPages }
                            />
                        </Pagination>
                    </div>
                ) }
            </Card.Body>
        </Card>
    );
};

export default DetailedHistory;