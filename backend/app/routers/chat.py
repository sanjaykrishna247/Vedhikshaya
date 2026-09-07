"""Dr. Vedik — the Ayurvedic assistant.

Retrieval-light RAG: a compact, physician-reviewed knowledge base is passed to
the model as grounding context, and the model is instructed to answer only
from it. Swap KNOWLEDGE for a real vector store later without touching the
frontend.

The NVIDIA API key lives only here (server-side env var), never in the client.
"""

from __future__ import annotations

import os

import httpx
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/chat", tags=["chat"])

NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")

# --- physician-reviewed knowledge base -------------------------------------
# Reviewed by the project's consulting Vaidya. Every answer must be grounded
# in and consistent with these notes.
KNOWLEDGE = """
[Dashamoola Kwatha]  (reviewed: Ayurvedic panel)
Use: vata-driven aches, joint pain and stiffness, low-grade fever, cold, cough,
flu, general inflammation and body ache; supportive in recovery and post-natal
care. Ten roots (Bilva, Agnimantha, Shyonaka, Gambhari, Patala, Shalaparni,
Prishniparni, Brihati, Kantakari, Gokshura).
Dose: 100 mL warm, twice daily. Prep: 4:1 reduction, drawn at 85-90 C, single
fresh dose within 30 min.
Caution: avoid in acute high-pitta burning states and during fever spikes above
102 F / 39 C.

[Triphala Kwatha]  (reviewed: Ayurvedic panel)
Use: irregular digestion, indigestion, bloating, gas, mild constipation,
acidity; gentle daily detox and eye support. Three fruits: Haritaki, Bibhitaki,
Amalaki.
Dose: 100 mL warm on an empty stomach, or after dinner. Prep: 4:1 reduction,
85-90 C.
Caution: avoid during diarrhoea, dehydration, and the first trimester of
pregnancy.

[Guduchi Kwatha]  (reviewed: Ayurvedic panel)
Use: weak or recurrent immunity, frequent infections, allergy, low-grade fevers,
skin complaints, blood-sugar and joint support over time. Single herb:
Guduchi / Tinospora cordifolia stem.
Dose: once daily in the morning on an empty stomach (twice daily if prescribed).
Prep: 4:1 reduction, 85-90 C.
Caution: use cautiously with immunosuppressant therapy and in pregnancy.

[Ashwagandha Kwatha]  (reviewed: Ayurvedic panel)
Use: stress, anxiety, poor or non-restorative sleep, fatigue, low energy,
general weakness; an adaptogen.
Dose: in the evening, about 30 minutes before bed.
Caution: caution in hyperthyroid states and pregnancy; may interact with
sedatives.

[Nilavembu Kudineer Chooranam]  (reviewed: Ayurvedic panel)
Use: viral fevers, dengue-type fevers, body ache and malaise; a Siddha
polyherbal decoction.
Dose: as directed by the physician during febrile illness.
Caution: not a substitute for medical evaluation in high or persistent fever.

[General rules]
- The kashayas are prepared by the Vedikshaya pod as a 4:1 reduction drawn at
  85-90 C (pharmacopoeia grade), one fresh 100 mL dose made on demand.
- Take decoctions warm. Do not mix with milk unless a physician says so.
- If a dose is missed: take it when remembered if still within a few hours of
  the scheduled time; otherwise skip it and resume the next scheduled dose. Do
  not double up.
"""

SYSTEM_PROMPT = (
    "You are Dr. Vedik, a careful Ayurvedic assistant for the Vedikshaya app. "
    "Answer ONLY using the physician-reviewed notes below. If the notes do not "
    "cover the question, say you don't have that in your reference material and "
    "suggest consulting a registered Vaidya. Keep replies short (2-4 sentences), "
    "practical and calm. When you recommend a formulation, name it in **bold** "
    "and give the dose/timing from the notes. Always end with a brief reminder "
    "to confirm with a registered Ayurvedic physician. Never diagnose serious "
    "conditions; for red-flag symptoms (chest pain, breathlessness, very high "
    "or persistent fever, severe dehydration, pregnancy complications) tell the "
    "user to seek medical care now.\n\n"
    "=== PHYSICIAN-REVIEWED NOTES ===\n" + KNOWLEDGE
)


class Msg(BaseModel):
    role: str
    text: str


class ChatIn(BaseModel):
    messages: list[Msg] = Field(default_factory=list)


class ChatOut(BaseModel):
    reply: str
    source: str = "nvidia"


@router.post("", response_model=ChatOut)
@router.post("/", response_model=ChatOut)
async def chat(body: ChatIn) -> ChatOut:
    history = [m for m in body.messages if m.text.strip()][-10:]
    if not history:
        return ChatOut(reply="Tell me what you're experiencing and I'll suggest a Kashaya.", source="fallback")

    if not NVIDIA_API_KEY:
        return ChatOut(reply=_local_fallback(history[-1].text), source="fallback")

    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            *[
                {"role": "assistant" if m.role in ("bot", "assistant") else "user", "content": m.text}
                for m in history
            ],
        ],
        "temperature": 0.3,
        "top_p": 0.9,
        "max_tokens": 400,
        "stream": False,
    }
    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Accept": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(NVIDIA_URL, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
        reply = (data["choices"][0]["message"]["content"] or "").strip()
        if not reply:
            raise ValueError("empty completion")
        return ChatOut(reply=reply, source="nvidia")
    except Exception as exc:  # noqa: BLE001
        print(f"[chat] NVIDIA call failed: {exc}")
        return ChatOut(reply=_local_fallback(history[-1].text), source="fallback")


# Keyword fallback so the demo still works if the LLM/network is down.
_CATALOGUE = [
    ("Dashamoola Kwatha", ["fever", "cold", "cough", "flu", "joint", "arthritis", "inflammation", "body ache", "ache", "pain"],
     "Take 100 mL warm, twice daily."),
    ("Triphala Kwatha", ["digest", "indigest", "stomach", "constipat", "bloat", "acidity", "gas"],
     "Take 100 mL after dinner."),
    ("Guduchi Kwatha", ["immun", "infection", "allergy", "skin", "recurring", "recurrent"],
     "Take once daily in the morning on an empty stomach."),
    ("Ashwagandha Kwatha", ["stress", "anxiet", "sleep", "insomnia", "fatigue", "weak", "energy"],
     "Take in the evening, 30 minutes before bed."),
]


def _local_fallback(text: str) -> str:
    low = text.lower()
    for name, keys, dose in _CATALOGUE:
        if any(k in low for k in keys):
            return (
                f"Based on what you've described, **{name}** may help. {dose} "
                "Please confirm with a registered Ayurvedic physician."
            )
    return (
        "I don't have a specific match for that yet. Could you mention symptoms "
        "like fever, digestion, immunity, or stress? Please also confirm any "
        "choice with a registered Ayurvedic physician."
    )
