/**
 * Wrapper pour pdf-parse v2.x
 *
 * pdf-parse v2.x a une nouvelle API avec des exports différents.
 * Utilise la classe PDFParse avec data en Uint8Array.
 */

const { PDFParse } = require('pdf-parse');

module.exports = async function parsePdf(dataBuffer) {
  // Convertir Buffer Node.js en Uint8Array si nécessaire
  const data = dataBuffer instanceof Uint8Array ? dataBuffer : new Uint8Array(dataBuffer);

  const parser = new PDFParse({ data });
  const result = await parser.getText();

  return { text: result.text };
};
