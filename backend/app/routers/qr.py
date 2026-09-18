from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/qr", tags=["qr"])

REQUEST_TIMEOUT = 8.0
MAX_BYTES = 500_000
USER_AGENT = "Mozilla/5.0 (compatible; VedikshayaScanner/1.0)"


class ResolveRequest(BaseModel):
    url: str


class ResolveResponse(BaseModel):
    name: str


# Hosted "text QR" pages are built for humans, not scrapers: a language
# switcher, cookie banner, or nav item often renders as a <p> tag that sits
# earlier in the HTML than the actual encoded content, so grabbing the
# very first <p> on the page is unreliable — it sometimes wins the race.
_SKIP_ANCESTOR_TAGS = {"nav", "header", "footer", "script", "style", "noscript", "form"}
_CHROME_KEYWORDS = (
    "select language", "choose language", "choose your language",
    "cookie", "sign in", "sign up", "log in", "login", "subscribe",
    "newsletter", "privacy policy", "terms of service", "show more",
    "read more", "get started", "learn more", "menu",
)


class _FirstParagraphExtractor(HTMLParser):
    """Collects every non-empty <p> outside nav/header/footer chrome, in
    document order, plus <title>, so the caller can pick the first one that
    doesn't look like site chrome."""

    def __init__(self):
        super().__init__()
        self._skip_stack = []
        self._in_p = False
        self._in_title = False
        self._current_p = ""
        self.candidates = []
        self.title = ""

    def handle_starttag(self, tag, attrs):
        if tag in _SKIP_ANCESTOR_TAGS:
            self._skip_stack.append(tag)
        if tag == "p" and not self._skip_stack:
            self._in_p = True
            self._current_p = ""
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag in _SKIP_ANCESTOR_TAGS and self._skip_stack and self._skip_stack[-1] == tag:
            self._skip_stack.pop()
        if tag == "p" and self._in_p:
            self._in_p = False
            text = " ".join(self._current_p.split())
            if text:
                self.candidates.append(text)
        elif tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_p:
            self._current_p += data
        elif self._in_title:
            self.title += data


def _extract_name(html: str) -> str:
    parser = _FirstParagraphExtractor()
    parser.feed(html)
    for candidate in parser.candidates:
        low = candidate.lower()
        if len(candidate) > 200:
            continue
        if any(kw in low for kw in _CHROME_KEYWORDS):
            continue
        return candidate
    return parser.title.strip()


@router.post("/resolve", response_model=ResolveResponse)
async def resolve_qr_url(payload: ResolveRequest):
    """A scanned pod's QR code sometimes contains a link (e.g. a me-qr.com
    text page) rather than the kashaya name directly. Fetch it server-side
    (the target won't allow a direct browser fetch via CORS) and pull the
    name out of the page content."""
    parsed = urlparse(payload.url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only http/https URLs are supported.")

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=REQUEST_TIMEOUT) as client:
            async with client.stream("GET", payload.url, headers={"User-Agent": USER_AGENT}) as resp:
                resp.raise_for_status()
                chunks = []
                total = 0
                async for chunk in resp.aiter_bytes():
                    chunks.append(chunk)
                    total += len(chunk)
                    if total >= MAX_BYTES:
                        break
                body = b"".join(chunks).decode(resp.encoding or "utf-8", errors="replace")
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Could not fetch the scanned URL: {exc}") from exc

    name = _extract_name(body)
    if not name:
        raise HTTPException(status_code=422, detail="Could not find a name on the scanned page.")

    return ResolveResponse(name=name)
