import React from "react";
import { EduOSMark } from "../brand/EduOSBrand";

export interface LoadingScreenProps {
  text?: string;
}

export function LoadingScreen({ text }: LoadingScreenProps) {
  return (
    <div className="eduos-portal-loading-screen">
      <div className="eduos-spinner-container">
        <div className="eduos-spinner eduos-spinner--branded" />
        <EduOSMark size={28} />
      </div>
      {text ? <p className="eduos-loading-text">{text}</p> : null}
      {!text ? <span className="eduos-visually-hidden">Loading</span> : null}
    </div>
  );
}
