// SMARTMOVE Grounded Conversational Intelligence Engine
// Enforces strict data provenance and full multilingual voice responses

import { cityStore } from '../supabase/mockStore';

export interface AssistantAction {
  type: 'NAVIGATE' | 'SET_MAP_LAYER' | 'SET_SIMULATION_CONTROL' | 'NONE';
  payload?: any;
}

export interface AssistantResponse {
  reply: string;
  source: 'SIMULATED DATA' | 'LIVE API DATA' | 'ESTIMATED VALUE';
  action?: AssistantAction;
  whyExplanation?: string;
  confidence?: number;
}

export async function processAssistantQuery(
  query: string,
  lang: string = 'en'
): Promise<AssistantResponse> {
  const q = query.toLowerCase().trim();
  const state = cityStore.state;
  const l = (lang || 'en').toLowerCase().slice(0, 2);

  // 1. College Road Jam / Traffic Intent
  if (q.includes('college') || q.includes('jam') || q.includes('traffic') || q.includes('congest') || q.includes('போக்குவரத்து') || q.includes('நெரிசல்') || q.includes('ट्रैफिक') || q.includes('जाम')) {
    const colTraffic = state.traffic_data.find((t) => t.id === 'tf_college') || { congestion_pct: 84, avg_speed_kmh: 14 };
    
    let reply = `College Road is currently at ${colTraffic.congestion_pct}% congestion with vehicle speeds reduced to ${colTraffic.avg_speed_kmh} km/h. Recommended action: Divert via Ring Express Bypass.`;
    if (l === 'ta') {
      reply = `கல்லூரி சாலையில் தற்போது ${colTraffic.congestion_pct}% கடுமையான போக்குவரத்து நெரிசல் உள்ளது. வாகன வேகம் மணிக்கு ${colTraffic.avg_speed_kmh} கி.மீ ஆகக் குறைந்துள்ளது. ரிங் எக்ஸ்பிரஸ் பைபாஸ் வழியாக செல்ல பரிந்துரைக்கப்படுகிறது.`;
    } else if (l === 'hi') {
      reply = `कॉलेज रोड पर वर्तमान में ${colTraffic.congestion_pct}% भारी ट्रैफिक है। औसत गति घटकर ${colTraffic.avg_speed_kmh} किमी/घंटा रह गई है। रिंग एक्सप्रेस बाईपास से जाने की सिफारिश की जाती है।`;
    } else if (l === 'te') {
      reply = `కాలేజీ రోడ్డులో ప్రస్తుతం ${colTraffic.congestion_pct}% ట్రాఫిక్ జామ్ ఉంది. వాహనాల వేగం గంటకు ${colTraffic.avg_speed_kmh} కి.మీ. రింగ్ ఎక్స్‌ప్రెస్ బైపాస్ ద్వారా వెళ్లాలని సిఫార్సు చేయబడింది.`;
    }

    return {
      reply,
      source: 'SIMULATED DATA',
      whyExplanation: 'NIT dismissal (17:00) + Tech Park shifts (17:15) overlap with road throughput limit of 1,400 vph.',
      confidence: 93,
      action: { type: 'SET_MAP_LAYER', payload: 'traffic' },
    };
  }

  // 2. Bus 102 / Transit Crowding Intent
  if (q.includes('bus 102') || q.includes('102') || q.includes('bus') || q.includes('transit') || q.includes('பேருந்து') || q.includes('बस')) {
    const bus = state.bus_routes.find((b) => b.route_number === '102') || { current_eta_min: 6, current_occupancy_pct: 94, delay_min: 8, active_buses: 4 };
    
    let reply = `Bus Route 102 arrives in approx ${bus.current_eta_min} min with ${bus.delay_min} min delay. Passenger crowding is about ${bus.current_occupancy_pct}%.`;
    if (l === 'ta') {
      reply = `பேருந்து எண் 102 இன்னும் ${bus.current_eta_min} நிமிடங்களில் வந்து சேரும். ${bus.delay_min} நிமிடங்கள் தாமதம் உள்ளது. பேருந்தில் சுமார் ${bus.current_occupancy_pct}% கூட்டம் உள்ளது.`;
    } else if (l === 'hi') {
      reply = `बस संख्या 102 लगभग ${bus.current_eta_min} मिनट में पहुंचेगी। ${bus.delay_min} मिनट की देरी है और भीड़ लगभग ${bus.current_occupancy_pct}% है।`;
    } else if (l === 'te') {
      reply = `బస్సు నంబర్ 102 సుమారు ${bus.current_eta_min} నిమిషాల్లో వస్తుంది. ప్రయాణికుల రద్దీ ${bus.current_occupancy_pct}% ఉంది.`;
    }

    return {
      reply,
      source: 'SIMULATED DATA',
      confidence: 91,
      action: { type: 'NAVIGATE', payload: '/app/buses' },
    };
  }

  // 3. Parking Intent
  if (q.includes('parking') || q.includes('park') || q.includes('spot') || q.includes('பார்க்கிங்') || q.includes('पार्किंग')) {
    const campus = state.parking_locations.find((p) => p.id === 'pk_campus') || { available_spots: 14 };
    const metro = state.parking_locations.find((p) => p.id === 'pk_metro') || { available_spots: 155 };
    
    let reply = `Campus Smart Lot has only ${campus.available_spots} spots remaining. We recommend Metro Park & Ride Hub with ${metro.available_spots} available spots.`;
    if (l === 'ta') {
      reply = `கேம்பஸ் ஸ்மார்ட் பார்க்கிங்கில் ${campus.available_spots} இடங்கள் மட்டுமே உள்ளன. மெட்ரோ பார்க்கிங்கிற்கு செல்ல பரிந்துரைக்கப்படுகிறது, அங்கு ${metro.available_spots} இடங்கள் காலியாக உள்ளன.`;
    } else if (l === 'hi') {
      reply = `कैंपस स्मार्ट पार्किंग में केवल ${campus.available_spots} स्थान शेष हैं। मेट्रो पार्क एंड राइड पर जाएं जहां ${metro.available_spots} स्थान उपलब्ध हैं।`;
    } else if (l === 'te') {
      reply = `క్యాంపస్ పార్కింగ్‌లో ${campus.available_spots} స్థలాలు మాత్రమే ఉన్నాయి. మెట్రో పార్కింగ్‌లో ${metro.available_spots} స్థలాలు ఖాళీగా ఉన్నాయి.`;
    }

    return {
      reply,
      source: 'SIMULATED DATA',
      confidence: 95,
      action: { type: 'NAVIGATE', payload: '/app/parking' },
    };
  }

  // 4. Road Pricing / Toll Intent
  if (q.includes('road pricing') || q.includes('pricing') || q.includes('toll') || q.includes('erp') || q.includes('சுங்கம்') || q.includes('கட்டணம்') || q.includes('टोल')) {
    let reply = `Current CBD Dynamic ERP toll is ₹12. Next scheduled adjustment is in 18 minutes. Electric vehicles receive an automatic 25% green rebate!`;
    if (l === 'ta') {
      reply = `தற்போதைய CBD டைனமிக் ERP சுங்கக் கட்டணம் ₹12 மட்டுமே. அடுத்த கட்டண மாற்றம் 18 நிமிடங்களில் நடக்கும். மின்சார வாகனங்களுக்கு 25% பசுமை தள்ளுபடி உண்டு!`;
    } else if (l === 'hi') {
      reply = `वर्तमान सीबीडी डायनामिक ईआरपी टोल ₹12 है। अगला परिवर्तन 18 मिनट में होगा। इलेक्ट्रिक वाहनों पर 25% की छूट है!`;
    } else if (l === 'te') {
      reply = `ప్రస్తుత ఈఆర్పీ టోల్ ₹12 మాత్రమే. ఎలక్ట్రిక్ వాహనాలకు 25% తగ్గింపు లభిస్తుంది!`;
    }

    return {
      reply,
      source: 'SIMULATED DATA',
      confidence: 94,
      action: { type: 'NAVIGATE', payload: '/app/road-pricing' },
    };
  }

  // 5. Emergency / 112 Intent
  if (q.includes('emergency') || q.includes('ambulance') || q.includes('112') || q.includes('அவசரம்') || q.includes('ஆம்புலன்ஸ்') || q.includes('आपात')) {
    let reply = `For life-threatening emergencies, dial 112 immediately. SMARTMOVE active Green Corridor reduces ambulance transit time to 8 min.`;
    if (l === 'ta') {
      reply = `உயிர் காக்கும் அவசரநிலைகளுக்கு உடனடியாக 112 ஐ அழைக்கவும். ஆம்புலன்ஸ் 108 பசுமை வழித்தடம் பயண நேரத்தை 8 நிமிடங்களாகக் குறைக்கிறது.`;
    } else if (l === 'hi') {
      reply = `जीवन रक्षक आपात स्थितियों के लिए तुरंत 112 डायल करें। एम्बुलेंस 108 ग्रीन कॉरिडोर यात्रा समय को 8 मिनट तक कम करता है।`;
    }

    return {
      reply,
      source: 'SIMULATED DATA',
      confidence: 96,
      action: { type: 'NAVIGATE', payload: '/app/emergency' },
    };
  }

  // 6. Generic Urban Mobility Status
  let defaultReply = `SMARTMOVE AI Assistant: Monitoring city corridors and transit lines. Would you like to check route recommendations or parking availability?`;
  if (l === 'ta') {
    defaultReply = `ஸ்மார்ட்மூவ் AI உதவியாளர்: நகரத்தின் போக்குவரத்து மற்றும் பேருந்து வழித்தடங்களை கண்காணிக்கிறது. உங்களுக்கு சிறந்த வழித்தடம் அல்லது பார்க்கிங் தகவல் தேவையா?`;
  } else if (l === 'hi') {
    defaultReply = `स्मार्टमूव्ह AI सहायक: शहर के प्रमुख मार्गों और बस लाइनों की निगरानी कर रहा है। क्या आप मार्ग या पार्किंग उपलब्धता देखना चाहते हैं?`;
  } else if (l === 'te') {
    defaultReply = `స్మార్ట్‌మూవ్ AI సహాయకుడు: నగర రవాణా మార్గాలను పర్యవేక్షిస్తోంది. మీకు మార్గం లేదా పార్కింగ్ సమాచారం కావాలా?`;
  }

  return {
    reply: defaultReply,
    source: 'SIMULATED DATA',
    confidence: 88,
  };
}
