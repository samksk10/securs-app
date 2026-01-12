import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma.js';

export const exportCheckInsExcel = async (req, res) => {
    try {
        const { startDate, endDate, agentId } = req.query;

        let whereCondition = {};

        if (startDate || endDate) {
            whereCondition.createdAt = {};
            if (startDate) {
                whereCondition.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereCondition.createdAt.lte = end;
            }
        }

        if (agentId) {
            whereCondition.userId = parseInt(agentId);
        }

        const checkIns = await prisma.checkIn.findMany({
            where: whereCondition,
            include: {
                user: {
                    select: {
                        employeeId: true,
                        fullName: true,
                        department: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Créer le workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pointages');

        // Définir les colonnes
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Heure', key: 'time', width: 15 },
            { header: 'Agent', key: 'agent', width: 25 },
            { header: 'Matricule', key: 'employeeId', width: 15 },
            { header: 'Département', key: 'department', width: 20 },
            { header: 'Type', key: 'type', width: 10 },
            { header: 'Statut', key: 'status', width: 12 },
            { header: 'Méthode', key: 'method', width: 15 },
            { header: 'Notes', key: 'notes', width: 30 }
        ];

        // Ajouter les données
        checkIns.forEach(checkIn => {
            worksheet.addRow({
                id: checkIn.id,
                date: new Date(checkIn.createdAt).toLocaleDateString('fr-FR'),
                time: new Date(checkIn.createdAt).toLocaleTimeString('fr-FR'),
                agent: checkIn.user.fullName,
                employeeId: checkIn.user.employeeId,
                department: checkIn.user.department,
                type: checkIn.type === 'in' ? 'Entrée' : 'Sortie',
                status: checkIn.status === 'success' ? 'Succès' : 'Échec',
                method: checkIn.method === 'qr' ? 'QR Code' : 'Manuel',
                notes: checkIn.notes || ''
            });
        });

        // Style de l'en-tête
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF007BFF' }
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Envoyer le fichier
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=pointages-${ new Date().toISOString().split('T')[ 0 ] }.xlsx`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Erreur export Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'export Excel'
        });
    }
};