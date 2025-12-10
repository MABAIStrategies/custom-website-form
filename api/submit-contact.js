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
    const { fullName, email, phone, company, source } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '1VL1PpX6hPaq0Qwiq_W4bosKJe9t6r3EwFvH7dME6cl0';

    // Prepare row data for contact info sheet
    const rowData = [
      new Date().toISOString(),  // Timestamp
      fullName,                   // Full Name
      email,                      // Email
      phone,                      // Phone
      company || '',              // Company
      source || 'Website Form',   // Source
      'Partial - Page 1',         // Status
    ];

    // Append to a "Contacts" sheet (you may need to create this sheet)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Contacts!A:G',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Contact info saved'
    });

  } catch (error) {
    console.error('Error saving contact:', error);
    // Don't fail the form flow if contact capture fails
    return res.status(200).json({
      success: true,
      message: 'Contact processed',
      warning: 'Background save may have failed'
    });
  }
};
