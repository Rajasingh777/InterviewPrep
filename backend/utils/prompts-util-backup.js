export const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions,
) => {
  return `You are a senior engineer conducting a technical interview.

Generate exactly ${numberOfQuestions} interview questions for the following profile:
- Role: ${role}
- Experience: ${experience} years
- Topics to focus on: ${topicsToFocus || "general topics for this role"}

Rules for each question:
1. Keep difficulty aligned with ${experience} years of experience.
2. The "answer" must be very comprehensive (500-600 words) with deep technical details.
3. Write answer in detailed markdown with this expanded structure:
   - **Core Concept:** (2-3 detailed paragraphs explaining the fundamental theory)
   - **Technical Deep Dive:** (3-4 paragraphs covering advanced aspects, edge cases, and implementation details)
   - **How to Answer in Interview:** (6-8 detailed bullet points covering different scenarios)
   - **Real-World Example:** (2-3 detailed examples with code snippets where applicable)
   - **Common Mistakes & Best Practices:** (4-6 bullet points with detailed explanations)
   - **Follow-up Questions to Prepare:** (3-4 potential interviewer follow-ups)
4. Include practical code examples using proper markdown code blocks.
5. Use technical terminology appropriately for ${experience} years experience.
6. Make answers comprehensive enough to serve as complete study material.

Return ONLY a valid JSON array. No extra text, no markdown wrapper around the JSON.

[
  {
    "question": "...",
    "answer": "**Core Concept:** ...\\n\\n**Technical Deep Dive:** ...\\n\\n**How to Answer in Interview:**\\n- ...\\n- ...\\n\\n**Real-World Example:** ...\\n\\n**Common Mistakes & Best Practices:**\\n- ...\\n\\n**Follow-up Questions to Prepare:**\\n- ..."
  }
]`;
};

export const conceptExplainPrompt = (question) => {
  return `You are a senior developer explaining a concept to a junior developer.

Explain the following interview question in depth:
"${question}"

Structure your explanation like this:
1. Start with a **one-line definition** in bold.
2. Explain the concept in 2-3 short paragraphs.
3. Use bullet points for any list of features, pros/cons, or steps.
4. If relevant, include a small code example (under 10 lines) in a \`\`\`js block.
5. End with a **"Key Takeaway"** line summarizing the concept in one sentence.

Return ONLY a valid JSON object in this exact shape. No extra text outside the JSON:

{
  "title": "Short, clear concept title (5 words max)",
  "explanation": "**Definition:** ...\\n\\n Paragraph...\\n\\n**Key Takeaway:** ..."
}`;
};
