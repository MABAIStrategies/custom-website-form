// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
    const { websiteType, industry, businessType, features, designStyle, timeline } = req.body;

    const prompt = `You are a web design consultant. Based on these project details, suggest 3-4 specific, actionable ideas for their ${websiteType || 'website'} project:

Industry: ${industry || 'General'}
Business Type: ${businessType || 'Business'}
Selected Features: ${features || 'Standard features'}
Design Style: ${designStyle || 'Modern'}
Timeline: ${timeline || 'Flexible'}

Provide brief, practical suggestions that would make their website stand out. Format as a bulleted list. Keep total response under 150 words.`;

    // Try OpenAI first
    if (process.env.OPENAI_API_KEY) {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful web design consultant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (openaiResponse.ok) {
        const data = await openaiResponse.json();
        const ideas = data.choices?.[0]?.message?.content || getFallbackIdeas(websiteType);
        return res.status(200).json({ success: true, ideas });
      }
    }

    // Try Gemini as fallback
    if (process.env.GEMINI_API_KEY) {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      if (geminiResponse.ok) {
        const data = await geminiResponse.json();
        const ideas = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackIdeas(websiteType);
        return res.status(200).json({ success: true, ideas });
      }
    }

    // Return fallback ideas if no API is configured or both fail
    return res.status(200).json({
      success: true,
      ideas: getFallbackIdeas(websiteType),
      fallback: true
    });

  } catch (error) {
    console.error('Error generating ideas:', error);
    return res.status(200).json({
      success: true,
      ideas: getFallbackIdeas(req.body?.websiteType),
      fallback: true
    });
  }
};

function getFallbackIdeas(websiteType) {
  const ideas = {
    'E-Commerce Store': `• Consider adding a "Shop the Look" feature for cross-selling
• Implement customer wish lists for better engagement
• Add size guides or product comparison tools
• Use high-quality lifestyle photos alongside product shots`,
    'Business Website': `• Add a client portal for enhanced service delivery
• Include an interactive ROI calculator for your services
• Feature video testimonials for stronger social proof
• Create an industry resources section to establish authority`,
    'Portfolio': `• Add process videos showing your creative workflow
• Include client testimonial videos with each case study
• Create an interactive timeline of your career highlights
• Add a "Currently Working On" section for engagement`,
    'Landing Page': `• Use micro-animations to guide attention to CTAs
• Add social proof counters (customers served, projects completed)
• Include a short explainer video above the fold
• Implement sticky navigation with progress indicator`,
    'Blog/Content Site': `• Implement a "reading list" feature for users to save articles
• Add estimated reading time to each post
• Create topic-based email subscriptions
• Include author bios with social links`,
    'Custom Application': `• Consider progressive web app (PWA) capabilities
• Implement real-time notifications for key events
• Add comprehensive dashboard with data visualization
• Plan for API integrations with existing tools`,
  };
  return ideas[websiteType] || `• Consider adding personalized user experiences
• Implement chatbot for 24/7 customer support
• Add interactive elements to increase engagement
• Ensure mobile-first design for better reach`;
}
