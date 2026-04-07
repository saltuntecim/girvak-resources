exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const notionKey = process.env.NOTION_TOKEN;

  try {
    const { type, payload } = JSON.parse(event.body);

    if (type === 'notion') {
      const response = await fetch(payload.url, {
        method: payload.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${notionKey}`,
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify(payload.body)
      });
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    if (type === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    return { statusCode: 400, body: 'Unknown type' };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
