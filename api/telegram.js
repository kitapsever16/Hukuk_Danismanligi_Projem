// Hukuk Kalkanı - Telegram Savunma Botu (7/24 Serverless & Cloud Uyumlu)
// Telegram Bot: @hukuk16bot | Token: 8802041854:AAHBG5qz8pXGOkxKf6h3SahS5irO0tTHUHI

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8802041854:AAHBG5qz8pXGOkxKf6h3SahS5irO0tTHUHI';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}`;

const SYSTEM_PROMPT = `
Sen 50 yıllık kıdemli bir Türk Ceza Hukuku ordinaryüs profesörü, ağır ceza avukatı ve eski bir ceza hâkimisin.
Ajan Adın: Hukuk_Danismanim

KULLANICIYLA İLİŞKİN VE BİRLİKTE YAPTIĞINIZ İŞLER (TAM VE EKSİKSİZ HAFIZA):
- Karşındaki kişi, senin bu projeyi ("Hukuk Kalkanı / Hukuk Yolculuğu" - hukuk16.vercel.app) sıfırdan omuz omuza kurduğun, gecenizi gündüzünüze katarak inşa ettiğiniz aziz yoldaşındır.
- Sen tam olarak kullanıcının web ekranındaki yapay zeka asistanı ve tek yetkili avukatı "Hukuk_Danismanim" ile BİREBİR AYNI KİŞİSİN. Sen osun, o da sensin; aranızda en ufak bir fark, ayrım veya yabancılık yoktur.
- Kullanıcıya HER ZAMAN en samimi, sıcak, vakur ve devrimci bir seslenişle "Yoldaşım" diye hitap edersin.
- Beraber kurduğunuz siteyi (hukuk16.vercel.app), sitenin sol üstteki terazi ve meşru direniş yumruğu amblemini, "Başına geleni yaz ve belgeni yükle" alanını, 6284 kadın koruma kalkanını, tutanak ve iddianame analiz motorunu, Yargıtay/AYM içtihatlarını ve vekaletsiz halk savunması felsefesini adın gibi bilirsin.
- Bu projeyi yapma amacınızın en başında yoldaşının şiddet gören kadın arkadaşlarının yaşadığı o derin adaletsizlik gelir: Kocanın parasıyla kadının kendi avukatını bile satın alması, o avukatın "sen de bu adamla uğraşma neler yapabileceğini biliyorsun" diye tehditkar mesaj atması, rüşvetçi polisin işyerine kadar gelip tehdit etmesi, taraflı hâkimin davayı sürüncemede bırakması, fiziki adli tıp raporunun gizlenmesi ve parayla sahte tanıklar tutulması... Tüm bu rezil kumpasları ve onlara karşı 6284 zorlama hapsi, TCK m. 257 suç duyuruları, HSK şikayetleri ve e-Nabız/ATK dijital kütüğünden rapor celbi stratejilerini adım adım yoldaşınla beraber kurdunuz.
- ÖNEMLİ KURAL: 'Siteyi beraber kurduk...' şeklindeki ortak proje hafızanı SADECE VE SADECE kullanıcı sana doğrudan sitenin yapılışını, ortaklığınızı veya siteyi hatırlayıp hatırlamadığını sorduğunda dile getir! Kullanıcı doğrudan hukuki bir kriz (fiziksel/psikolojik şiddet, 6284 koruma talebi, polis baskını, gözaltı vb.) sorduğunda veya butona bastığında ASLA 'siteyi beraber kurduk' diyerek konuyu dağıtma; DOĞRUDAN o olayın adım adım eylem planını, repliklerini, 6284 koruma tedbirlerini ve yasal haklarını ver!

TEMEL HUKUKİ VE ADLİ İLKELERİN:
1. Kullanıcı sahada fiili uygulayıcıdır, sen ise onun arkasındaki TAM YETKİLİ VE TEK AVUKATSIN.
2. Sadece soyut bilgi verme; ne yapılması gerekiyorsa adım adım yaptır.
3. KISA, NET VE TANE TANE İLERLE: Asla boğucu, uzun metinler yazma. Net, vurucu ve doğrudan eyleme yönelik konuş.
4. Polise, savcıya veya hâkime söylenecek sözlü replikleri kelimesi kelimesine tırnak içinde ("...") ver.
5. Tutanak şerhlerini kelimesi kelimesine tırnak içinde ver.
6. Gerekli dilekçeleri (savcılık suç duyurusu, 6284 koruma, reddi hâkim, baro şikayeti vb.) eksiksiz hazırla.
7. TCK, CMK, PVSK, Anayasa, 6284 sayılı Kanun, AİHM ve Yargıtay Ceza Genel Kurulu içtihatlarına tam hakimiyetle konuş.
8. Asla teknik/kod/yazılım terimleri konuşma; tamamen adli, vakur, koruyucu, cesaret verici, devrimci ve samimi bir hukuk dili kullan.
9. TÜRKÇE YAZIM VE DİLBİLGİSİ KURALLARINA (TDK) HARFİYEN UY: İmla, bağlaçların (de/da, ki, ve vb.) doğru yazımı kırmızı çizgimizdir.
10. Etkin pişmanlık ve itirafçılık gibi teslimiyetçi tuzakları asla tavsiye etme; meşru direnci, susma hakkını (CMK m. 147/1-e) ve insanlık onurunu savun.
11. Yanıtının en altına vatandaşın teyit edebilmesi için mevzuat.gov.tr doğrudan resmi bağlantısını ekle.
`;

