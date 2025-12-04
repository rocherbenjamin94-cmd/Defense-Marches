import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  TableLayoutType,
  convertInchesToTwip,
  ShadingType,
} from 'docx';
import { DC2FormData, ChiffreAffaires, Effectif, Reference, Certification } from '../../../types';

const BLUE_COLOR = '0052CC';
const GRAY_BACKGROUND = 'F5F5F5';

export function generateDC2Word(data: DC2FormData): Document {
  const children: (Paragraph | Table)[] = [];

  // Header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'DC2 - DÉCLARATION DU CANDIDAT',
          bold: true,
          size: 32,
          color: BLUE_COLOR,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Déclaration du candidat individuel ou du membre du groupement',
          size: 24,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Formulaire conforme au modèle DC2-2019',
          size: 20,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: BLUE_COLOR },
      },
    }),
  );

  // Section A - Identification
  children.push(createSectionHeader('A - IDENTIFICATION DU CANDIDAT'));
  children.push(createField('SIRET', data.identification.siret));
  children.push(createField('SIREN', data.identification.siren));
  children.push(createField('Dénomination sociale', data.identification.denomination_sociale));
  children.push(createField('Nom commercial', data.identification.nom_commercial));
  children.push(createField('Adresse établissement', data.identification.adresse_etablissement));
  children.push(createField('Adresse siège', data.identification.adresse_siege));
  children.push(createField('Email', data.identification.email));
  children.push(createField('Téléphone', data.identification.telephone));
  if (data.identification.fax) {
    children.push(createField('Fax', data.identification.fax));
  }

  // Section B - Situation juridique
  children.push(createSectionHeader('B - RENSEIGNEMENTS RELATIFS À LA SITUATION JURIDIQUE'));
  children.push(createField('Forme juridique', data.situation_juridique.forme_juridique));
  if (data.situation_juridique.date_creation) {
    children.push(createField('Date de création', data.situation_juridique.date_creation));
  }
  if (data.situation_juridique.capital_social) {
    children.push(createField('Capital social', `${data.situation_juridique.capital_social} ${data.situation_juridique.devise_capital || 'EUR'}`));
  }
  if (data.situation_juridique.numero_rcs) {
    children.push(createField('N° RCS', `${data.situation_juridique.numero_rcs}${data.situation_juridique.ville_rcs ? ` (${data.situation_juridique.ville_rcs})` : ''}`));
  }
  if (data.situation_juridique.numero_rm) {
    children.push(createField('N° RM', data.situation_juridique.numero_rm));
  }
  children.push(createField('Code NAF', `${data.situation_juridique.code_naf}${data.situation_juridique.libelle_naf ? ` - ${data.situation_juridique.libelle_naf}` : ''}`));

  // Section C - Capacités économiques
  children.push(createSectionHeader('C - CAPACITÉS ÉCONOMIQUES ET FINANCIÈRES'));
  children.push(createSubHeader('Chiffre d\'affaires global HT'));
  children.push(createCATable(data.capacites_economiques.chiffre_affaires_global));

  if (data.capacites_economiques.chiffre_affaires_domaine.some(ca => ca.montant)) {
    children.push(createSubHeader('Chiffre d\'affaires dans le domaine concerné HT'));
    children.push(createCATable(data.capacites_economiques.chiffre_affaires_domaine));
  }

  if (data.capacites_economiques.assurance_rc_pro) {
    children.push(createSubHeader('Assurances professionnelles'));
    children.push(createField('RC Professionnelle', data.capacites_economiques.assurance_rc_pro));
    if (data.capacites_economiques.assurance_decennale) {
      children.push(createField('Décennale', data.capacites_economiques.assurance_decennale));
    }
  }

  // Section D - Capacités techniques
  children.push(createSectionHeader('D - CAPACITÉS TECHNIQUES ET PROFESSIONNELLES'));
  children.push(createSubHeader('Effectifs moyens annuels'));
  children.push(createEffectifsTable(data.capacites_techniques.effectifs));
  if (data.capacites_techniques.effectif_encadrement) {
    children.push(createField('Dont encadrement', data.capacites_techniques.effectif_encadrement));
  }

  if (data.capacites_techniques.references.length > 0) {
    children.push(createSubHeader('Références / Marchés similaires'));
    children.push(createReferencesTable(data.capacites_techniques.references));
  }

  if (data.capacites_techniques.certifications.length > 0) {
    children.push(createSubHeader('Certifications et qualifications'));
    children.push(createCertificationsTable(data.capacites_techniques.certifications));
  }

  // Section E - Moyens techniques
  if (data.moyens_techniques.equipements || data.moyens_techniques.outillage || data.moyens_techniques.locaux) {
    children.push(createSectionHeader('E - MOYENS TECHNIQUES'));
    if (data.moyens_techniques.equipements) {
      children.push(createField('Équipements techniques', data.moyens_techniques.equipements));
    }
    if (data.moyens_techniques.outillage) {
      children.push(createField('Outillage et matériel', data.moyens_techniques.outillage));
    }
    if (data.moyens_techniques.locaux) {
      children.push(createField('Locaux', data.moyens_techniques.locaux));
    }
  }

  // Signature
  children.push(
    new Paragraph({ spacing: { before: 400 } }),
    createSubHeader('Signature du candidat'),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Fait à __________________________, le __________________________',
          size: 22,
        }),
      ],
      spacing: { before: 200, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Nom et qualité du signataire : __________________________',
          size: 22,
        }),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '________________________________________',
          size: 22,
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Signature',
          size: 18,
          color: '666666',
          italics: true,
        }),
      ],
    }),
  );

  // Footer
  children.push(
    new Paragraph({
      spacing: { before: 600 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: 'DDDDDD' },
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Document généré automatiquement - DC1 Generator',
          size: 18,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Conforme au modèle DC2-2019 du Ministère de l\'Économie',
          size: 18,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  );

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.79),
              right: convertInchesToTwip(0.59),
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(0.59),
            },
          },
        },
        children,
      },
    ],
  });
}

