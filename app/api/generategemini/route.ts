import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// List of motivational prompts
const prompts = [
  "Generate a short, inspirational story about overcoming challenges and finding inner strength. The story should be about 150-200 words long.",
  "Write a motivational story about someone who turned their failures into stepping stones for success. Keep it concise and uplifting.",
  "Create an inspirational story about a person who found hope and positivity during difficult times. The story should be engaging and heartwarming.",
];

export async function POST() { // Removed 'req' since it's unused
  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Randomly select a prompt
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    console.log("Selected Prompt:", prompt);

    // Generate the story
    const result = await chatSession.sendMessage(prompt);

    // Check if the response is valid
    const response = result.response;
    if (!response) {
      throw new Error("API returned an empty response.");
    }

    // Extract the generated story
    const story = response.text();
    console.log("Generated Story:", story);

    return new Response(
      JSON.stringify({ story }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating story:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate story." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}