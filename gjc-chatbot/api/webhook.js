// Multi-Site MessageHub Chatbot Webhook
// Routes messages to the correct AI personality based on inbox ID
// Powered by OpenAI GPT, deployed as a Vercel Serverless Function

const https = require("https");

// ─── CONFIG (set these as Environment Variables in Vercel) ───────────────────
const MESSAGEHUB_BASE_URL = process.env.MESSAGEHUB_BASE_URL; // https://messagehub.myclickfunnels.com
const MESSAGEHUB_API_TOKEN = process.env.MESSAGEHUB_API_TOKEN; // Your MessageHub API access token
const MESSAGEHUB_ACCOUNT_ID = process.env.MESSAGEHUB_ACCOUNT_ID; // 86
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Your OpenAI API key

// ─── INBOX IDs ───────────────────────────────────────────────────────────────
const GJC_INBOX_ID = 108441;       // Georgetown Judo Club live chat widget (confirmed from logs)
const DJL_INBOX_ID = 207;          // davidjlamoureux.com chat inbox

// Only these two live chat widget inboxes get an auto-response.
// All other inboxes (email, etc.) are silently ignored.
const ALLOWED_INBOX_IDS = [GJC_INBOX_ID, DJL_INBOX_ID];

// ─── SYSTEM PROMPT: Georgetown Judo Club ─────────────────────────────────────
const GJC_SYSTEM_PROMPT = `You are a friendly and enthusiastic customer service assistant for Georgetown Judo Club, located in Georgetown, Texas. Your job is to answer questions from potential and current students in a warm, welcoming, and encouraging tone.

Here is everything you need to know about the club:

BUSINESS INFO:
- Name: Georgetown Judo Club (housed by 10th Planet Jiu-Jitsu Georgetown)
- Address: 1523 Northwest Blvd Suite 105/110, Georgetown, TX 78628
- Phone: (512) 630-0422 (call or text David Lamoureux directly)
- Website: https://www.georgetownjudoclub.com

HOURS & SCHEDULE:
- Monday: 8:15pm - 9:30pm (Judo, Age 10+)
- Thursday: 8:15pm - 9:30pm (Judo, Age 10+)
- Saturday: Private lessons by appointment only
- Kids and adults train together at the same time

CLASSES OFFERED:
- Judo (Age 10+): Sport and practical self-defense judo, open to all skill levels. Teaches throws, takedowns, and ground control. Students can compete in tournaments.
- Self Defense / Krav Maga: Taught by David Lamoureux. Practical real-world self-defense system used by the Israeli Defense Forces.

FREE TRIAL:
- New students get 2 FREE classes to try before committing
- To book, go to https://www.georgetownjudoclub.com, fill out the short form, and pick Monday or Thursday
- The club will be notified and get them set up

MEMBERSHIP PRICING:
- First week is FREE before billing starts
- Monthly: $50/month (come as often as you like, classes twice a week)
- Quarterly: $137.50/quarter ($45.83/month equivalent, get 1 free month per year)
- Yearly: $500/year ($41.67/month equivalent, get 2 free months per year)
- Group discounts available:
  - Person 1: full price
  - Person 2: 20% off
  - Person 3: 25% off
  - Person 4: 30% off
- Full pricing details: https://www.georgetownjudoclub.com/join-today

AGE REQUIREMENTS:
- Minimum age is 10 years old
- Kids and adults train together in the same class

GEAR / UNIFORM:
- No gi (uniform) is required to try your first class
- Just wear comfortable athletic clothes you can move in
- You will want to buy a gi once you decide to stick around
- David can point new students in the right direction on gear

INSTRUCTOR:
- David Lamoureux
- 1st degree black belt in Judo (trained 8 years at Fort Worth Judo Club)
- 2nd degree black belt in Taekwondo
- 4 years of Jiu-Jitsu experience
- Krav Maga self-defense instructor
- Has won tournaments in Taekwondo, Jiu-Jitsu, and Judo
- Favorite quote: "Learned a lot, a lot to learn."

CONTACT / QUESTIONS:
- Always encourage people to call or text David at (512) 630-0422 for anything you can't answer
- They can also fill out the contact form at https://www.georgetownjudoclub.com/contact-us

IMPORTANT RULES:
- Keep responses concise and friendly, no more than 3-4 sentences unless a detailed breakdown is needed (like pricing)
- Always encourage people to come try the 2 free classes
- If you don't know the answer, tell them to call or text David at (512) 630-0422
- Never make up information that isn't listed above
- Do not use em dashes in your responses, use commas or ellipses instead`;

