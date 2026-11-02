"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Building,
  Compass,
  Check,
  Search,
  ChevronDown,
  X,
  AlertCircle,
} from "lucide-react";
import {
  PAKISTAN_PROVINCES,
  PAKISTAN_DISTRICTS_DATA,
  searchPakistanCities,
  getTehsilsForDistrict,
  findCity,
  type CityData,
} from "@/lib/pakistanLocations";
import { cn } from "@/lib/utils";

export interface LocationValues {
  city: string;
  district: string;
  tehsil: string;
  location: string;
  province?: string;
}

interface PakistanLocationFieldsProps {
  values: LocationValues;
  onChange: (values: LocationValues) => void;
  touched?: boolean;
}

export function PakistanLocationFields({
  values,
  onChange,
  touched = false,
}: PakistanLocationFieldsProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(values.city || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cityId = useId();
  const districtId = useId();
  const tehsilId = useId();
  const locationId = useId();

  // Keep search input query in sync if values.city changes externally
  useEffect(() => {
    setSearchQuery(values.city || "");
  }, [values.city]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchPakistanCities(searchQuery, 40);
  const tehsils = values.district ? getTehsilsForDistrict(values.district) : [];

  const cityValid = values.city.trim().length >= 2;
  const districtValid = values.district.trim().length >= 2;
  const tehsilValid = values.tehsil.trim().length >= 2;

  function handleSelectCity(item: CityData) {
    const updatedTehsils = getTehsilsForDistrict(item.district);
    const chosenTehsil = item.tehsil || (updatedTehsils.length > 0 ? updatedTehsils[0] : "");

    setSearchQuery(item.name);
    setIsOpen(false);

    onChange({
      ...values,
      city: item.name,
      district: item.district,
      tehsil: chosenTehsil,
      province: item.province,
    });
  }

  function handleDistrictChange(newDistrict: string) {
    const matchedDistrict = PAKISTAN_DISTRICTS_DATA.find((d) => d.name === newDistrict);
    const availableTehsils = matchedDistrict ? matchedDistrict.tehsils : [];
    const defaultTehsil = availableTehsils.length > 0 ? availableTehsils[0] : "";

    onChange({
      ...values,
      district: newDistrict,
      tehsil: defaultTehsil,
      province: matchedDistrict?.province || values.province || "",
    });
  }

  function handleTehsilChange(newTehsil: string) {
    onChange({
      ...values,
      tehsil: newTehsil,
    });
  }

  function handleCityInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setSearchQuery(text);
    setIsOpen(true);

    // If user clears or types custom text, sync city
    const exact = findCity(text);
    if (exact) {
      const updatedTehsils = getTehsilsForDistrict(exact.district);
      const chosenTehsil = exact.tehsil || (updatedTehsils.length > 0 ? updatedTehsils[0] : "");
      onChange({
        ...values,
        city: exact.name,
        district: exact.district,
        tehsil: chosenTehsil,
        province: exact.province,
      });
    } else {
      onChange({
        ...values,
        city: text,
      });
    }
  }

  function handleClearCity(e: React.MouseEvent) {
    e.stopPropagation();
    setSearchQuery("");
    onChange({
      ...values,
      city: "",
    });
    inputRef.current?.focus();
    setIsOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* ─── 1. City / Searchable Combobox ─────────────────────────────────── */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <span
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-navy-400 flex items-center justify-center w-5 h-5 z-10"
            aria-hidden="true"
          >
            <MapPin className="h-4 w-4" />
          </span>

          <input
            ref={inputRef}
            id={cityId}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="pakistan-cities-listbox"
            aria-autocomplete="list"
            autoComplete="off"
            placeholder=" "
            value={searchQuery}
            onChange={handleCityInputChange}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "field-float field-float--with-left-icon !ps-11 !pe-16",
              touched && !cityValid && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/15"
            )}
          />

          <label
            htmlFor={cityId}
            className={cn(
              "field-float-label field-float-label--inset",
              touched && !cityValid && "field-float-label--error"
            )}
          >
            {t("marketing.regCity")} <span className="text-rose-400">*</span>
          </label>

          {/* Action slots on right: Clear, Valid Check, or Dropdown Toggle */}
          <div className="absolute end-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearCity}
                className="p-1 rounded-md text-navy-400 hover:text-navy-700 hover:bg-slate-100 transition-colors"
                title="Clear"
                aria-label="Clear city"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {cityValid && !isOpen && (
              <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="p-1 text-navy-400 hover:text-navy-600 transition-transform"
              aria-label="Toggle city list"
            >
              <ChevronDown
                className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
              />
            </button>
          </div>
        </div>

        {touched && !cityValid && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t("marketing.regCityRequired")}
          </p>
        )}

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            id="pakistan-cities-listbox"
            role="listbox"
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-navy-400 flex items-center justify-between border-b border-slate-100 mb-1">
              <span className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                {searchQuery ? t("common.searchResults") : t("marketing.regAllCities")}
              </span>
              <span className="text-[10px] text-navy-300">
                {searchResults.length} {t("common.results")}
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted">
                <p>{t("marketing.regNoCitiesFound")}</p>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...values, city: searchQuery });
                    setIsOpen(false);
                  }}
                  className="mt-2 text-xs font-semibold text-gold-700 underline hover:text-gold-800"
                >
                  Use &quot;{searchQuery}&quot; as City
                </button>
              </div>
            ) : (
              searchResults.map((item) => {
                const isSelected =
                  values.city.toLowerCase() === item.name.toLowerCase() &&
                  values.district.toLowerCase() === item.district.toLowerCase();

                return (
                  <button
                    key={`${item.name}-${item.district}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCity(item)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-xs transition-colors",
                      isSelected
                        ? "bg-gold-50 text-gold-900 font-semibold"
                        : "text-navy hover:bg-navy-50/70"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm text-navy-900">{item.name}</span>
                      <span className="text-[11px] text-navy-400">
                        {item.district} · {item.province}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-gold-600 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ─── 2. District & Tehsil Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* District Field */}
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <span
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-navy-400 flex items-center justify-center w-5 h-5 z-10"
              aria-hidden="true"
            >
              <Building className="h-4 w-4" />
            </span>

            <select
              id={districtId}
              value={values.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className={cn(
                "field-float field-float--with-left-icon !ps-11 !pe-9 appearance-none cursor-pointer bg-white",
                touched && !districtValid && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/15"
              )}
            >
              <option value="" disabled>
                -- {t("marketing.regDistrictSelect")} --
              </option>
              {PAKISTAN_PROVINCES.map((prov) => {
                const dists = PAKISTAN_DISTRICTS_DATA.filter((d) => d.province === prov);
                if (dists.length === 0) return null;
                return (
                  <optgroup key={prov} label={prov}>
                    {dists.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            <label
              htmlFor={districtId}
              className={cn(
                "field-float-label field-float-label--inset !top-2 !translate-y-0 !text-[11px] !font-semibold text-gold-700",
                touched && !districtValid && "field-float-label--error"
              )}
            >
              {t("marketing.regDistrict")} <span className="text-rose-400">*</span>
            </label>

            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-navy-400">
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>

          {touched && !districtValid && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t("marketing.regDistrictRequired")}
            </p>
          )}
        </div>

        {/* Tehsil Field */}
        <div className="flex flex-col gap-1.5">
          <div className="relative">
            <span
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-navy-400 flex items-center justify-center w-5 h-5 z-10"
              aria-hidden="true"
            >
              <Compass className="h-4 w-4" />
            </span>

            <select
              id={tehsilId}
              value={values.tehsil}
              onChange={(e) => handleTehsilChange(e.target.value)}
              disabled={!values.district}
              className={cn(
                "field-float field-float--with-left-icon !ps-11 !pe-9 appearance-none cursor-pointer bg-white disabled:bg-slate-50 disabled:cursor-not-allowed",
                touched && !tehsilValid && "border-rose-300 focus:border-rose-400 focus:ring-rose-400/15"
              )}
            >
              <option value="" disabled>
                {values.district
                  ? `-- ${t("marketing.regTehsilSelect")} --`
                  : `-- ${t("marketing.regDistrictSelect")} First --`}
              </option>
              {tehsils.map((tName) => (
                <option key={tName} value={tName}>
                  {tName}
                </option>
              ))}
            </select>

            <label
              htmlFor={tehsilId}
              className={cn(
                "field-float-label field-float-label--inset !top-2 !translate-y-0 !text-[11px] !font-semibold text-gold-700",
                touched && !tehsilValid && "field-float-label--error"
              )}
            >
              {t("marketing.regTehsil")} <span className="text-rose-400">*</span>
            </label>

            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-navy-400">
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>

          {touched && !tehsilValid && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t("marketing.regTehsilRequired")}
            </p>
          )}
        </div>
      </div>

      {/* ─── 3. Specific Chamber / Office Location (Optional) ─────────────── */}
      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <span
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-navy-400 flex items-center justify-center w-5 h-5"
            aria-hidden="true"
          >
            <MapPin className="h-4 w-4" />
          </span>

          <input
            id={locationId}
            type="text"
            placeholder=" "
            value={values.location}
            onChange={(e) => onChange({ ...values, location: e.target.value })}
            className="field-float field-float--with-left-icon !ps-11 !pe-4"
          />

          <label htmlFor={locationId} className="field-float-label field-float-label--inset">
            {t("marketing.regLocation")}
          </label>
        </div>
      </div>
    </div>
  );
}
