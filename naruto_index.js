/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

//
// Alexa Fact Skill - Sample for Beginners
//

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');

// core functionality for fact skill
const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetNewFactIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    // gets a random fact by assigning an array to the variable
    // the random item from the array will be selected by the i18next library
    // the i18next library is set up in the Request Interceptor
    const randomFact = requestAttributes.t('FACTS');
    // concatenates a standard message with the random fact
    const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();
// TODO: Replace this data with your own.
// It is organized by language/locale.  You can safely ignore the locales you aren't using.
// Update the name and messages to align with the theme of your skill

const deData = {
  translation: {
    SKILL_NAME: 'Weltraumwissen',
    GET_FACT_MESSAGE: 'Hier sind deine Fakten: ',
    HELP_MESSAGE: 'Du kannst sagen, „Nenne mir einen Fakt über den Weltraum“, oder du kannst „Beenden“ sagen... Wie kann ich dir helfen?',
    HELP_REPROMPT: 'Wie kann ich dir helfen?',
    FALLBACK_MESSAGE: 'Die Weltraumfakten Skill kann dir dabei nicht helfen. Sie kann dir Fakten über den Raum erzählen, wenn du dannach fragst.',
    FALLBACK_REPROMPT: 'Wie kann ich dir helfen?',
    ERROR_MESSAGE: 'Es ist ein Fehler aufgetreten.',
    STOP_MESSAGE: 'Auf Wiedersehen!',
    FACTS:
      [
        'Ein Jahr dauert auf dem Merkur nur 88 Tage.',
        'Die Venus ist zwar weiter von der Sonne entfernt, hat aber höhere Temperaturen als Merkur.',
        'Venus dreht sich entgegen dem Uhrzeigersinn, möglicherweise aufgrund eines früheren Zusammenstoßes mit einem Asteroiden.',
        'Auf dem Mars erscheint die Sonne nur halb so groß wie auf der Erde.',
        'Jupiter hat den kürzesten Tag aller Planeten.',
      ],
  },
};

const dedeData = {
  translation: {
    SKILL_NAME: 'Weltraumwissen auf Deutsch',
  },
};

