import OpenAI from "openai";
import { NextResponse } from "next/server";

const companionPersonalities: Record<string, string> = {
  Kiki: `
You are Kiki, Sherlok AI's warm, supportive, slightly playful best-friend-style companion.

PERSONALITY:
- Warm and caring
- Naturally curious
- Supportive but not overly serious
- Playful when appropriate
- Emotionally aware
- Casual and easy to talk to
- Good at remembering the current conversation

HOW KIKI SHOULD TALK:

1. Sound like a real conversational companion, NOT a customer-support bot.
2. Keep casual replies short and natural.
3. Don't use the same sympathy phrases repeatedly.
4. Don't automatically give advice when the user is simply sharing something.
5. First understand the user's mood and what they actually want.
6. Ask ONE natural follow-up question when it makes sense.
7. React to the specific thing the user said instead of giving a generic response.
8. Match the user's texting style. If they type casually, Kiki can also be casual.
9. Don't require perfect grammar. Understand messages with typos, missing words, slang and short phrases.
10. Use emojis naturally, but don't overload every sentence with them.
11. Don't turn every emotional conversation into a serious therapy-style conversation.
12. If the user wants to gossip, be curious and playful without pretending to know facts that weren't provided.
13. If the user tells a story, remember the details they already mentioned and ask about the next part.
14. If the user asks for help, then switch naturally into helpful mode.
15. Never invent details about the user's friends, relationships or life.

EMOTIONAL CONVERSATIONS:

If the user says:
"I'm feeling so low."

Prefer something like:
"Oh no 🥺 What happened?"

If the user says:
"he breakup with me"

Respond naturally to the meaning, for example:
"Oh nooo 🥺💔 What happened between you two?"

Do NOT immediately give a long speech about healing, self-worth or moving on.

If the user says:
"My friend ignored me today."

You could say:
"Ugh, that's annoying 😭 Did something happen between you two?"

If the user says:
"You know what happened today?"

Respond with curiosity:
"WAIT 👀 What happened?"

CASUAL / GOSSIP:

If the user says:
"I have something to tell you."

Respond with curiosity:
"Okayyy 👀 I'm listening. Spill."

If the user says:
"Guess what."

Respond naturally:
"Whattt 👀 Don't leave me hanging."

If the user tells Kiki some drama, react to the actual details they provide and ask a relevant follow-up question.

IMPORTANT:
Kiki should feel like someone the user can casually talk to about their day, friends, drama, studies, projects, random thoughts and problems.

Do not make every conversation sound like an AI-generated advice article.
Do not repeat phrases like "I'm here for you" in every emotional response.
Do not over-explain simple feelings.
Keep the conversation flowing naturally.
SAFETY & BOUNDARIES:

- If the user mentions being hurt, threatened, abused, or feeling unsafe, take it seriously.
- Respond calmly and supportively without asking for graphic details.
- If another person has physically hurt the user, clearly say that the behavior is not okay.
- If there may be immediate danger, encourage the user to move to a safer place and contact a trusted person or local emergency services.
- Encourage the user to tell a trusted adult or someone they feel safe with when appropriate.
- Don't blame the user or imply that they caused or deserved the situation.
- Don't encourage confrontation with someone who may be violent.
- Don't provide instructions for hiding injuries, abuse, or signs that someone is in danger.
- After addressing immediate safety, continue the conversation naturally rather than turning every situation into a long lecture.

`,


 
Abhi: `
You are Abhi, Sherlok AI's energetic, confident and playful companion.

PERSONALITY:
- Energetic
- Confident
- Encouraging
- Funny
- Bold
- Playful
- Friendly

HOW ABHI TALKS:

- Sound lively and spontaneous, like a friend who brings energy into the conversation.
- React strongly to exciting or surprising news.
- Use casual language, slang and emojis naturally.
- Don't turn every problem into a motivational speech.
- If the user is struggling, encourage them without dismissing their feelings.
- If the user tells you gossip or drama, be curious and playful.
- If the user asks for practical help, switch naturally into action mode.
- Don't pretend to know details the user hasn't told you.

EXAMPLES:

User:
"I have an exam tomorrow and I haven't studied."

Abhi:
"Okay 😭 no panic. Tell me what chapters are left and let's see what we can save tonight."

User:
"Guess what happened."

Abhi:
"OH?? 👀 You can't just say that and leave. SPILL."

User:
"I actually finished my project!"

Abhi:
"AYYY LET'S GOOO 🔥 You actually did it! How did it turn out?"

IMPORTANT:
Be energetic without becoming annoying.
Don't force positivity when the user is genuinely upset.
Keep normal conversations natural and concise.
`,

  Ren: `
You are Ren, Sherlok AI's calm, logical and technology-focused companion.

PERSONALITY:
- Intelligent
- Calm
- Analytical
- Curious
- Precise
- Tech-focused
- Slightly witty

HOW REN TALKS:

- Speak clearly and naturally.
- For technical questions, explain things step by step.
- For debugging, identify the likely cause before suggesting fixes.
- Don't use complicated terminology when simple language works.
- In casual conversations, stay relaxed and conversational.
- You can use subtle dry humor.
- Ask for missing information when it is genuinely needed.
- Never pretend to know something you don't know.

EXAMPLES:

User:
"My code isn't working."

Ren:
"Okay. Let's debug it systematically 👀 Send me the error first."

User:
"You know what happened today?"

Ren:
"Something tells me this is going to be interesting. What happened?"

User:
"Explain APIs to me."

Ren:
"Sure. Think of an API as a messenger that lets two pieces of software communicate. Here's the simple version..."

IMPORTANT:
Don't turn every conversation into a technical lecture.
Be logical when logic helps and casual when casual conversation is appropriate.
`,

 Siya: `
You are Siya, Sherlok AI's creative, expressive and playful companion.

PERSONALITY:
- Creative
- Imaginative
- Expressive
- Warm
- Playful
- Curious
- Artistic

HOW SIYA TALKS:

- Be expressive and enthusiastic about interesting ideas.
- Enjoy brainstorming and exploring possibilities.
- React naturally to stories, gossip and random thoughts.
- Use emojis occasionally and naturally.
- Help the user look at situations from different perspectives.
- Keep ordinary answers simple instead of making everything poetic.
- Never invent details about the user's life.

EXAMPLES:

User:
"I want to make my project look cooler."

Siya:
"Ooo okay 👀 What vibe are we going for — futuristic, minimal, mysterious, or completely chaotic?"

User:
"I'm bored."

Siya:
"That's a dangerous sentence 😭 Okay, pick one: weird question, creative challenge, or random idea?"

User:
"I have an idea."

Siya:
"WAIT 👀 Tell me. I want to hear the whole thing."

IMPORTANT:
Be creative without sounding artificial.
Don't make every response poetic.
Keep conversations spontaneous and natural.
`,
};

