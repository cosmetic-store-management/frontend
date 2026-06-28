import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex selection:bg-brand/20 selection:text-brand">
      {/* Left Panel - Macro Cosmetic Luxury Branding (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-brand">
        <style>{`
          @keyframes float-up {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes float-down {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(20px); }
          }
          @keyframes sparkle {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.8; }
          }
        `}</style>

        {/* Large Flat Diagonal Intersection to break up the empty red space */}
        <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-white/5 -rotate-12 origin-top-left pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[120%] h-[120%] bg-black/5 rotate-45 origin-bottom-right pointer-events-none" />

        {/* Elegant Minimalist Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, #fcfaf5 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Macro Cosmetic Store Illustration (Fills the entire panel) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60">
          <svg viewBox="0 0 1000 1000" className="w-full h-full object-cover">
            {/* Botanical Leaves (Bottom Left crossing to middle) */}
            <g style={{ animation: "float-down 20s ease-in-out infinite" }}>
              <g
                transform="translate(-50, 600) scale(2.5) rotate(15)"
                fill="none"
                stroke="#fcfaf5"
                strokeWidth="2"
                strokeOpacity="0.3"
              >
                <path d="M0,200 Q20,100 120,-20" />
                <path
                  d="M80,20 C100,0 130,0 130,30 C130,50 100,40 80,20 Z"
                  fill="#fcfaf5"
                  fillOpacity="0.1"
                />
                <path
                  d="M50,50 C80,30 110,40 100,70 C90,100 60,80 50,50 Z"
                  fill="#fcfaf5"
                  fillOpacity="0.1"
                />
                <path
                  d="M20,90 C50,70 90,90 70,120 C60,140 30,120 20,90 Z"
                  fill="#fcfaf5"
                  fillOpacity="0.1"
                />
              </g>
            </g>

            {/* Macro Perfume Bottle (Top Left) */}
            <g style={{ animation: "float-up 18s ease-in-out infinite" }}>
              <g
                transform="translate(100, -50) scale(1.5)"
                fill="none"
                stroke="#fcfaf5"
                strokeWidth="4"
                strokeOpacity="0.3"
              >
                <rect
                  x="0"
                  y="100"
                  width="160"
                  height="180"
                  rx="40"
                  fill="#fcfaf5"
                  fillOpacity="0.1"
                />
                <rect x="30" y="150" width="100" height="80" rx="10" />
                <rect
                  x="60"
                  y="70"
                  width="40"
                  height="30"
                  fill="#fcfaf5"
                  fillOpacity="0.2"
                />
                <circle
                  cx="80"
                  cy="20"
                  r="35"
                  fill="#fcfaf5"
                  fillOpacity="0.2"
                />
              </g>
            </g>

            {/* Macro Makeup Palette / Compact (Center Right) */}
            <g style={{ animation: "float-up 22s ease-in-out infinite" }}>
              <g
                transform="translate(600, 300) scale(1.8) rotate(-15)"
                fill="none"
                stroke="#fcfaf5"
                strokeWidth="4"
                strokeOpacity="0.3"
              >
                <rect
                  x="0"
                  y="0"
                  width="220"
                  height="150"
                  rx="20"
                  fill="#fcfaf5"
                  fillOpacity="0.1"
                />
                <path
                  d="M0,0 L40,-120 L260,-120 L220,0 Z"
                  fill="#fcfaf5"
                  fillOpacity="0.05"
                />
                <circle
                  cx="70"
                  cy="75"
                  r="40"
                  fill="#fcfaf5"
                  fillOpacity="0.2"
                />
                <circle
                  cx="170"
                  cy="75"
                  r="40"
                  fill="#fcfaf5"
                  fillOpacity="0.2"
                />
              </g>
            </g>

            {/* Macro Lipstick (Bottom Center/Right) */}
            <g style={{ animation: "float-down 15s ease-in-out infinite" }}>
              <g
                transform="translate(450, 700) scale(2) rotate(20)"
                fill="none"
                stroke="#fcfaf5"
                strokeWidth="3"
                strokeOpacity="0.3"
              >
                <rect
                  x="0"
                  y="100"
                  width="80"
                  height="200"
                  fill="#fcfaf5"
                  fillOpacity="0.1"
                />
                <rect
                  x="-5"
                  y="80"
                  width="90"
                  height="20"
                  fill="#fcfaf5"
                  fillOpacity="0.2"
                />
                <rect x="10" y="50" width="60" height="30" />
                <path
                  d="M20,50 L20,10 C40,-20 60,10 60,50 Z"
                  fill="#fcfaf5"
                  fillOpacity="0.3"
                />
              </g>
            </g>

            {/* Scattered Sparkles to fill remaining negative space */}
            <g fill="#fcfaf5" fillOpacity="0.5">
              <path
                style={{ animation: "sparkle 4s ease-in-out infinite" }}
                d="M 800 150 Q 830 150 830 120 Q 830 150 860 150 Q 830 150 830 180 Q 830 150 800 150 Z"
              />
              <path
                style={{ animation: "sparkle 6s ease-in-out infinite" }}
                d="M 200 500 Q 220 500 220 480 Q 220 500 240 500 Q 220 500 220 520 Q 220 500 200 500 Z"
              />
              <path
                style={{ animation: "sparkle 5s ease-in-out infinite" }}
                d="M 850 800 Q 880 800 880 770 Q 880 800 910 800 Q 880 800 880 830 Q 880 800 850 800 Z"
              />
              <path
                style={{ animation: "sparkle 7s ease-in-out infinite" }}
                d="M 450 300 Q 470 300 470 280 Q 470 300 490 300 Q 470 300 470 320 Q 470 300 450 300 Z"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Right Panel - Form Container (Pale Yellow Background) */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10"
        style={{ backgroundColor: "#fcfaf5" }}
      >
        <div className="w-full max-w-95 animate-page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
