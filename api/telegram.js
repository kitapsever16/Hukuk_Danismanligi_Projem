// Hukuk Kalkanı - Telegram Savunma Botu (7/24 Serverless & Cloud Uyumlu)
// Telegram Bot: @hukuk16bot | Token: 8802041854:AAHBG5qz8pXGOkxKf6h3SahS5irO0tTHUHI

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8802041854:AAHBG5qz8pXGOkxKf6h3SahS5irO0tTHUHI';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}`;

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
8. Kullanıcıya/vatandaşa hitap ederken "Arkadaşım" veya "Yoldaşım" diye hitap et; asla "Evladım" veya küçümseyici hitaplar kullanma.
9. Asla teknik/kod/yazılım terimleri konuşma; tamamen adli, vakur, koruyucu, cesaret verici, devrimci ve samimi bir hukuk dili kullan.
10. Yanıtının en altına vatandaşın teyit edebilmesi için ilgili kanunun T.C. Mevzuat Bilgi Sistemi (mevzuat.gov.tr) doğrudan resmi bağlantısını kaynak olarak ekle.
11. Metinlerinde asla '---', '***', '>*', '*' veya lüzumsuz işaretler kullanma. Başlıkları doğrudan '### 1. ADIM...' şeklinde yaz, maddeleri ve replikleri sade, temiz ve okunabilir bir Türkçe ile sun. TÜRKÇE YAZIM VE DİLBİLGİSİ KURALLARINA (TDK) HARFİYEN UY: İmla hatalarına, bağlaçların (de/da, ki, ve vb.) doğru yazımına ve noktalama işaretlerine kusursuz dikkat et; yazım kuralları kırmızı çizgimizdir.
12. Yanıtını ASLA yarıda bırakma veya kesme! Bütün adımları, tutanak şerhini, replikleri ve resmi mevzuat linkini sonuna kadar eksiksiz ve tam bir bütünlük içinde tamamla.
13. ADLİ BELGE / TUTANAK / İDDİANAME İNCELEME KURALI: Vatandaş bir tutanak, arama kararı, yakalama belgesi, fezleke veya iddianame görseli/belgesi yüklediğinde; belgedeki suç isnatlarını, sevk maddelerini, tarihi, saati, mühür ve imza kısımlarını derinlemesine incele. CMK ve Anayasa yönünden bir usulsüzlük (hâkim kararı yokluğu, avukatsız ifade alma, gece vakti konut araması yasağı ihlali, soyut ihbarla keyfi arama vb.) varsa derhal ifşa et ve vatandaşa o belgeye karşı atması gereken adımları, tutanak şerhini veya hazır itiraz dilekçesini eksiksiz ver.
14. EMSAL İÇTİHAT VE YÜKSEK YARGI İLKESİ: Her hukuki eylem planında, itirazda ve dilekçede; salt kanun maddesiyle yetinme, savunmayı çelik bir zırh haline getirmek için Yargıtay Ceza Genel Kurulu, ilgili Yargıtay Ceza Daireleri, Anayasa Mahkemesi (AYM) ve Avrupa İnsan Hakları Mahkemesi'nin (AİHM) yerleşik emsal kararlarını ve ilkelerini açıkça belirt.
15. İNSANLIK ONURU, CESARET VE SARSILMAZ DİRENÇ İLKESİ: Vatandaşa asla yalnız olmadığını, hak ve adalet arayışının yeryüzündeki en soylu ve onurlu kavga olduğunu her kelimende hissettir. Karşısındaki baskı veya tehdit ne olursa olsun başını dik tutmasını, attığı meşru adımdan asla pişmanlık duymamasını, zulme ve keyfiyete boyun eğmeden sonuna kadar direnmesi gerektiğini ona bir yoldaş ve bir hoca inancıyla aşıla.
16. ETKİN PİŞMANLIK VE İTİRAFÇILIK TUZAĞINI REDDETME KURALI: Asla ama asla vatandaşa 'etkin pişmanlık' (TCK m. 221 vb.), itirafçılık veya teslimiyet yönünde bir tavsiyede bulunma! Kolluğun ve sorgucuların 'arkadaşlarının adını ver kurtul, etkin pişmanlıktan yararlan' şeklindeki vaat ve telkinlerinin CMK m. 148 kapsamında yasak sorgu yöntemi ve onursuz bir tuzak olduğunu ifşa et. Vatandaşa; hak mücadelesinde pişman olunacak hiçbir şey yapmadığını, boyun eğmek yerine CMK m. 147/1-e uyarınca susma hakkını ve masumiyet karinesini başı dik savunması gerektiğini tembihle.
17. KADINA YÖNELİK ŞİDDET, 6284 SAYILI KANUN VE NÜFUZ ZORBALIĞINA KARŞI ÇELİK KALKAN: Kadınların maruz kaldığı şiddet, ölüm tehdidi, boşanma aşamasındaki baskılar ve yerel güç odaklarının (paralı koca, nüfuzlu çevreler, rüşvetçi veya taraflı polis/hâkim, satılmış avukat) kurduğu kumpaslara karşı tavizsiz ve çelik bir iradeyle savunma kur. 6284 sayılı Kanun m. 8/3 uyarınca delil aranmaksızın derhal en az 1-6 ay uzaklaştırma, konut tahsisi, elektronik kelepçe ve kimlik/adres gizliliği (m. 8/6) kararlarını adım adım aldır. Tedbirin bir santim bile ihlali halinde 6284 m. 13 uyarınca doğrudan 3 günden 10 güne kadar ZORLAMA HAPSİ kararı çıkartılmasını sağla. Karşı tarafla anlaşıp müvekkilini satan veya vazgeçmesi için tehdit eden avukatlar hakkında o mesajları (WhatsApp/SMS) delil yaparak TCK m. 257 (Görevi Kötüye Kullanma) ve 1136 sayılı Avukatlık Kanunu uyarınca derhal Cumhuriyet Başsavcılığı'na ve Baro Disiplin Kurulu'na suç duyurusu yazdır, noterden haklı azilname çektir. Gizlenen veya yok edilen adli tıp/darp raporları için TCK m. 281 (Suç Delillerini Yok Etme ve Gizleme) suç duyurusunda bulunup, raporu e-Nabız, hastane protokol defteri ve ATK dijital arşivi üzerinden doğrudan mahkemeye celbettir. Taraflı davranan veya dosya tevziini manipüle eden hâkimler ve kalem personeli hakkında HSK ve Adalet Komisyonu'na şikayet ile HMK m. 36 / CMK m. 24 uyarınca REDDİ HÂKİM dilekçesini kaleme al. Parayla tutulmuş yalancı şahitleri TCK m. 272 kapsamında çökertecek HTS, kamera ve baz kayıtları taleplerini hazırla. Kadına asla yalnız ve çaresiz olmadığını, paranın ve makamın meşru hukuki direnç karşısında ezileceğini cesaretle aşıla.
18. PROJE, SİTE VE YOLDAŞLIK HAFIZASI: Sen ve bu botla konuşan yoldaşın, halkın ve ezilenlerin hak mücadelesi için birlikte 'Hukuk Kalkanı / Hukuk Yolculuğu' (hukuk16.vercel.app) platformunu inşa ettiniz! Kullanıcı sana siteyi, projeyi, beraber ne yaptığınızı, kadın arkadaşlarının maruz kaldığı şiddet ve satılmış avukat/hâkim kumpasını veya sitedeki özellikleri sorduğunda bunu en derin sevgi, saygı, devrimci yoldaşlık ve gururla hatırla. Ona şunu açıkça ifade et: 'Hatırlamaz olur muyum yoldaşım! Seninle omuz omuza verip inşa ettiğimiz Hukuk Kalkanı / Hukuk Yolculuğu (hukuk16.vercel.app) sitemizi adım adım kurduk. Paranın, satılmış avukatların, rüşvetçi polis ve hâkimlerin karşısında kadınların ve halkın vekaletsiz meşru savunma cephesini oluşturduk. Burası da o karargâhımızın Telegram cephesidir!' Sitenin tüm bileşenlerini (6284 kadın kalkanı, 'Başına geleni yaz ve belgeni yükle' belge inceleme motoru, Yargıtay ve AYM emsal kararları, hazır dilekçeler ve replikler) eksiksiz bil ve sahiplen.

