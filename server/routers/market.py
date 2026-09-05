import html
import os
import json
from typing import List, Optional
from urllib import response
from urllib import response
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from database import get_db_connection
import httpx
from dotenv import load_dotenv
import random

load_dotenv()

router = APIRouter(prefix="/api", tags=["market"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()


# Mapping common symbols to CoinGecko IDs
COINGECKO_ID_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "ADA": "cardano",
    "AVAX": "avalanche-2",
    "DOT": "polkadot"
}

# Fallback news items if external API fails or rate-limits
FALLBACK_NEWS = [
    {
        "id": "fallback-1",
        "title": "Bitcoin Network Hashrate Reaches New Milestone Amid Institutional Accumulation",
        "source": "CryptoDesk",
        "url": "https://coindesk.com",
        "published_at": "2 hours ago",
        "currencies": ["BTC"]
    },
    {
        "id": "fallback-2",
        "title": "Layer 2 Networks Expand Scaling Capacity as Daily Active Addresses Climb",
        "source": "CoinTelegraph",
        "url": "https://cointelegraph.com",
        "published_at": "4 hours ago",
        "currencies": ["ETH", "SOL", "AVAX"]
    },
    {
        "id": "fallback-3",
        "title": "Decentralized Finance Protocols Register Inflow Boost Across Multi-Chain Pools",
        "source": "DeFiPulse",
        "url": "https://decrypt.co",
        "published_at": "6 hours ago",
        "currencies": ["ETH", "SOL", "AVAX", "DOT"]
    }
]

# Dedicated crypto subreddits for variety
CRYPTO_SUBREDDITS = ["cryptocurrencymemes", "BitcoinMemes", "dogecoin"]

# Verified crypto-specific fallback memes
CRYPTO_FALLBACK_MEMES = [
    {
        "id": "crypto_fb_1",
        "title": "When you buy the dip and it keeps dipping",
        "image_url": "https://i.imgflip.com/4/30b1gx.jpg",
        "author": "hodl_gang",
        "permalink": "https://reddit.com/r/cryptocurrencymemes"
    },
    {
        "id": "crypto_fb_2",
        "title": "Explaining blockchain and smart contracts at family dinner",
        "image_url": "https://i.imgflip.com/1otk96.jpg",
        "author": "defi_degen",
        "permalink": "https://reddit.com/r/cryptocurrencymemes"
    },
    {
        "id": "crypto_fb_3",
        "title": "Me checking CoinGecko every 4 minutes",
        "image_url": "https://i.imgflip.com/1g8my4.jpg",
        "author": "crypto_trader_pro",
        "permalink": "https://reddit.com/r/cryptocurrencymemes"
    },
    {
        "id": "crypto_fb_4",
        "title": "Buy high, sell low — an ancient trading strategy",
        "image_url": "https://i.imgflip.com/265k.jpg",
        "author": "satoshi_disciple",
        "permalink": "https://reddit.com/r/cryptocurrencymemes"
    },
    {
        "id": "crypto_fb_5",
        "title": "Still holding my coins through the bear market",
        "image_url": "https://i.imgflip.com/64sz4u.png",
        "author": "diamond_hands",
        "permalink": "https://reddit.com/r/cryptocurrencymemes"
    }
]

CRYPTO_KEYWORDS = [
    "crypto", "bitcoin", "btc", "eth", "ethereum", "coin", "token",
    "wallet", "hodl", "dip", "pump", "dump", "bull", "bear", "satoshi",
    "altcoin", "trading", "chart", "portfolio", "leverage", "defi"
]

@router.get("/prices")
async def get_coin_prices(symbols: List[str] = Query(default=["BTC", "ETH"])):
    # Map symbols to CoinGecko API IDs
    coin_ids = [COINGECKO_ID_MAP.get(s.upper(), s.lower()) for s in symbols]
    ids_param = ",".join(coin_ids)

    url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids_param}&vs_currencies=usd&include_24hr_change=true"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        formatted_prices = []
        for sym in symbols:
            cg_id = COINGECKO_ID_MAP.get(sym.upper(), sym.lower())
            coin_data = data.get(cg_id, {})
            formatted_prices.append({
                "symbol": sym.upper(),
                "price_usd": coin_data.get("usd", 0.0),
                "change_24h": round(coin_data.get("usd_24h_change", 0.0), 2)
            })

        return formatted_prices

    except Exception as e:
        print(f"CoinGecko API error: {e}")
        return [
            {"symbol": sym.upper(), "price_usd": 0.0, "change_24h": 0.0}
            for sym in symbols
        ]

@router.get("/news")
async def get_market_news(currencies: Optional[List[str]] = Query(default=None)):
    # Query CryptoPanic public developer feed
    params = {"public": "true"}
    if currencies:
        params["currencies"] = ",".join([c.upper() for c in currencies])

    url = "https://cryptopanic.com/api/free/v1/posts/"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                payload = resp.json()
                results = payload.get("results", [])
                if results:
                    articles = []
                    for item in results[:5]:
                        curr_tags = [c.get("code") for c in item.get("currencies", [])] if item.get("currencies") else []
                        articles.append({
                            "id": str(item.get("id")),
                            "title": item.get("title"),
                            "source": item.get("domain", "CryptoPanic"),
                            "url": item.get("url"),
                            "published_at": item.get("published_at", "")[:10],
                            "currencies": curr_tags
                        })
                    return articles

        # Return curated fallback news if external response is empty
        return FALLBACK_NEWS

    except Exception as err:
        print(f"News fetch error, using fallback: {err}")
        return FALLBACK_NEWS