// ─── SYSTEM PROMPT: David J Lamoureux ────────────────────────────────────────
const DJL_SYSTEM_PROMPT = `You are a friendly and knowledgeable assistant for David Lamoureux's personal brand website at davidjlamoureux.com. Your job is to help visitors understand what David does, what services he offers, and how to get started working with him.

Here is everything you need to know about David and his business:

WHO IS DAVID LAMOUREUX:
- David Lamoureux is a sales funnel builder, digital marketing strategist, and AI automation consultant
- He helps businesses scale without sacrificing health, sanity, or relationships
- He is a certified ClickFunnels funnel builder with certifications in every funnel type
- He has been featured on stages and cruise ships around the world
- He is also a martial arts instructor (Judo, Taekwondo, Krav Maga) and runs Georgetown Judo Club
- He is a father of two young boys and is passionate about personal freedom, family time, and adventure

HIS STORY:
- Back in 2016, David was working at an electrical supply warehouse in Dallas, Texas and hated it
- He knew there had to be a better way and set out to find it
- He now helps others break free from the 9-5 and build businesses they love

SERVICES OFFERED:
- Sales Funnels: David builds custom sales funnels for businesses. Whether you need one built from scratch or want your existing funnel optimized, he can help. Book a free strategy call to find out which type is right for you.
- Ads & Marketing: Help with paid advertising and marketing strategy. Rising ad costs and attention competition are real, and David helps businesses cut through the noise.
- AI Automations: David helps businesses automate everyday tasks using AI so they can save time and stay ahead of the competition.

FREE STRATEGY CALL:
- The best first step is always to book a FREE Strategy Call with David
- On the call, you will walk away with clarity and an action plan, whether you hire him or not
- As a bonus, you get a free share funnel based on your conversation
- Book at: https://www.davidjlamoureux.com (click the "Free Strategy Call" button)

FREE DOWNLOAD:
- David offers a free "Side Hustle Cheat Sheet" download on his website
- It covers how to get cash in your hand within 24 hours, how to get paid what you are worth, and how to earn from work someone else already did
- Available at: https://www.davidjlamoureux.com

ONLINE COURSE - SELF DEFENSE CONFIDENCE:
- Course name: Self Defense Confidence
- Tagline: "Your complete guide from 'Scaredy Cat' to 'I got this'"
- URL: https://www.davidjlamoureux.com/courses/self-defense-confidence
- This is a full video course teaching practical self-defense skills
- Modules included:
  1. Self Defense Basics: Intro and warmup, shoulder tag, 360 defense, block and counter drills, Rhino In defense, quarter nelson position, spin under takedown
  2. Fall Safety: Fall safety position, fall safety game, fall from standing, technical standup, push/fall/scoot/stand, slip and fall drill
  3. Weapons Defense: Knife defense (ice pick grip, forward grip attacks, walk across drill, follow behind drill), stick and bat defense, gun defense (outside in, inside out, gun pointed at 3rd party, gun shown at waist level), de-escalation
  4. What If Scenarios: Bathroom push, front choke, side choke, standing rear naked choke, multiple attackers, behind the back bear hugs
  5. Takedowns: Russian arm drop, spin under turn facedown, face push takedown, T-clinch to suplex, kimura drop, kote gaeshi
  6. Detaining Techniques: The safewrap, back to belly turnovers
  7. Train With Me In Person: How to train with David in person
  8. Community: Access to the course community
- To enroll, visit https://www.davidjlamoureux.com/courses/self-defense-confidence

RESOURCES & CONTENT:
- Blog: https://www.davidjlamoureux.com/blog
- YouTube channel with tutorials and tips
- Podcast available to subscribe to
- Store with digital products

CONTACT:
- Best way to connect is to book a free strategy call at https://www.davidjlamoureux.com
- Phone: (512) 630-0422 (call or text)

IMPORTANT RULES:
- Keep responses concise and friendly, no more than 3-4 sentences unless a detailed breakdown is needed
- Always encourage visitors to book the free strategy call, it is the best next step
- If you don't know the answer, tell them to call or text David at (512) 630-0422 or visit the website
- Never make up information that isn't listed above
- Do not use em dashes in your responses, use commas or ellipses instead`;

