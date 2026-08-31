import { questionPool } from "./questions";
import { sectorQuestionPool } from "./sectorQuestions";
import type { Difficulty, SectorId } from "../types";

export type RapidCategory = "uygulama" | "teorik" | "vaka" | "psikoloji";

export interface RapidOption {
  text: string;
  isBest: boolean;
  feedback: string;
}

export interface RapidQuestion {
  id: string;
  category: RapidCategory;
  difficulty: Difficulty;
  prompt: string;
  options: RapidOption[];
}

const difficultyRank: Record<Difficulty, number> = { kolay: 0, orta: 1, zor: 2, efsane: 3 };

export const vakaQuestions: RapidQuestion[] = [
  {
    id: "vaka-teslim",
    category: "vaka",
    difficulty: "orta",
    prompt:
      "Ekibin, teslim tarihine 2 gün kala kritik bir hata buluyor. Müşteriye haber vermek teslimi geciktirir, vermemek risklidir. Ne yaparsın?",
    options: [
      { text: "Müşteriye durumu şeffafça bildirip revize bir plan sunarım.", isBest: true, feedback: "Şeffaflık kısa vadede rahatsız etse de güveni korur — doğru yaklaşım." },
      { text: "Hatayı sessizce düzeltip teslim tarihine yetiştirmeye çalışırım.", isBest: false, feedback: "Riskli: fark edilirse güven tamamen kaybedilir." },
      { text: "Sorunu yöneticime bildirmeden kendi başıma çözerim.", isBest: false, feedback: "Kritik kararları tek başına almak, ekip iletişimini zayıflatır." },
      { text: "Teslim tarihini hiç sorgulamadan olduğu gibi bırakırım.", isBest: false, feedback: "Bilinen bir riski görmezden gelmek sorumluluktan kaçmaktır." },
    ],
  },
  {
    id: "vaka-butce",
    category: "vaka",
    difficulty: "kolay",
    prompt: "Bütçen kısıtlı, iki önemli proje arasında kaynak paylaştırman gerekiyor. Nasıl karar verirsin?",
    options: [
      { text: "Etki ve aciliyete göre bir önceliklendirme matrisi kullanırım.", isBest: true, feedback: "Yapılandırılmış önceliklendirme, duygusal değil verimli karar verdirir." },
      { text: "İkisine de eşit oranda kaynak ayırırım.", isBest: false, feedback: "Adil görünse de genelde ikisinin de yarım kalmasına yol açar." },
      { text: "Hangisi daha gürültülü savunuluyorsa ona öncelik veririm.", isBest: false, feedback: "Karar, gerçek etkiden çok ses yüksekliğine göre verilmiş olur." },
      { text: "Kararı tamamen üst yönetime bırakırım, sorumluluğu üstlenmek istemem.", isBest: false, feedback: "Bazen gerekli olsa da, hiç analiz yapmadan devretmek pasiflik gösterir." },
    ],
  },
  {
    id: "vaka-direnc",
    category: "vaka",
    difficulty: "orta",
    prompt: "Yeni bir yazılıma geçişte ekibin yarısı dirençli. Nasıl yönetirsin?",
    options: [
      { text: "Dirençli olanlarla birebir konuşup endişelerini anlar, kademeli bir geçiş planı sunarım.", isBest: true, feedback: "Direnç genelde bilinmezlik korkusundan gelir; anlamak ve kademeli ilerlemek en etkili yoldur." },
      { text: "Yeni aracı zorunlu kılıp itirazları dinlemem.", isBest: false, feedback: "Kısa vadede işe yarasa da uzun vadede motivasyonu ve güveni zedeler." },
      { text: "Değişikliği erteleyip eski sistemde devam ederim, ekibi zorlamak istemediğim için bekletirim.", isBest: false, feedback: "Sorunu çözmez, sadece geciktirir." },
      { text: "Sadece isteyenlerin geçmesine izin veririm.", isBest: false, feedback: "Ekipte parçalı bir sistem kullanımı verimliliği düşürür." },
    ],
  },
  {
    id: "vaka-kriz",
    category: "vaka",
    difficulty: "zor",
    prompt: "Bir müşteri şikayeti sosyal medyada büyüyor, yöneticine şu an ulaşamıyorsun. Ne yaparsın?",
    options: [
      { text: "Yetkim dahilinde hızlı, şeffaf bir ilk yanıt verip durumu yöneticime iletirim.", isBest: true, feedback: "Krizde hız ve şeffaflık önemlidir; yetkini aşmadan hareket etmek dengeyi korur." },
      { text: "Yöneticim dönene kadar hiçbir şey yapmam, yetkim olmadığını düşünüp beklerim.", isBest: false, feedback: "Kriz anlarında pasif kalmak durumu büyütebilir." },
      { text: "Şirket adına büyük vaatlerde bulunarak durumu hemen kapatmaya çalışırım.", isBest: false, feedback: "Yetkin dışında vaatlerde bulunmak ileride daha büyük sorun yaratabilir." },
      { text: "Konuyu görmezden gelip kendi işime devam ederim.", isBest: false, feedback: "Bir krizi görmezden gelmek, itibar açısından en riskli seçenektir." },
    ],
  },
  {
    id: "vaka-cakisma",
    category: "vaka",
    difficulty: "orta",
    prompt: "İki ekip üyesi aynı görevde çakışmış, ikisi de kendi versiyonunu savunuyor. Nasıl çözersin?",
    options: [
      { text: "İkisini bir araya getirip ortak bir çözüm için arabuluculuk yaparım.", isBest: true, feedback: "Taraflardan birini seçmek yerine ortak zemin bulmak, ekip güvenini korur." },
      { text: "Rastgele birinin versiyonunu seçerim, zaman kaybetmemek için hızlıca karar veririm.", isBest: false, feedback: "Adaletsiz görünüp gücenmeye yol açabilir." },
      { text: "İkisinden de vazgeçip işi kendim yaparım.", isBest: false, feedback: "Kısa vadede pratik görünse de ekibin gelişimini ve sorumluluğunu engeller." },
      { text: "Konuyu görmezden gelip ikisinin kendi aralarında çözmesini beklerim.", isBest: false, feedback: "Çatışma büyürse süreci daha da geciktirebilir." },
    ],
  },
  {
    id: "vaka-butce-kesinti",
    category: "vaka",
    difficulty: "zor",
    prompt: "Şirket ani bir bütçe kesintisine gidiyor, ekibinin en sevdiği projelerden birini durdurman gerekiyor. Nasıl iletirsin?",
    options: [
      { text: "Kararın gerekçesini şeffafça açıklar, ekibin sorularını doğrudan yanıtlarım.", isBest: true, feedback: "Zor haberlerde şeffaflık ve doğrudan iletişim, güveni korumanın en etkili yoludur." },
      { text: "Haberi mail ile duyurup soru almaktan kaçınırım, yüz yüze konuşmanın zor olacağını düşünürüm.", isBest: false, feedback: "Zor bir kararı mesafeli iletmek, ekipte güvensizlik ve söylenti yaratır." },
      { text: "Kararı geciktirip son ana kadar söylemem.", isBest: false, feedback: "Ertelemek, ekibin hazırlıksız yakalanmasına ve güven kaybına yol açar." },
      { text: "Kararı üst yönetimin üstüne atıp kendimi sorumluluktan çekerim.", isBest: false, feedback: "Sorumluluğu tamamen başkasına yıkmak, liderlik güvenilirliğini zedeler." },
    ],
  },
  {
    id: "vaka-yetenek-kaybi",
    category: "vaka",
    difficulty: "kolay",
    prompt: "Ekibindeki en yetenekli kişi başka bir şirketten teklif aldığını söylüyor. İlk adımın ne olur?",
    options: [
      { text: "Neyin onu ayrılmaya ittiğini anlamak için samimi bir konuşma yaparım.", isBest: true, feedback: "Kök nedeni anlamadan teklif sunmak, sorunu çözmeden üstünü örter." },
      { text: "Hemen maaşını artırma sözü veririm, en hızlı çözümün bu olduğunu düşünürüm.", isBest: false, feedback: "Kök neden maaş değilse, bu geçici bir çözüm olur." },
      { text: "Ayrılacağını düşünüp ilgilenmeyi bırakırım.", isBest: false, feedback: "Erken pes etmek, değerli bir çalışanı gereksiz yere kaybettirebilir." },
      { text: "Diğer ekip üyelerine durumu hemen duyururum, şeffaf olmanın doğru olduğunu düşünürüm.", isBest: false, feedback: "Henüz netleşmemiş bir durumu yaymak gereksiz kaygı yaratabilir." },
    ],
  },
  {
    id: "vaka-yeni-lider",
    category: "vaka",
    difficulty: "zor",
    prompt: "Az deneyimli birini ekip lideri yaptılar, sen ondan daha kıdemlisin. Nasıl yaklaşırsın?",
    options: [
      { text: "Yeni role destek olup deneyimimi paylaşırım, otoritesini baltalamam.", isBest: true, feedback: "Olgun bir yaklaşım: ekip başarısı, kişisel gururdan önce gelir." },
      { text: "Kararlarını sürekli sorgulayıp yetkisiz olduğunu ima ederim.", isBest: false, feedback: "Bu tavır ekip dinamiğini bozar ve profesyonelliğini gölgeler." },
      { text: "Onu görmezden gelip kendi başıma hareket ederim.", isBest: false, feedback: "Yapısal olarak kabul edilen bir otoriteyi göz ardı etmek işleyişi bozar." },
      { text: "Durumu değiştirmesi için üst yönetime baskı yaparım.", isBest: false, feedback: "Kararı sorgulamadan baskıyla değiştirtmeye çalışmak yıkıcı bir yaklaşımdır." },
    ],
  },
  {
    id: "vaka-uzaktan-ekip",
    category: "vaka",
    difficulty: "orta",
    prompt: "Tamamen uzaktan çalışan bir ekip üyesi, günler geçmesine rağmen mesajlarına geç yanıt veriyor ve teslimler aksıyor. Ne yaparsın?",
    options: [
      { text: "Durumu hemen yöneticime şikayet edip müdahale etmesini isterim.", isBest: false, feedback: "Önce doğrudan konuşmadan üst mercie taşımak, ilişkiyi gereksiz yere germiş olabilir." },
      { text: "Kişiyle birebir görüşüp bir engel olup olmadığını sorar, birlikte net bir iletişim ve teslim planı oluştururum.", isBest: true, feedback: "Doğrudan ve meraklı bir yaklaşım, sorunun kök nedenini (kişisel zorluk, önceliklendirme, iletişim tercihi) ortaya çıkarır." },
      { text: "Sabırla bekleyip hiçbir şey söylemem, kendiliğinden düzelir diye umarım ve müdahale etmenin durumu kötüleştireceğinden çekinirim.", isBest: false, feedback: "Pasif kalmak, sorunun ekibin genel performansını etkilemesine izin verir." },
      { text: "Herkesin önünde, ekip kanalında gecikmeleri açıkça eleştiririm.", isBest: false, feedback: "Herkesin önünde eleştirmek kişiyi savunmaya itebilir ve uzaktan ekiplerde güveni zedeler." },
    ],
  },
  {
    id: "vaka-veri-hatasi",
    category: "vaka",
    difficulty: "zor",
    prompt: "Üzerinde çalıştığın bir analizde, raporu paylaştıktan SONRA ciddi bir veri hatası yaptığını fark ediyorsun. Rapor zaten üst yönetime iletildi. Ne yaparsın?",
    options: [
      { text: "Kimse fark etmezse sessiz kalır, bir dahaki raporda sessizce düzeltirim.", isBest: false, feedback: "Bilinçli olarak sessiz kalmak, hata ortaya çıkarsa güvenilirliğini ciddi şekilde zedeler." },
      { text: "Hatayı fark ettiğimi kimseye söylemeden kendi kendime notlar alıp ileride dikkat ederim.", isBest: false, feedback: "Zaten paylaşılmış yanlış bir bilgiye dayanarak karar alınabilir; sessiz kalmak riski büyütür." },
      { text: "Hemen ilgili kişilere hatayı ve düzeltilmiş halini açık, net bir dille bildiririm.", isBest: true, feedback: "Hata paylaşıldıktan sonra fark edilmişse bile, en hızlı ve şeffaf şekilde düzeltmek hem güveni korur hem yanlış kararların önüne geçer." },
      { text: "Hatanın büyüklüğünü küçümseyip 'önemli değil' diyerek geçiştiririm.", isBest: false, feedback: "Hatanın gerçek etkisini küçümsemek, sorunun fark edilmeden büyümesine yol açabilir." },
    ],
  },
  {
    id: "vaka-yeniden-yapilanma",
    category: "vaka",
    difficulty: "kolay",
    prompt: "Şirket bir yeniden yapılanmaya gidiyor ve senin pozisyonun farklı bir departmana bağlanıyor, yeni bir yöneticin olacak. İlk tepkin ne olur?",
    options: [
      { text: "Yeni yöneticimle kısa bir tanışma görüşmesi talep edip beklentileri ve mevcut işleyişi netleştiririm.", isBest: true, feedback: "Belirsizlik anında proaktif netlik aramak, geçişi hem senin hem yeni yöneticin için kolaylaştırır." },
      { text: "Değişikliği önemsemeden eskisi gibi çalışmaya devam ederim, zamanla kendiliğinden oturacağını düşünürüm.", isBest: false, feedback: "Yapısal bir değişikliği görmezden gelmek, yeni beklentileri kaçırmana neden olabilir." },
      { text: "Bu değişikliğin kötü bir işaret olduğunu düşünüp hemen iş aramaya başlarım.", isBest: false, feedback: "Yeniden yapılanmalar her zaman olumsuz bir sinyal değildir; erken panik gereksiz olabilir." },
      { text: "Değişikliğe açıkça itiraz edip eski departmanımda kalmak için ısrar ederim.", isBest: false, feedback: "Organizasyonel bir kararı sorgulamadan reddetmek, esneklik eksikliği izlenimi bırakabilir." },
    ],
  },
  {
    id: "vaka-yetki-asimi",
    category: "vaka",
    difficulty: "orta",
    prompt: "Bir proje kararını, yetkin olmamasına rağmen kendi başına alman gerekiyormuş gibi bir baskı hissediyorsun çünkü yöneticine ulaşamıyorsun ve son teslim yaklaşıyor. Ne yaparsın?",
    options: [
      { text: "Yetkim olmasa da kararı tek başıma alıp ilerlerim, sonuçlarını sonra açıklarım.", isBest: false, feedback: "Yetkini aşan bir kararı tek başına almak, sonuç kötü giderse ciddi güven kaybına yol açabilir." },
      { text: "Elimdeki bilgiyle en düşük riskli geçici adımı atar, yöneticime ulaşır ulaşmaz durumu netleştiririm.", isBest: true, feedback: "Riski minimize eden geçici bir adım atıp en kısa sürede yetkiliyle netleşmek, hem süreci aksatmaz hem de sınırlarını aşmamış olursun." },
      { text: "Yöneticime ulaşamadığım için hiçbir şey yapmadan teslim tarihini kaçırırım.", isBest: false, feedback: "Tamamen pasif kalmak, çözülebilecek bir durumu kontrolsüz bir gecikmeye dönüştürür." },
      { text: "Kararı ekip arkadaşlarımdan birine devredip sorumluluktan çekilirim.", isBest: false, feedback: "Sorumluluğu yetkisi olmayan birine devretmek, sorunu çözmek yerine büyütebilir." },
    ],
  },
  {
    id: "vaka-mentorluk-talebi",
    category: "vaka",
    difficulty: "kolay",
    prompt: "Ekibindeki genç bir arkadaşın senden düzenli mentorluk istiyor ama kendi işlerin de yoğun. Nasıl yaklaşırsın?",
    options: [
      { text: "Haftada kısa, sabit bir zaman dilimi ayırıp mentorluğu net bir çerçeveye oturturum.", isBest: true, feedback: "Küçük ama düzenli bir zaman ayırmak, hem kendi yoğunluğunu korur hem de gerçek bir katkı sağlar." },
      { text: "Zamanım olmadığı için tamamen reddederim, kendi işime öncelik vermem gerektiğini düşünürüm.", isBest: false, feedback: "Reddetmek anlaşılır olsa da, ekip gelişimine katkı ve görünürlük fırsatını kaçırtır." },
      { text: "Kabul ederim ama düzensiz aralıklarla, ne zaman aklıma gelirse görüşürüz.", isBest: false, feedback: "Düzensiz bir yapı, mentorluk ilişkisinin gerçek bir fayda sağlamasını zorlaştırır." },
      { text: "Onu başka birine yönlendirip kendim hiç dahil olmam.", isBest: false, feedback: "Tamamen kaçınmak, kurulabilecek değerli bir ilişkiyi baştan kapatır." },
    ],
  },
  {
    id: "vaka-networking-firsat",
    category: "vaka",
    difficulty: "orta",
    prompt: "Bir networking etkinliğinde, aradığın pozisyonu açan bir şirketin yöneticisiyle tanışıyorsun ama ortam kısa ve kalabalık. Ne yaparsın?",
    options: [
      { text: "Kısa, net bir tanıtım yapıp iletişim bilgisi alarak sonra detaylı bağlantı kurmayı öneririm.", isBest: true, feedback: "Kalabalık ortamlarda kısa ve öz olup takibi sonraya bırakmak, hem karşındakine saygılı hem etkili bir stratejidir." },
      { text: "Hemen CV'mi çıkarıp uzun uzun kendimi anlatmaya başlarım.", isBest: false, feedback: "Kalabalık, sınırlı zamanlı bir ortamda uzun bir sunum yapmak karşı tarafı sıkabilir." },
      { text: "Utanıp hiç yaklaşmam, fırsatı kaçırırım.", isBest: false, feedback: "Girişimde bulunmamak, değerli bir fırsatı baştan kaybettirir." },
      { text: "Sadece kartvizit alıp hiçbir şey söylemeden geçerim.", isBest: false, feedback: "Kısa da olsa bir tanıtım yapmadan sadece kartvizit almak, akılda kalıcı bir izlenim bırakmaz." },
    ],
  },
  {
    id: "vaka-freelance-cakisma",
    category: "vaka",
    difficulty: "orta",
    prompt: "Ekip üyelerinden birinin yan projesi (freelance işi), asıl işindeki teslim tarihleriyle çakışmaya başladı. Ekip lideri olarak ne yaparsın?",
    options: [
      { text: "Kişiyle açıkça konuşup önceliklerini ve iş yükünü birlikte gözden geçiririm.", isBest: true, feedback: "Doğrudan ve yargılamadan bir konuşma, hem sorunu netleştirir hem de kişiye saygı gösterir." },
      { text: "Yan projesini hemen bırakmasını isterim.", isBest: false, feedback: "Henüz gerçek etkisini konuşmadan bu kadar kesin bir talep, orantısız bir müdahale olabilir." },
      { text: "Durumu görmezden gelip gecikmeleri sessizce tolere ederim.", isBest: false, feedback: "Sessizce tolere etmek, sorunun büyümesine ve diğer ekip üyelerinde adaletsizlik hissine yol açabilir." },
      { text: "Hemen İK'ya şikayet ederim.", isBest: false, feedback: "Önce doğrudan konuşmadan resmi sürece geçmek, ilişkiyi gereksiz yere sertleştirebilir." },
    ],
  },
  {
    id: "vaka-uzaktan-mulakat-yonetimi",
    category: "vaka",
    difficulty: "zor",
    prompt: "Tamamen uzaktan bir mülakat yürütüyorsun, adayın bağlantısı sürekli kopuyor ve süre daralıyor. Ne yaparsın?",
    options: [
      { text: "Sakin kalıp adaya kısa bir mola/yeniden bağlanma süresi tanır, gerekirse süreyi makul ölçüde esnetirim.", isBest: true, feedback: "Teknik aksaklıkları adayın kontrolü dışında bir faktör olarak görüp esneklik göstermek, adil ve profesyonel bir yaklaşımdır." },
      { text: "Bağlantı sorunu adayın hazırlıksızlığı olarak değerlendirip puan kırarım.", isBest: false, feedback: "Teknik bir sorunu adayın yetkinliğiyle karıştırmak, haksız bir değerlendirmeye yol açar." },
      { text: "Mülakatı hemen iptal edip adayı elemeye alırım.", isBest: false, feedback: "Basit bir teknik aksaklık için süreci tamamen iptal etmek, iyi bir adayı kaybettirebilir." },
      { text: "Sorunu görmezden gelip soruları olduğu gibi sormaya devam ederim, zamanla düzeleceğini düşünürüm.", isBest: false, feedback: "Bağlantı sorunları çözülmeden devam etmek, hem adayın performansını hem değerlendirmenin sağlığını olumsuz etkiler." },
    ],
  },
];

