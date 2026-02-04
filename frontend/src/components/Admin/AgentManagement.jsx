import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getAgents, createAgent, updateAgent, deleteAgent } from '../../services/api';

const AgentManagement = () => {
    const [ agents, setAgents ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState('');
    const [ showModal, setShowModal ] = useState(false);
    const [ editingAgent, setEditingAgent ] = useState(null);
    const [ formData, setFormData ] = useState({
        employeeId: '',
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });
    const [ submitting, setSubmitting ] = useState(false);

    // Charger les agents
    const loadAgents = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAgents();
            if (response.data.success) {
                setAgents(response.data.data);
            } else {
                setError(response.data.error || 'Erreur lors du chargement des agents');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAgents();
    }, []);

    // Ouvrir modal pour ajouter
    const handleAdd = () => {
        setEditingAgent(null);
        setFormData({
            employeeId: '',
            fullName: '',
            email: '',
            phone: '',
            password: ''
        });
        setShowModal(true);
    };

    // Ouvrir modal pour éditer
    const handleEdit = (agent) => {
        setEditingAgent(agent);
        setFormData({
            employeeId: agent.employee_id,
            fullName: agent.full_name,
            email: agent.email || '',
            phone: agent.phone || '',
            password: '' // Ne pas pré-remplir le mot de passe
        });
        setShowModal(true);
    };

    // Fermer modal
    const handleClose = () => {
        setShowModal(false);
        setEditingAgent(null);
        setFormData({
            employeeId: '',
            fullName: '',
            email: '',
            phone: '',
            password: ''
        });
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        // Validation côté client
        if (!formData.employeeId.trim() || !formData.fullName.trim() || (!editingAgent && !formData.password.trim())) {
            setError('Veuillez remplir tous les champs requis');
            setSubmitting(false);
            return;
        }

        try {
            let response;
            if (editingAgent) {
                // Update
                const updateData = {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim() || null,
                    phone: formData.phone.trim() || null
                };
                response = await updateAgent(editingAgent.id, updateData);
            } else {
                // Create
                response = await createAgent({
                    employeeId: formData.employeeId.trim(),
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim() || null,
                    phone: formData.phone.trim() || null,
                    password: formData.password.trim()
                });
            }

            if (response.data.success) {
                await loadAgents(); // Recharger la liste
                handleClose();
            } else {
                setError(response.data.error || 'Erreur lors de la sauvegarde');
            }
        } catch (err) {
            console.error('Erreur soumission:', err);
            setError(err.response?.data?.error || 'Erreur de connexion au serveur');
        } finally {
            setSubmitting(false);
        }
    };

    // Supprimer un agent
    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
            return;
        }

        try {
            const response = await deleteAgent(id);
            if (response.data.success) {
                await loadAgents(); // Recharger la liste
            } else {
                setError(response.data.error || 'Erreur lors de la suppression');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        }
    };

    // Gérer les changements du formulaire
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [ e.target.name ]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">Chargement des agents...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 mb-0">Gestion des Agents</h2>
                <Button variant="primary" onClick={ handleAdd }>
                    <Plus className="me-2" />
                    Ajouter un agent
                </Button>
            </div>

            { error && <Alert variant="danger">{ error }</Alert> }

            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID Employé</th>
                            <th>Nom complet</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Rôle</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        { agents.map((agent) => (
                            <tr key={ agent.id }>
                                <td>{ agent.employee_id }</td>
                                <td>{ agent.full_name }</td>
                                <td>{ agent.email || '-' }</td>
                                <td>{ agent.phone || '-' }</td>
                                <td>{ agent.user_role }</td>
                                <td>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={ () => handleEdit(agent) }
                                    >
                                        <Edit />
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={ () => handleDelete(agent.id) }
                                    >
                                        <Trash2 />
                                    </Button>
                                </td>
                            </tr>
                        )) }
                        { agents.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4">
                                    Aucun agent trouvé
                                </td>
                            </tr>
                        ) }
                    </tbody>
                </Table>
            </div>

            {/* Modal pour ajouter/éditer */ }
            <Modal show={ showModal } onHide={ handleClose }>
                <Modal.Header closeButton>
                    <Modal.Title>
                        { editingAgent ? 'Modifier l\'agent' : 'Ajouter un agent' }
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={ handleSubmit }>
                    <Modal.Body>
                        { error && <Alert variant="danger">{ error }</Alert> }

                        <Form.Group className="mb-3">
                            <Form.Label>ID Employé *</Form.Label>
                            <Form.Control
                                type="text"
                                name="employeeId"
                                value={ formData.employeeId }
                                onChange={ handleChange }
                                required
                                disabled={ !!editingAgent } // Ne pas permettre la modification de l'ID
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nom complet *</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                value={ formData.fullName }
                                onChange={ handleChange }
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={ formData.email }
                                onChange={ handleChange }
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Téléphone</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={ formData.phone }
                                onChange={ handleChange }
                            />
                        </Form.Group>

                        { !editingAgent && (
                            <Form.Group className="mb-3">
                                <Form.Label>Mot de passe *</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={ formData.password }
                                    onChange={ handleChange }
                                    required
                                />
                            </Form.Group>
                        ) }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={ handleClose }>
                            Annuler
                        </Button>
                        <Button variant="primary" type="submit" disabled={ submitting }>
                            { submitting ? <Spinner animation="border" size="sm" /> : null }
                            { editingAgent ? 'Modifier' : 'Ajouter' }
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default AgentManagement;