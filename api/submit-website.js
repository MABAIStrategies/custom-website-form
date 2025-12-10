const { google } = require('googleapis');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Initialize Google Sheets API
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1VL1PpX6hPaq0Qwiq_W4bosKJe9t6r3EwFvH7dME6cl0';

    // Prepare row data - order matches spreadsheet columns
    const rowData = [
      new Date().toISOString(),                    // Timestamp
      formData.fullName || '',                     // Full Name
      formData.email || '',                        // Email
      formData.phone || '',                        // Phone
      formData.company || '',                      // Company
      formData.businessType || '',                 // Business Type
      formData.industry || '',                     // Industry
      formData.existingWebsite || '',              // Existing Website
      formData.designStyle || '',                  // Design Style
      formData.primaryColor || '',                 // Primary Color
      formData.secondaryColor || '',               // Secondary Color
      formData.websiteType || '',                  // Website Type
      formData.otherWebsite || '',                 // Other Website Type
      formData.features || '',                     // Selected Features
      formData.dynamicFeatures || '',              // AI-Recommended Features
      formData.timeline || '',                     // Timeline
      formData.budget || '',                       // Budget
      formData.notes || '',                        // Additional Notes
      formData.referrer || 'Direct',               // Referrer
      formData.userAgent || '',                    // User Agent
    ];

    // Append to Google Sheet (first sheet - gid=0)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:T',  // Adjust range based on your columns
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({
      error: 'Failed to submit form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
