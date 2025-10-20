import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Tooltip } from "react-tooltip";
import ChevronDownIcon from "../assets/images/svg/chevron-down.svg?react";
import ChevronLeftIcon from "../assets/images/svg/chevron-left.svg?react";
import ChevronRightIcon from "../assets/images/svg/chevron-right.svg?react";
import ChevronUpIcon from "../assets/images/svg/chevron-up.svg?react";
import FlameKindlingIcon from "../assets/images/svg/flame-kindling.svg?react";
import Pizza from "../assets/images/svg/pizza.svg?react";

import { styles } from "../lib/styles";
import {
  Experience,
  ExperienceCategory,
  Product,
  ProductCategory,
} from "../lib/interfaces";
import ShopNavbar from "../components/ShopNavbar";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionHeader from "../components/SectionHeader";
import { useTranslation } from "react-i18next";
import {
  getPublicCategoryExperiences,
  getPublicCategoryProducts,
  getPublicExperiences,
  getPublicProducts,
} from "../db/actions/reservation";
import ExperienceCard from "../components/ExperienceCard";
import ProductCard from "../components/ProductCard";
import { AnimatePresence, motion } from "framer-motion";
import { toTitleCase } from "../lib/utils";
import { toast } from "sonner";

/** small hook to close on outside click or Esc */
function useDismissable(isOpen: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [isOpen, onClose]);

  return ref;
}

