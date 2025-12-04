import { DC1FormData, MembreGroupement } from '../../../types';

export function generateDC1Html(data: DC1FormData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>DC1 - Lettre de candidature</title>
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
    .checkbox {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 1px solid #333;
      margin-right: 8px;
      text-align: center;
      line-height: 12px;
      font-weight: bold;
    }
    .checkbox.checked::before {
      content: "X";
    }
    .checkbox-row {
      margin: 5px 0;
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
    <h1>DC1 - LETTRE DE CANDIDATURE</h1>
    <p class="subtitle">Marchés publics / Accords-cadres</p>
    <p class="subtitle" style="font-size: 10px; margin-top: 5px;">
      Formulaire conforme au modèle DC1-2019
    </p>
  </div>

  <!-- Section A -->
  <h2>A - IDENTIFICATION DE L'ACHETEUR</h2>
  <div class="field">
    <div class="field-label">Nom de l'acheteur :</div>
    <div class="field-value">${escapeHtml(data.acheteur.nom)}</div>
  </div>
  ${data.acheteur.reference_avis ? `
  <div class="field">
    <div class="field-label">Référence de l'avis de publicité :</div>
    <div class="field-value">${escapeHtml(data.acheteur.reference_avis)}</div>
  </div>
  ` : ''}
  ${data.acheteur.reference_dossier ? `
  <div class="field">
    <div class="field-label">Référence du dossier de consultation :</div>
    <div class="field-value">${escapeHtml(data.acheteur.reference_dossier)}</div>
  </div>
  ` : ''}

  <!-- Section B -->
  <h2>B - OBJET DE LA CONSULTATION</h2>
  <div class="field">
    <div class="field-label">Objet du marché :</div>
    <div class="field-value">${escapeHtml(data.consultation.objet)}</div>
  </div>

  <!-- Section C -->
  <h2>C - OBJET DE LA CANDIDATURE</h2>
  <div class="checkbox-row">
    <span class="checkbox ${data.candidature.type === 'marche_unique' ? 'checked' : ''}"></span>
    Marché ou accord-cadre unique
  </div>
  <div class="checkbox-row">
    <span class="checkbox ${data.candidature.type === 'tous_lots' ? 'checked' : ''}"></span>
    L'ensemble des lots de la consultation
  </div>
  <div class="checkbox-row">
    <span class="checkbox ${data.candidature.type === 'lots_specifiques' ? 'checked' : ''}"></span>
    Les lots suivants : ${data.candidature.lots ? escapeHtml(data.candidature.lots) : ''}
  </div>

  <!-- Section D -->
  <h2>D - PRÉSENTATION DU CANDIDAT</h2>
  <div class="checkbox-row">
    <span class="checkbox ${data.candidat.mode === 'seul' ? 'checked' : ''}"></span>
    Le candidat se présente seul
  </div>
  <div class="checkbox-row">
    <span class="checkbox ${data.candidat.mode === 'groupement' ? 'checked' : ''}"></span>
    Le candidat est membre d'un groupement
    ${data.groupement ? `
      <span style="margin-left: 20px;">
        <span class="checkbox ${data.groupement.type === 'conjoint' ? 'checked' : ''}"></span> Conjoint
        <span class="checkbox ${data.groupement.type === 'solidaire' ? 'checked' : ''}" style="margin-left: 10px;"></span> Solidaire
      </span>
    ` : ''}
  </div>

  <h3>Identification du candidat</h3>
  <div class="two-cols">
    <div>
      <div class="field">
        <div class="field-label">SIRET :</div>
        <div class="field-value">${escapeHtml(data.candidat.siret)}</div>
      </div>
      <div class="field">
        <div class="field-label">Nom commercial :</div>
        <div class="field-value">${escapeHtml(data.candidat.nom_commercial)}</div>
      </div>
      <div class="field">
        <div class="field-label">Dénomination sociale :</div>
        <div class="field-value">${escapeHtml(data.candidat.denomination_sociale)}</div>
      </div>
    </div>
    <div>
      <div class="field">
        <div class="field-label">Adresse établissement :</div>
        <div class="field-value">${escapeHtml(data.candidat.adresse_etablissement)}</div>
      </div>
      <div class="field">
        <div class="field-label">Email :</div>
        <div class="field-value">${escapeHtml(data.candidat.email)}</div>
      </div>
      <div class="field">
        <div class="field-label">Téléphone :</div>
        <div class="field-value">${escapeHtml(data.candidat.telephone)}</div>
      </div>
    </div>
  </div>

  ${data.candidat.mode === 'groupement' && data.groupement ? generateGroupementSection(data.groupement) : ''}

  <!-- Section F -->
  <h2>F - ENGAGEMENTS DU CANDIDAT</h2>
  <div class="checkbox-row">
    <span class="checkbox ${data.engagements.attestation_exclusion ? 'checked' : ''}"></span>
    Le candidat atteste sur l'honneur ne pas faire l'objet d'une interdiction de soumissionner
    (articles L.2141-1 à L.2141-5 et L.2141-7 à L.2141-10 du code de la commande publique)
  </div>

  <h3>Justification des capacités</h3>
  <div class="checkbox-row">
    <span class="checkbox ${data.engagements.type_capacites === 'dc2' ? 'checked' : ''}"></span>
    Via le formulaire DC2
  </div>
  <div class="checkbox-row">
    <span class="checkbox ${data.engagements.type_capacites === 'documents' ? 'checked' : ''}"></span>
    Via documents propres
  </div>

  ${data.engagements.url_documents ? `
  <div class="field">
    <div class="field-label">URL des documents :</div>
    <div class="field-value">${escapeHtml(data.engagements.url_documents)}</div>
  </div>
  ` : ''}

  <!-- Signature -->
  <div class="signature-box">
    <h3>Signature du candidat ou du mandataire</h3>
    <p style="margin-top: 10px;">Fait à __________________________, le __________________________</p>
    <p style="margin-top: 10px;">Nom et qualité du signataire : __________________________</p>
    <div class="signature-line"></div>
    <p style="font-size: 9px; color: #666; margin-top: 5px;">Signature</p>
  </div>

  <div class="footer">
    <p>Document généré automatiquement - DC1 Generator</p>
    <p>Conforme au modèle DC1-2019 du Ministère de l'Économie</p>
  </div>
</body>
</html>
  `;
}

function generateGroupementSection(groupement: DC1FormData['groupement']): string {
  if (!groupement) return '';

  const membresRows = groupement.membres
    .map(
      (m: MembreGroupement) => `
    <tr>
      <td>${escapeHtml(m.siret)}</td>
      <td>${escapeHtml(m.nom_commercial)}</td>
      <td>${escapeHtml(m.denomination_sociale)}</td>
      <td>${escapeHtml(m.adresse)}</td>
      <td>${escapeHtml(m.email)}</td>
      <td>${escapeHtml(m.telephone)}</td>
      ${groupement.type === 'conjoint' ? `<td>${escapeHtml(m.prestations || '')}</td>` : ''}
    </tr>
  `,
    )
    .join('');

  return `
  <h2>E - MEMBRES DU GROUPEMENT</h2>
  ${groupement.type === 'conjoint' && groupement.mandataire_solidaire ? `
  <div class="checkbox-row">
    <span class="checkbox ${groupement.mandataire_solidaire === 'oui' ? 'checked' : ''}"></span>
    Le mandataire est solidaire des autres membres
  </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        <th>SIRET</th>
        <th>Nom commercial</th>
        <th>Dénomination</th>
        <th>Adresse</th>
        <th>Email</th>
        <th>Téléphone</th>
        ${groupement.type === 'conjoint' ? '<th>Prestations</th>' : ''}
      </tr>
    </thead>
    <tbody>
      ${membresRows}
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