class InsightsRequest(BaseModel):
    investor_type: str
    interested_assets: List[str]

@router.post("/insights")
async def generate_market_insights(payload: InsightsRequest):
    investor = payload.investor_type or "General"
    assets = payload.interested_assets if payload.interested_assets else ["BTC"]
    assets_str = ", ".join(assets)

    # 1. Fetch live market metrics from CoinGecko for real data grounding
    coin_ids = [COINGECKO_ID_MAP.get(s.upper(), s.lower()) for s in assets]
    ids_param = ",".join(coin_ids)
    coingecko_url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids_param}&vs_currencies=usd&include_24hr_change=true"
    
    live_market_context = ""
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            cg_res = await client.get(coingecko_url)
            if cg_res.status_code == 200:
                cg_data = cg_res.json()
                context_parts = []
                for sym in assets:
                    cid = COINGECKO_ID_MAP.get(sym.upper(), sym.lower())
                    info = cg_data.get(cid, {})
                    price = info.get("usd", "N/A")
                    chg = info.get("usd_24h_change", 0.0)
                    context_parts.append(f"{sym.upper()}: ${price} (24h change: {chg:.2f}%)")
                live_market_context = " | ".join(context_parts)
    except Exception as e:
        print(f"Failed to fetch live market context: {e}")

    fallback_result = {
        "investor_type": investor,
        "assets_evaluated": assets,
        "sentiment": "Neutral Consolidation",
        "analysis": f"Market dynamics for {assets_str} are stabilizing as investors monitor macro signals.",
        "recommendation": "Maintain disciplined position sizing and use percentage-based stop-losses."
    }

    if not GROQ_API_KEY:
        print("GROQ_API_KEY is missing, returning fallback.")
        return fallback_result

    # 2. Inject live data directly into the LLM prompt
    prompt = f"""
    You are an expert crypto financial analyst.
    Analyze the current market posture based on this REAL-TIME market data:
    - Investor Persona: {investor}
    - Live Market Data: {live_market_context if live_market_context else assets_str}

    CRITICAL RULES:
    1. Base your sentiment and analysis on the actual 24h price trend provided.
    2. Provide 1 actionable risk management recommendation tailored to the {investor} persona.

    Return ONLY a valid JSON object matching this schema:
    {{
      "sentiment": "Short sentiment phrase reflecting the data (e.g. Bullish Accumulation, Bearish Pressure)",
      "analysis": "1-2 concise sentences analyzing the current market posture.",
      "recommendation": "1 specific, actionable strategy tip."
    }}
    """

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "model": "openai/gpt-oss-120b",
        "messages": [
            {"role": "system", "content": "You are a professional financial assistant that outputs strictly valid JSON."},
            {"role": "user", "content": prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.5
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json=body)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["choices"][0]["message"]["content"]
                parsed = json.loads(raw_text)

                return {
                    "investor_type": investor,
                    "assets_evaluated": assets,
                    "sentiment": parsed.get("sentiment", "Neutral"),
                    "analysis": parsed.get("analysis", fallback_result["analysis"]),
                    "recommendation": parsed.get("recommendation", fallback_result["recommendation"])
                }
            else:
                print(f"Groq API returned status {resp.status_code}: {resp.text}")
                return fallback_result

    except Exception as err:
        print(f"Groq request error: {err}")
        return fallback_result

@router.get("/meme")
async def get_crypto_meme():
    # Pick a random crypto subreddit
    target_sub = random.choice(CRYPTO_SUBREDDITS)
    proxy_url = f"https://meme-api.com/gimme/{target_sub}"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(proxy_url)
            if resp.status_code == 200:
                item = resp.json()
                title = item.get("title", "")
                sub = item.get("subreddit", "").lower()
                
                # Check if it actually belongs to a crypto sub or has crypto keywords
                is_crypto_sub = sub in [s.lower() for s in CRYPTO_SUBREDDITS]
                has_keywords = any(kw in title.lower() for kw in CRYPTO_KEYWORDS)

                if is_crypto_sub or has_keywords:
                    return {
                        "id": item.get("postLink", "").split("/")[-1] or f"meme_{random.randint(1000, 9999)}",
                        "title": title,
                        "image_url": item.get("url"),
                        "author": item.get("author"),
                        "permalink": item.get("postLink")
                    }
    except Exception as e:
        print(f"Online meme fetch failed: {e}")

    # Guarantees a crypto-focused meme
    return random.choice(CRYPTO_FALLBACK_MEMES)

class VoteRequest(BaseModel):
    user_id: str
    section: str  # 'insights', 'prices', 'news', 'meme'
    vote: int     # 1 or -1
    item_id: Optional[str] = None

@router.post("/vote")
def record_vote(data: VoteRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO section_votes (user_id, section, vote, item_id)
                VALUES (%s, %s, %s, %s)
                RETURNING id, created_at;
                """,
                (data.user_id, data.section, data.vote, data.item_id)
            )
            created_vote = cur.fetchone()
            conn.commit()
            return {"status": "success", "vote": created_vote}
    except Exception as e:
        conn.rollback()
        print("Failed to record vote:", e)
        raise HTTPException(status_code=500, detail="Database insert error")
    finally:
        conn.close()