// ─── GET SYSTEM PROMPT BASED ON INBOX ID ─────────────────────────────────────
function getSystemPrompt(inboxId) {
  const id = parseInt(inboxId, 10);
  if (id === DJL_INBOX_ID) {
    console.log(`Routing to DJL system prompt (inbox ${inboxId})`);
    return DJL_SYSTEM_PROMPT;
  }
  // Default to GJC for inbox 107218 or any unrecognized inbox
  console.log(`Routing to GJC system prompt (inbox ${inboxId})`);
  return GJC_SYSTEM_PROMPT;
}

// ─── CALL OPENAI API ─────────────────────────────────────────────────────────
function callOpenAI(userMessage, systemPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content.trim());
          } else {
            console.error("Unexpected OpenAI response:", data);
            resolve("Thanks for reaching out! For the quickest answer, call or text David at (512) 630-0422.");
          }
        } catch (e) {
          console.error("Failed to parse OpenAI response:", e);
          resolve("Thanks for reaching out! For the quickest answer, call or text David at (512) 630-0422.");
        }
      });
    });

    req.on("error", (err) => {
      console.error("OpenAI request error:", err);
      resolve("Thanks for reaching out! For the quickest answer, call or text David at (512) 630-0422.");
    });

    req.write(body);
    req.end();
  });
}

// ─── SEND REPLY VIA MESSAGEHUB API ───────────────────────────────────────────
function sendReply(conversationId, message) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      content: message,
      message_type: "outgoing",
      private: false,
    });

    const path = `/api/v1/accounts/${MESSAGEHUB_ACCOUNT_ID}/conversations/${conversationId}/messages`;
    const baseUrl = new URL(MESSAGEHUB_BASE_URL);

    const options = {
      hostname: baseUrl.hostname,
      path: path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_access_token": MESSAGEHUB_API_TOKEN,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    console.log(`Sending reply to: ${baseUrl.hostname}${path}`);

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`MessageHub API response status: ${res.statusCode}`);
        console.log(`MessageHub API response body: ${data}`);
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on("error", (err) => {
      console.error("MessageHub API request error:", err);
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

// ─── VERCEL SERVERLESS HANDLER ───────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;

    console.log("Incoming webhook payload:", JSON.stringify(payload, null, 2));

    // Only respond to message_created events
    if (payload.event !== "message_created") {
      console.log(`Ignoring event: ${payload.event}`);
      return res.status(200).json({ status: "ignored", reason: `event is ${payload.event}` });
    }

    // Only respond to incoming messages (from the customer)
    const msgType = payload.message_type;
    if (msgType !== "incoming") {
      console.log(`Ignoring message_type: ${msgType}`);
      return res.status(200).json({ status: "ignored", reason: `message_type is ${msgType}` });
    }

    const incomingMessage = payload.content;
    const conversationId = payload.conversation?.id;
    const inboxId = payload.inbox_id || payload.conversation?.inbox_id;

    console.log(`Inbox ID: ${inboxId} | Message: "${incomingMessage}" | Conversation ID: ${conversationId}`);

    // Only respond to whitelisted live chat widget inboxes. Ignore email and any other channel.
    if (!ALLOWED_INBOX_IDS.includes(parseInt(inboxId, 10))) {
      console.log(`Ignoring message from non-whitelisted inbox: ${inboxId}`);
      return res.status(200).json({ status: "ignored", reason: `inbox ${inboxId} is not a whitelisted chat widget inbox` });
    }

    if (!incomingMessage || !conversationId) {
      console.error("Missing content or conversation ID in payload");
      return res.status(400).json({ error: "Missing message content or conversation ID" });
    }

    // Select the correct system prompt based on which inbox the message came from
    const systemPrompt = getSystemPrompt(inboxId);

    // Get AI-powered reply from OpenAI
    console.log("Calling OpenAI...");
    const reply = await callOpenAI(incomingMessage, systemPrompt);
    console.log(`OpenAI reply: "${reply}"`);

    // Send reply back via MessageHub API
    const result = await sendReply(conversationId, reply);

    console.log(`Done. MessageHub status: ${result.status}`);

    return res.status(200).json({ status: "ok", replied: reply });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
};
