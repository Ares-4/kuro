import { jsPDF } from "jspdf";
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Generates an eligibility PDF and uploads it to Supabase Storage
 * @param {object} leadData - Lead details including score, tier, etc.
 * @returns {Promise<string>} - Public URL of the generated PDF
 */
export const generateEligibilityPDF = async (leadData) => {
  const doc = new jsPDF();
  const { name, target_destination, study_level, intake_month, budget_range, tier, score } = leadData;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185); // Blue
  doc.text("Eligibility Assessment Result", 105, 20, null, null, "center");
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Kuro Education Consultancy", 105, 28, null, null, "center");
  
  doc.setDrawColor(200);
  doc.line(20, 35, 190, 35);

  // Applicant Details
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Applicant Details", 20, 50);
  
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text(`Name: ${name || 'N/A'}`, 25, 60);
  doc.text(`Target Destination: ${target_destination || 'N/A'}`, 25, 68);
  doc.text(`Study Level: ${study_level || 'N/A'}`, 25, 76);
  doc.text(`Preferred Intake: ${intake_month || 'N/A'}`, 25, 84);
  doc.text(`Budget Range: ${budget_range || 'N/A'}`, 25, 92);

  // Score Section
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(1);
  doc.rect(20, 110, 170, 60); // Box

  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text("Assessment Result", 105, 125, null, null, "center");

  // Tier Display
  let tierColor = [100, 100, 100];
  if (tier === 'A') tierColor = [39, 174, 96]; // Green
  if (tier === 'B') tierColor = [243, 156, 18]; // Orange

  doc.setFontSize(40);
  doc.setTextColor(...tierColor);
  doc.text(`Tier ${tier}`, 105, 145, null, null, "center");

  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text(`Lead Score: ${score}/100`, 105, 155, null, null, "center");

  // Disclaimer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    "Disclaimer: This assessment is preliminary and based on the information provided. Final decisions regarding admission and visas depend entirely on the respective institutions and embassies. This document does not guarantee acceptance.", 
    20, 
    200, 
    { maxWidth: 170, align: "justify" }
  );

  // Save/Upload
  const pdfBlob = doc.output('blob');
  const fileName = `${name.replace(/\s+/g, '_')}_Eligibility_${Date.now()}.pdf`;

  const { data, error } = await supabase.storage
    .from('eligibility-results')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (error) {
    console.error('PDF Upload Error:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from('eligibility-results')
    .getPublicUrl(fileName);

  return publicData.publicUrl;
};