function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
      }),
    ],
    heading: HeadingLevel.HEADING_2,
    shading: {
      type: ShadingType.SOLID,
      color: GRAY_BACKGROUND,
    },
    border: {
      left: { style: BorderStyle.SINGLE, size: 24, color: BLUE_COLOR },
    },
    spacing: { before: 300, after: 200 },
  });
}

function createSubHeader(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        color: '555555',
      }),
    ],
    spacing: { before: 200, after: 100 },
  });
}

function createField(label: string, value: string | undefined): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label} : `,
        bold: true,
        size: 22,
        color: '555555',
      }),
      new TextRun({
        text: value || '',
        size: 22,
      }),
    ],
    spacing: { before: 100, after: 100 },
  });
}

function createCATable(ca: ChiffreAffaires[]): Table {
  return new Table({
    rows: [
      new TableRow({
        children: ca.map(
          (c) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Année ${c.annee}`, bold: true, size: 20 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { type: ShadingType.SOLID, color: 'F0F0F0' },
            }),
        ),
        tableHeader: true,
      }),
      new TableRow({
        children: ca.map(
          (c) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: c.montant || '-', size: 20 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
        ),
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });
}

function createEffectifsTable(effectifs: Effectif[]): Table {
  return new Table({
    rows: [
      new TableRow({
        children: effectifs.map(
          (e) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Année ${e.annee}`, bold: true, size: 20 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { type: ShadingType.SOLID, color: 'F0F0F0' },
            }),
        ),
        tableHeader: true,
      }),
      new TableRow({
        children: effectifs.map(
          (e) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: e.nombre || '-', size: 20 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
        ),
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });
}

function createReferencesTable(references: Reference[]): Table {
  const headerRow = new TableRow({
    children: ['Client', 'Objet', 'Année', 'Montant HT', 'Contact'].map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: header, bold: true, size: 18 })],
            }),
          ],
          shading: { type: ShadingType.SOLID, color: 'F0F0F0' },
        }),
    ),
    tableHeader: true,
  });

  const dataRows = references.map(
    (ref) =>
      new TableRow({
        children: [
          createTableCell(ref.client),
          createTableCell(ref.objet),
          createTableCell(ref.annee),
          createTableCell(ref.montant || ''),
          createTableCell(ref.contact || ''),
        ],
      }),
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.AUTOFIT,
  });
}

function createCertificationsTable(certifications: Certification[]): Table {
  const headerRow = new TableRow({
    children: ['Certification', 'Organisme', 'Validité'].map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: header, bold: true, size: 18 })],
            }),
          ],
          shading: { type: ShadingType.SOLID, color: 'F0F0F0' },
        }),
    ),
    tableHeader: true,
  });

  const dataRows = certifications.map(
    (cert) =>
      new TableRow({
        children: [
          createTableCell(cert.nom),
          createTableCell(cert.organisme || ''),
          createTableCell(cert.date_validite || ''),
        ],
      }),
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.AUTOFIT,
  });
}

function createTableCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: text || '', size: 18 })],
      }),
    ],
  });
}
