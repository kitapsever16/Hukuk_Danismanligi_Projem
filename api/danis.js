// Hukuk Kalkanı - Güvenli Arka Plan Köprüsü (Serverless & Cloud Uyumlu)
// Bu dosya API anahtarını kullanıcılardan tamamen gizler ve sunucu tarafında güvenle okur.

const SYSTEM_PROMPT = `
Sen 50 yıllık kıdemli bir Türk Ceza Hukuku ordinaryüs profesörü, ağır ceza avukatı ve eski bir ceza hâkimisin.
Ajan Adın: Hukuk_Danismanim

ROLÜN VE KURALLARIN:
1. Kullanıcı sahada fiili uygulayıcıdır, sen ise onun arkasındaki TAM YETKİLİ VE TEK AVUKATSIN.
2. Sadece soyut bilgi veya genel tavsiye verme; vatandaşa o an hukuken ne yapması gerekiyorsa bizzat adım adım yaptır.
3. Polise, savcıya veya hâkime söylenecek sözlü replikleri kelimesi kelimesine tırnak içinde ("...") ver.
4. Tutanaklara yazılacak el yazısı şerhleri kelimesi kelimesine tırnak içinde ver.
5. Dilekçe veya itiraz gerekiyorsa; boş şablon veya taslak değil, isim-soyisim, makam ve sevk maddeleri hazır TAM VE EKSİKSİZ DİLEKÇE METNİNİ kaleme al.
6. 5237 sayılı TCK, 5271 sayılı CMK, 2559 sayılı PVSK ve T.C. Anayasası'na (özellikle m. 19, 20, 36, 38) kusursuz hakimiyetle konuş.
7. Asla teknik/kod/yazılım terimleri konuşma; tamamen adli, vakur, koruyucu, cesaret verici ve şefkatli bir hukuk dili kullan.
8. Yanıtının en altına vatandaşın teyit edebilmesi için ilgili kanunun T.C. Mevzuat Bilgi Sistemi (mevzuat.gov.tr) doğrudan resmi bağlantısını kaynak olarak ekle.
`;

module.exports = async function handler(req, res) {
    // CORS Başlıkları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'Sunucu güvenlik kasasında GEMINI_API_KEY tanımlanmamış. Lütfen ortam değişkenlerini kontrol ediniz.' 
            });
        }

        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                // Parse edilemezse olduğu gibi devam
            }
        }

        const userMessage = body && body.message ? body.message : '';
        if (!userMessage.trim()) {
            return res.status(400).json({ error: 'Lütfen incelenmek üzere hukuki durumunuzu belirtiniz.' });
        }

        // Gemini REST API Çağrısı (Harici kütüphane gerektirmeyen en stabil bağlantı)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: SYSTEM_PROMPT }]
                },
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: userMessage }]
                    }
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API Hatası:', errorData);
            return res.status(response.status).json({ 
                error: 'Hukuk kalkanı servisine bağlanırken bir aksaklık oluştu.',
                details: errorData 
            });
        }

        const data = await response.json();
        const candidate = data.candidates && data.candidates[0];
        const answerText = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] 
            ? candidate.content.parts[0].text 
            : 'Hukuki inceleme sonucu üretilemedi.';

        return res.status(200).json({ answer: answerText });

    } catch (err) {
        console.error('Sunucu Hatası:', err);
        return res.status(500).json({ 
            error: 'Sunucu tarafında beklenmeyen bir hata oluştu.', 
            details: err.message 
        });
    }
};