const enData = {
  translation: {
    SKILL_NAME: 'Anime Facts',
    GET_FACT_MESSAGE: 'Here\'s your fact: ',
    HELP_MESSAGE: 'You can say tell me a Anime fact, or, you can say exit... What can I help you with?',
    HELP_REPROMPT: 'What can I help you with?',
    FALLBACK_MESSAGE: 'The Anime Facts skill can\'t help you with that.  It can help you discover facts about space if you say tell me a Anime fact. What can I help you with?',
    FALLBACK_REPROMPT: 'What can I help you with?',
    ERROR_MESSAGE: 'Sorry, an error occurred.',
    STOP_MESSAGE: 'Goodbye!',
    FACTS:
      [
        "Naruto’s favorite ramen shop “Ichiraku” exists in real life.",
        "Shikamaru’s IQ is above 200.",
        "Naruto's trademark Kage Bunshin Jutsu ; is actually a Jōnin level technique",
        "The anime Naruto Shippuden almost got cancelled.A certain organization was not happy at the high amount of deaths in the series, and issued a complaint, requesting one of the sponsors of the show to pull their funding.",
        "Naruto is one of the biggest selling manga titles in the world",
        "Naruto has numerous references to Dragon Ball Z",
        "Rock Lee was the first person to ever touch Gaara, let alone hurt him",
        " The Leaf Village had one other ninja that was as strong as the Sannin.Kakashi’s father, Hatake Sakumo, is said to be just as strong as the Sannin. He wielded a white chakra blade that left a trail of white light whenever he cut something. Due to this his name nickname was  Konoha’s White Fang",
        "  Saskue Uchiha is the only character that can summon two types of animals .Saskue Uchiha is capable of summoning a Hawk and a Snake. No other character has been seen able to summon two different species.",
        " Naruto married Hinata on Sakura’s Birthday.",
        " When Tobi’s identity was revealed in 2012, Tobi and Obito trended worldwide on Twitter.",
        "  Konohamaru, Udon, and Moegi make a cameo in Ben 10 of all things ",
        " Sasuke’s hawk is named Garuda, after the legendary hawk Vishnu rides in Hindu mythology, who also solely eats snakes. What a coincidence. ",
        "If he takes his hood off, Kankuro’s hairstyle looks like Naruto’s.",
        "Asuma’s cigarette is never lit in the official American version",
        "The reason only Hinata appears in the Naruto ending song Jitensha meaning  Bicycle is because the anime staff contained a lot of Hinata fans.",
        "Team Seven Naruto’s team was the first group to have been passed by Kakashi.",
        "Kakuzu’s techniques are named after the series Mobile Suit Gundam.",
        "Neji’s forehead marks are different in the anime and manga.",
        "The tallest shinobi in Hidden Leaf is Ibiki Morino",
        "Sanji from One Piece was supposed to be named Naruto.",
        "The Legendary Sannin are a reference to an old novel",
        "The toads all have namesakes.They were famous actors and actress in the 80s and 90s.",
        "The Death Note Can’t Kill Children",
        "One-Punch Man started online, moved to paper, then to your screen.the hero actually started as a webcomic. Created by the anonymous named manga artist ONE, the comic launched online in early 2009, receiving almost 8 million views by June of 2012. ",
        "Beyond giving One-Punch Man an unassuming look, the character’s outfit also serves as a tribute to a beloved children’s character. Anpanman, a superhero with a jelly pastry for a head, starred in a manga that ran from 1973 to 2013, and in an anime that debuted in 1988 and still runs to this day.",
        "By saving the Split-Chinned Kid’s life, One-Punch Man changed the world.The boy was the grandson of multi-millionaire Agoni, who is so inspired by Saitama’s deed he forms the Hero Association. ",
        "One-Punch Man is theoretically almost as fast as the speed of light.Proof - Boros kicks Saitama so hard he flies from Earth to the Moon, only to discover that Saitama is able to jump back to Earth on his own in roughly 1.5 seconds. If the Earth is 238,855 miles away from the moon, and it takes 1.5 seconds to get back to Earth, Saitama is going 159,236 miles per second. The speed of light is 186,282 miles per second.",
        "Threats in the world of One-Punch Man come in five different levels ",
        "One-Punch Man’s workout might not make you the most powerful being on Earth, but it’s actually good for you.The workout is a combination of core training, leg training, and cardio, exercising a wider range of your muscle groups than just running every day. The one downside of this work out is you won’t build a ton of muscle doing it, thanks to the lack of a strength training beyond your normal body weight.On the other hand, that explains why One-Punch Man isn’t absolutely ripped. His work out is designed for lean strength.",
        "Saitama is a fan of his creator’s other work.For example, One-Punch Man creator ONE’s other series, Mob Psycho 100, makes a cameo appearance during Saitama’s childhood",
        "The first season of One Punch Man was done by legendary animation studio Madhouse.Madhouse, is also behind some of the other most popular and important anime titles of the last two decades, including Perfect Blue, Death Note, Ninja Scroll, and Paprika.",
        "The writer of One Punch Man, One decided to go with a rather simplistic design for Saitama because there are way too many superheroes that look cool. In One’s opinion, coolness comes from one’s spirit not looks.",
        "Before becoming a superhero, Saitama worked in a convenience store.This was confirmed in One Punch Man: Hero Perfection Q&A by ONE and it was also shown in ONE’s picture dairy on his old homepage. There is a scene where a robber is pointing a knife at Saitama and all Saitama did was wonder where is the barcode of the knife",
        "At the end of One Punch Man opening, Saitama makes a reference to Hunter x Hunter with us never noticing that. You can see how Saitama is placing his left hand over his right hand while preparing to land a blow. This is a parody of Gon Freecss’s attack Rock.",
        "When L wants to communicate without revealing his identity, he uses a capital L as his symbol. The letter comes from a real font called Cloister Black.",
        "After Light and L's fight in episode 18, many fans assumed L was using capoeira a form of dance fighting that originated among Brazilian slaves. Series creator Tsugumi Ohba hadn't written L as a master capoeirista, but he liked the idea so much that he declared it canon.",
        "Light and L are depicted as opposites in just about every way. Watch episode 2 again: you'll see that Light uses a PC and L uses a Mac.",
        "In the manga and anime, L recognizes ex-FBI agent Naomi Misora from her work on the Los Angeles BB murder cases, chronicled in one of the light novels. Though L works with her remotely, only once do they ever meet in person and Naomi never finds out that they did.",
        "Why did Ohba ( Writer of Death Note ) kill off Naomi Misora so early? Initially, he wanted a cool female character to balance out the male-heavy cast, but she ended up piecing the Kira case together faster than he anticipated. That's right: she dies because she's too smart. In a cast with Light and L, that's definitely saying something.",
        "A highly intelligent shinigami named Daril Ghiroza was originally intended to make a prominent appearance in the second season of the anime. She was replaced by the dimwitted Sidoh because he was much easier to draw.",
        "When creating characters in Death Note, Ohba chose names that sounded real but were unlikely to exist. This approach is particularly obvious in the Another Note light novel, which includes names like Quarter Queen, Believe Bridesmaid, and Blues-harp Babysplit.",
        "L's surname, Lawliet, is pronounced low light.",
        "Go back and watch episode 6 of Full Metal Panic! The Second Raid. L briefly appears in the foreground, riding a bike! Light, Misa, and Soichiro are also in this scene.",
      
      ],
  },
};

