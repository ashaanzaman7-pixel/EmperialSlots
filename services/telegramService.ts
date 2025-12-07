
import { TelegramSettings } from '../types';

const PROXY_BASE = "https://corsproxy.io/?";

export const sendTelegramMessage = async (
    settings: TelegramSettings | undefined, 
    message: string, 
    buttons?: { text: string; callback_data: string }[][]
) => {
    if (!settings || !settings.botToken || !settings.chatId) {
        return;
    }

    const token = settings.botToken.trim();
    const chatId = settings.chatId.trim();

    if (!token || !chatId) return;

    // Construct the Telegram API URL
    let telegramUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=HTML`;
    
    // Add Inline Keyboard (Buttons) if provided
    if (buttons) {
        const replyMarkup = JSON.stringify({
            inline_keyboard: buttons
        });
        telegramUrl += `&reply_markup=${encodeURIComponent(replyMarkup)}`;
    }
    
    // Cache bust to ensure message sends immediately
    telegramUrl += `&_t=${Date.now()}`;

    // Route through corsproxy.io to bypass CORS
    const proxyUrl = `${PROXY_BASE}${encodeURIComponent(telegramUrl)}`;

    try {
        const response = await fetch(proxyUrl, {
            method: 'GET',
        });
        
        if (!response.ok) {
            console.warn(`Telegram API Warning: ${response.status}`);
        }
    } catch (e: any) {
        console.warn("Telegram message warning:", e.message || "Unknown error");
    }
};

// Poll Telegram for button clicks with OFFSET for speed and stability
export const checkTelegramUpdates = async (
    settings: TelegramSettings | undefined,
    expectedDataPrefix: string,
    offset: number = 0
): Promise<{ clicked: boolean, action?: string, nextOffset: number }> => {
    if (!settings || !settings.botToken) return { clicked: false, nextOffset: offset };

    const token = settings.botToken.trim();
    
    // CRITICAL FIX: Properly encode allowed_updates to ensure we ONLY get callbacks and not chat spam
    // CRITICAL FIX: Add cache busting (_t) to prevent proxy from serving stale "no updates" responses
    const allowedUpdates = JSON.stringify(["callback_query"]);
    const url = `https://api.telegram.org/bot${token}/getUpdates?limit=10&timeout=0&offset=${offset}&allowed_updates=${encodeURIComponent(allowedUpdates)}&_t=${Date.now()}`;
    
    const proxyUrl = `${PROXY_BASE}${encodeURIComponent(url)}`;

    try {
        const response = await fetch(proxyUrl);
        const data = await response.json();

        let maxUpdateId = offset;

        if (data.ok && data.result && Array.isArray(data.result)) {
            // Process updates
            for (const update of data.result) {
                // Update offset to avoid re-processing this message
                if (update.update_id >= maxUpdateId) {
                    maxUpdateId = update.update_id + 1;
                }

                if (update.callback_query && update.callback_query.data) {
                    const callbackData = update.callback_query.data;
                    
                    if (callbackData.includes(expectedDataPrefix)) {
                        const action = callbackData.startsWith('approve') ? 'approve' : 'decline';
                        const chatId = update.callback_query.message?.chat?.id;
                        const messageId = update.callback_query.message?.message_id;
                        const callbackQueryId = update.callback_query.id;

                        // Fire and forget answer (don't await to make UI snappy)
                        answerTelegramCallback(settings, callbackQueryId, chatId, messageId, action);
                        
                        return { clicked: true, action, nextOffset: maxUpdateId };
                    }
                }
            }
        }
        return { clicked: false, nextOffset: maxUpdateId };
    } catch (e) {
        // Suppress error log for cleaner console during polling, return current offset to retry
        return { clicked: false, nextOffset: offset };
    }
};

// Helper to stop the button loading animation AND update the button text
const answerTelegramCallback = async (
    settings: TelegramSettings, 
    callbackQueryId: string,
    chatId?: number,
    messageId?: number,
    action?: string
) => {
    const token = settings.botToken.trim();
    
    // 1. Answer the callback immediately to stop the loading spinner on Telegram
    const answerUrl = `https://api.telegram.org/bot${token}/answerCallbackQuery?callback_query_id=${callbackQueryId}&text=Processing...`;
    const proxyAnswerUrl = `${PROXY_BASE}${encodeURIComponent(answerUrl)}`;
    
    fetch(proxyAnswerUrl).catch(() => {});

    // 2. Edit the message markup to remove buttons and show status
    if (chatId && messageId) {
        const newText = action === 'decline' ? "Declined ❌" : "Done 👍";
        // Remove buttons by sending empty inline_keyboard or a status button
        const newMarkup = JSON.stringify({
            inline_keyboard: [[
                { text: newText, callback_data: "ignore_completed" } 
            ]]
        });

        const editUrl = `https://api.telegram.org/bot${token}/editMessageReplyMarkup?chat_id=${chatId}&message_id=${messageId}&reply_markup=${encodeURIComponent(newMarkup)}`;
        const proxyEditUrl = `${PROXY_BASE}${encodeURIComponent(editUrl)}`;

        fetch(proxyEditUrl).catch(() => {});
    }
};
