# Georgetown Judo Club & David Lamoureux - MessageHub Chatbot (v2 - OpenAI Powered)

A serverless chatbot webhook that uses OpenAI GPT to automatically answer customer questions in your ClickFunnels MessageHub chat bubble. Deployed for free on Vercel. It acts as a smart router, handling messages for both Georgetown Judo Club and David Lamoureux's personal site using distinct AI personas.

---

## Credentials & Connection Info

This section contains all the important information for connecting your MessageHub and ClickFunnels accounts to the Vercel webhook.

### Vercel Environment Variables

These variables must be set in your Vercel project under **Settings** → **Environment Variables**. Note that variable names are case-sensitive and must be ALL_CAPS exactly as listed below. After adding or changing any variable, you must **Redeploy** the project for changes to take effect.

| Variable Name | Value | Where to Find It |
| --- | --- | --- |
| `MESSAGEHUB_BASE_URL` | `https://messagehub.myclickfunnels.com` | Fixed value for ClickFunnels MessageHub |
| `MESSAGEHUB_API_TOKEN` | `qKePb6WWXpTpTaCa7QYy9vRp` | MessageHub → Profile Settings → Scroll to bottom → Access Token |
| `MESSAGEHUB_ACCOUNT_ID` | `86` | MessageHub → Chat Settings → General |
| `OPENAI_API_KEY` | `sk-proj-...` | platform.openai.com → API Keys |

### Inbox IDs

The bot routes messages to the correct AI persona based on the inbox ID. You can find your inbox IDs in MessageHub by going to **Settings** → **Chat Inboxes** → click **Settings** on an inbox and look at the URL.

- **Georgetown Judo Club (georgetownjudoclub.com ):** `107218`

- **David Lamoureux (davidjlamoureux.com):** `207`

- **GJC API Channel (unused for chat bubble):** `108441`

### Webhook Configuration in MessageHub

To connect MessageHub to your Vercel bot, configure the webhook in MessageHub under **Settings** → **Chat Integrations** → **Webhooks**.

- **Webhook URL:** `https://gjc-chatbot-eight.vercel.app/api/webhook`

- **Subscribed Events:** Only check `message_created`. Leave all other events unchecked to prevent the bot from responding to its own messages or internal events.

### Testing the Bot

**Important:** You must test the bot from a device that is NOT logged into MessageHub (e.g., your phone or an incognito window ). Agents cannot chat with themselves, so testing while logged in will not trigger the bot correctly.

---

## What's New in v2

- Powered by **OpenAI GPT-4o-mini** for natural, conversational responses

- Handles any question intelligently, not just keyword matches

- Acts as a smart router for multiple websites (GJC and David Lamoureux)

- Detailed logging for easy debugging in Vercel

- Graceful fallback to David's phone number if OpenAI is unavailable

---

## Setting Up OpenAI (One-Time)

1. Go to [https://platform.openai.com](https://platform.openai.com) and create a free account

1. Go to **Billing** and add a minimum of **$5 in credits** (this will last months for a local business)

1. Go to **API Keys** → **Create new secret key**

1. Copy the key (starts with `sk-`) and add it as `OPENAI_API_KEY` in Vercel

**Estimated cost:** Less than $0.01 per conversation. A typical local business will spend under $1/month.

---

## How to Deploy Updates

1. Edit `api/webhook.js` in your GitHub repo

1. Commit the changes

1. Vercel automatically redeploys within about 30 seconds

---

## Viewing Logs (Debugging)

If something isn't working, check the logs:

1. Go to your Vercel project

1. Click **Deployments** → click the latest deployment

1. Click **Functions** → `api/webhook`

1. You'll see detailed logs for every incoming message and API response

---

## Updating the Bot's Knowledge

All business information lives in the `GJC_SYSTEM_PROMPT` and `DJL_SYSTEM_PROMPT` constants at the top of `api/webhook.js`. To update hours, pricing, services, or any other info, just edit that section and push to GitHub.

