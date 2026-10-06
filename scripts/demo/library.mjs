// The demo library: real books, notes written the way a reader writes them
// (paraphrase, a short quotation, a thought of their own), on realistic pages.
//
// `isbn` books get their real cover from Open Library when seeded; the rest
// keep Hassad's designed cloth cover, so both treatments can be judged.
// Colours are the backend's five ribbon colours.

export const C = {
  blue: '#DBE9FE',
  green: '#D7F6E5',
  yellow: '#F7F7D3',
  pink: '#F7DEE4',
  purple: '#EFE9F5',
};

export const shelves = [
  {
    name: 'فكر وتاريخ',
    books: [
      {
        name: 'مقدمة ابن خلدون',
        author: 'عبد الرحمن بن خلدون',
        notes: [
          {
            name: 'العصبية أساس المُلك',
            page: 142,
            color: C.blue,
            favourite: true,
            content:
              'الدولة عند ابن خلدون لا تقوم بالقوة وحدها، بل بالعصبية: الرابطة التي تجعل الجماعة تتحرك كجسدٍ واحد وتدافع عن نفسها.\nوحين تضعف هذه الرابطة يبدأ الهرم من الداخل قبل أن يظهر في الخارج.',
          },
          {
            name: 'للدول أعمارٌ كأعمار الناس',
            page: 170,
            color: C.green,
            favourite: true,
            content:
              'قلّما يتجاوز عمر الدولة ثلاثة أجيال: جيلٌ يبني بخشونة البداوة، وجيلٌ يرث فيحافظ، وجيلٌ ينسى كلفة البناء كأنها لم تكن.\nما يلفتني هنا أن الخطر الأكبر هو النسيان، لا العدو.',
          },
          {
            name: 'المغلوب مولعٌ بتقليد الغالب',
            page: 147,
            color: C.yellow,
            content:
              'يقلّد المغلوب الغالبَ في لباسه وعاداته ولغته، لأنه يظن الكمال فيه. تفسّر هذه الملاحظة كثيراً من انبهارنا بالآخر اليوم، حتى في التفاصيل الصغيرة.',
          },
          {
            name: 'الظلم مؤذنٌ بخراب العمران',
            page: 286,
            color: C.pink,
            content:
              'لا يقصد ابن خلدون بالظلم أخذ المال بغير حق فقط، بل كل ما يُضعف أمل الناس في الكسب. فإذا ذهبت الآمال انقبضت الأيدي عن العمل، وكسدت الأسواق، وقلّت الجباية، فتزيد الدولة الظلم لتعوّض ما نقص.\nهكذا تدور الحلقة حتى الخراب، لا لأن أحداً أراده، بل لأن أحداً لم يرَ أن العمران كله قائمٌ على الأمل.',
          },
        ],
      },
      {
        name: 'شروط النهضة',
        author: 'مالك بن نبي',
        notes: [
          {
            name: 'معادلة الحضارة',
            page: 45,
            color: C.blue,
            content:
              'الحضارة عند مالك بن نبي: إنسان + تراب + وقت، والفكرة الدينية هي التي تمزج هذه العناصر.\nالمشكلة إذن ليست في نقص الأشياء، بل في الإنسان الذي يحسن أو لا يحسن توظيفها.',
          },
          {
            name: 'القابلية للاستعمار',
            page: 152,
            color: C.pink,
            favourite: true,
            content:
              'قبل أن يُستعمَر شعبٌ يكون قد صار قابلاً للاستعمار. فكرة قاسية لكنها عادلة: تنقل السؤال من «ماذا فعلوا بنا؟» إلى «ماذا فينا جعل ذلك ممكناً؟».',
          },
        ],
      },
      {
        name: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '9780062316097',
        notes: [
          {
            name: 'Shared fictions',
            page: 27,
            color: C.blue,
            content:
              'Large-scale cooperation rests on stories we all agree to believe: money, nations, companies. None of them exist outside our shared imagination, yet they organise millions of strangers.',
          },
          {
            name: 'The luxury trap',
            page: 87,
            color: C.yellow,
            content:
              'Every convenience creates new obligations. Farming promised an easier life and delivered longer days.\nWorth remembering each time I adopt a new tool “to save time”.',
          },
        ],
      },
    ],
  },
  {
    name: 'أدب ورواية',
    books: [
      {
        name: 'الأيام',
        author: 'طه حسين',
        notes: [
          {
            name: 'العالم بالأصوات',
            page: 23,
            color: C.purple,
            content:
              'يصف الصبي الكفيف كيف عرف عالمه بالأصوات والروائح وملمس الأشياء: السياج، والقناة، وصوت الشاعر في الليل. كتابة تجعلك تعيد اكتشاف حواسك.',
          },
          {
            name: 'الكرامة في التفاصيل',
            page: 118,
            color: C.yellow,
            content:
              'أكثر ما يؤلم في الفصل ليس العمى، بل نظرات الشفقة وضحكات الإخوة الصغيرة على مائدة الطعام. قرّر بعدها أن يأكل وحده؛ قرارٌ صغير يكشف كبرياءً كبيرة.',
          },
        ],
      },
      {
        name: 'موسم الهجرة إلى الشمال',
        author: 'الطيب صالح',
        notes: [
          {
            name: 'دفء العودة',
            page: 5,
            color: C.green,
            content:
              'يعود الراوي بعد سنوات في أوروبا فيشعر بدفء القبيلة، كأنه كان قطعة ثلج تذوب. افتتاحية تقول كل شيء عن الحنين قبل أن تبدأ الحكاية.',
          },
          {
            name: 'مصطفى سعيد',
            page: 60,
            color: C.pink,
            favourite: true,
            content:
              'مصطفى سعيد ليس شخصاً بقدر ما هو سؤال: ماذا يفعل الاستعمار بالعقل الذي يتعلّم في مدارسه؟ أعجبني أن الرواية لا تجيب، بل تتركك أمام المرآة.',
          },
        ],
      },
      {
        name: 'ثلاثية غرناطة',
        author: 'رضوى عاشور',
        notes: [],
      },
      {
        name: 'One Hundred Years of Solitude',
        author: 'Gabriel García Márquez',
        isbn: '9780060883287',
        notes: [
          {
            name: 'The insomnia plague',
            page: 49,
            color: C.purple,
            content:
              'When Macondo starts forgetting, they label everything: “table”, “chair”, “cow — milk her every morning”. A beautiful image of how fragile knowledge is until it’s written down.',
          },
          {
            name: 'الزمن دائرة',
            page: 396,
            color: C.blue,
            content:
              'تتكرر الأسماء والأخطاء جيلاً بعد جيل في بيت بوينديا، حتى تشعر أن الزمن لا يتقدّم بل يدور. لم أعد أخلط بين الأسماء؛ صرت أفهم لماذا تتشابه.',
          },
        ],
      },
    ],
  },
  {
    name: 'عادات وإنتاجية',
    books: [
      {
        name: 'Atomic Habits',
        author: 'James Clear',
        isbn: '9780735211292',
        notes: [
          {
            name: 'Habits as votes',
            page: 38,
            color: C.yellow,
            favourite: true,
            content:
              'Every action is a vote for the type of person you want to become.\nكل عادة صغيرة صوتٌ للهوية التي أريدها، ولا أحتاج الأغلبية المطلقة، بل أن أستمر في التصويت.',
          },
          {
            name: 'Systems over goals',
            page: 23,
            color: C.blue,
            content:
              'Winners and losers often share the same goals. What differs is the system. I keep setting reading targets; better to fix the system: twenty pages before the phone in the morning.',
          },
          {
            name: 'البيئة أقوى من الإرادة',
            page: 84,
            color: C.green,
            content:
              'وضعتُ الكتاب على الوسادة والهاتف في المطبخ. لم تتغير إرادتي، تغيّر الطريق الأسهل فقط، وقرأت هذا الأسبوع ضعف الأسبوع الماضي.',
          },
          {
            name: 'The two-minute rule',
            page: 162,
            color: C.purple,
            content:
              'Scale any new habit down until it takes two minutes: “read before bed” becomes “read one page”. A habit must be established before it can be improved.',
          },
        ],
      },
      {
        name: 'Deep Work',
        author: 'Cal Newport',
        isbn: '9781455586691',
        notes: [
          {
            name: 'Attention residue',
            page: 42,
            color: C.pink,
            content:
              'When you switch tasks, part of your attention stays stuck on the last one. Checking email “for a second” costs far more than a second.',
          },
          {
            name: 'طقس الإغلاق',
            page: 151,
            color: C.green,
            content:
              'في نهاية اليوم يراجع قائمة المهام ويكتب خطة الغد ثم يقول بصوت مسموع: انتهى. جرّبته ثلاثة أيام، وصار المساء لي فعلاً لا للعمل المؤجَّل.',
          },
        ],
      },
      {
        name: 'Essentialism',
        author: 'Greg McKeown',
        isbn: '9780804137409',
        notes: [
          {
            name: 'Less, but better',
            page: 5,
            color: C.yellow,
            content:
              'Not getting more done, but getting the right things done. If it isn’t a clear yes, it’s a no — the hardest sentence in the book for me.',
          },
        ],
      },
    ],
  },
  {
    name: 'تأملات',
    books: [
      {
        name: 'صيد الخاطر',
        author: 'ابن الجوزي',
        notes: [
          {
            name: 'شرف الوقت',
            page: 211,
            color: C.yellow,
            favourite: true,
            content:
              'ينبّه ابن الجوزي إلى أن يعرف الإنسانُ شرفَ زمانه وقدرَ وقته، فلا يضيّع منه لحظةً في غير فائدة.\nكُتب قبل تسعة قرون، ويصلح تعليقاً على شاشة هاتفي اليوم.',
          },
          {
            name: 'أنس الكتب',
            page: 402,
            color: C.blue,
            content:
              'يحكي أنه طالع آلاف المجلدات وما زال في طلب المزيد، وأن الكتب كانت أنسه حين يستوحش من الناس. أحببت هذه الصحبة الهادئة بين القارئ وكتبه.',
          },
        ],
      },
      {
        name: 'Meditations',
        author: 'Marcus Aurelius',
        notes: [
          {
            name: 'The morning reminder',
            page: 17,
            color: C.blue,
            content:
              'Begin the day expecting to meet the ungrateful, the arrogant and the dishonest — and remember they act from ignorance of what is good. Not cynicism: preparation.',
          },
          {
            name: 'ما في يدك وما ليس في يدك',
            page: 40,
            color: C.green,
            content:
              'يعود ماركوس مراراً إلى الفكرة نفسها: لا يؤذيك الحدث، بل حكمك عليه. حين أغضب من زحام الطريق أتذكّر أن الزحام ليس في يدي، أما ردّ فعلي فكذلك.',
          },
        ],
      },
      {
        name: 'Man’s Search for Meaning',
        author: 'Viktor E. Frankl',
        isbn: '9780807014295',
        notes: [
          {
            name: 'The last of the human freedoms',
            page: 66,
            color: C.pink,
            favourite: true,
            content:
              'Everything can be taken from a person but one thing: the freedom to choose one’s attitude in any given set of circumstances.',
          },
          {
            name: 'معنى المعاناة',
            page: 112,
            color: C.green,
            content:
              'لا يطلب فرانكل أن نحب الألم، بل أن نجد له معنى حين لا نستطيع تجنّبه. من يعرف «لماذا» يعيش، يستطيع أن يحتمل أي «كيف».',
          },
        ],
      },
      {
        name: 'وحي القلم',
        author: 'مصطفى صادق الرافعي',
        notes: [
          {
            name: 'البيان قبل الفكرة',
            page: 33,
            color: C.purple,
            content:
              'يكتب الرافعي كأنه ينحت؛ تقرأ الجملة مرتين، مرة لمعناها ومرة لجمالها. لاحظت أنني أبطئ في قراءته عمداً، وهذا وحده درسٌ في القراءة.',
          },
        ],
      },
    ],
  },
  // An honest empty shelf: a reader's to-read list before anything is on it.
  {name: 'للقراءة لاحقاً', books: []},
];

