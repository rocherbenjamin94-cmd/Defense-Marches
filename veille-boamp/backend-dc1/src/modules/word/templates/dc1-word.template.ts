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
import { DC1FormData, MembreGroupement } from '../../../types';

const BLUE_COLOR = '0052CC';
const GRAY_BACKGROUND = 'F5F5F5';

export function generateDC1Word(data: DC1FormData): Document {
  const children: (Paragraph | Table)[] = [];

  // Header
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'DC1 - LETTRE DE CANDIDATURE',
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
          text: 'Marchés publics / Accords-cadres',
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
          text: 'Formulaire conforme au modèle DC1-2019',
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

  // Section A - Acheteur
  children.push(createSectionHeader('A - IDENTIFICATION DE L\'ACHETEUR'));
  children.push(createField('Nom de l\'acheteur', data.acheteur.nom));
  if (data.acheteur.reference_avis) {
    children.push(
      createField('Référence de l\'avis de publicité', data.acheteur.reference_avis),
    );
  }
  if (data.acheteur.reference_dossier) {
    children.push(
      createField('Référence du dossier de consultation', data.acheteur.reference_dossier),
    );
  }

  // Section B - Objet
  children.push(createSectionHeader('B - OBJET DE LA CONSULTATION'));
  children.push(createField('Objet du marché', data.consultation.objet));

  // Section C - Candidature
  children.push(createSectionHeader('C - OBJET DE LA CANDIDATURE'));
  let candidatureText = '';
  if (data.candidature.type === 'marche_unique') {
    candidatureText = 'Marché ou accord-cadre unique';
  } else if (data.candidature.type === 'tous_lots') {
    candidatureText = "L'ensemble des lots de la consultation";
  } else if (data.candidature.type === 'lots_specifiques') {
    candidatureText = `Les lots suivants : ${data.candidature.lots || ''}`;
  }
  children.push(createField('Objet de la candidature', candidatureText));

  // Section D - Présentation du candidat
  children.push(createSectionHeader('D - PRÉSENTATION DU CANDIDAT'));
  if (data.candidat.mode === 'seul') {
    children.push(createField('Présentation', 'Le candidat se présente seul'));
  } else if (data.candidat.mode === 'groupement' && data.groupement) {
    const groupementType = data.groupement.type === 'conjoint' ? 'conjoint' : 'solidaire';
    children.push(createField('Présentation', `Le candidat est membre d'un groupement ${groupementType}`));
  }

  // Identification du candidat
  children.push(createSubHeader('Identification du candidat'));
  children.push(createField('SIRET', data.candidat.siret));
  children.push(createField('Nom commercial', data.candidat.nom_commercial));
  children.push(
    createField('Dénomination sociale', data.candidat.denomination_sociale),
  );
  children.push(
    createField('Adresse établissement', data.candidat.adresse_etablissement),
  );
  children.push(createField('Email', data.candidat.email));
  children.push(createField('Téléphone', data.candidat.telephone));

  // Section E - Membres du groupement (if applicable)
  if (data.candidat.mode === 'groupement' && data.groupement) {
    children.push(createSectionHeader('E - MEMBRES DU GROUPEMENT'));

    if (data.groupement.type === 'conjoint' && data.groupement.mandataire_solidaire) {
      children.push(
        createCheckbox(
          data.groupement.mandataire_solidaire === 'oui',
          'Le mandataire est solidaire des autres membres',
        ),
      );
    }

    // Table des membres
    if (data.groupement.membres && data.groupement.membres.length > 0) {
      children.push(createMembresTable(data.groupement.membres, data.groupement.type));
    }
  }

  // Section F - Engagements
  children.push(createSectionHeader('F - ENGAGEMENTS DU CANDIDAT'));
  children.push(
    createCheckbox(
      data.engagements.attestation_exclusion,
      'Le candidat atteste sur l\'honneur ne pas faire l\'objet d\'une interdiction de soumissionner (articles L.2141-1 à L.2141-5 et L.2141-7 à L.2141-10 du code de la commande publique)',
    ),
  );

  const capacitesText = data.engagements.type_capacites === 'dc2' ? 'Via le formulaire DC2' : 'Via documents propres';
  children.push(createField('Justification des capacités', capacitesText));

  if (data.engagements.url_documents) {
    children.push(createField('URL des documents', data.engagements.url_documents));
  }

  // Signature box
  children.push(
    new Paragraph({
      spacing: { before: 400 },
    }),
  );
  children.push(createSubHeader('Signature du candidat ou du mandataire'));
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Fait à __________________________, le __________________________',
          size: 22,
        }),
      ],
      spacing: { before: 200, after: 200 },
    }),
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Nom et qualité du signataire : __________________________',
          size: 22,
        }),
      ],
      spacing: { after: 400 },
    }),
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '________________________________________',
          size: 22,
        }),
      ],
      spacing: { after: 50 },
    }),
  );
  children.push(
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
  );
  children.push(
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
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Conforme au modèle DC1-2019 du Ministère de l\'Économie',
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
              top: convertInchesToTwip(0.79), // 20mm
              right: convertInchesToTwip(0.59), // 15mm
              bottom: convertInchesToTwip(0.79), // 20mm
              left: convertInchesToTwip(0.59), // 15mm
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

function createCheckbox(checked: boolean, text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: checked ? '☑ ' : '☐ ',
        size: 22,
      }),
      new TextRun({
        text,
        size: 22,
      }),
    ],
    spacing: { before: 100, after: 100 },
  });
}

function createMembresTable(
  membres: MembreGroupement[],
  groupementType: string,
): Table {
  const headers = ['SIRET', 'Nom commercial', 'Dénomination', 'Adresse', 'Email', 'Tél.'];
  if (groupementType === 'conjoint') {
    headers.push('Prestations');
  }

  const headerRow = new TableRow({
    children: headers.map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: header,
                  bold: true,
                  size: 18,
                }),
              ],
            }),
          ],
          shading: {
            type: ShadingType.SOLID,
            color: 'F0F0F0',
          },
        }),
    ),
    tableHeader: true,
  });

  const dataRows = membres.map(
    (membre) =>
      new TableRow({
        children: [
          createTableCell(membre.siret),
          createTableCell(membre.nom_commercial),
          createTableCell(membre.denomination_sociale),
          createTableCell(membre.adresse),
          createTableCell(membre.email),
          createTableCell(membre.telephone),
          ...(groupementType === 'conjoint'
            ? [createTableCell(membre.prestations || '')]
            : []),
        ],
      }),
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    layout: TableLayoutType.AUTOFIT,
  });
}

function createTableCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '',
            size: 18,
          }),
        ],
      }),
    ],
  });
}