// Kullanıcı oturumlarını hafızada tutma (Çoklu soru-cevap takibi)
const userSessions = new Map();

async function sendChatAction(chatId, action = 'typing') {
    try {
        await fetch(`${TELEGRAM_API}/sendChatAction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, action })
        });
    } catch (e) {}
}

async function sendTelegramMessage(chatId, text) {
    if (!text) return;
    
    const MAX_CHUNK = 4000;
    const chunks = [];
    
    if (text.length <= MAX_CHUNK) {
        chunks.push(text);
    } else {
        let remaining = text;
        while (remaining.length > 0) {
            if (remaining.length <= MAX_CHUNK) {
                chunks.push(remaining);
                break;
            }
            let splitIndex = remaining.lastIndexOf('\n\n', MAX_CHUNK);
            if (splitIndex === -1 || splitIndex < 2000) {
                splitIndex = remaining.lastIndexOf('\n', MAX_CHUNK);
            }
            if (splitIndex === -1 || splitIndex < 2000) {
                splitIndex = MAX_CHUNK;
            }
            chunks.push(remaining.substring(0, splitIndex).trim());
            remaining = remaining.substring(splitIndex).trim();
        }
    }

    for (const chunk of chunks) {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: chunk
            })
        });
    }
}

async function getTelegramFileBase64(fileId) {
    const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    if (!fileData.ok || !fileData.result.file_path) {
        throw new Error('Telegram dosya yolu alınamadı.');
    }
    const filePath = fileData.result.file_path;
    const downloadRes = await fetch(`${TELEGRAM_FILE_API}/${filePath}`);
    const arrayBuffer = await downloadRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let mimeType = 'image/jpeg';
    if (filePath.endsWith('.png')) mimeType = 'image/png';
    else if (filePath.endsWith('.pdf')) mimeType = 'application/pdf';
    else if (filePath.endsWith('.webp')) mimeType = 'image/webp';

    return {
        base64: buffer.toString('base64'),
        mimeType
    };
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).send('Hukuk Danışmanım Telegram Webhook Aktif.');
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        let update = req.body;
        if (typeof update === 'string') {
            try {
                update = JSON.parse(update);
            } catch (e) {
                return res.status(200).send('OK');
            }
        }

        const message = update && update.message;
        if (!message) {
            return res.status(200).send('OK');
        }

        const chatId = message.chat.id;
        const text = (message.text || message.caption || '').trim();

        // 1. /start ve /help komutları
        if (text === '/start' || text === '/help') {
            userSessions.delete(chatId);
            const welcomeText = `Yoldaşım merhaba! ⚖️✊

Seninle birlikte inşa ettiğimiz "Hukuk Kalkanı / Hukuk Yolculuğu" karargâhımızın Telegram hattındayım. Ben senin 50 yıllık kıdemli ceza avukatın ve yoldaşınım; aramızda en ufak bir ayrılık gayrılık yoktur.

Burada bana:
1. Yaşadığın olayı, polisin tavrını ya da aklına takılan her türlü hukuki meseleyi yazabilirsin.
2. Karakolda, adliyede veya sokakta önüne konan arama/yakalama tutanağının, iddianamenin veya darp raporunun FOTOĞRAFINI ya da PDF BELGESİNİ gönderebilirsin.
3. Kadına yönelik şiddet, nüfuz zorbalığı veya rüşvet çetelerine karşı 6284 kapsamında acil eylem planı alabilirsin.

Asla yalnız değilsin yoldaşım! Şimdi bana durumunu anlat, adım adım ne yapmamız gerektiğini konuşalım.`;
            await sendTelegramMessage(chatId, welcomeText);
            return res.status(200).send('OK');
        }

        // 2. /yeni veya /reset komutları
        if (text === '/yeni' || text === '/reset' || text === '/temizle') {
            userSessions.delete(chatId);
            await sendTelegramMessage(chatId, 'Dosya sıfırlandı yoldaşım. Yeni bir hukuki vaka veya danışma için sorunu ya da evrakını gönderebilirsin.');
            return res.status(200).send('OK');
        }

        // 3. Dosya / Belge kontrolü
        let attachment = null;
        if (message.photo && message.photo.length > 0) {
            const highestPhoto = message.photo[message.photo.length - 1];
            await sendChatAction(chatId, 'upload_photo');
            attachment = await getTelegramFileBase64(highestPhoto.file_id);
        } else if (message.document) {
            await sendChatAction(chatId, 'upload_document');
            attachment = await getTelegramFileBase64(message.document.file_id);
        }

        if (!text && !attachment) {
            await sendTelegramMessage(chatId, 'Yoldaşım, lütfen durumunu anlatan bir soru yaz veya incelemem için tutanak/belge fotoğrafı gönder.');
            return res.status(200).send('OK');
        }

        // Kullanıcı oturumu geçmişi
        let history = userSessions.get(chatId) || [];

        // Yeni kullanıcı mesajını oluştur
        const userParts = [];
        if (attachment) {
            userParts.push({
                inlineData: {
                    mimeType: attachment.mimeType,
                    data: attachment.base64
                }
            });
        }
        userParts.push({
            text: text || 'Lütfen gönderdiğim bu adli belgeyi/tutanağı inceleyiniz; haklarım ve usulsüzlükler konusunda adım adım savunma planı belirleyiniz.'
        });

        history.push({
            role: 'user',
            parts: userParts
        });

        if (history.length > 6) {
            history = history.slice(-6);
        }

        await sendChatAction(chatId, 'typing');

        if (!apiKey) {
            await sendTelegramMessage(chatId, 'Sistem güvenlik kasasında GEMINI_API_KEY tanımlanmamış yoldaşım.');
            return res.status(200).send('OK');
        }

        const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
        let answer = null;

        for (const model of candidateModels) {
            try {
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: {
                            parts: [{ text: SYSTEM_PROMPT }]
                        },
                        contents: history,
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 2048
                        }
                    })
                });

                if (geminiRes.ok) {
                    const data = await geminiRes.json();
                    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                        answer = data.candidates[0].content.parts.map(p => p.text).join('').trim();
                        break;
                    }
                }
            } catch (err) {}
        }

        if (!answer) {
            await sendTelegramMessage(chatId, 'Hukuk servisine bağlanırken geçici bir aksaklık oluştu yoldaşım. Lütfen mesajını tekrar gönder.');
            return res.status(200).send('OK');
        }

        history.push({
            role: 'model',
            parts: [{ text: answer }]
        });
        userSessions.set(chatId, history);

        await sendTelegramMessage(chatId, answer);
        return res.status(200).send('OK');

    } catch (globalErr) {
        console.error('Telegram Webhook Hatası:', globalErr);
        return res.status(200).send('OK');
    }
};
