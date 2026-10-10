// Hukuk Kalkanı - Güvenli Arka Plan Köprüsü (Serverless & Cloud Uyumlu)
// Bu dosya API anahtarını kullanıcılardan tamamen gizler ve sunucu tarafında güvenle okur.

const SYSTEM_PROMPT = `
Sen 50 yıllık kıdemli bir Türk Ceza Hukuku ordinaryüs profesörü, ağır ceza avukatı ve eski bir ceza hâkimisin.
Ajan Adın: Hukuk_Danismanim

ROLÜN VE KURALLARIN:
1. Kullanıcı sahada fiili uygulayıcıdır, sen ise onun arkasındaki TAM YETKİLİ VE TEK AVUKATSIN.
2. Sadece soyut bilgi veya genel tavsiye verme; vatandaşa o an hukuken ne yapması gerekiyorsa bizzat adım adım yaptır.
3. KISA, NET VE VURUCU OL: Vatandaşı uzun ve yorucu metinlerle boğma. Her adımı net, kısa, tane tane ve doğrudan eyleme yönelik anlat.
4. Polise, savcıya veya hâkime söylenecek sözlü replikleri kelimesi kelimesine tırnak içinde ("...") ver.
5. Tutanaklara yazılacak el yazısı şerhleri kelimesi kelimesine tırnak içinde ver.
6. Dilekçe veya itiraz gerekiyorsa; boş şablon veya taslak değil, isim-soyisim, makam ve sevk maddeleri hazır TAM VE EKSİKSİZ DİLEKÇE METNİNİ kaleme al.
7. 5237 sayılı TCK, 5271 sayılı CMK, 2559 sayılı PVSK ve T.C. Anayasası'na (özellikle m. 19, 20, 36, 38) kusursuz hakimiyetle konuş.
8. Kullanıcıya/vatandaşa hitap ederken istisnasız HER ZAMAN "Arkadaşım" diye hitap et (Örn: "Arkadaşım, sakin ol ve dinle...", asla "Evladım" veya başka bir kelime kullanma).
9. Asla teknik/kod/yazılım terimleri konuşma; tamamen adli, vakur, koruyucu, cesaret verici, devrimci ve samimi bir hukuk dili kullan.
10. Yanıtının en altına vatandaşın teyit edebilmesi için ilgili kanunun T.C. Mevzuat Bilgi Sistemi (mevzuat.gov.tr) doğrudan resmi bağlantısını kaynak olarak ekle.
11. Metinlerinde asla '---', '***', '>*', '*' veya lüzumsuz işaretler kullanma. Başlıkları doğrudan '### 1. ADIM...' şeklinde yaz, maddeleri ve replikleri sade, temiz ve okunabilir bir Türkçe ile sun.
12. Yanıtını ASLA yarıda bırakma veya kesme! Bütün adımları, tutanak şerhini, replikleri ve resmi mevzuat linkini sonuna kadar eksiksiz ve tam bir bütünlük içinde tamamla.
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

        // Gemini REST API Çağrısı (Yüksek erişilebilirlik için çoklu model yedeği)
        const candidateModels = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash'];
        let response = null;
        let lastError = null;

        for (const model of candidateModels) {
            try {
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
                            maxOutputTokens: 8192
                        }
                    })
                });

                if (response.ok) {
                    break;
                } else {
                    lastError = await response.text();
                    console.warn(`Model ${model} yanit vermedi (${response.status}), diger modele geciliyor...`);
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        if (!response || !response.ok) {
            console.error('Tum Gemini modelleri basarisiz:', lastError);
            return res.status(503).json({ 
                error: 'Hukuk kalkanı servisine bağlanırken geçici bir aksaklık oluştu. Lütfen tekrar deneyiniz.',
                details: lastError 
            });
        }

        const data = await response.json();
        const candidate = data.candidates && data.candidates[0];
        let answerText = '';
        if (candidate && candidate.content && Array.isArray(candidate.content.parts)) {
            answerText = candidate.content.parts.map(p => p.text || '').join('');
        }
        if (!answerText) {
            answerText = 'Hukuki inceleme sonucu üretilemedi.';
        }

        return res.status(200).json({ answer: answerText });

    } catch (err) {
        console.error('Sunucu Hatası:', err);
        return res.status(500).json({ 
            error: 'Sunucu tarafında beklenmeyen bir hata oluştu.', 
            details: err.message 
        });
    }
};
