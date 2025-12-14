export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variable
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { context } = req.body;
    
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a web design consultant. Based on these project details, suggest 3-4 specific, actionable ideas for their ${context.websiteType || 'website'} project:\n\nIndustry: ${context.industry || 'N/A'}\nBusiness Type: ${context.businessType || 'N/A'}\nSelected Features: ${context.features || 'N/A'}\nDesign Style: ${context.designStyle || 'N/A'}\nTimeline: ${context.timeline || 'N/A'}\n\nProvide brief, practical suggestions that would make their website stand out. Format as a bulleted list. Keep total response under 150 words.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
          }
        })
      }
    );

    const data = await response.json();
    
    // Extract ideas from Gemini response
    const ideas = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate ideas at this time. Please try again.';
    
    res.status(200).json({ ideas });
    
  } catch (error) {
    console.error('Error generating ideas:', error);
    res.status(500).json({ error: 'Failed to generate ideas. Please try again.' });
  }
}
