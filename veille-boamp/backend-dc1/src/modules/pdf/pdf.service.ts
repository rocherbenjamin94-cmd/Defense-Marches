import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { DC1FormData, DC2FormData, MembreGroupement } from '../../types';

@Injectable()
export class PdfService {
  async generatePDF(formData: DC1FormData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        this.buildDC1Document(doc, formData);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateDC2PDF(formData: DC2FormData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        this.buildDC2Document(doc, formData);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private buildDC1Document(doc: PDFKit.PDFDocument, data: DC1FormData): void {
    const primaryColor = '#0052CC';
    const grayColor = '#555555';

    // Header
    doc.fontSize(18).fillColor(primaryColor).text('DC1 - LETTRE DE CANDIDATURE', { align: 'center' });
    doc.fontSize(10).fillColor(grayColor).text('Marchés publics / Accords-cadres', { align: 'center' });
    doc.fontSize(8).text('Formulaire conforme au modèle DC1-2019', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(primaryColor).lineWidth(2).stroke();
    doc.moveDown();

    // Section A - Acheteur
    this.drawSectionHeader(doc, 'A - IDENTIFICATION DE L\'ACHETEUR', primaryColor);
    this.drawField(doc, 'Nom de l\'acheteur', data.acheteur.nom);
    if (data.acheteur.reference_avis) {
      this.drawField(doc, 'Référence de l\'avis', data.acheteur.reference_avis);
    }
    if (data.acheteur.reference_dossier) {
      this.drawField(doc, 'Référence du dossier', data.acheteur.reference_dossier);
    }

    // Section B - Consultation
    this.drawSectionHeader(doc, 'B - OBJET DE LA CONSULTATION', primaryColor);
    this.drawField(doc, 'Objet du marché', data.consultation.objet);

    // Section C - Candidature
    this.drawSectionHeader(doc, 'C - OBJET DE LA CANDIDATURE', primaryColor);
    let candidatureText = '';
    if (data.candidature.type === 'marche_unique') {
      candidatureText = 'Marché ou accord-cadre unique';
    } else if (data.candidature.type === 'tous_lots') {
      candidatureText = "L'ensemble des lots de la consultation";
    } else if (data.candidature.type === 'lots_specifiques') {
      candidatureText = `Les lots suivants : ${data.candidature.lots || ''}`;
    }
    this.drawField(doc, 'Objet de la candidature', candidatureText);

    // Section D - Candidat
    this.drawSectionHeader(doc, 'D - PRÉSENTATION DU CANDIDAT', primaryColor);
    if (data.candidat.mode === 'seul') {
      this.drawField(doc, 'Présentation', 'Le candidat se présente seul');
    } else if (data.candidat.mode === 'groupement' && data.groupement) {
      const groupementType = data.groupement.type === 'conjoint' ? 'conjoint' : 'solidaire';
      this.drawField(doc, 'Présentation', `Le candidat est membre d'un groupement ${groupementType}`);
    }

    doc.moveDown(0.5);
    doc.fontSize(11).fillColor(grayColor).text('Identification du candidat', { underline: true });
    doc.moveDown(0.3);

    this.drawField(doc, 'SIRET', data.candidat.siret);
    this.drawField(doc, 'Nom commercial', data.candidat.nom_commercial);
    this.drawField(doc, 'Dénomination sociale', data.candidat.denomination_sociale);
    this.drawField(doc, 'Adresse établissement', data.candidat.adresse_etablissement);
    this.drawField(doc, 'Email', data.candidat.email);
    this.drawField(doc, 'Téléphone', data.candidat.telephone);

    // Section E - Groupement (if applicable)
    if (data.candidat.mode === 'groupement' && data.groupement && data.groupement.membres.length > 0) {
      this.drawSectionHeader(doc, 'E - MEMBRES DU GROUPEMENT', primaryColor);

      data.groupement.membres.forEach((membre: MembreGroupement, index: number) => {
        doc.fontSize(10).fillColor('#333').text(`Membre ${index + 1} :`, { underline: true });
        this.drawField(doc, 'SIRET', membre.siret);
        this.drawField(doc, 'Nom commercial', membre.nom_commercial);
        this.drawField(doc, 'Dénomination', membre.denomination_sociale);
        this.drawField(doc, 'Adresse', membre.adresse);
        this.drawField(doc, 'Email', membre.email);
        this.drawField(doc, 'Téléphone', membre.telephone);
        if (data.groupement?.type === 'conjoint' && membre.prestations) {
          this.drawField(doc, 'Prestations', membre.prestations);
        }
        doc.moveDown(0.5);
      });
    }

    // Section F - Engagements
    this.drawSectionHeader(doc, 'F - ENGAGEMENTS DU CANDIDAT', primaryColor);
    this.drawCheckbox(doc, 'Le candidat atteste sur l\'honneur ne pas faire l\'objet d\'une interdiction de soumissionner', data.engagements.attestation_exclusion);
    doc.fontSize(8).fillColor(grayColor).text('   (articles L.2141-1 à L.2141-5 et L.2141-7 à L.2141-10 du code de la commande publique)');
    doc.moveDown(0.5);

    const capacitesText = data.engagements.type_capacites === 'dc2' ? 'Via le formulaire DC2' : 'Via documents propres';
    this.drawField(doc, 'Justification des capacités', capacitesText);

    if (data.engagements.url_documents) {
      this.drawField(doc, 'URL des documents', data.engagements.url_documents);
    }

    // Signature box
    doc.moveDown();
    doc.rect(50, doc.y, 495, 100).stroke();
    const boxY = doc.y + 10;
    doc.fontSize(10).fillColor('#333').text('Signature du candidat ou du mandataire', 60, boxY);
    doc.fontSize(9).text('Fait à __________________________, le __________________________', 60, boxY + 20);
    doc.text('Nom et qualité du signataire : __________________________', 60, boxY + 40);
    doc.text('Signature :', 60, boxY + 70);
    doc.moveTo(120, boxY + 85).lineTo(250, boxY + 85).stroke();

    // Footer
    doc.fontSize(8).fillColor(grayColor).text('Document généré automatiquement - TenderSpotter', 50, 780, { align: 'center' });
    doc.text('Conforme au modèle DC1-2019 du Ministère de l\'Économie', { align: 'center' });
  }

  private buildDC2Document(doc: PDFKit.PDFDocument, data: DC2FormData): void {
    const primaryColor = '#0052CC';
    const grayColor = '#555555';

    // Header
    doc.fontSize(18).fillColor(primaryColor).text('DC2 - DÉCLARATION DU CANDIDAT', { align: 'center' });
    doc.fontSize(10).fillColor(grayColor).text('Déclaration du candidat individuel ou du membre du groupement', { align: 'center' });
    doc.fontSize(8).text('Formulaire conforme au modèle DC2-2019', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(primaryColor).lineWidth(2).stroke();
    doc.moveDown();

    // Section A - Identification
    this.drawSectionHeader(doc, 'A - IDENTIFICATION DU CANDIDAT', primaryColor);
    this.drawField(doc, 'SIRET', data.identification.siret);
    this.drawField(doc, 'Dénomination sociale', data.identification.denomination_sociale);
    this.drawField(doc, 'Nom commercial', data.identification.nom_commercial);
    this.drawField(doc, 'Adresse établissement', data.identification.adresse_etablissement);
    this.drawField(doc, 'Email', data.identification.email);
    this.drawField(doc, 'Téléphone', data.identification.telephone);

    // Section B - Situation juridique
    this.drawSectionHeader(doc, 'B - RENSEIGNEMENTS RELATIFS À LA SITUATION JURIDIQUE', primaryColor);
    this.drawField(doc, 'Forme juridique', data.situation_juridique.forme_juridique);
    this.drawField(doc, 'Date de création', data.situation_juridique.date_creation);
    this.drawField(doc, 'Capital social', `${data.situation_juridique.capital_social} ${data.situation_juridique.devise_capital || 'EUR'}`);
    this.drawField(doc, 'N° RCS', `${data.situation_juridique.numero_rcs}${data.situation_juridique.ville_rcs ? ` (${data.situation_juridique.ville_rcs})` : ''}`);
    this.drawField(doc, 'Code NAF', `${data.situation_juridique.code_naf} - ${data.situation_juridique.libelle_naf}`);
    if (data.situation_juridique.numero_rm) {
      this.drawField(doc, 'N° RM', data.situation_juridique.numero_rm);
    }

    // Section C - Capacités économiques
    this.drawSectionHeader(doc, 'C - CAPACITÉS ÉCONOMIQUES ET FINANCIÈRES', primaryColor);

    doc.fontSize(10).fillColor('#333').text('Chiffre d\'affaires global HT :');
    if (data.capacites_economiques.chiffre_affaires_global.length > 0) {
      data.capacites_economiques.chiffre_affaires_global.forEach(ca => {
        if (ca.montant) {
          this.drawField(doc, `Année ${ca.annee}`, ca.montant);
        }
      });
    }

    if (data.capacites_economiques.chiffre_affaires_domaine.some(ca => ca.montant)) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#333').text('Chiffre d\'affaires dans le domaine d\'activité :');
      data.capacites_economiques.chiffre_affaires_domaine.forEach(ca => {
        if (ca.montant) {
          this.drawField(doc, `Année ${ca.annee}`, ca.montant);
        }
      });
    }

    if (data.capacites_economiques.assurance_rc_pro) {
      this.drawField(doc, 'RC Professionnelle', data.capacites_economiques.assurance_rc_pro);
    }
    if (data.capacites_economiques.assurance_decennale) {
      this.drawField(doc, 'Décennale', data.capacites_economiques.assurance_decennale);
    }

    // Section D - Capacités techniques
    this.drawSectionHeader(doc, 'D - CAPACITÉS TECHNIQUES ET PROFESSIONNELLES', primaryColor);

    doc.fontSize(10).fillColor('#333').text('Effectifs moyens annuels :');
    data.capacites_techniques.effectifs.forEach(eff => {
      if (eff.nombre) {
        this.drawField(doc, `Année ${eff.annee}`, eff.nombre);
      }
    });

    if (data.capacites_techniques.effectif_encadrement) {
      this.drawField(doc, 'Dont encadrement', data.capacites_techniques.effectif_encadrement);
    }

    if (data.capacites_techniques.references.length > 0) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#333').text('Références / Marchés similaires :', { underline: true });
      data.capacites_techniques.references.forEach((ref, index) => {
        doc.fontSize(9).text(`${index + 1}. ${ref.client} - ${ref.objet} (${ref.annee}) - ${ref.montant}`);
      });
    }

    if (data.capacites_techniques.certifications.length > 0) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#333').text('Certifications :', { underline: true });
      data.capacites_techniques.certifications.forEach(cert => {
        doc.fontSize(9).text(`• ${cert.nom} (${cert.organisme}) - Validité: ${cert.date_validite}`);
      });
    }

    // Section E - Moyens techniques
    if (data.moyens_techniques.equipements || data.moyens_techniques.outillage || data.moyens_techniques.locaux) {
      this.drawSectionHeader(doc, 'E - MOYENS TECHNIQUES', primaryColor);
      if (data.moyens_techniques.equipements) {
        this.drawField(doc, 'Équipements techniques', data.moyens_techniques.equipements);
      }
      if (data.moyens_techniques.outillage) {
        this.drawField(doc, 'Outillage et matériel', data.moyens_techniques.outillage);
      }
      if (data.moyens_techniques.locaux) {
        this.drawField(doc, 'Locaux', data.moyens_techniques.locaux);
      }
    }

    // Signature box
    doc.moveDown();
    const sigY = Math.min(doc.y, 680);
    doc.rect(50, sigY, 495, 80).stroke();
    doc.fontSize(10).fillColor('#333').text('Signature du candidat', 60, sigY + 10);
    doc.fontSize(9).text('Fait à __________________________, le __________________________', 60, sigY + 25);
    doc.text('Nom et qualité du signataire : __________________________', 60, sigY + 40);
    doc.moveTo(120, sigY + 65).lineTo(250, sigY + 65).stroke();

    // Footer
    doc.fontSize(8).fillColor(grayColor).text('Document généré automatiquement - TenderSpotter', 50, 780, { align: 'center' });
    doc.text('Conforme au modèle DC2-2019 du Ministère de l\'Économie', { align: 'center' });
  }

  private drawSectionHeader(doc: PDFKit.PDFDocument, title: string, color: string): void {
    doc.moveDown(0.5);
    doc.rect(50, doc.y, 495, 20).fill('#f5f5f5');
    doc.rect(50, doc.y, 4, 20).fill(color);
    doc.fontSize(11).fillColor('#333').text(title, 60, doc.y + 5);
    doc.moveDown(1.2);
  }

  private drawField(doc: PDFKit.PDFDocument, label: string, value: string | undefined): void {
    if (!value) return;
    doc.fontSize(9).fillColor('#555').text(`${label} :`, { continued: true });
    doc.fillColor('#333').text(` ${value}`);
  }

  private drawCheckbox(doc: PDFKit.PDFDocument, label: string, checked: boolean, inline = false): void {
    const checkMark = checked ? '[X]' : '[ ]';
    if (inline) {
      doc.fontSize(9).fillColor('#333').text(`${checkMark} ${label}`, { continued: true });
    } else {
      doc.fontSize(9).fillColor('#333').text(`${checkMark} ${label}`);
    }
  }

  renderTemplate(formData: DC1FormData): string {
    // Keep HTML template for preview
    const { generateDC1Html } = require('./templates/dc1.template');
    return generateDC1Html(formData);
  }

  renderDC2Template(formData: DC2FormData): string {
    // Keep HTML template for preview
    const { generateDC2Html } = require('./templates/dc2.template');
    return generateDC2Html(formData);
  }
}
