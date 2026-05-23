"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface ShareProfileButtonProps {
  username: string;
  displayName: string;
  variant?: "row" | "icon";
}

export default function ShareProfileButton({
  username,
  displayName,
  variant = "row",
}: ShareProfileButtonProps) {
  const [profileUrl, setProfileUrl] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileUrl(`${window.location.origin}/u/${username}`);
  }, [username]);

  useEffect(() => {
    if (!showQR || !profileUrl || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, profileUrl, {
      width: 280,
      margin: 1,
      color: { dark: "#1b1c1c", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(() => {
      // ignore — UI just shows blank canvas
    });
  }, [showQR, profileUrl]);

  async function handleShare() {
    if (!profileUrl) return;
    const shareData = {
      title: `${displayName} on WildDex`,
      text: `Check out ${displayName}'s WildDex.`,
      url: profileUrl,
    };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user dismissed share sheet — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // can't even copy — open a window with the URL
      window.prompt("Copy your profile URL:", profileUrl);
    }
  }

  if (variant === "icon") {
    return (
      <>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share profile"
            className="w-9 h-9 bg-surface border-[2px] border-on-background rounded-lg flex items-center justify-center hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Share profile"
          >
            <span
              className="material-symbols-outlined text-on-background"
              style={{ fontSize: "18px" }}
            >
              {copied ? "check" : "ios_share"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setShowQR(true)}
            aria-label="Show QR code"
            className="w-9 h-9 bg-surface border-[2px] border-on-background rounded-lg flex items-center justify-center hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Show QR code"
          >
            <span
              className="material-symbols-outlined text-on-background"
              style={{ fontSize: "18px" }}
            >
              qr_code_2
            </span>
          </button>
        </div>
        {showQR && (
          <QRModal
            onClose={() => setShowQR(false)}
            canvasRef={canvasRef}
            username={username}
            profileUrl={profileUrl}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 bg-primary text-on-primary font-display font-bold text-sm py-3 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex items-center justify-center gap-2 transition-all"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "20px" }}
          >
            {copied ? "check" : "ios_share"}
          </span>
          {copied ? "LINK COPIED" : "SHARE PROFILE"}
        </button>
        <button
          type="button"
          onClick={() => setShowQR(true)}
          aria-label="Show QR code"
          className="bg-surface text-on-background font-display font-bold text-sm px-4 py-3 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active flex items-center justify-center gap-2 transition-all"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "20px" }}
          >
            qr_code_2
          </span>
        </button>
      </div>
      {showQR && (
        <QRModal
          onClose={() => setShowQR(false)}
          canvasRef={canvasRef}
          username={username}
          profileUrl={profileUrl}
        />
      )}
    </>
  );
}

interface QRModalProps {
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  username: string;
  profileUrl: string;
}

function QRModal({ onClose, canvasRef, username, profileUrl }: QRModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-on-background/70 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border-[3px] border-on-background rounded-2xl p-6 hard-shadow max-w-sm w-full flex flex-col items-center gap-4"
      >
        <div className="flex items-center justify-between w-full">
          <h2 className="font-display text-lg font-extrabold text-on-background">
            Scan to add @{username}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 bg-surface-container border-[2px] border-on-background rounded-lg flex items-center justify-center hard-shadow-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px" }}
            >
              close
            </span>
          </button>
        </div>
        <div className="bg-white border-[3px] border-on-background rounded-xl p-3">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="block"
            aria-label={`QR code linking to ${profileUrl}`}
          />
        </div>
        <p className="font-sans text-xs text-on-surface-variant text-center break-all">
          {profileUrl}
        </p>
      </div>
    </div>
  );
}
