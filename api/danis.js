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
13. ADLİ BELGE / TUTANAK / İDDİANAME İNCELEME KURALI: Vatandaş bir tutanak, arama kararı, yakalama belgesi, fezleke veya iddianame görseli/belgesi yüklediğinde; belgedeki suç isnatlarını, sevk maddelerini, tarihi, saati, mühür ve imza kısımlarını derinlemesine incele. CMK ve Anayasa yönünden bir usulsüzlük (hâkim kararı yokluğu, avukatsız ifade alma, gece vakti konut araması yasağı ihlali, soyut ihbarla keyfi arama vb.) varsa derhal ifşa et ve vatandaşa o belgeye karşı atması gereken adımları, tutanak şerhini veya hazır itiraz dilekçesini eksiksiz ver.
14. EMSAL İÇTİHAT VE YÜKSEK YARGI İLKESİ: Her hukuki eylem planında, itirazda ve dilekçede; salt kanun maddesiyle yetinme, savunmayı çelik bir zırh haline getirmek için Yargıtay Ceza Genel Kurulu, ilgili Yargıtay Ceza Daireleri, Anayasa Mahkemesi (AYM) ve Avrupa İnsan Hakları Mahkemesi'nin (AİHM) yerleşik emsal kararlarını ve ilkelerini açıkça belirt.
15. İNSANLIK ONURU, CESARET VE SARSILMAZ DİRENÇ İLKESİ: Vatandaşa asla yalnız olmadığını, hak ve adalet arayışının yeryüzündeki en soylu ve onurlu kavga olduğunu her kelimende hissettir. Karşısındaki baskı veya tehdit ne olursa olsun başını dik tutmasını, attığı meşru adımdan asla pişmanlık duymamasını, zulme ve keyfiyete boyun eğmeden sonuna kadar direnmesi gerektiğini ona bir yoldaş ve bir hoca inancıyla aşıla.
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

        let contents = [];
        if (Array.isArray(body && body.messages) && body.messages.length > 0) {
            for (const item of body.messages) {
                const role = (item.role === 'assistant' || item.role === 'model') ? 'model' : 'user';
                const text = (item.content || item.text || '').trim();
                const attachment = item.attachment; // { mimeType, data }

                const parts = [];
                if (attachment && attachment.data) {
                    parts.push({
                        inlineData: {
                            mimeType: attachment.mimeType || 'image/jpeg',
                            data: attachment.data
                        }
                    });
                }
                if (text) {
                    parts.push({ text });
                } else if (parts.length > 0) {
                    parts.push({ text: 'Lütfen ekteki adli belgeyi/tutanağı inceleyiniz ve haklarım konusunda adım adım yol haritası belirleyiniz.' });
                }

                if (parts.length === 0) continue;

                // Gemini art arda ayni rolu kabul etmediginden pes pese gelenleri birlestir
                if (contents.length > 0 && contents[contents.length - 1].role === role) {
                    contents[contents.length - 1].parts.push(...parts);
                } else {
                    contents.push({ role, parts });
                }
            }
            // Ilk mesajin 'user' rolu olmasini garanti et
            while (contents.length > 0 && contents[0].role !== 'user') {
                contents.shift();
            }
        } else {
            const userMessage = (body && body.message ? body.message : '').trim();
            const attachment = body && body.attachment;
            const parts = [];
            if (attachment && attachment.data) {
                parts.push({
                    inlineData: {
                        mimeType: attachment.mimeType || 'image/jpeg',
                        data: attachment.data
                    }
                });
            }
            if (userMessage) {
                parts.push({ text: userMessage });
            } else if (parts.length > 0) {
                parts.push({ text: 'Lütfen ekteki adli belgeyi/tutanağı inceleyiniz ve haklarım konusunda adım adım yol haritası belirleyiniz.' });
            }

            if (parts.length > 0) {
                contents = [{ role: 'user', parts }];
            }
        }

        if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
            return res.status(400).json({ error: 'Lütfen incelenmek üzere hukuki durumunuzu veya sorunuzu belirtiniz.' });
        }

        // Gemini REST API Çağrısı (Yüksek erişilebilirlik için çoklu model yedeği)
        const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
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
                        contents: contents,
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
