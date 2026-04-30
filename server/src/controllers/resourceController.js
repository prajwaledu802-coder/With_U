const asyncHandler = require('../utils/asyncHandler');

const RESOURCES = {
  en: [
    {
      id: 'breath-1',
      category: 'breathing',
      title: '4-6 breath',
      body: 'Breathe in for 4. Out for 6. Repeat 5 times. Longer exhales calm the nervous system.',
      duration: '2 min',
      tags: ['stress', 'overwhelm'],
    },
    {
      id: 'rest-1',
      category: 'rest',
      title: 'A small reset',
      body: 'Sit somewhere quiet. Eyes closed. No goal — just three minutes.',
      duration: '3 min',
      tags: ['exhaustion'],
    },
    {
      id: 'reach-1',
      category: 'connection',
      title: 'One small message',
      body: 'Send "thinking of you" to someone you love. That\'s the whole task.',
      duration: '1 min',
      tags: ['isolation'],
    },
    {
      id: 'note-1',
      category: 'reflection',
      title: 'Three soft notes',
      body: "Write three things you carried today. No judgement — just naming them.",
      duration: '5 min',
      tags: ['overwhelm', 'worry'],
    },
    {
      id: 'walk-1',
      category: 'movement',
      title: 'A doorstep walk',
      body: 'Step outside. Five slow breaths. Step back in.',
      duration: '2 min',
      tags: ['worry', 'overwhelm'],
    },
  ],
  hi: [
    {
      id: 'breath-1',
      category: 'breathing',
      title: '४-६ साँस',
      body: 'चार गिनकर अंदर। छह गिनकर बाहर। पाँच बार। लंबी साँस-छोड़ शांत करती है।',
      duration: '२ मि',
      tags: ['stress', 'overwhelm'],
    },
    {
      id: 'rest-1',
      category: 'rest',
      title: 'थोड़ा रुकना',
      body: 'किसी शांत जगह बैठिए। आँखें बंद। तीन मिनट के लिए कुछ नहीं।',
      duration: '३ मि',
      tags: ['exhaustion'],
    },
    {
      id: 'reach-1',
      category: 'connection',
      title: 'एक छोटा संदेश',
      body: 'किसी अपने को "तुम याद आए" लिख भेजिए। बस इतना।',
      duration: '१ मि',
      tags: ['isolation'],
    },
    {
      id: 'note-1',
      category: 'reflection',
      title: 'तीन कोमल पंक्तियाँ',
      body: 'आज जो कुछ उठाया उसे तीन वाक्यों में लिखिए — बिना निर्णय के।',
      duration: '५ मि',
      tags: ['overwhelm', 'worry'],
    },
    {
      id: 'walk-1',
      category: 'movement',
      title: 'दरवाज़े तक की सैर',
      body: 'बाहर जाइए। पाँच धीमी साँस। फिर अंदर।',
      duration: '२ मि',
      tags: ['worry', 'overwhelm'],
    },
  ],
};

exports.list = asyncHandler(async (req, res) => {
  const lang = req.query.lang === 'hi' ? 'hi' : 'en';
  const tag = req.query.tag;
  let items = RESOURCES[lang];
  if (tag) items = items.filter((r) => r.tags.includes(tag));
  res.json({ success: true, items });
});