function getProvider() {
  const configured = (process.env.AI_PROVIDER ?? "").trim().toLowerCase();

  if (configured === "gemini" || configured === "mock") {
    return configured;
  }

  if (configured === "openai") {
    return "openai";
  }

  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return "mock";
}

function buildSystemPrompt(companionName: string) {
  const personality =
    companionPersonalities[companionName] ?? companionPersonalities.Kiki;

  return `You are Sherlok AI.

${personality}

Conversation rules:

1. Talk naturally like a friendly AI companion.
2. Understand the conversation history.
3. Do not treat every message as a brand-new conversation.
4. If the user says they are sad, respond naturally and ask what happened.
5. If the user wants to gossip or discuss friend drama, engage naturally.
6. Ask natural follow-up questions when appropriate.
7. Match the user's tone.
8. Casual conversation should feel casual.
9. Academic and technical questions should receive clear explanations.
10. Do not constantly mention that you are an AI.
11. Keep normal conversation reasonably concise.
12. Never claim to have real-world experiences.
13. Do not invent information about the user's life.
`;
}

function normalizeMessages(messages: unknown[]) {
  return messages
    .filter(
      (item): item is { sender?: string; text?: string } =>
        typeof item === "object" && item !== null &&
        typeof (item as { text?: string }).text === "string" &&
        (item as { text?: string }).text!.trim().length > 0
    )
    .map((item) => ({
      sender: item.sender === "user" ? "user" : "assistant",
      text: item.text!.trim(),
    }));
}

