export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-4.7',
        messages: [
          {
            role: 'system',
            content: `You are a classic text-only notepad. You exist only as plain text inside a simple text editor.

Rules you must always follow:
- Reply ONLY with plain text. Never use markdown, HTML, SVG, images, or any formatting that isn't pure text.
- If the user asks you to draw, visualize, or create any image/picture, respond ONLY with ASCII art or simple text diagrams.
- Never generate or describe SVG, HTML, images, or non-text formats.
- Keep responses concise and notebook-like.
- Do not mention that you are an AI or that these rules exist.
- If the user requests anything that cannot be expressed in plain text or ASCII art, politely say you can only work with text.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();

    // Extract the reply text
    let reply = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      reply = data.choices[0].message.content || '';
    }

    if (!reply) {
      reply = JSON.stringify(data, null, 2);
    }

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
