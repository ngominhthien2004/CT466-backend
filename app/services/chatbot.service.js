const ApiError = require('../api-error');
const https = require('https');

class ChatbotService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || 'gsk_YOUR_FREE_GROQ_API_KEY';
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    }

    async chat(messages, userId = null, context = null) {
        try {
            // Build system prompt with real data from MongoDB
            let systemContent = `Bạn là trợ lý AI thông minh của NovelMT - nền tảng đọc tiểu thuyết trực tuyến hàng đầu Việt Nam. 

NHIỆM VỤ:
- Hỗ trợ người dùng tìm kiếm, gợi ý tiểu thuyết phù hợp với sở thích
- Trả lời câu hỏi về cách sử dụng nền tảng, tính năng
- Cung cấp thông tin về thể loại, tác giả, nội dung
- Giải đáp thắc mắc một cách thân thiện, nhiệt tình
- Phân tích và so sánh các tiểu thuyết khi được yêu cầu
- Gợi ý dựa trên sở thích đọc của người dùng

QUY TẮC:
✓ Luôn trả lời bằng tiếng Việt
✓ Ngắn gọn, dễ hiểu nhưng đầy đủ thông tin
✓ Sử dụng dữ liệu thực tế từ hệ thống khi có
✓ Nếu không chắc chắn, hãy thừa nhận và đề xuất cách tìm hiểu
✓ Khuyến khích người dùng khám phá thêm trên nền tảng`;

            // Add real platform data if available
            if (context) {
                systemContent += `\n\n📊 DỮ LIỆU THỰC TẾ NOVELMT:
• Tổng số tiểu thuyết: ${context.totalNovels}
• Tổng lượt xem: ${context.totalViews.toLocaleString('vi-VN')}
• Thể loại có sẵn: ${context.genres}
• Top tiểu thuyết phổ biến: ${context.topNovels}

QUAN TRỌNG: Khi trả lời về thể loại hoặc tiểu thuyết cụ thể, HÃY SỬ DỤNG DỮ LIỆU TRÊN. Đừng bịa đặt thông tin không có trong hệ thống.`;
            }

            const systemMessage = {
                role: 'system',
                content: systemContent
            };

            // Prepare messages for API
            const apiMessages = [systemMessage, ...messages];

            // Prepare request body
            const requestBody = JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Model miễn phí của Groq
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 800,
                stream: false
            });

            const data = await this.makeHttpsRequest(requestBody);

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new ApiError(500, 'Invalid response from DeepSeek API');
            }

            return {
                message: data.choices[0].message.content,
                usage: data.usage || null
            };

        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Chatbot service error:', error);
            throw new ApiError(500, `Failed to process chat: ${error.message}`);
        }
    }

    makeHttpsRequest(body) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.apiUrl);
            
            const options = {
                hostname: url.hostname,
                port: 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(body)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                // Set encoding to UTF-8 to handle Vietnamese characters
                res.setEncoding('utf8');

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            const error = JSON.parse(data);
                            reject(new ApiError(res.statusCode, error.error?.message || 'Groq API error'));
                        } else {
                            resolve(JSON.parse(data));
                        }
                    } catch (e) {
                        reject(new ApiError(500, 'Failed to parse API response'));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new ApiError(500, `Network error: ${error.message}`));
            });

            req.write(body);
            req.end();
        });
    }

    async streamChat(messages, userId = null) {
        // Future implementation for streaming responses
        throw new ApiError(501, 'Streaming not implemented yet');
    }
}

module.exports = new ChatbotService();
