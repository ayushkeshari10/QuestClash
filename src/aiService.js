export async function breakDownTaskWithAI(taskTitle) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error("Missing Gemini API Key in .env file.");
  }

  const prompt = `Break down the following goal into 3 small, actionable sub-tasks. Return ONLY a valid JSON array of strings, with no markdown formatting, no backticks, and no other text. Goal: "${taskTitle}"`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 }
    })
  });

  if (!response.ok) {
    throw new Error("Failed to reach Google Gemini AI service.");
  }

  const data = await response.json();
  try {
    const rawText = data.candidates[0].content.parts[0].text.trim();
    // Strip markdown codeblocks if the AI hallucinates them despite instructions
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI Output Parse Error:", err);
    throw new Error("AI returned an invalid format. Try again.");
  }
}
