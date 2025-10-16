import React, { useState } from "react";
import MailIcon from "../assets/images/svg/mail.svg?react";
import WhatsAppIcon from "../assets/images/svg/send.svg?react";
import ShopNavbar from "../components/ShopNavbar";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation,  } from "react-i18next";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";
import { ISOLOGO, QR_BAMBUCAMP } from "../assets/images";
import { formatPrice} from "../lib/utils";

const WHATSAPP_URL = "https://wa.link/ioswo5";
const RESERVAS_EMAIL = "reservas@bambucamp.com";

// ---- Fill with your real data
const QR_NAME = "CRIALCA S.A.C";

const BBVA_ACCOUNT = "0011-0341-0200476632";
const BBVA_CCI = "011-341-000200476632-51";
const BBVA_OWNER = "CRIALCA S.A.C - RUC 20602767532";
// ----

// Small utility to build a mailto with i18n subject/body
const buildMailto = (to: string, subject: string, body: string) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

const CopyButton: React.FC<{ value: string; className?: string }> = ({ value, className }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // You could show a toast/snackbar if you use one
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-secondary/40 px-3 py-1.5 text-xs text-secondary hover:bg-secondary hover:text-white transition"
      }
      aria-label={t("common.copy")}
      title={t("common.copy")}
    >
      {copied ? t("common.copied") : t("common.copy")}
    </button>
  );
};

const InProcessReservation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { external_id?: string; gross_import?: number };
  };

  const stateExternalId = location.state?.external_id;
  const stateGrossImport = location.state?.gross_import;

  // Fallback if user refreshed
  let fallback: { external_id?: string; gross_import?: number } = {};
  try {
    fallback = JSON.parse(sessionStorage.getItem("reserve_summary") ?? "{}");
  } catch {}

  const externalId = stateExternalId ?? fallback.external_id;
  const grossImport = stateGrossImport ?? fallback.gross_import;

  const goToRoute = (route: string) => navigate(route);

  const mailtoHref = buildMailto(
    RESERVAS_EMAIL,
    t("reserve.mail_subject"),
    t("reserve.mail_body")
  );

  return (
    <>
      <div className="w-full min-h-screen relative flex flex-row overflow-x-hidden">
        <ShopNavbar variant="dark" />
        <div className="relative w-full h-full flex flex-col">
          <div className="flex flex-col w-full items-start gap-x-4">
            <div className="w-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="w-full max-w-3xl flex flex-col items-center gap-6 rounded-2xl sm:border sm:border-secondary/30 sm:shadow-xl sm:bg-white/80 sm:backdrop-blur p-4 sm:p-10 mt-12"
              >
                <img alt="isologo" src={ISOLOGO} className="h-16 w-16" />

                <h1 className="font-primary text-primary text-2xl sm:text-4xl text-center">
                  {t("reserve.header_in_process")}
                </h1>

                <p className="text-secondary text-center text-sm sm:text-base">
                  {t("reserve.info_in_process")}
                </p>

                {/* Instrucciones generales */}
                <div className="w-full rounded-xl border-2 border-secondary/40 bg-secondary/5 p-5 sm:p-6">
                  <h2 className="text-secondary font-semibold mb-2">
                    {t("reserve.deposit_title")}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700">
                    {t("reserve.deposit_instructions", { email: RESERVAS_EMAIL })}
                  </p>
                </div>

                {/* Resumen de la reserva --- */}
                {(externalId || grossImport != null) && (
                  <div className="w-full rounded-xl border-2 border-secondary/30 bg-white/70 backdrop-blur p-5 sm:p-6 my-4">
                    <h3 className="text-secondary font-semibold mb-3">
                      {t("reserve.summary")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base">
                      {externalId && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">{t("reserve.reservation")}</span>
                          <span className="font-medium text-tertiary">{externalId}</span>
                        </div>
                      )}
                      {grossImport != null && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">{t("reserve.total_amount")}</span>
                          <span className="font-semibold text-tertiary">
                            {formatPrice(Number(grossImport))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Métodos de pago (Rediseñado) */}
                <div className="w-full rounded-xl border border-secondary/30 bg-white p-5 sm:p-6">
                  <h3 className="text-secondary font-semibold mb-2">
                    {t("reserve.payment_methods_title")}
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base mb-4">
                    {t("reserve.payment_methods_intro")}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Columna 1: QR / Yape / Plin */}
                    <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                          {t("reserve.payment_methods_qr_title")}
                        </h4>
                        <span className="text-[11px] sm:text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                          {t("reserve.payment_methods_qr_badge")}
                        </span>
                      </div>

                      {/* QR cuadrado */}
                      <div className="w-full">
                        <div className="mx-auto aspect-square max-w-[220px] rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
                          <img
                            src={QR_BAMBUCAMP}
                            alt={t("reserve.payment_qr_alt")}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm sm:text-base mt-4">
                        {t("reserve.payment_methods_qr_note")}
                      </p>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs sm:text-sm">
                            <div className="text-gray-500">{t("reserve.account_holder_label")}</div>
                            <div className="font-medium text-gray-900">{QR_NAME}</div>
                          </div>
                          <CopyButton value={QR_NAME} />
                        </div>
                      </div>
                    </div>

                    {/* Columna 2: Transferencia BBVA */}
                    <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                          {t("reserve.bank_transfer_title")}
                        </h4>
                        <span className="text-[11px] sm:text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {t("reserve.bank_badge_bbva")}
                        </span>
                      </div>

                      <ul className="text-gray-800 text-sm sm:text-base space-y-3">
                        <li className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-gray-500 text-xs">{t("reserve.bank_account_label")}</div>
                            <div className="font-medium text-sm">{BBVA_ACCOUNT}</div>
                          </div>
                          <CopyButton value={BBVA_ACCOUNT} />
                        </li>
                        <li className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-gray-500 text-xs">{t("reserve.bank_cci_label")}</div>
                            <div className="font-medium text-sm">{BBVA_CCI}</div>
                          </div>
                          <CopyButton value={BBVA_CCI} />
                        </li>
                        <li className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-gray-500 text-xs">{t("reserve.bank_holder_label")}</div>
                            <div className="font-medium text-sm">{BBVA_OWNER}</div>
                          </div>
                          <CopyButton value={BBVA_OWNER} />
                        </li>
                      </ul>

                      <p className="text-gray-600 text-xs sm:text-sm mt-4">
                        {t("reserve.send_receipt_note", { email: RESERVAS_EMAIL })}{" "}
                        <a href={mailtoHref} className="underline text-secondary">
                          {RESERVAS_EMAIL}
                        </a>{" "}
                        {t("reserve.send_receipt_or")}{" "}
                        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="underline text-secondary">
                          WhatsApp
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones: Email / WhatsApp */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <a
                    href={mailtoHref}
                    className="w-full text-sm sm:text-md sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-secondary px-5 py-2.5 text-secondary hover:bg-secondary hover:text-white transition"
                  >
                    <MailIcon className="w-5 h-5" />
                    {t("reserve.contact_email_cta")}
                  </a>

                  <span className="text-gray-400 select-none">{t("reserve.or")}</span>

                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-sm sm:text-md sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-white hover:brightness-95 transition"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    {t("reserve.contact_whatsapp_cta")}
                  </a>
                </div>

                {/* CTA Home */}
                <div className="w-full sm:w-auto flex justify-center pt-2">
                  <Button onClick={() => goToRoute("/")} variant="dark" isRound>
                    {t("common.home")}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InProcessReservation;