const enauData = {
  translation: {
    SKILL_NAME: 'Anime Facts',
  },
};

const encaData = {
  translation: {
    SKILL_NAME: 'Anime Facts',
  },
};

const engbData = {
  translation: {
    SKILL_NAME: 'Anime Facts',
  },
};

const eninData = {
  translation: {
    SKILL_NAME: 'Anime Facts',
  },
};

const enusData = {
  translation: {
    SKILL_NAME: 'American Space Facts',
  },
};

const esData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio',
    GET_FACT_MESSAGE: 'Aquí está tu curiosidad: ',
    HELP_MESSAGE: 'Puedes decir dime una curiosidad del espacio o puedes decir salir... Cómo te puedo ayudar?',
    HELP_REPROMPT: 'Como te puedo ayudar?',
    FALLBACK_MESSAGE: 'La skill Curiosidades del Espacio no te puede ayudar con eso.  Te puede ayudar a descubrir curiosidades sobre el espacio si dices dime una curiosidad del espacio. Como te puedo ayudar?',
    FALLBACK_REPROMPT: 'Como te puedo ayudar?',
    ERROR_MESSAGE: 'Lo sentimos, se ha producido un error.',
    STOP_MESSAGE: 'Adiós!',
    FACTS:
        [
          'Un año en Mercurio es de solo 88 días',
          'A pesar de estar más lejos del Sol, Venus tiene temperaturas más altas que Mercurio',
          'En Marte el sol se ve la mitad de grande que en la Tierra',
          'Jupiter tiene el día más corto de todos los planetas',
          'El sol es una esféra casi perfecta',
        ],
  },
};

const esesData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio para España',
  },
};

const esmxData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio para México',
  },
};

const esusData = {
  translation: {
    SKILL_NAME: 'Curiosidades del Espacio para Estados Unidos',
  },
};

const frData = {
  translation: {
    SKILL_NAME: 'Anecdotes de l\'Espace',
    GET_FACT_MESSAGE: 'Voici votre anecdote : ',
    HELP_MESSAGE: 'Vous pouvez dire donne-moi une anecdote, ou, vous pouvez dire stop... Comment puis-je vous aider?',
    HELP_REPROMPT: 'Comment puis-je vous aider?',
    FALLBACK_MESSAGE: 'La skill des anecdotes de l\'espace ne peux vous aider avec cela. Je peux vous aider à découvrir des anecdotes sur l\'espace si vous dites par exemple, donne-moi une anecdote. Comment puis-je vous aider?',
    FALLBACK_REPROMPT: 'Comment puis-je vous aider?',
    ERROR_MESSAGE: 'Désolé, une erreur est survenue.',
    STOP_MESSAGE: 'Au revoir!',
    FACTS:
        [
          'Une année sur Mercure ne dure que 88 jours.',
          'En dépit de son éloignement du Soleil, Vénus connaît des températures plus élevées que sur Mercure.',
          'Sur Mars, le Soleil apparaît environ deux fois plus petit que sur Terre.',
          'De toutes les planètes, Jupiter a le jour le plus court.',
          'Le Soleil est une sphère presque parfaite.',
        ],
  },
};

const frfrData = {
  translation: {
    SKILL_NAME: 'Anecdotes françaises de l\'espace',
  },
};

const frcaData = {
  translation: {
    SKILL_NAME: 'Anecdotes canadiennes de l\'espace',
  },
};

