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


class _FirstParagraphExtractor(HTMLParser):
    """Grabs the text of the first non-empty <p> tag, falling back to <title>."""

    def __init__(self):
        super().__init__()
        self._in_p = False
        self._in_title = False
        self.paragraph = ""
        self.title = ""
        self._done_paragraph = False

    def handle_starttag(self, tag, attrs):
        if tag == "p" and not self._done_paragraph:
            self._in_p = True
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "p" and self._in_p:
            self._in_p = False
            if self.paragraph.strip():
                self._done_paragraph = True
        elif tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_p and not self._done_paragraph:
            self.paragraph += data
        elif self._in_title:
            self.title += data


def _extract_name(html: str) -> str:
    parser = _FirstParagraphExtractor()
    parser.feed(html)
    candidate = parser.paragraph.strip()
    if candidate:
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