// Books being read now, not on a shelf yet.
export const unshelved = [
  {
    name: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '9780374533557',
    notes: [
      {
        name: 'Two systems',
        page: 20,
        color: C.blue,
        content:
          'System 1 is fast, intuitive and always on; System 2 is slow, deliberate and lazy. Most of what we call thinking is System 1 telling a story that System 2 signs without reading.',
      },
      {
        name: 'WYSIATI',
        page: 85,
        color: C.purple,
        favourite: true,
        content:
          'What you see is all there is: we build a coherent story from whatever evidence is at hand, and rarely ask what is missing.',
      },
      {
        name: 'المرساة',
        page: 119,
        color: C.yellow,
        content:
          'رقمٌ عشوائي يُذكر قبل السؤال يغيّر تقديرنا للإجابة. صرت أنتبه في المفاوضات لأول رقم يُطرح؛ هو غالباً ما سيحكم بقية الحديث.',
      },
    ],
  },
  {
    name: 'The Psychology of Money',
    author: 'Morgan Housel',
    isbn: '9780857197689',
    notes: [
      {
        name: 'Enough',
        page: 31,
        color: C.green,
        content:
          'The hardest financial skill is getting the goalpost to stop moving. There is no reason to risk what you have and need for what you don’t have and don’t need.',
      },
      {
        name: 'هامش للخطأ',
        page: 115,
        color: C.pink,
        content:
          'الخطة الجيدة ليست التي تنجح إن سار كل شيء كما توقّعت، بل التي تحتمل أن أكون مخطئاً. أريد هذا الهامش في وقتي أيضاً، لا في مالي فقط.',
      },
    ],
  },
];