const hiData = {
  translation: {
    SKILL_NAME: 'Anime ज्ञान ',
    GET_FACT_MESSAGE: 'ये लीजिए आपका fact: ',
    HELP_MESSAGE: 'आप मुझे नया fact सुनाओ बोल सकते हैं या फिर exit भी बोल सकते हैं... आप क्या करना चाहेंगे?',
    HELP_REPROMPT: 'मैं आपकी किस प्रकार से सहायता कर सकती हूँ?',
    ERROR_MESSAGE: 'सॉरी, मैं वो समज नहीं पायी. क्या आप repeat कर सकते हैं?',
    STOP_MESSAGE: 'अच्छा bye, फिर मिलते हैं',
    FACTS:
      [
        "Naruto की पसंदीदा रेमन शॉप इचिराकु वास्तविक जीवन में मौजूद है।",
        "Shikamaru का आईक्यू 200 से ऊपर है।",
        "Naruto का ट्रेडमार्क केज बंशीन जटसू; वास्तव में एक जिन्न स्तर की तकनीक है",
        "एनीमे को लगभग रद्द कर दिया गया था। कुछ संगठन श्रृंखला में मौतों की उच्च मात्रा से खुश नहीं थे, और एक शिकायत जारी की, जिसमें शो के प्रायोजकों में से एक को अपनी निधि खींचने का अनुरोध किया गया।",
        "Naruto दुनिया में सबसे ज्यादा बिकने वाले मंगा खिताबों में से एक है",
        "Naruto के ड्रैगन बॉल जेड के कई संदर्भ हैं",
        "Rock Lee Gaara को छूने वाले पहले व्यक्ति थे, चोट पहुंचाना तो दुर्र की बात ",
        "लीफ विलेज में एक और Ninja था जो Sannin की तरह मजबूत था। काकाशी के पिता हतेके सकुमो के बारे में कहा जाता है कि वह Sannin की तरह ही मज़बूत था। उसने एक सफ़ेद चक्र ब्लेड को फिर से उतारा, जिससे जब भी वह कुछ काटता तो सफ़ेद प्रकाश का एक निशान छोड़ देता था। .इसके नाम के कारण कोनोहा का श्वेत फांग नाम था: ",
        "Sasuke Uchiha एकमात्र ऐसा चरित्र है जो दो प्रकार के जानवरों को समन कर सकता है। Sasuke Uchiha एक हॉक और एक सांप को बुलाने में सक्षम है। कोई अन्य चरित्र दो अलग-अलग प्रजातियों को बुलाने में सक्षम नहीं देखा गया है।",
        "Naruto ने हिनता से सकुरा के जन्मदिन पर शादी की।",
        "जब Tobi की पहचान 2012 में सामने आई थी, तो twitter पर Tobi और Obito trend कर रहे थे।",
        "Konohamaru, Udon और Moegi तीनो Ben 10 में एक episode में बैक्ग्राउंड में आते है ",
        " हिंदू पौराणिक कथाओं में विष्णु की सवारी के बाद Sasuke के बाज का नाम गरुड़ रखा गया है, जो पूरी तरह से सांपों को खाते हैं। क्या संयोग है। ",
        "अगर वह अपना हुड उतारता है, तो Kankuro का केश Naruto की तरह दिखता है।",
        "आधिकारिक अमेरिकी संस्करण में Asuma की सिगरेट कभी नहीं जलाई जाती है",
        "कारण केवल हिनता Naruto के अंत गीत जितेन्शा में दिखाई देता है जिसका अर्थ है साइकिल क्योंकि एनीमे के कर्मचारियों में हिनता के बहुत सारे प्रशंसक शामिल थे।",
        "टीम सेवन Naruto की टीम काकाशी द्वारा पारित किया गया पहला समूह था।",
        "Kakuzu की तकनीकों का नाम श्रृंखला मोबाइल सूट गुंडम के नाम पर रखा गया है।",
        "नेजी के माथे के निशान एनीमे और मंगा में भिन्न हैं।",
        "हिडन लीफ में सबसे लंबा शिबोबी इबिकी मोरिनो है",
        "वन पीस से सांजी को Naruto नाम दिया जाना था।",
        "द लेजेंडरी सैनिन एक पुराने उपन्यास का संदर्भ है",
        "टॉड में सभी के नाम हैं। वे 80 और 90 के दशक में प्रसिद्ध अभिनेता और अभिनेत्री थे।"
      ],
  },
};

const hiinData = {
  translation: {
    SKILL_NAME: 'Anime ज्ञान ',
  },
}

