import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toTranslatable, type Translatable } from "../core/i18n/types";
import {
  checkinService,
  type QrCheckinResult,
} from "../core/services/checkinService";

type QrCheckinState =
  | { status: "working" }
  | QrCheckinResult
  | { status: "error"; message: Translatable };

/**
 * Checks in as soon as the QR link opens: scanning *is* the intent, so no
 * extra tap. If login was needed first, ProtectedRoute brings the user back
 * here and this runs then.
 */
export const useQrCheckin = () => {
  const { token = "" } = useParams();
  const [state, setState] = useState<QrCheckinState>({ status: "working" });
  // StrictMode runs effects twice in development; the POST must go once
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    checkinService
      .checkInWithQr(token)
      .then(setState)
      .catch((err: unknown) =>
        setState({ status: "error", message: toTranslatable(err) }),
      );
  }, [token]);

  return { state };
};
