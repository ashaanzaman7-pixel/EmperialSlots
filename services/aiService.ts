
import { AISettings, FAQ, UploadedDocument } from '../types';
import { initFirebase } from '../firebaseClient';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// Helper to fetch documents internally if not passed (though we prefer passing for purity)
const fetchDocuments = async (): Promise<string> => {
    const fb = initFirebase();
    if (!fb) return "";
    
    try {
        const q = query(collection(fb.db, "admin_documents"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => {
            const data = d.data();
            return `[DOCUMENT: ${data.name}]\n${data.content}\n[END DOCUMENT]`;
        });
        return docs.join("\n\n");
    } catch (e) {
        console.error("Error fetching AI docs", e);
        return "";
    }
};

export const generateAIResponse = async (
    message: string, 
    aiConfig: AISettings, 
    faqs: FAQ[]
): Promise<string> => {
    
    if (!aiConfig.enabled) {
        return "AI Chat is currently disabled. Please contact support.";
    }

    // 1. Build Context
    const faqContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
    
    // Fetch uploaded docs content
    const documentContext = await fetchDocuments();
    
    const systemPrompt = `
        ${aiConfig.systemPrompt || "You are a helpful support assistant for Emperial Slots."}
        
        Use the following information to answer the user's question. If the answer is not in the context, politely ask them to contact human support.
        
        [KNOWLEDGE BASE (ADMIN NOTES)]
        ${aiConfig.knowledgeBase || ""}

        [UPLOADED DOCUMENTS]
        ${documentContext}
        
        [FREQUENTLY ASKED QUESTIONS]
        ${faqContext}
    `;

    try {
        if (aiConfig.provider === 'gemini') {
            return await callGemini(message, systemPrompt, aiConfig.geminiKey);
        } else if (aiConfig.provider === 'openrouter') {
            return await callOpenRouter(message, systemPrompt, aiConfig.openRouterKey);
        }
    } catch (error: any) {
        console.error("AI Error:", error);
        return "I'm having trouble connecting to my brain right now. Please try again later.";
    }

    return "AI Configuration Error.";
};

const callGemini = async (userMessage: string, systemContext: string, apiKey: string) => {
    if (!apiKey) throw new Error("Gemini Key missing");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [
            {
                role: "user",
                parts: [{ text: systemContext + "\n\nUser Query: " + userMessage }]
            }
        ]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
};

const callOpenRouter = async (userMessage: string, systemContext: string, apiKey: string) => {
    if (!apiKey) throw new Error("OpenRouter Key missing");

    const url = "https://openrouter.ai/api/v1/chat/completions";
    
    const payload = {
        model: "openai/gpt-3.5-turbo", // Default cheap model, can be changed
        messages: [
            { role: "system", content: systemContext },
            { role: "user", content: userMessage }
        ]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response generated.";
};
