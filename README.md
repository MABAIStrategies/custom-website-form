# custom-website-form

Custom website project intake form for MAB AI Strategies - Client information gathering and project scoping tool.

## Features

- Multi-step intake form with progress tracking
- AI-powered idea generation
- Google Sheets integration for form submissions
- Redirect to Custom Web App form with URL parameter passing
- Responsive design

## Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` to deploy

### Environment Variables

Configure these in Vercel Dashboard > Project Settings > Environment Variables:

| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email for Google Sheets API |
| `GOOGLE_PRIVATE_KEY` | Private key from service account JSON (include newlines) |
| `GOOGLE_SPREADSHEET_ID` | ID from spreadsheet URL (default: `1VL1PpX6hPaq0Qwiq_W4bosKJe9t6r3EwFvH7dME6cl0`) |
| `OPENAI_API_KEY` | OpenAI API key for AI idea generation (optional) |
| `GEMINI_API_KEY` | Google Gemini API key as fallback (optional) |

### Google Sheets Setup

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account and download JSON key
4. Share the spreadsheet with the service account email (Editor access)

### Spreadsheet Structure

The form submits to Sheet1 with these columns:
- Timestamp, Full Name, Email, Phone, Company
- Business Type, Industry, Existing Website
- Design Style, Primary Color, Secondary Color
- Website Type, Other Website Type
- Features, AI-Recommended Features
- Timeline, Budget, Additional Notes
- Referrer, User Agent

## API Endpoints

- `POST /api/submit-website` - Submit full form data
- `POST /api/submit-contact` - Submit partial contact info (Page 1)
- `POST /api/generate-ideas` - AI idea generation

## Related

- [custom-web-app-form](https://github.com/MABAIStrategies/custom-web-app-form) - Custom application intake form