const Extras: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addProduct, addExperience, getRangeDates } = useCart();
  const navigate = useNavigate();

  // Categories
  const [experiencesCategories, setExperiencesCategories] =
    useState<ExperienceCategory[]>([]);
  const [productsCategories, setProductsCategories] =
    useState<ProductCategory[]>([]);

  // Master lists (fetched once per language)
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allExperiences, setAllExperiences] = useState<Experience[]>([]);

  // Selected filters
  const [selectedCategories, setSelectedCategories] = useState<{
    products: string[];
    experiences: string[];
  }>({ products: [], experiences: [] });

  // Open dropdown (mobile)
  const [openCategory, setOpenCategory] = useState<string | undefined>(undefined);

  // -------- Utils
  const goToRoute = (route: string) => navigate(route);

  type HasCategory = { category?: { name?: string } };
  const getCategoryName = (item: HasCategory) => item.category?.name ?? "";

  // Normalize category names from different possible shapes
  const selectedProductNames = useMemo(
    () => new Set(selectedCategories.products),
    [selectedCategories.products]
  );

  const selectedExperienceNames = useMemo(
    () => new Set(selectedCategories.experiences),
    [selectedCategories.experiences]
  );

  // -------- Handlers
  const handleAddProductToCart = useCallback(
    (idProduct: number, quantity: number) => {
      const product = allProducts.find((p) => p.id === Number(idProduct));
      if (quantity === 0) {
        toast.error(t("validations.no_products_quantity"));
        return;
      }
      if (product) {
        addProduct({
          idProduct,
          name: product.name,
          price:
            product.price === product.custom_price
              ? product.price
              : product.custom_price,
          advanced: 0,
          quantity,
          confirmed: false,
        });
      }
    },
    [allProducts, addProduct, t]
  );

  const handleAddExperienceToCart = useCallback(
    (idExperience: number, quantity: number, day: Date) => {
      const experience = allExperiences.find(
        (e) => e.id === Number(idExperience)
      );
      if (quantity === 0) {
        toast.error(t("validations.no_experiences_quantity"));
        return;
      }
      if (experience) {
        addExperience({
          idExperience,
          name: experience.name,
          price:
            experience.price === experience.custom_price
              ? experience.price
              : experience.custom_price,
          advanced: 0,
          quantity,
          day,
          confirmed: false,
        });
      }
    },
    [allExperiences, addExperience, t]
  );

  const onChangeSelectedCategorie = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked, value } = e.target;
      const prefix = name.split("_")[0];

      setSelectedCategories((prev) => {
        if (prefix === "experience") {
          const current = new Set(prev.experiences);
          checked ? current.add(value) : current.delete(value);
          return { ...prev, experiences: [...current] };
        }
        if (prefix === "product") {
          const current = new Set(prev.products);
          checked ? current.add(value) : current.delete(value);
          return { ...prev, products: [...current] };
        }
        return prev;
      });
    },
    []
  );

  // -------- Fetch ONCE per language (or when language changes)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [catsProducts, catsExperiences, prod, exps] = await Promise.all([
        getPublicCategoryProducts(i18n.language),
        getPublicCategoryExperiences(i18n.language),
        getPublicProducts(i18n.language),
        getPublicExperiences(i18n.language),
      ]);

      if (cancelled) return;

      if (catsProducts) setProductsCategories(catsProducts);
      if (catsExperiences) setExperiencesCategories(catsExperiences);
      if (prod) setAllProducts(prod);
      if (exps) setAllExperiences(exps);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  // -------- Derived (filtered) lists: useMemo
  const filteredProducts = useMemo(() => {
    if (selectedProductNames.size === 0) return allProducts;
    return allProducts.filter(
      (p) => selectedProductNames.has(getCategoryName(p))
    );
  }, [allProducts, selectedProductNames]);

  const isBundleCategory = (name?: string) =>
    (name ?? "").trim().toUpperCase() === "BAMBU PAQUETES";

  const filteredExperiences = useMemo(() => {
    const base = selectedExperienceNames.size === 0
      ? allExperiences
      : allExperiences.filter(e => selectedExperienceNames.has(getCategoryName(e)));

    // Remove bundles
    return base.filter(e => !isBundleCategory(getCategoryName(e)));
  }, [allExperiences, selectedExperienceNames]);

  const isProductsOpen = openCategory === "products";
  const isExperiencesOpen = openCategory === "experiences";

  const closeProducts = useCallback(() => setOpenCategory(undefined), []);
  const closeExperiences = useCallback(() => setOpenCategory(undefined), []);

  const productsPopoverRef = useDismissable(isProductsOpen, closeProducts);
  const experiencesPopoverRef = useDismissable(isExperiencesOpen, closeExperiences);

  return (
    <>
      <div className="w-full min-h-screen relative flex flex-row overflow-x-hidden">
        <SectionHeader identifier="extras" />
        <ShopNavbar variant="dark" />

        <div
          className={`relative w-full h-full flex flex-col ${styles.padding} mb-12 mt-36 sm:mt-20 lg:mt-0`}
        >
          {/* Header */}
          <div className="flex flex-row w-auto h-auto gap-x-4">
            <button
              onClick={() => goToRoute("/booking")}
              className="rounded-full h-8 sm:h-12 w-8 sm:w-12 bg-white border-2 border-secondary text-secondary duration-300 transition-all hover:bg-secondary group active:scale-95 "
            >
              <ChevronLeftIcon className="h-full w-full group-hover:text-white" />
            </button>
            <h1 className="font-primary text-secondary text-2xl sm:text-6xl">
              Extras
            </h1>
          </div>

          {/* Experiences */}
          <div className="w-full flex flex-col gap-y-4 mt-2">
            <span className="flex flex-row items-end gap-x-2">
              <FlameKindlingIcon className="h-8 sm:h-10 w-8 sm:w-10" />
              <h2 className="text-md sm:text-lg">{t("reserve.experiences")}</h2>
            </span>
            <p className="text-sm sm:text-md">{t("experience.header")}</p>
            <h2 className="text-secondary hidden sm:block">
              {t("common.categories")}
            </h2>

            <div className="w-full h-auto pb-4">
              {/* Mobile dropdown */}
              <div
                className="relative w-full h-auto mb-2 sm:hidden"
              >
                <div className="p-none m-none flex items-center justify-between w-full h-6">
                  <h2 className="text-secondary">{t("common.categories")}</h2>

                  {/* stable toggle button to avoid double toggles */}
                  <button
                    type="button"
                    aria-expanded={openCategory === "experiences"}
                    aria-controls="experiences-categories-popover"
                    onClick={() =>
                      setOpenCategory((prev) => (prev === "experiences" ? undefined : "experiences"))
                    }
                    className="w-6 h-6 grid place-items-center"
                  >
                    {isExperiencesOpen ? (
                      <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {isExperiencesOpen && (
                    <motion.div
                      key="experience-catalog-categories"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      style={{ transformOrigin: "top left" }}
                      className="absolute left-0 top-[120%] flex w-[200px] h-auto flex-col gap-2 bg-white border-2 border-secondary rounded-lg px-1 py-2 z-[20]"
                      ref={experiencesPopoverRef}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {experiencesCategories
                        .filter(item => !isBundleCategory(item.name))
                        .map((item) => {
                        const id = `experience_${item.id}`;
                        return (
                          <div
                            key={id}
                            className="checkbox-wrapper-13 flex items-center gap-2"
                          >
                            <input
                              id={id}
                              name={id}
                              value={item.name}
                              type="checkbox"
                              aria-hidden="true"
                              onChange={onChangeSelectedCategorie}
                              checked={selectedCategories.experiences.includes(
                                item.name
                              )}
                            />
                            <label
                              htmlFor={id}
                              className="text-xs sm:text-sm cursor-pointer"
                            >
                              {toTitleCase(item.name)}
                            </label>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop checkboxes */}
              <div className="hidden w-full h-auto sm:flex flex-row pb-2 m-none gap-x-4">
                {experiencesCategories
                  .filter(item => !isBundleCategory(item.name))
                  .map((item) => {
                  const id = `experience_${item.id}`;
                  return (
                    <div
                      key={id}
                      className="checkbox-wrapper-13 flex items-center gap-2"
                    >
                      <input
                        id={id}
                        name={id}
                        value={item.name}
                        type="checkbox"
                        aria-hidden="true"
                        onChange={(e) => {
                          onChangeSelectedCategorie(e);
                          setOpenCategory(undefined);
                        }}
                        checked={selectedCategories.experiences.includes(
                          item.name
                        )}
                      />
                      <label
                        htmlFor={id}
                        className="text-xs sm:text-sm cursor-pointer"
                      >
                        {toTitleCase(item.name)}
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Cards */}
              <div className="w-full h-full flex flex-row overflow-x-scroll gap-x-6 pb-4">
                {filteredExperiences.map((experienceItem, index) => (
                  <ExperienceCard
                    key={`experience__extra_${experienceItem.id ?? index}`}
                    index={index}
                    experience={experienceItem}
                    handleAddExperience={handleAddExperienceToCart}
                    rangeDates={getRangeDates()}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="w-full flex flex-col gap-y-4 mt-2">
            <span className="flex flex-row items-end gap-x-2">
              <Pizza className="h-8 sm:h-10 w-8 sm:w-10" />
              <h2 className="text-md sm:text-lg">{t("reserve.products")}</h2>
            </span>
            <p className="text-sm sm:text-md">{t("product.header")}</p>
            <h2 className="text-secondary hidden sm:block">{t("Categories")}</h2>

            {/* Mobile dropdown */}
            <div
              className="relative w-full h-auto mb-2 sm:hidden"
            >
              <div className="p-none m-none flex items-center justify-between w-full h-6">
                <h2 className="text-secondary">{t("common.categories")}</h2>

                {/* stable toggle button to avoid double toggles */}
                <button
                  type="button"
                  aria-expanded={openCategory === "products"}
                  aria-controls="products-categories-popover"
                  onClick={() =>
                    setOpenCategory((prev) => (prev === "products" ? undefined : "products"))
                  }
                  className="w-6 h-6 grid place-items-center"
                >
                  {openCategory === "products" ? (
                    <ChevronUpIcon className="w-6 h-6" />
                  ) : (
                    <ChevronDownIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
              <AnimatePresence>
                {isProductsOpen && (
                  <motion.div
                    key="product-catalog-categories"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformOrigin: "top left" }}
                    className="absolute left-0 top-[120%] flex w-[200px] h-auto flex-col gap-2 bg-white border-2 border-secondary rounded-lg px-1 py-2 z-[20]"
                    ref={productsPopoverRef}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {productsCategories.map((item) => {
                      const id = `product_${item.id}`;
                      return (
                        <div
                          key={id}
                          className="checkbox-wrapper-13 flex items-center gap-2"
                        >
                          <input
                            id={id}
                            name={id}
                            value={item.name}
                            type="checkbox"
                            aria-hidden="true"
                            onChange={onChangeSelectedCategorie}
                            checked={selectedCategories.products.includes(
                              item.name
                            )}
                          />
                          <label
                            htmlFor={id}
                            className="text-xs sm:text-sm cursor-pointer"
                          >
                            {toTitleCase(item.name)}
                          </label>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop checkboxes */}
            <div className="w-full h-auto hidden sm:flex flex-row py-2 m-none gap-x-4">
              {productsCategories.map((item) => {
                const id = `product_${item.id}`;
                return (
                  <div
                    key={id}
                    className="checkbox-wrapper-13 flex items-center gap-2"
                  >
                    <input
                      id={id}
                      name={id}
                      value={item.name}
                      type="checkbox"
                      aria-hidden="true"
                      onChange={onChangeSelectedCategorie}
                      checked={selectedCategories.products.includes(item.name)}
                    />
                    <label
                      htmlFor={id}
                      className="text-xs sm:text-sm cursor-pointer"
                    >
                      {toTitleCase(item.name)}
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Cards */}
            <div className="w-full h-[350px] pb-4">
              <div className="w-full h-full flex flex-row overflow-x-scroll gap-x-6">
                {filteredProducts.map((productItem, index) => (
                  <ProductCard
                    key={`product__extra_${productItem.id ?? index}`}
                    index={index}
                    product={productItem}
                    handleAddProduct={handleAddProductToCart}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="absolute right-12 bottom-12">
          <Button
            onClick={() => goToRoute("/reserve")}
            variant="dark"
            effect="default"
            size="lg"
            className="group text-md sm:text-lg h-8 sm:h-10"
            rightIcon={
              <ChevronRightIcon className="w-4 sm:w-6 h-4 sm:h-6 ml-2 duration-300" />
            }
          >
            {t("common.go_to_reserve")}
          </Button>
        </div>
      </div>

      <Tooltip
        id="my-tooltip"
        style={{
          backgroundColor: "#00AAA9",
          borderRadius: "10px",
          padding: "6px",
          fontSize: "10px",
        }}
      />
    </>
  );
};

export default Extras;