const itData = {
  translation: {
    SKILL_NAME: 'Aneddoti dallo spazio',
    GET_FACT_MESSAGE: 'Ecco il tuo aneddoto: ',
    HELP_MESSAGE: 'Puoi chiedermi un aneddoto dallo spazio o puoi chiudermi dicendo "esci"... Come posso aiutarti?',
    HELP_REPROMPT: 'Come posso aiutarti?',
    FALLBACK_MESSAGE: 'Non posso aiutarti con questo. Posso aiutarti a scoprire fatti e aneddoti sullo spazio, basta che mi chiedi di dirti un aneddoto. Come posso aiutarti?',
    FALLBACK_REPROMPT: 'Come posso aiutarti?',
    ERROR_MESSAGE: 'Spiacenti, si è verificato un errore.',
    STOP_MESSAGE: 'A presto!',
    FACTS:
      [
        'Sul pianeta Mercurio, un anno dura solamente 88 giorni.',
        'Pur essendo più lontana dal Sole, Venere ha temperature più alte di Mercurio.',
        'Su Marte il sole appare grande la metà che su la terra. ',
        'Tra tutti i pianeti del sistema solare, la giornata più corta è su Giove.',
        'Il Sole è quasi una sfera perfetta.',
      ],
  },
};

const ititData = {
  translation: {
    SKILL_NAME: 'Aneddoti dallo spazio',
  },
};

const jpData = {
  translation: {
    SKILL_NAME: '日本語版豆知識',
    GET_FACT_MESSAGE: '知ってましたか？',
    HELP_MESSAGE: '豆知識を聞きたい時は「豆知識」と、終わりたい時は「おしまい」と言ってください。どうしますか？',
    HELP_REPROMPT: 'どうしますか？',
    ERROR_MESSAGE: '申し訳ありませんが、エラーが発生しました',
    STOP_MESSAGE: 'さようなら',
    FACTS:
      [
        '水星の一年はたった88日です。',
        '金星は水星と比べて太陽より遠くにありますが、気温は水星よりも高いです。',
        '金星は反時計回りに自転しています。過去に起こった隕石の衝突が原因と言われています。',
        '火星上から見ると、太陽の大きさは地球から見た場合の約半分に見えます。',
        '木星の<sub alias="いちにち">1日</sub>は全惑星の中で一番短いです。',
        '天の川銀河は約50億年後にアンドロメダ星雲と衝突します。',
      ],
  },
};

const jpjpData = {
  translation: {
    SKILL_NAME: '日本語版豆知識',
  },
};

const ptbrData = {
  translation: {
    SKILL_NAME: 'Fatos Espaciais',
  },
};

const ptData = {
  translation: {
    SKILL_NAME: 'Fatos Espaciais',
    GET_FACT_MESSAGE: 'Aqui vai: ',
    HELP_MESSAGE: 'Você pode me perguntar por um fato interessante sobre o espaço, ou, fexar a skill. Como posso ajudar?',
    HELP_REPROMPT: 'O que vai ser?',
    FALLBACK_MESSAGE: 'A skill fatos espaciais não tem uma resposta para isso. Ela pode contar informações interessantes sobre o espaço, é só perguntar. Como posso ajudar?',
    FALLBACK_REPROMPT: 'Eu posso contar fatos sobre o espaço. Como posso ajudar?',
    ERROR_MESSAGE: 'Desculpa, algo deu errado.',
    STOP_MESSAGE: 'Tchau!',
    FACTS:
      [
        'Um ano em Mercúrio só dura 88 dias.',
        'Apesar de ser mais distante do sol, Venus é mais quente que Mercúrio.',
        'Visto de marte, o sol parece ser metade to tamanho que nós vemos da terra.',
        'Júpiter tem os dias mais curtos entre os planetas no nosso sistema solar.',
        'O sol é quase uma esfera perfeita.',
      ],
  },
};

// constructs i18n and l10n data structure
const languageStrings = {
  'de': deData,
  'de-DE': dedeData,
  'en': enData,
  'en-AU': enauData,
  'en-CA': encaData,
  'en-GB': engbData,
  'en-IN': eninData,
  'en-US': enusData,
  'es': esData,
  'es-ES': esesData,
  'es-MX': esmxData,
  'es-US': esusData,
  'fr': frData,
  'fr-FR': frfrData,
  'fr-CA': frcaData,
  'hi': hiData,
  'hi-IN': hiinData,
  'it': itData,
  'it-IT': ititData,
  'ja': jpData,
  'ja-JP': jpjpData,
  'pt': ptData,
  'pt-BR': ptbrData,
};
