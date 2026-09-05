// Friendly waving robot-doctor mascot. Self-contained: the keyframes and
// helper classes are scoped under `.ad-doctor` so they can't leak into the
// rest of the app. Recoloured from the original cyan asset to the Vedikshaya
// green palette.
export default function AnimatedDoctor({ size = 64, className = '', animated = true }) {
  return (
    <span
      className={`ad-doctor ${className}`}
      style={{ width: size, height: size, display: 'inline-block', lineHeight: 0 }}
    >
      <style>{`
        .ad-doctor svg { width: 100%; height: 100%; display: block; overflow: visible; }
        .ad-doctor .ad-stroke-bold { stroke: #012F13; stroke-width: 8.5; stroke-linecap: round; stroke-linejoin: round; }
        .ad-doctor .ad-stroke-med  { stroke: #012F13; stroke-width: 7;   stroke-linecap: round; stroke-linejoin: round; }
        .ad-doctor .ad-stroke-fine { stroke: #012F13; stroke-width: 5;   stroke-linecap: round; stroke-linejoin: round; }
        .ad-doctor .ad-fill-white  { fill: #FFFFFF; }
        .ad-doctor .ad-fill-green  { fill: #8BC53D; }
        .ad-doctor .ad-fill-ink    { fill: #012F13; }
        .ad-doctor .ad-fill-visor  { fill: #08300F; }

        ${animated ? `
        @keyframes adFloat      { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes adShadow     { 0%,100% { transform: scale(1); opacity: .8; } 50% { transform: scale(.92); opacity: .55; } }
        @keyframes adWave       { 0%,100% { transform: rotate(0); } 15% { transform: rotate(-24deg); } 30% { transform: rotate(10deg); } 45% { transform: rotate(-24deg); } 60% { transform: rotate(10deg); } 75% { transform: rotate(-14deg); } 85% { transform: rotate(0); } }
        @keyframes adHeadTilt   { 0%,100% { transform: rotate(0); } 20%,65% { transform: rotate(-3.5deg); } 80% { transform: rotate(1deg); } }
        @keyframes adBlink      { 0%,46%,50%,96%,100% { transform: scaleY(1); } 48%,98% { transform: scaleY(.08); } }

        .ad-doctor #ad-shadow { transform-origin: 300px 542px; animation: adShadow 2.8s ease-in-out infinite; }
        .ad-doctor #ad-body   { animation: adFloat 2.8s ease-in-out infinite; }
        .ad-doctor #ad-head   { transform-origin: 300px 280px; animation: adHeadTilt 2.8s ease-in-out infinite; }
        .ad-doctor .ad-eye    { transform-box: fill-box; transform-origin: center; animation: adBlink 3.8s ease-in-out infinite; }
        .ad-doctor #ad-arm    { transform-origin: 418px 352px; animation: adWave 2.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ad-doctor #ad-shadow, .ad-doctor #ad-body, .ad-doctor #ad-head,
          .ad-doctor .ad-eye, .ad-doctor #ad-arm { animation: none; }
        }
        ` : ''}
      `}</style>

      <svg viewBox="118 92 424 452" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="300" cy="542" fill="#cfe0c0" id="ad-shadow" rx="98" ry="10" />

        <g id="ad-body">
          {/* base pod */}
          <path className="ad-stroke-bold" d="M214 456 C214 515 252 528 300 528 C348 528 386 515 386 456 Z" fill="#F0F4F8" />

          {/* coat silhouette */}
          <path className="ad-stroke-bold ad-fill-white" d="M172 456 C170 340 216 288 300 288 C384 288 430 340 428 456 C428 468 410 472 300 472 C190 472 172 468 172 456 Z" />

          {/* v-neck + tie */}
          <path className="ad-stroke-med ad-fill-green" d="M252 290 L300 354 L348 290 Z" />
          <path className="ad-fill-ink" d="M288 290 H312 L315 316 L300 350 L285 316 Z" />
          <path className="ad-stroke-fine" d="M266 312 L290 326" fill="none" />
          <path className="ad-stroke-fine" d="M334 312 L310 326" fill="none" />

          {/* lapels */}
          <path className="ad-stroke-bold ad-fill-white" d="M232 290 L298 356 L298 472 H214 C190 472 182 430 182 390 L220 310 Z" />
          <path className="ad-stroke-bold ad-fill-white" d="M368 290 L302 356 L302 472 H386 C410 472 418 430 418 390 L380 310 Z" />
          <path className="ad-stroke-med ad-fill-white" d="M230 292 L220 316 L248 328 L236 348 L298 356" />
          <path className="ad-stroke-med ad-fill-white" d="M370 292 L380 316 L352 328 L364 348 L302 356" />
          <line className="ad-stroke-med" x1="300" x2="300" y1="356" y2="472" />
          <line className="ad-stroke-fine" x1="208" x2="238" y1="440" y2="440" />

          {/* left arm */}
          <g>
            <path className="ad-stroke-bold ad-fill-white" d="M182 352 C158 368 152 400 156 444 C158 460 178 462 196 450 C202 422 204 388 200 354 Z" />
            <line className="ad-stroke-bold" x1="156" x2="198" y1="408" y2="408" />
          </g>

          {/* stethoscope */}
          <path className="ad-stroke-bold" d="M228 296 C214 366 216 414 246 414 C272 414 274 380 274 348" fill="none" />
          <circle className="ad-stroke-bold ad-fill-white" cx="242" cy="400" r="27" />
          <circle className="ad-stroke-bold ad-fill-ink" cx="242" cy="400" r="15" />
          <path className="ad-stroke-bold" d="M372 296 C382 344 382 376 374 394" fill="none" />
          <g>
            <rect className="ad-stroke-bold ad-fill-white" height="42" rx="10" transform="rotate(-15 357 409)" width="34" x="340" y="388" />
            <circle className="ad-stroke-med ad-fill-ink" cx="348" cy="422" r="5.5" />
            <circle className="ad-stroke-med ad-fill-ink" cx="366" cy="427" r="5.5" />
          </g>

          {/* waving arm */}
          <g id="ad-arm">
            <path className="ad-stroke-bold ad-fill-white" d="M416 352 C450 340 482 315 490 262 C494 244 472 238 456 254 C440 270 422 312 402 352 Z" />
            <line className="ad-stroke-bold" x1="482" x2="452" y1="272" y2="284" />
            <path className="ad-stroke-bold ad-fill-white" d="M464 248 C468 226 492 216 508 230 C522 242 516 268 496 276 C482 282 462 268 464 248 Z" />
            <path className="ad-stroke-med ad-fill-white" d="M472 254 C464 248 462 238 468 232 C474 226 482 232 482 240" />
            <g fill="none" opacity="0.85" stroke="#8BC53D" strokeLinecap="round" strokeWidth="4.5">
              <path d="M524 212 C532 222 534 236 530 248" />
              <path d="M538 224 C544 232 544 242 542 252" strokeWidth="3.5" />
            </g>
          </g>

          {/* head */}
          <g id="ad-head">
            <g>
              <path className="ad-stroke-bold ad-fill-white" d="M152 208 C124 208 124 266 152 266 Z" />
              <path className="ad-stroke-med ad-fill-white" d="M148 218 C134 218 134 256 148 256 Z" />
            </g>
            <g>
              <path className="ad-stroke-bold ad-fill-white" d="M448 208 C476 208 476 266 448 266 Z" />
              <path className="ad-stroke-med ad-fill-white" d="M452 218 C466 218 466 256 452 256 Z" />
            </g>

            <rect className="ad-stroke-bold ad-fill-white" height="236" rx="118" width="312" x="144" y="118" />
            <path className="ad-fill-ink ad-stroke-bold" d="M154 208 C160 186 208 170 300 170 C392 170 440 186 446 208 L452 186 C442 152 388 140 300 140 C212 140 158 152 148 186 Z" />

            <g>
              <circle className="ad-stroke-bold ad-fill-white" cx="300" cy="144" r="44" />
              <circle className="ad-stroke-bold ad-fill-white" cx="300" cy="144" r="26" />
              <circle className="ad-fill-ink ad-stroke-med" cx="300" cy="144" r="10" />
            </g>

            <rect className="ad-stroke-bold ad-fill-visor" height="126" rx="60" width="244" x="178" y="210" />
            <path d="M198 226 C230 220 370 220 402 226 C360 236 240 236 198 226 Z" fill="#FFFFFF" opacity="0.1" />

            <g className="ad-eye">
              <ellipse cx="236" cy="260" fill="#FFFFFF" rx="24" ry="29" stroke="#012F13" strokeWidth="4" />
              <circle cx="230" cy="253" fill="#DEF2C6" r="7" />
            </g>
            <g className="ad-eye">
              <ellipse cx="364" cy="260" fill="#FFFFFF" rx="24" ry="29" stroke="#012F13" strokeWidth="4" />
              <circle cx="358" cy="253" fill="#DEF2C6" r="7" />
            </g>

            <path d="M280 294 Q300 310 320 294" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="7" />
          </g>
        </g>
      </svg>
    </span>
  );
}