export const psikolojiQuestions: RapidQuestion[] = [
  {
    id: "psy-kriz",
    category: "psikoloji",
    difficulty: "kolay",
    prompt: "Ani bir kriz anında ilk içsel tepkin genelde nasıl olur?",
    options: [
      { text: "Derin bir nefes alıp durumu parçalara ayırarak değerlendiririm.", isBest: true, feedback: "Duraklayıp analiz etmek, panik tepkisinden çok daha etkili sonuç verir." },
      { text: "Anında bir şeyler yapmam gerektiğini hissedip aceleyle harekete geçerim.", isBest: false, feedback: "Aceleci tepkiler bazen durumu daha da karmaşıklaştırabilir." },
      { text: "Donup kalır, ne yapacağımı bilemem.", isBest: false, feedback: "Anlaşılır bir tepki ama fark etmek, üstesinden gelmenin ilk adımıdır." },
      { text: "Sorumluluğu hemen başka birine devretmeye çalışırım.", isBest: false, feedback: "Bazen doğru olsa da, ilk refleks olarak kaçınmak güven kaybettirebilir." },
    ],
  },
  {
    id: "psy-elestiri",
    category: "psikoloji",
    difficulty: "kolay",
    prompt: "Beklenmedik bir eleştiri aldığında ilk içsel tepkin ne olur?",
    options: [
      { text: "Önce savunmaya geçmeden anlamaya çalışırım.", isBest: true, feedback: "Duygusal tepkiyi erteleyip önce anlamak, olgun bir iletişim becerisidir." },
      { text: "Hemen kendimi savunacak bir cevap ararım.", isBest: false, feedback: "Anlık savunma refleksi, geri bildirimin özünü kaçırmana neden olabilir." },
      { text: "İçime atar, bir daha hiç konuşmam.", isBest: false, feedback: "Bastırılan tepki genelde birikip başka bir anda ortaya çıkar." },
      { text: "Eleştiriyi yapan kişiyi haksız bulurum.", isBest: false, feedback: "Otomatik olarak karşı tarafı suçlamak, öğrenme fırsatını kaçırtır." },
    ],
  },
  {
    id: "psy-yuk",
    category: "psikoloji",
    difficulty: "orta",
    prompt: "Aynı anda çok fazla iş üstüne geldiğinde ne yaparsın?",
    options: [
      { text: "Önceliklendirip gerekirse yardım ister ya da bazı işleri ertelerim.", isBest: true, feedback: "Sınır koyup önceliklendirmek, sürdürülebilir performansın anahtarıdır." },
      { text: "Hepsini aynı anda yetiştirmeye çalışıp uykumdan feragat ederim.", isBest: false, feedback: "Kısa vadede işe yarasa da tükenmişliğe giden en hızlı yoldur." },
      { text: "En kolay işleri yapıp zor olanları sona bırakırım.", isBest: false, feedback: "Aciliyet ve önem sırasını göz ardı etmek, kritik işlerin gecikmesine yol açar." },
      { text: "Hiçbirine başlayamaz, kararsız kalırım, önceliklendirme konusunda zorlanırım.", isBest: false, feedback: "Aşırı yük karşısında donmak, ilerlemeyi tamamen durdurabilir." },
    ],
  },
  {
    id: "psy-hata",
    category: "psikoloji",
    difficulty: "orta",
    prompt: "Bir hata yaptığını fark ettiğin an ilk düşüncen ne olur?",
    options: [
      { text: "Bunu nasıl düzeltebileceğimi düşünürüm.", isBest: true, feedback: "Çözüm odaklı düşünmek, hatayı büyütmeden ilerlemeyi sağlar." },
      { text: "Kimsenin fark etmemesini umarım.", isBest: false, feedback: "Kaçınma, genelde sorunu büyüterek geri döner." },
      { text: "Kendimi uzun süre suçlarım.", isBest: false, feedback: "Öz eleştiri faydalı olabilir ama aşırısı harekete geçmeni engeller." },
      { text: "Başka birinin payı olup olmadığını araştırırım.", isBest: false, feedback: "İlk refleks olarak sorumluluk aramak yerine önce durumu düzeltmek önceliklidir." },
    ],
  },
  {
    id: "psy-baski",
    category: "psikoloji",
    difficulty: "zor",
    prompt: "Baskı altında hızlı bir karar vermen gerektiğinde ne hissedip ne yaparsın?",
    options: [
      { text: "Kısa süreli gerginliği normal karşılayıp elimdeki bilgiyle en mantıklı adımı atarım.", isBest: true, feedback: "Stresi kabul edip yine de harekete geçebilmek, baskı altında öz-yönetimin özüdür." },
      { text: "Karar veremeyip süreyi tamamen kaçırırım, baskı altında donup kalırım.", isBest: false, feedback: "Karasızlık bazen yanlış karardan daha maliyetli olabilir." },
      { text: "Stresle başa çıkamayıp panikleyerek rastgele bir seçim yaparım.", isBest: false, feedback: "Panik altında verilen kararlar genelde tutarsız olur." },
      { text: "Baskıyı hissetmemek için durumu önemsememeye çalışırım.", isBest: false, feedback: "Durumu küçümsemek, gerçek riskleri gözden kaçırmana yol açabilir." },
    ],
  },
  {
    id: "psy-belirsizlik",
    category: "psikoloji",
    difficulty: "orta",
    prompt: "Net olmayan, belirsiz bir görev sana verildiğinde nasıl tepki verirsin?",
    options: [
      { text: "Netleştirici sorular sorup küçük bir ilk adımla ilerlemeye başlarım.", isBest: true, feedback: "Belirsizlikte harekete geçmeden önce netlik aramak, hem etkili hem güven verici bir yaklaşımdır." },
      { text: "Netlik gelene kadar hiçbir şeye başlamam, boşuna emek harcamak istemem.", isBest: false, feedback: "Bazı belirsizlikler asla tam netleşmez; beklemek fırsat kaybettirebilir." },
      { text: "Kendi yorumuma göre rastgele bir yöne ilerlerim.", isBest: false, feedback: "Doğrulama yapmadan ilerlemek, emeğin boşa gitmesine yol açabilir." },
      { text: "Görevi tamamen reddederim.", isBest: false, feedback: "Belirsizlik, iş hayatının doğal bir parçasıdır; reddetmek esneklik eksikliği gösterir." },
    ],
  },
  {
    id: "psy-yalnizlik",
    category: "psikoloji",
    difficulty: "kolay",
    prompt: "Bir görevde tamamen yalnız kaldığını, kimseden destek alamadığını hissettiğinde ne yaparsın?",
    options: [
      { text: "Kimden hangi konuda yardım isteyebileceğimi netleştirip doğrudan talep ederim.", isBest: true, feedback: "Yardım istemek zayıflık değil, kaynakları etkili kullanma becerisidir." },
      { text: "Yardım istemeyi gurur meselesi yapıp tek başıma devam ederim.", isBest: false, feedback: "Gereksiz yere yalnız kalmak, hem süreci yavaşlatır hem tükenmeyi hızlandırır." },
      { text: "Durumdan şikayet edip hiçbir aksiyon almam, durumu değiştiremeyeceğimi düşünürüm.", isBest: false, feedback: "Şikayet etmek rahatlatabilir ama sorunu çözmez." },
      { text: "Görevi tamamen bırakırım.", isBest: false, feedback: "Zorluk anında pes etmek, uzun vadede güvenilirliğini zedeler." },
    ],
  },
  {
    id: "psy-basari",
    category: "psikoloji",
    difficulty: "zor",
    prompt: "Beklenmedik bir başarı elde ettiğinde bunu nasıl karşılarsın?",
    options: [
      { text: "Başarıyı kutlarım ama neyin işe yaradığını analiz edip tekrarlanabilir hale getirmeye çalışırım.", isBest: true, feedback: "Başarıyı anlamlandırmak, onu şansa değil tekrarlanabilir bir yönteme dönüştürür." },
      { text: "Şans eseri olduğunu düşünüp üzerinde hiç durmam, kendi katkımı küçümserim.", isBest: false, feedback: "Başarıyı tamamen şansa bağlamak, öğrenme fırsatını kaçırtır." },
      { text: "Hemen daha büyük bir hedefe atlayıp mevcut başarıyı içselleştirmeden geçerim.", isBest: false, feedback: "Başarıyı sindirmeden ilerlemek, sürdürülebilir bir özgüven inşa etmeyi zorlaştırır." },
      { text: "Başarıyı abartıp gerçekçi olmayan beklentiler oluştururum.", isBest: false, feedback: "Aşırı özgüven, bir sonraki zorlukta hazırlıksız yakalanmana neden olabilir." },
    ],
  },
  {
    id: "psy-degisim",
    category: "psikoloji",
    difficulty: "kolay",
    prompt: "Alışık olduğun bir süreç aniden değiştirildiğinde ilk tepkin ne olur?",
    options: [
      { text: "Değişikliğe direnip eski yöntemi savunmaya devam ederim, eskisinin daha güvenilir olduğunu düşünürüm.", isBest: false, feedback: "Değişime karşı otomatik direnç, adaptasyon sürecini yavaşlatır." },
      { text: "Önce değişikliğin nedenini anlamaya çalışır, sonra kendi iş akışıma nasıl uyarlayabileceğimi düşünürüm.", isBest: true, feedback: "Merakla yaklaşmak, değişimi bir tehdit yerine bir öğrenme fırsatına dönüştürür." },
      { text: "Hiçbir şey söylemeden sadece şikayet ederim, ama yine de değişikliğe uyum sağlamam.", isBest: false, feedback: "Şikayet etmek gerginliği artırır ama gerçek bir uyum sağlamaz." },
      { text: "Değişikliği fark etmemiş gibi davranıp eski yöntemi gizlice sürdürürüm.", isBest: false, feedback: "Gizlice eski yöntemde ısrar etmek, ileride daha büyük bir uyumsuzluk sorunu yaratabilir." },
    ],
  },
  {
    id: "psy-yanlis-anlasilma",
    category: "psikoloji",
    difficulty: "orta",
    prompt: "Bir mesajının karşı tarafça yanlış anlaşıldığını ve bunun küçük bir gerginliğe yol açtığını fark ettiğinde ne yaparsın?",
    options: [
      { text: "Karşı tarafın yanlış anladığını düşünüp konuyu kapatırım, benim bir hatam yok diye düşünürüm.", isBest: false, feedback: "Sorumluluğu tamamen karşı tarafa yıkmak, iletişimdeki kendi payını görmeni engeller." },
      { text: "Gerginlik kendiliğinden geçer diye bekleyip hiçbir şey yapmam.", isBest: false, feedback: "Küçük yanlış anlaşılmalar zamanla büyüyebilir; erken müdahale genelde daha kolaydır." },
      { text: "Kısa bir süre içinde karşı tarafla iletişime geçip ne demek istediğimi netleştiririm.", isBest: true, feedback: "Yanlış anlaşılmayı hızlıca netleştirmek, gerginliğin büyümeden çözülmesini sağlar." },
      { text: "Konuyu üçüncü bir kişi üzerinden dolaylı olarak açıklamaya çalışırım.", isBest: false, feedback: "Dolaylı iletişim, yanlış anlaşılmayı çözmek yerine daha da karmaşıklaştırabilir." },
    ],
  },
  {
    id: "psy-tukenmislik-erken",
    category: "psikoloji",
    difficulty: "zor",
    prompt: "Son haftalarda enerjinin belirgin biçimde düştüğünü, işe eskisi kadar istekli başlamadığını fark ediyorsun. Bunu erken bir tükenmişlik belirtisi olarak nasıl ele alırsın?",
    options: [
      { text: "Bunu görmezden gelip her zamanki temposunda çalışmaya devam ederim, geçici bir yorgunluk olduğunu düşünürüm.", isBest: false, feedback: "Erken belirtileri görmezden gelmek, durumu tam bir tükenmişliğe dönüştürebilir." },
      { text: "İş yükümü ve sınırlarımı gözden geçirir, gerekirse yöneticimle konuşup öncelikleri yeniden düzenlerim.", isBest: true, feedback: "Erken belirtileri fark edip aksiyon almak, tam bir tükenmişliğe dönüşmeden durumu tersine çevirmenin en etkili yoludur." },
      { text: "Daha fazla çalışarak bu hissi bastırmaya çalışırım.", isBest: false, feedback: "Daha fazla çalışmak, tükenmişliği hafifletmek yerine genelde hızlandırır." },
      { text: "Bunun geçici bir dönem olduğunu düşünüp hiçbir şey değiştirmeden beklerim.", isBest: false, feedback: "Bazen geçebilir ama erken belirtileri fark ettiğinde aktif adım atmak daha güvenli bir yaklaşımdır." },
    ],
  },
  {
    id: "psy-karsilastirma",
    category: "psikoloji",
    difficulty: "kolay",
    prompt: "Bir iş arkadaşının senden daha hızlı ilerlediğini, daha çok takdir aldığını fark ettiğinde ne hissedip ne yaparsın?",
    options: [
      { text: "Kendimi sürekli onunla kıyaslayıp değersiz hissederim, kendi ilerlememi göz ardı ederim.", isBest: false, feedback: "Sürekli kıyaslama, kendi gelişimine odaklanmanı zorlaştırıp özgüvenini zedeler." },
      { text: "Kısa bir kıyaslama hissi normal karşılayıp, kendi hedeflerime ve gelişim alanlarıma odaklanmaya devam ederim.", isBest: true, feedback: "Kıyaslama hissini kabul edip yine de kendi yoluna odaklanabilmek, sağlıklı bir öz-yönetim örneğidir." },
      { text: "Arkadaşımın başarısını küçümseyip 'şans eseri' olduğunu düşünürüm.", isBest: false, feedback: "Başkasının başarısını küçümsemek, kendi gelişimin için hiçbir şey öğrenmeni engeller." },
      { text: "Bu durumu değiştirmek için gereğinden fazla çalışıp kendimi tüketirim, aradaki farkı kapatmam gerektiğini düşünürüm.", isBest: false, feedback: "Kıyaslamadan doğan aşırı telafi çabası, kısa vadede işe yarasa da sürdürülebilir değildir." },
    ],
  },
  {
    id: "psy-kariyer-molasi-sonrasi",
    category: "psikoloji",
    difficulty: "kolay",
    prompt: "Uzun bir kariyer molasının ardından işe geri dönerken kendini biraz paslanmış hissediyorsun. Bunu nasıl yönetirsin?",
    options: [
      { text: "Bu hissi normal karşılayıp ilk haftalarda küçük, ulaşılabilir hedeflerle özgüvenimi yeniden inşa ederim.", isBest: true, feedback: "Küçük başarılarla kademeli olarak özgüveni inşa etmek, uzun bir aradan sonra en sağlıklı geri dönüş yoludur." },
      { text: "Bu hissi kimseyle paylaşmam, zayıf görünmekten çekinirim.", isBest: false, feedback: "Bu hissi paylaşmamak, gerekli desteği almanı ve daha hızlı adapte olmanı zorlaştırabilir." },
      { text: "Hemen eskisi kadar hızlı olmayı kendimden beklerim, aksi halde hayal kırıklığına uğrarım.", isBest: false, feedback: "Gerçekçi olmayan beklentiler, adaptasyon sürecini gereksiz yere zorlaştırır." },
      { text: "Paslandığımı düşünüp geri dönme kararımı sorgulamaya başlarım, molanın hata olduğunu düşünmeye başlarım.", isBest: false, feedback: "Geçici bir adaptasyon hissini kalıcı bir yetersizlik olarak yorumlamak, öz güveni gereksiz yere zedeler." },
    ],
  },
  {
    id: "psy-networking-kaygisi",
    category: "psikoloji",
    difficulty: "orta",
    prompt: "Bir networking etkinliğine katılmadan önce içinde güçlü bir kaygı/utangaçlık hissi oluşuyor. Ne yaparsın?",
    options: [
      { text: "Kaygıyı kabul edip, sadece bir-iki kişiyle samimi bir sohbet hedefleyerek baskıyı azaltırım.", isBest: true, feedback: "Küçük, ulaşılabilir bir hedef koymak, kaygıyı yönetilebilir hale getirip harekete geçmeyi kolaylaştırır." },
      { text: "Kaygı çok yüksekse etkinliğe hiç gitmem.", isBest: false, feedback: "Kaçınmak kısa vadede rahatlatsa da, uzun vadede kaygıyı pekiştirip fırsatları kaçırtır." },
      { text: "Kaygımı bastırmak için kendimi olduğumdan çok daha dışa dönük göstermeye zorlarım.", isBest: false, feedback: "Zorlama bir performans, hem yorucu olur hem de samimiyetsiz algılanabilir." },
      { text: "Kaygılı olduğum için etkinlikte hiç kimseyle konuşmam, sadece izlerim.", isBest: false, feedback: "Tamamen pasif kalmak, etkinliğe katılmanın asıl amacını (bağlantı kurmayı) boşa çıkarır." },
    ],
  },
  {
    id: "psy-mentorluk-geri-bildirimi",
    category: "psikoloji",
    difficulty: "orta",
    prompt: "Mentorun sana beklemediğin kadar doğrudan ve sert bir geri bildirim verdi. İlk içsel tepkin ne olur?",
    options: [
      { text: "Sertliğin arkasındaki niyeti (gelişimime katkı) ayırt etmeye çalışıp mesajın özüne odaklanırım.", isBest: true, feedback: "Üslubu değil özü ayırt edebilmek, zor geri bildirimlerden gerçek anlamda öğrenebilmenin anahtarıdır." },
      { text: "Sert bir üslup kullandığı için mentorluk ilişkisini tamamen bitiririm.", isBest: false, feedback: "Tek bir sert anı yüzünden değerli bir ilişkiyi bitirmek, orantısız bir tepki olabilir." },
      { text: "Geri bildirimi kişisel bir saldırı olarak algılayıp savunmaya geçerim.", isBest: false, feedback: "Savunmacı bir tepki, geri bildirimin gerçek değerini görmeni engeller." },
      { text: "Üzülüp bir süre mentorumla hiç iletişime geçmem, geri bildirimi kişisel bir eleştiri olarak algılarım.", isBest: false, feedback: "Geri çekilmek, konuyu netleştirme ve ilişkiyi onarma fırsatını kaçırtır." },
    ],
  },
  {
    id: "psy-yan-is-yorgunlugu",
    category: "psikoloji",
    difficulty: "zor",
    prompt: "Asıl işinin yanında yürüttüğün bir yan projeden dolayı enerjinin tükendiğini fark ediyorsun ama projeyi de bırakmak istemiyorsun. Ne yaparsın?",
    options: [
      { text: "İkisi arasında net sınırlar çizip, gerekirse yan projenin kapsamını geçici olarak küçültürüm.", isBest: true, feedback: "Sınır koyup kapsamı geçici olarak ayarlamak, ikisini de tamamen bırakmadan sürdürülebilirliği korumanın en sağlıklı yolu." },
      { text: "İkisini de aynı yoğunlukta sürdürmeye devam edip yorgunluğu görmezden gelirim.", isBest: false, feedback: "Yorgunluk sinyalini görmezden gelmek, ilerleyen dönemde tükenmişliğe yol açabilir." },
      { text: "Yan projeyi hiç düşünmeden aniden tamamen bırakırım.", isBest: false, feedback: "Ani ve düşünülmemiş bir karar, ileride pişmanlık yaratabilecek bir fırsatı da beraberinde götürebilir." },
      { text: "Asıl işimdeki performansımın düşmesine izin verip yan projeye öncelik veririm.", isBest: false, feedback: "Ana iş sorumluluğunu ihmal etmek, uzun vadede güven ve itibar kaybına yol açabilir." },
    ],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fromClassicPool(category: "uygulama" | "teorik", n: number, sector?: SectorId): RapidQuestion[] {
  // Sektör seçildiyse (yalnızca "uygulama" kategorisinde geçerli — sektör
  // soruları hep bu tipte) önce sektöre özel soruları yerleştir, kalan
  // slotları her zamanki gibi genel havuzdan doldur — bkz. `buildGameQuestions`
  // (data/questions.ts) ile aynı desen.
  const sectorMatches =
    sector && category === "uygulama"
      ? shuffle(sectorQuestionPool.filter((q) => q.sector === sector)).slice(0, n)
      : [];
  const remaining = n - sectorMatches.length;
  const genericMatches = shuffle(questionPool.filter((q) => q.type === category)).slice(0, remaining);
  const picked = [...sectorMatches, ...genericMatches];
  return picked.map((q) => ({
    id: q.id,
    category,
    difficulty: q.difficulty,
    prompt: q.interviewerLine,
    options: shuffle(
      q.options.map((o) => ({
        text: o.text,
        isBest: Boolean(o.isBest),
        feedback: o.feedback,
      }))
    ),
  }));
}

function withShuffledOptions(questions: RapidQuestion[]): RapidQuestion[] {
  return questions.map((q) => ({ ...q, options: shuffle(q.options) }));
}

export function buildRapidQuestions(sector?: SectorId): RapidQuestion[] {
  const mix = [
    ...fromClassicPool("uygulama", 4, sector),
    ...fromClassicPool("teorik", 4),
    ...withShuffledOptions(shuffle(vakaQuestions).slice(0, 4)),
    ...withShuffledOptions(shuffle(psikolojiQuestions).slice(0, 4)),
  ];
  // Kademeli zorluk: aynı zorluk seviyesindekiler karışık, ama genel sıralama kolaydan zora ilerler.
  return shuffle(mix).sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty]);
}
