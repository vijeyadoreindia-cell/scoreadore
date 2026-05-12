import React, { useState, useRef } from "react";
import { extractDriveId, getDriveViewUrl } from "../utils/driveUtils";
import "./DriveVideoPlayer.css";

/**
 * DriveVideoPlayer
 * Embeds Google Drive video inside the site using /preview URL.
 * The /preview endpoint is specifically designed for embedding and
 * works correctly in Chrome and most Brave configurations.
 * Shows a loading spinner while the iframe initializes.
 */
export default function DriveVideoPlayer({ url, title }) {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef(null);

  const id = extractDriveId(url);
  // /preview is the correct embeddable endpoint — different from /view which triggers CSP
  const embedUrl = id
    ? `https://drive.google.com/file/d/${id}/preview`
    : url;
  const viewUrl = getDriveViewUrl(url);

  return (
    <div className="dvp-wrapper">
      {!loaded && (
        <div className="dvp-loading">
          <div className="dvp-spinner" />
          <p>Loading video…</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title || "Video"}
        allow="autoplay; fullscreen"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        className="dvp-iframe"
        style={{ opacity: loaded ? 1 : 0 }}
      />
      <div className="dvp-bar">
        <span className="dvp-brave-tip">
          🛡 Using Brave? Disable shields for this site if video doesn't play.
        </span>
        <a href={viewUrl} target="_blank" rel="noreferrer" className="dvp-link">
          Open in Drive ↗
        </a>
      </div>
    </div>
  );
}
