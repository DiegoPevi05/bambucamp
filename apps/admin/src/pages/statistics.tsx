import Dashboard from "../components/ui/Dashboard";
import { AnimatePresence, motion } from "framer-motion";
import { fadeIn, fadeOnly } from "../lib/motions";
import { BarChart, ChevronDownIcon, ChevronUpIcon, FileBarChart, LineChart, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getNetSalesStatistics, getReserveQuantityStatistics } from "../db/actions/statistics";
import { generateNetSalesBarChart, generateReservesQuantities } from "../lib/charts";
import { formatPrice } from "../lib/utils";
import Button from "../components/ui/Button";
import Modal from "../components/Modal";
import { downloadSalesReport } from "../db/actions/reports";
import { salesReportSchema, SalesReportForm } from "../lib/schemas/reports";
import { ZodError } from "zod";

type DropDownOption = { value: string; label: string };

interface PropsDropDown {
  currentStatus: { key: string; field: string; value: string };
  options: DropDownOption[];
  handleChangeOption: (key: string, field: string, value: string) => void;
}

const DropDownComponent = (props: PropsDropDown) => {
  const { t } = useTranslation();
  const { currentStatus, options, handleChangeOption } = props;
  const [show, setShow] = useState<boolean>(false);

  const toggleShow = () => {
    setShow((prev) => !prev);
  };

  const onClickOption = useCallback(
    (value: string) => {
      handleChangeOption(currentStatus.key, currentStatus.field, value);
      setShow(false);
    },
    [currentStatus, handleChangeOption],
  );

  return (
    <div
      className="w-auto px-4 h-auto py-1 bg-secondary relative flex items-center justify-center text-white rounded-xl border-2 hover:border-white hover:bg-primary cursor-pointer active:scale-95 duration-300"
      onClick={toggleShow}
    >
      <label className="inline-flex gap-x-2 cursor-pointer">
        {currentStatus.value} {show ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </label>
      {show && (
        <motion.div
          initial="hidden"
          animate="show"
          exit="hidden"
          variants={fadeOnly("", 0, 0.5)}
          className="absolute top-full w-auto h-auto flex flex-col mt-2"
        >
          {options.map((option, index) => (
            <span
              onClick={(event) => {
                event.stopPropagation();
                onClickOption(option.value);
              }}
              key={`option_${currentStatus.key}_${currentStatus.field}_${index}`}
              className={`w-auto px-4 py-1 bg-primary inline-flex items-center justify-center hover:bg-secondary duration-300 ${index === 0 ? "rounded-t-xl " : ""} ${index === options.length - 1 ? "rounded-b-xl" : ""}`}
            >
              {t(option.label)}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
};

type Step = "W" | "M" | "Y";
type SeriesType = "A" | "P";

type WindowedFilters = {
  step: Step;
  type: SeriesType;
  anchor: string;   // YYYY-MM-DD
  offset: number;   // e.g., 0 (current), -1 (prev page), +1 (next)
  tz?: string;      // optional, default 'America/Lima'
};

const createDefaultSalesReportForm = (): SalesReportForm => ({
  dateFrom: "",
  dateTo: "",
  format: "pdf",
});

const DashboardAdminStatistics = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const todayIso = new Date().toISOString().slice(0, 10);

  const [selectedOptions, setSelectedOptions] = useState<{ net_amount: WindowedFilters, reserves: WindowedFilters }>({
    net_amount: { step: "W", type: "P", anchor: todayIso, offset: 0 },
    reserves: { step: "W", type: "P", anchor: todayIso, offset: 0 },
  });


  const [totalValues, setTotalValues] = useState({
    net_amount: 0,
    reserves: 0,
  });

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportForm, setReportForm] = useState<SalesReportForm>(createDefaultSalesReportForm);
  const [reportErrors, setReportErrors] = useState<Record<string, string>>({});
  const [reportLoading, setReportLoading] = useState(false);


  const shiftRange = (key: 'net_amount' | 'reserves', delta: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        offset: Math.min(0, (prev[key].offset + delta)), // prevent going into future; allow <=0
      }
    }));
  };

  // When step changes, reset offset to 0 so the user jumps back to "current"
  const updateSelectedOption = (key: string, field: string, value: string) => {
    setSelectedOptions((prev: any) => {
      const next = { ...prev, [key]: { ...prev[key], [field]: value } };
      if (field === 'step') next[key].offset = 0;
      return next;
    });
  };

  const getNetSalesStatisticsHandler = useCallback(async () => {
    if (user != null) {
      const netSales = await getNetSalesStatistics(user.token, selectedOptions.net_amount, i18n.language);
      const salesData = netSales ?? [];

      if (salesData.length === 0) {
        setTotalValues((prevTotal) => ({ ...prevTotal, net_amount: 0 }));
      } else if (selectedOptions.net_amount.type === "P") {
        setTotalValues((prevTotal) => ({
          ...prevTotal,
          net_amount: salesData.reduce((sum, sale) => sum + sale.amount, 0),
        }));
      } else {
        setTotalValues((prevTotal) => ({
          ...prevTotal,
          net_amount: salesData[salesData.length - 1].amount,
        }));
      }

      await generateNetSalesBarChart(t("statistic.net_amount_chart_header"), salesData);
    }
  }, [user, selectedOptions.net_amount, i18n.language, t]);

  const getReserveQuantityStatisticsHandler = useCallback(async () => {
    if (user != null) {
      const reservesQuantities = await getReserveQuantityStatistics(user.token, selectedOptions.reserves, i18n.language);
      const reserveData = reservesQuantities ?? [];

      if (reserveData.length === 0) {
        setTotalValues((prevTotal) => ({ ...prevTotal, reserves: 0 }));
      } else if (selectedOptions.reserves.type === "P") {
        setTotalValues((prevTotal) => ({
          ...prevTotal,
          reserves: reserveData.reduce((sum, reserve) => sum + reserve.quantity, 0),
        }));
      } else {
        setTotalValues((prevTotal) => ({
          ...prevTotal,
          reserves: reserveData[reserveData.length - 1].quantity,
        }));
      }

      await generateReservesQuantities(t("statistic.reserves_chart_header"), reserveData);
    }
  }, [user, selectedOptions.reserves, i18n.language, t]);

  useEffect(() => {
    getNetSalesStatisticsHandler();
  }, [getNetSalesStatisticsHandler]);

  useEffect(() => {
    getReserveQuantityStatisticsHandler();
  }, [getReserveQuantityStatisticsHandler]);

  useEffect(() => {
    if (reportModalOpen) {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      setReportErrors({});
      setReportForm((prev) => ({
        ...prev,
        dateFrom: prev.dateFrom || lastWeek.toISOString().slice(0, 10),
        dateTo: prev.dateTo || today.toISOString().slice(0, 10),
      }));
    }
  }, [reportModalOpen]);

  const resetReportForm = () => {
    setReportForm(createDefaultSalesReportForm());
    setReportErrors({});
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
    resetReportForm();
  };

  const handleReportFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setReportForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDownloadSalesReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user == null) return;

    setReportLoading(true);
    setReportErrors({});

    try {
      const parsed = salesReportSchema.parse(reportForm);
      const success = await downloadSalesReport(user.token, parsed, i18n.language);
      if (success) {
        handleCloseReportModal();
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0];
          if (typeof field === "string") {
            formattedErrors[field] = err.message;
          }
        });
        setReportErrors(formattedErrors);
      } else {
        console.error(error);
      }
    } finally {
      setReportLoading(false);
    }
  };

  const handleOpenReportModal = () => {
    setReportModalOpen(true);
  };

  return (
    <Dashboard>
      <motion.div
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={fadeIn("up", "", 0, 0.5)}
        className="bg-white h-auto 2xl:h-[90%] w-full flex flex-col xl:flex-row justify-start items-start gap-y-4 xl:gap-4 xl:pb-4"
      >
        <div className="w-full xl:w-full h-full flex flex-col xl:flex-row gap-y-4 xl:gap-x-4">
          <div className="bg-white px-2 py-4 xl:p-4 rounded-lg shadow-lg border-2 border-gray-200 w-full h-auto xl:h-auto flex flex-col">
            <div className="w-full h-auto flex flex-row justify-end items-end">
              <Button
                effect="default"
                className="w-auto max-sm:text-[12px]"
                size="sm"
                variant="ghostLight"
                onClick={handleOpenReportModal}
                rightIcon={<FileBarChart />}
                isRound
              >
                {t("statistic.download_report")}
              </Button>
            </div>
            <h1 className="text-sm sm:text-lg flex flex-row gap-x-2 text-secondary max-sm:mt-2">
              <LineChart />
              {t("statistic.net_amount")}
            </h1>
            <p className="font-secondary text-sm sm:text-md max-sm:mt-2 text-tertiary">{t("statistic.select_time")}</p>
            <div className="w-full h-auto flex flex-row gap-x-2 my-4 sm:my-2">
              <button
                type="button"
                className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                onClick={(e) => { e.stopPropagation(); shiftRange('net_amount', -1); }}
                title={t('statistic.prev_period')}
              >
                <ChevronLeft />
              </button>
              <DropDownComponent
                currentStatus={{ key: "net_amount", field: "step", value: selectedOptions.net_amount.step }}
                options={[
                  { value: "W", label: "statistic.weekly" },
                  { value: "M", label: "statistic.monthly" },
                  { value: "Y", label: "statistic.yearly" },
                ]}
                handleChangeOption={updateSelectedOption}
              />

              <DropDownComponent
                currentStatus={{ key: "net_amount", field: "type", value: selectedOptions.net_amount.type }}
                options={[
                  { value: "A", label: "statistic.acumulative" },
                  { value: "P", label: "statistic.period" },
                ]}
                handleChangeOption={updateSelectedOption}
              />
              <button
                type="button"
                className="px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-40"
                onClick={(e) => { e.stopPropagation(); shiftRange('net_amount', +1); }}
                disabled={selectedOptions.net_amount.offset >= 0}
                title={t('statistic.next_period')}
              >
                <ChevronRight />
              </button>
            </div>
            <div className="h-auto w-full flex flex-col items-end justify-end bg-white duration-800 transition-all transition-opacity rounded-b-xl">
              <p className="text-secondary text-md">{t("statistic.net_amount_chart_title")}</p>
              <h1 className="text-5xl">{formatPrice(totalValues.net_amount)}</h1>
            </div>
            <AnimatePresence>
              <motion.div
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={fadeOnly("", 0, 0.5)}
                className="h-auto w-full bg-white duration-800 transition-all transition-opacity rounded-b-xl"
              >
                <canvas id="statistics_net_amount" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="bg-white px-2 py-4 xl:p-4 rounded-lg shadow-lg border-2 border-gray-200 w-full h-full xl:h-auto flex flex-col">
            <div className="w-full h-auto flex flex-row justify-end items-end">
              <Button
                effect="default"
                className="w-auto max-sm:text-[12px]"
                size="sm"
                variant="ghostLight"
                onClick={handleOpenReportModal}
                rightIcon={<FileBarChart />}
                isRound
              >
                {t("statistic.download_report")}
              </Button>
            </div>
            <h1 className="text-sm sm:text-lg flex flex-row gap-x-2 text-secondary max-sm:mt-2">
              <BarChart />
              {t("statistic.reserves")}
            </h1>
            <p className="font-secondary text-sm sm:text-md max-sm:mt-2 text-tertiary">{t("statistic.select_time")}</p>
            <div className="w-full h-auto flex flex-row gap-x-2 my-4 sm:my-2">
              <button
                type="button"
                className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                onClick={(e) => { e.stopPropagation(); shiftRange('reserves', -1); }}
                title={t('statistic.prev_period')}
              >
                <ChevronLeft />
              </button>
              <DropDownComponent
                currentStatus={{ key: "reserves", field: "step", value: selectedOptions.reserves.step }}
                options={[
                  { value: "W", label: "statistic.weekly" },
                  { value: "M", label: "statistic.monthly" },
                  { value: "Y", label: "statistic.yearly" },
                ]}
                handleChangeOption={updateSelectedOption}
              />

              <DropDownComponent
                currentStatus={{ key: "reserves", field: "type", value: selectedOptions.reserves.type }}
                options={[
                  { value: "A", label: "statistic.acumulative" },
                  { value: "P", label: "statistic.period" },
                ]}
                handleChangeOption={updateSelectedOption}
              />
              <button
                type="button"
                className="px-3 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-40"
                onClick={(e) => { e.stopPropagation(); shiftRange('reserves', +1); }}
                disabled={selectedOptions.net_amount.offset >= 0}
                title={t('statistic.next_period')}
              >
                <ChevronRight />
              </button>
            </div>
            <div className="h-auto w-full flex flex-col items-end justify-end bg-white duration-800 transition-all transition-opacity rounded-b-xl">
              <p className="text-secondary text-md">{t("statistic.reserves_chart_title")}</p>
              <h1 className="text-5xl">{formatPrice(totalValues.reserves)}</h1>
            </div>
            <AnimatePresence>
              <motion.div
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={fadeOnly("", 0, 0.5)}
                className="h-auto w-full bg-white duration-800 transition-all transition-opacity rounded-b-xl"
              >
                <canvas id="statistics_reserves_quantities" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <Modal isOpen={reportModalOpen} onClose={handleCloseReportModal}>
        <form onSubmit={handleDownloadSalesReport} className="w-full max-w-xl p-6 flex flex-col gap-4">
          <div className="flex flex-row items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-primary text-secondary">{t("reports.sales_title")}</h3>
              <p className="text-xs text-gray-500">{t("reports.sales_description")}</p>
            </div>
            <Button type="button" variant="ghostLight" size="sm" isRound onClick={handleCloseReportModal}>
              {t("common.cancel")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary" htmlFor="sales-report-date-from">
                {t("reports.date_from")}
              </label>
              <input
                id="sales-report-date-from"
                name="dateFrom"
                type="date"
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={reportForm.dateFrom}
                onChange={handleReportFieldChange}
              />
              {reportErrors.dateFrom && <span className="text-[10px] text-tertiary">{t(reportErrors.dateFrom)}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary" htmlFor="sales-report-date-to">
                {t("reports.date_to")}
              </label>
              <input
                id="sales-report-date-to"
                name="dateTo"
                type="date"
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={reportForm.dateTo}
                onChange={handleReportFieldChange}
              />
              {reportErrors.dateTo && <span className="text-[10px] text-tertiary">{t(reportErrors.dateTo)}</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary" htmlFor="sales-report-format">
                {t("reports.format")}
              </label>
              <select
                id="sales-report-format"
                name="format"
                className="border-b-2 border-secondary focus:outline-none focus:border-b-primary px-2 py-1 text-sm"
                value={reportForm.format}
                onChange={handleReportFieldChange}
              >
                <option value="pdf">{t("reports.pdf")}</option>
                <option value="csv">{t("reports.csv")}</option>
              </select>
              {reportErrors.format && <span className="text-[10px] text-tertiary">{t(reportErrors.format)}</span>}
            </div>
          </div>

          <div className="flex flex-row justify-end gap-2">
            <Button type="button" variant="ghostLight" size="sm" isRound onClick={handleCloseReportModal}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="default" size="sm" isRound isLoading={reportLoading}>
              {t("reports.generate")}
            </Button>
          </div>
        </form>
      </Modal>
    </Dashboard>
  );
};

export default DashboardAdminStatistics;
