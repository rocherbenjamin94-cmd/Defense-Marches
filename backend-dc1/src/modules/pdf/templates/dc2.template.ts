import { DC2FormData, ChiffreAffaires, Effectif, Reference, Certification } from '../../../types';

export function generateDC2Html(data: DC2FormData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>DC2 - Déclaration du candidat</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      padding: 20mm 15mm;
    }
    h1 {
      font-size: 16px;
      text-align: center;
      margin-bottom: 5px;
      color: #0052CC;
    }
    h2 {
      font-size: 13px;
      background: #f5f5f5;
      padding: 8px 12px;
      margin: 15px 0 10px;
      border-left: 4px solid #0052CC;
    }
    h3 {
      font-size: 11px;
      margin: 10px 0 5px;
      color: #555;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #0052CC;
      padding-bottom: 15px;
    }
    .subtitle {
      font-size: 12px;
      color: #666;
    }
    .field {
      margin: 8px 0;
    }
    .field-label {
      font-weight: bold;
      color: #555;
    }
    .field-value {
      padding: 5px 10px;
      background: #fafafa;
      border: 1px solid #ddd;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 6px 8px;
      text-align: left;
      font-size: 10px;
    }
    th {
      background: #f0f0f0;
      font-weight: bold;
    }
    .two-cols {
      display: flex;
      gap: 20px;
    }
    .two-cols > div {
      flex: 1;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 10px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    .signature-box {
      margin-top: 20px;
      border: 1px solid #ddd;
      padding: 15px;
    }
    .signature-line {
      margin-top: 50px;
      border-top: 1px solid #333;
      width: 200px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>DC2 - DÉCLARATION DU CANDIDAT</h1>
    <p class="subtitle">Déclaration du candidat individuel ou du membre du groupement</p>
    <p class="subtitle" style="font-size: 10px; margin-top: 5px;">
      Formulaire conforme au modèle DC2-2019
    </p>
  </div>

  <!-- Section A - Identification -->
  <h2>A - IDENTIFICATION DU CANDIDAT</h2>
  <div class="two-cols">
    <div>
      <div class="field">
        <div class="field-label">SIRET :</div>
        <div class="field-value">${escapeHtml(data.identification.siret)}</div>
      </div>
      <div class="field">
        <div class="field-label">Dénomination sociale :</div>
        <div class="field-value">${escapeHtml(data.identification.denomination_sociale)}</div>
      </div>
      <div class="field">
        <div class="field-label">Nom commercial :</div>
        <div class="field-value">${escapeHtml(data.identification.nom_commercial)}</div>
      </div>
    </div>
    <div>
      <div class="field">
        <div class="field-label">Adresse établissement :</div>
        <div class="field-value">${escapeHtml(data.identification.adresse_etablissement)}</div>
      </div>
      <div class="field">
        <div class="field-label">Email :</div>
        <div class="field-value">${escapeHtml(data.identification.email)}</div>
      </div>
      <div class="field">
        <div class="field-label">Téléphone :</div>
        <div class="field-value">${escapeHtml(data.identification.telephone)}</div>
      </div>
    </div>
  </div>

  <!-- Section B - Situation juridique -->
  <h2>B - RENSEIGNEMENTS RELATIFS À LA SITUATION JURIDIQUE</h2>
  <div class="two-cols">
    <div>
      <div class="field">
        <div class="field-label">Forme juridique :</div>
        <div class="field-value">${escapeHtml(data.situation_juridique.forme_juridique)}</div>
      </div>
      <div class="field">
        <div class="field-label">Date de création :</div>
        <div class="field-value">${escapeHtml(data.situation_juridique.date_creation)}</div>
      </div>
      <div class="field">
        <div class="field-label">Capital social :</div>
        <div class="field-value">${escapeHtml(data.situation_juridique.capital_social)} ${escapeHtml(data.situation_juridique.devise_capital)}</div>
      </div>
    </div>
    <div>
      <div class="field">
        <div class="field-label">N° RCS :</div>
        <div class="field-value">${escapeHtml(data.situation_juridique.numero_rcs)} ${data.situation_juridique.ville_rcs ? `(${escapeHtml(data.situation_juridique.ville_rcs)})` : ''}</div>
      </div>
      <div class="field">
        <div class="field-label">Code NAF :</div>
        <div class="field-value">${escapeHtml(data.situation_juridique.code_naf)} - ${escapeHtml(data.situation_juridique.libelle_naf)}</div>
      </div>
      ${data.situation_juridique.numero_rm ? `
      <div class="field">
        <div class="field-label">N° RM :</div>
        <div class="field-value">${escapeHtml(data.situation_juridique.numero_rm)}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- Section C - Capacités économiques -->
  <h2>C - CAPACITÉS ÉCONOMIQUES ET FINANCIÈRES</h2>

  <h3>Chiffre d'affaires global HT</h3>
  ${generateCATable(data.capacites_economiques.chiffre_affaires_global)}

  ${data.capacites_economiques.chiffre_affaires_domaine.some(ca => ca.montant) ? `
  <h3>Chiffre d'affaires dans le domaine d'activité concerné HT</h3>
  ${generateCATable(data.capacites_economiques.chiffre_affaires_domaine)}
  ` : ''}

  ${data.capacites_economiques.assurance_rc_pro || data.capacites_economiques.assurance_decennale ? `
  <h3>Assurances professionnelles</h3>
  <div class="field">
    <div class="field-label">RC Professionnelle :</div>
    <div class="field-value">${escapeHtml(data.capacites_economiques.assurance_rc_pro)}</div>
  </div>
  ${data.capacites_economiques.assurance_decennale ? `
  <div class="field">
    <div class="field-label">Décennale :</div>
    <div class="field-value">${escapeHtml(data.capacites_economiques.assurance_decennale)}</div>
  </div>
  ` : ''}
  ` : ''}

  <!-- Section D - Capacités techniques -->
  <h2>D - CAPACITÉS TECHNIQUES ET PROFESSIONNELLES</h2>

  <h3>Effectifs moyens annuels</h3>
  ${generateEffectifsTable(data.capacites_techniques.effectifs)}
  ${data.capacites_techniques.effectif_encadrement ? `
  <p style="margin-top: 5px;"><strong>Dont encadrement :</strong> ${escapeHtml(data.capacites_techniques.effectif_encadrement)}</p>
  ` : ''}

  ${data.capacites_techniques.references.length > 0 ? `
  <h3>Références / Marchés similaires</h3>
  ${generateReferencesTable(data.capacites_techniques.references)}
  ` : ''}

  ${data.capacites_techniques.certifications.length > 0 ? `
  <h3>Certifications et qualifications</h3>
  ${generateCertificationsTable(data.capacites_techniques.certifications)}
  ` : ''}

  <!-- Section E - Moyens techniques -->
  ${(data.moyens_techniques.equipements || data.moyens_techniques.outillage || data.moyens_techniques.locaux) ? `
  <h2>E - MOYENS TECHNIQUES</h2>
  ${data.moyens_techniques.equipements ? `
  <div class="field">
    <div class="field-label">Équipements techniques :</div>
    <div class="field-value">${escapeHtml(data.moyens_techniques.equipements)}</div>
  </div>
  ` : ''}
  ${data.moyens_techniques.outillage ? `
  <div class="field">
    <div class="field-label">Outillage et matériel :</div>
    <div class="field-value">${escapeHtml(data.moyens_techniques.outillage)}</div>
  </div>
  ` : ''}
  ${data.moyens_techniques.locaux ? `
  <div class="field">
    <div class="field-label">Locaux :</div>
    <div class="field-value">${escapeHtml(data.moyens_techniques.locaux)}</div>
  </div>
  ` : ''}
  ` : ''}

  <!-- Signature -->
  <div class="signature-box">
    <h3>Signature du candidat</h3>
    <p style="margin-top: 10px;">Fait à __________________________, le __________________________</p>
    <p style="margin-top: 10px;">Nom et qualité du signataire : __________________________</p>
    <div class="signature-line"></div>
    <p style="font-size: 9px; color: #666; margin-top: 5px;">Signature</p>
  </div>

  <div class="footer">
    <p>Document généré automatiquement - DC1 Generator</p>
    <p>Conforme au modèle DC2-2019 du Ministère de l'Économie</p>
  </div>
</body>
</html>
  `;
}

function generateCATable(ca: ChiffreAffaires[]): string {
  return `
  <table>
    <thead>
      <tr>
        ${ca.map(c => `<th>Année ${c.annee}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        ${ca.map(c => `<td>${escapeHtml(c.montant) || '-'}</td>`).join('')}
      </tr>
    </tbody>
  </table>
  `;
}

function generateEffectifsTable(effectifs: Effectif[]): string {
  return `
  <table>
    <thead>
      <tr>
        ${effectifs.map(e => `<th>Année ${e.annee}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        ${effectifs.map(e => `<td>${escapeHtml(e.nombre) || '-'}</td>`).join('')}
      </tr>
    </tbody>
  </table>
  `;
}

function generateReferencesTable(references: Reference[]): string {
  return `
  <table>
    <thead>
      <tr>
        <th>Client</th>
        <th>Objet</th>
        <th>Année</th>
        <th>Montant HT</th>
        <th>Contact</th>
      </tr>
    </thead>
    <tbody>
      ${references.map(ref => `
      <tr>
        <td>${escapeHtml(ref.client)}</td>
        <td>${escapeHtml(ref.objet)}</td>
        <td>${escapeHtml(ref.annee)}</td>
        <td>${escapeHtml(ref.montant)}</td>
        <td>${escapeHtml(ref.contact)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  `;
}

function generateCertificationsTable(certifications: Certification[]): string {
  return `
  <table>
    <thead>
      <tr>
        <th>Certification</th>
        <th>Organisme</th>
        <th>Validité</th>
      </tr>
    </thead>
    <tbody>
      ${certifications.map(cert => `
      <tr>
        <td>${escapeHtml(cert.nom)}</td>
        <td>${escapeHtml(cert.organisme)}</td>
        <td>${escapeHtml(cert.date_validite)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  `;
}

function escapeHtml(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