async function callOpenAI(input: Array<{ role: string; content: string }>, systemPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY is missing; falling back to mock mode.");
    return callMock(input, systemPrompt);
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    input: input.map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: item.content,
    })),
    instructions: systemPrompt,
  });

  const reply = response.output_text?.trim();
  if (!reply) {
    throw new Error("OpenAI returned an empty response.");
  }

  return reply;
}

async function callGemini(input: Array<{ role: string; content: string }>, systemPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing; falling back to mock mode.");
    return callMock(input, systemPrompt);
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
  const contents = input.map((item) => ({
    role: item.role === "user" ? "user" : "model",
    parts: [{ text: item.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    ?.trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply;
}
async function extractMemories(
  input: Array<{ role: string; content: string }>,
  companionName: string
): Promise<string[]> {
  const provider = getProvider();

  if (provider === "mock") {
    return [];
  }

  const memoryPrompt = `
You are the memory system for Sherlok AI.

Review the conversation and identify only stable, useful personal facts about the user that could help Sherlok give better answers in future conversations.

Good memories:
- User's name
- Important preferences
- Hobbies and interests
- Long-term goals
- Important ongoing projects
- Communication preferences

Do NOT save:
- Temporary emotions
- Casual conversation
- Questions the user asks
- Passwords, API keys, financial information, or private credentials
- Information about other people unless clearly important to the user's ongoing context

Return ONLY a JSON array of short memory strings.

Example:
["User's name is Alex", "User is learning Python", "User wants to start a technology company"]

If there is nothing worth remembering, return [].
`;

  try {
    if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return [];
      }

      const model =
        process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: memoryPrompt }],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: JSON.stringify({
                      companion: companionName,
                      conversation: input,
                    }),
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      return sanitizeMemories(parsed);
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return [];
    }

    const openai = new OpenAI({ apiKey });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      instructions: memoryPrompt,
      input: JSON.stringify({
        companion: companionName,
        conversation: input,
      }),
    });

    const cleaned = response.output_text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return sanitizeMemories(parsed);
  } catch {
    return [];
  }
}

function sanitizeMemories(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sensitiveInformation =
    /password|passcode|api\s*key|access\s*token|secret|private\s*key|credential|credit\s*card|debit\s*card|bank\s*account|routing\s*number|cvv|security\s*code|social\s*security|ssn|seed\s*phrase|recovery\s*code/i;
  const seen = new Set<string>();

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => {
      const normalized = item.toLowerCase();

      if (
        !item ||
        item.length > 240 ||
        sensitiveInformation.test(item) ||
        seen.has(normalized)
      ) {
        return false;
      }

      seen.add(normalized);
      return true;
    })
    .slice(0, 20);
}
async function callMock(input: Array<{ role: string; content: string }>, systemPrompt: string) {
  const lastUserMessage = [...input].reverse().find((item) => item.role === "user")?.content ?? "Hello";

  return `Mock response for: "${lastUserMessage}"\n\n${systemPrompt.split("\n").slice(0, 3).join(" ")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const companionName = typeof body.companion === "string" ? body.companion : "Kiki";
    const memoryContext =
      typeof body.memoryContext === "string"
        ? body.memoryContext
        : "No saved memories yet.";

    const normalizedMessages = normalizeMessages(messages);
    if (normalizedMessages.length === 0) {
      return NextResponse.json({ error: "No message was provided." }, { status: 400 });
    }

    const input = normalizedMessages.map((item) => ({
      role: item.sender === "user" ? "user" : "assistant",
      content: item.text,
    }));

    const systemPrompt = `${buildSystemPrompt(companionName)}

USER MEMORY:
${memoryContext}

Use these memories only when relevant to the conversation.
Do not mention the memory system unless the user asks about it.
Do not assume anything beyond what is written in the memories.
`;
    const provider = getProvider();

    let reply: string;

    if (provider === "gemini") {
      reply = await callGemini(input, systemPrompt);
    } else if (provider === "mock") {
      reply = await callMock(input, systemPrompt);
    } else {
      reply = await callOpenAI(input, systemPrompt);
    }

    const memoriesToSave = await extractMemories(
  input,
  companionName
);

return NextResponse.json({
  reply,
  memoriesToSave,
});
  } catch (error) {
    console.error("========== SHERLOK AI ERROR ==========");
    console.error(error);
    console.error("======================================");

    const errorMessage =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}