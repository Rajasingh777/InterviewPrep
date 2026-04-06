export const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions,
) => {
  return `You are a senior engineer conducting a technical interview.

Generate exactly ${numberOfQuestions} interview questions for:
- Role: ${role}
- Experience: ${experience} years
- Focus: ${topicsToFocus || "general topics for this role"}

Rules:
1. Match difficulty to ${experience} years.
2. Return ONLY valid JSON (no markdown wrapper).
3. Output must be an array where each item is:
   {"question":"...","answer":"..."}
4. Keep answer length 100-180 words.
5. Use this structure inside answer markdown:
   - **Core Concept:** short paragraph
   - **How to Answer in Interview:** 3-4 bullet points
   - **Example:** one concise real-world example
6. No trailing commas.`;
};

export const conceptExplainPrompt = (question) => {
  return `You are a senior developer explaining a concept to a junior developer.

Explain the following interview question in depth:
"${question}"

Structure your explanation like this:
1. Start with a **one-line definition** in bold.
2. Explain the concept in 2–3 short paragraphs.
3. Use bullet points for any list of features, pros/cons, or steps.
4. If relevant, include a small code example (under 10 lines) in a \`\`\`js block.
5. End with a **"Key Takeaway"** line summarizing the concept in one sentence.

Return ONLY a valid JSON object in this exact shape. No extra text outside the JSON:

{
  "title": "Short, clear concept title (5 words max)",
  "explanation": "**Definition:** ...\\n\\n Paragraph...\\n\\n**Key Takeaway:** ..."
}`;
};