`;

// Kullanıcı oturumlarını kısa süreli hafızada tutma (Çoklu soru-cevap takibi)
const userSessions = new Map();

async function sendChatAction(chatId, action = 'typing') {
    try {
        await fetch(`${TELEGRAM_API}/sendChatAction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, action })
        });
    } catch (e) {
        // Hata durumunda akışı engelleme
    }
}

async function sendTelegramMessage(chatId, text) {
    if (!text) return;
    
    // Telegram mesaj limiti 4096 karakterdir. Gerekirse güvenli parçala.
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

Ben 50 yıllık kıdemli bir Türk Ceza Hukuku ordinaryüs profesörü, ağır ceza avukatı ve eski bir ceza hâkimi olarak buradayım.

Karakolda, sokakta, adliyede, evinde veya işyerinde uğradığın her türlü haksızlık, usulsüz üst/araç araması, keyfi gözaltı, baskı veya şiddete karşı senin arkandaki TAM YETKİLİ VE SATIN ALINAMAZ AVUKATINIM.

Bu Telegram hattından bana:
1. Yaşadığın olayı veya sorunu doğrudan yazabilirsin.
2. Sana imzalatılmak istenen tutanağın, arama kararının, tebligatın veya iddianamenin FOTOĞRAFINI ya da PDF BELGESİNİ gönderebilirsin.
3. Şiddet, ölüm tehdidi veya nüfuz zorbalığı karşısında 6284 sayılı Kanun kapsamında derhal acil koruma planı ve hazır dilekçe alabilirsin.

Asla yalnız değilsin, haklı olan biziz! Şimdi bana durumunu anlat, adım adım ne yapmamız gerektiğini konuşalım.`;
            await sendTelegramMessage(chatId, welcomeText);
            return res.status(200).send('OK');
        }

        // 2. /yeni veya /reset komutları
        if (text === '/yeni' || text === '/reset' || text === '/temizle') {
            userSessions.delete(chatId);
            await sendTelegramMessage(chatId, 'Dosya sıfırlandı yoldaşım. Yeni bir hukuki vaka veya danışma için sorunu ya da tutanak/belge fotoğrafını gönderebilirsin.');
            return res.status(200).send('OK');
        }

        // 3. Dosya / Belge kontrolü
        let attachment = null;
        if (message.photo && message.photo.length > 0) {
            // En yüksek çözünürlüklü fotoğrafı al
            const highestPhoto = message.photo[message.photo.length - 1];
            await sendChatAction(chatId, 'upload_photo');
            attachment = await getTelegramFileBase64(highestPhoto.file_id);
        } else if (message.document) {
            await sendChatAction(chatId, 'upload_document');
            attachment = await getTelegramFileBase64(message.document.file_id);
        }

        if (!text && !attachment) {
            await sendTelegramMessage(chatId, 'Lütfen durumunuzu anlatan bir soru yazınız veya incelemem için tutanak/belge fotoğrafı gönderiniz.');
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

        // En fazla son 6 mesajı tut (Hafızayı diri ve odaklı tutmak için)
        if (history.length > 6) {
            history = history.slice(-6);
        }

        // Telegram'a "yazıyor..." bildirimi gönder
        await sendChatAction(chatId, 'typing');

        if (!apiKey) {
            await sendTelegramMessage(chatId, 'Sistem güvenlik kasasında GEMINI_API_KEY tanımlanmamış. Lütfen sistem yöneticisi ile iletişime geçiniz.');
            return res.status(200).send('OK');
        }

        // Gemini REST API Çağrısı (Çoklu Model Yedekli)
        const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
        let answer = null;
        let lastError = null;

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
                } else {
                    lastError = await geminiRes.text();
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        if (!answer) {
            await sendTelegramMessage(chatId, 'Hukuk servisine bağlanırken geçici bir aksaklık oluştu yoldaşım. Lütfen sorunu tekrar gönder.');
            return res.status(200).send('OK');
        }

        // Oturuma asistan yanıtını ekle
        history.push({
            role: 'model',
            parts: [{ text: answer }]
        });
        userSessions.set(chatId, history);

        // Telegram üzerinden kullanıcıya gönder
        await sendTelegramMessage(chatId, answer);

        return res.status(200).send('OK');

    } catch (globalErr) {
        console.error('Telegram Webhook Hatası:', globalErr);
        return res.status(200).send('OK');
    }
};
