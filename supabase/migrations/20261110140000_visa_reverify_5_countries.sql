-- Re-verification of the 5 visa entries last checked April 2026.
-- Corrects process errors (Cyprus tourist-visa conversion, Malta "Single Permit",
-- Austria permit type) and updates fees. Where public sources disagree, the
-- text gives a range and says to confirm with the official source.

update destination_visa_info set
  visa_type = 'Residence Permit – Student (Aufenthaltsbewilligung Student)',
  processing_time = 'Up to 3 months – apply as soon as you have your admission letter',
  cost = '€218 residence permit fee (2026); further document fees may apply',
  official_link = 'https://www.oead.at/en/to-austria/coming-to-austria/entry-and-residence/',
  notes = 'For stays over 6 months you need a student residence permit, applied for at the Austrian embassy or consulate before travel. Proof of funds for 12 months (2026): €722.58/month if under 24, €1,308.39/month if 24 or older. Non-EU students at public universities pay about €726.72 per semester plus the ÖH student union fee. Register your address (Meldezettel) within 3 days of arrival.',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'austria';

update destination_visa_info set
  visa_type = 'Student Entry Permit + Temporary Residence Permit',
  processing_time = 'Several weeks – your university files the entry permit before you travel',
  cost = '€70 entry/residence permit fee (Migration Department); Aliens Register/ARC charges may be added',
  official_link = 'https://www.gov.cy/mip-md/en/documents/students/',
  notes = 'Your university submits the entry permit application to the Migration Department while you are still outside Cyprus. You cannot switch to student status after entering on a tourist or visitor visa. Within 7–10 days of arrival, register with the Aliens Register and apply for your temporary residence permit with medical tests from a Cyprus hospital, health insurance, proof of accommodation and bank proof of funds.',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'cyprus';

update destination_visa_info set
  visa_type = 'Temporary Residence Permit (studies)',
  processing_time = '30 days standard; 10 or 5 working-day express options',
  cost = 'About €160–€180 state fee (30-day processing) + €45 residence card; express costs more. A consular fee applies if you file at an embassy',
  official_link = 'https://www.pmlp.gov.lv/en/residence-permit-studies',
  notes = 'Non-EU students staying over 90 days need a temporary residence permit from the Office of Citizenship and Migration Affairs (PMLP/OCMA). You can usually file through a Latvian embassy before travel; depending on your nationality you may also need a long-stay (D) visa to enter. Proof of funds is roughly €780 per month (2026). Confirm the current fee table on the PMLP site.',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'latvia';

update destination_visa_info set
  visa_type = 'Temporary Residence Permit (studies), applied via MIGRIS',
  processing_time = 'Up to 2 months standard; faster urgent processing available',
  cost = 'State fee roughly €80–€160 standard (higher for urgent), plus the VFS Global service fee where you file through VFS',
  official_link = 'https://migracija.lrv.lt/en/',
  notes = 'Start your application in the MIGRIS online system after receiving your admission letter; your university will guide you. You then attend an appointment (in Lithuania or at a VFS centre/embassy) to submit documents and biometrics. Fees and fund requirements changed in 2026 and public sources disagree, so confirm the current amounts on the Migration Department site before paying.',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'lithuania';

update destination_visa_info set
  visa_type = 'National (Type D) Student Visa + Student Residence Permit (Identità)',
  processing_time = '4–8 weeks for the visa; residence permit issued after arrival',
  cost = 'About €50 Identità residence permit application; the visa fee is separate and varies by embassy',
  official_link = 'https://identita.gov.mt/',
  notes = 'Non-EU students enter on a national (Type D) study visa, then apply to Identità for a student residence permit (eResidence card) soon after arrival. The Single Permit is for workers, not students. Malta''s English-taught programmes are popular with African students.',
  last_verified = '2026-11-10', updated_at = now()
where destination_slug = 'malta';
