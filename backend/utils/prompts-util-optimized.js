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
2. The "answer" must be concise but comprehensive (200-300 words) with key technical details.
3. Write answer in structured markdown with this efficient structure:
   - **Core Concept:** (1-2 focused paragraphs explaining the fundamental theory)
   - **Key Technical Details:** (2-3 paragraphs covering important aspects and implementation)
   - **How to Answer in Interview:** (4-6 bullet points covering main scenarios)
   - **Real-World Example:** (1 practical example with brief code snippet)
   - **Common Pitfalls:** (2-3 bullet points with solutions)
4. Include concise code examples using markdown code blocks.
5. Use appropriate technical terminology for ${experience} years experience.
6. Focus on interview-relevant information for quick study.

Return ONLY a valid JSON array. No extra text, no markdown wrapper around the JSON.

[
  {
    "question": "What is the difference between var, let, and const in JavaScript?",
    "answer": "**Core Concept:**\\nVar, let, and const are variable declaration keywords in JavaScript with different scoping rules. Var is function-scoped and can be redeclared, let is block-scoped and cannot be redeclared in the same scope, while const creates block-scoped constants that cannot be reassigned.\\n\\n**Key Technical Details:**\\nVariables declared with var are hoisted to the top of their function scope, while let and const are hoisted but not initialized. This means var variables can be accessed before declaration (returning undefined), but let/const throw ReferenceError. Const prevents reassignment but allows mutation of objects and arrays.\\n\\n**How to Answer in Interview:**\\n- Explain scoping differences (function vs block scope)\\n- Discuss hoisting behavior and temporal dead zone\\n- Cover reassignment and redeclaration rules\\n- Mention best practices for each keyword\\n\\n**Real-World Example:**\\n\`\`\`javascript\\nfunction example() {\\n  if (true) {\\n    var x = 1; // function scope\\n    let y = 2; // block scope\\n    const z = 3; // block scope constant\\n  }\\n  console.log(x); // 1\\n  console.log(y); // ReferenceError\\n}\\n\`\`\`\\n\\n**Common Pitfalls:**\\n- Using var in modern code due to scoping issues\\n- Attempting to reassign const variables\\n- Accessing let/const before declaration"
  }
]`;
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
