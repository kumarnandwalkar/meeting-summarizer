import Groq from 'groq-sdk';

const providers = {
  groq: async ({ transcript, instruction, model }) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const system = `You are an assistant that rewrites meeting notes according to user instructions. Output clean Markdown.`;
    const user = `Instruction:\n${instruction}\n\nTranscript:\n${transcript}`;
    const resp = await groq.chat.completions.create({
      model: model || process.env.GROQ_MODEL || 'llama3-70b-8192',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.2,
    });
    const summary = resp.choices?.[0]?.message?.content?.trim() || '';
    return { summary, usage: {} };
  },
};

export async function generateSummary({ transcript, instruction }) {
  const providerName = process.env.AI_PROVIDER || 'groq';
  const fn = providers[providerName];
  if (!fn) throw new Error(`Unknown AI_PROVIDER ${providerName}`);
  return fn({ transcript, instruction });
}
