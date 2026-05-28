"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type Option = { value: string; label: string };

type FilterGroupProps = {
  label: string;
  name: string;
  options: Option[];
  selected: string[];
  counts: Record<string, number> | null;
  onChange: () => void;
};

function FilterCheckboxes({ label, name, options, selected, counts, onChange }: FilterGroupProps) {
  const sortedOptions = counts
    ? [...options].sort((a, b) => {
        const aSel = selected.includes(a.value) ? 1 : 0;
        const bSel = selected.includes(b.value) ? 1 : 0;
        if (aSel !== bSel) return bSel - aSel;
        return (counts[b.value] ?? 0) - (counts[a.value] ?? 0);
      })
    : options;

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-[10px] uppercase tracking-wider text-white/35">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {sortedOptions.map((opt) => {
          const checked = selected.includes(opt.value);
          const count = counts ? (counts[opt.value] ?? 0) : null;
          const isEmpty = count === 0 && !checked;
          return (
            <label
              key={opt.value}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition ${
                checked
                  ? "cursor-pointer border-lg-gold/60 bg-lg-gold/15 text-lg-gold-light"
                  : isEmpty
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/25"
                  : "cursor-pointer border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={opt.value}
                defaultChecked={checked}
                disabled={isEmpty}
                onChange={onChange}
                className="sr-only"
              />
              <span>{opt.label}</span>
              {count !== null ? (
                <span className="text-[10px] opacity-55">({count})</span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

type Props = {
  q: string;
  mode: string;
  sourceOptions: Option[];
  typeOptions: Option[];
  domaineOptions: Option[];
  selectedSources: string[];
  selectedTypes: string[];
  selectedDomaines: string[];
  counts: {
    source: Record<string, number> | null;
    type: Record<string, number> | null;
    domaine: Record<string, number> | null;
  };
  dateFrom: string | null;
  dateTo: string | null;
  hasActiveFilters: boolean;
};

export function FilterFormClient({
  q,
  mode,
  sourceOptions,
  typeOptions,
  domaineOptions,
  selectedSources,
  selectedTypes,
  selectedDomaines,
  counts,
  dateFrom,
  dateTo,
  hasActiveFilters,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations("Recherche");
  const router = useRouter();

  function submitForm() {
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} method="get" action="/recherche">
      <input type="hidden" name="q" value={q} />
      <input type="hidden" name="mode" value={mode} />

      <details className="rounded-md border border-white/10" open>
        <summary className="cursor-pointer px-3 py-2 text-[11px] uppercase tracking-wider text-lg-gold/80">
          {t("filters")}
        </summary>
        <div className="grid gap-4 px-3 pb-3 pt-1 sm:grid-cols-2 lg:grid-cols-3">
          <FilterCheckboxes
            label={t("filterSource")}
            name="source"
            options={sourceOptions}
            selected={selectedSources}
            counts={counts.source}
            onChange={submitForm}
          />
          <FilterCheckboxes
            label={t("filterType")}
            name="type"
            options={typeOptions}
            selected={selectedTypes}
            counts={counts.type}
            onChange={submitForm}
          />
          <FilterCheckboxes
            label={t("filterDomaine")}
            name="domaine"
            options={domaineOptions}
            selected={selectedDomaines}
            counts={counts.domaine}
            onChange={submitForm}
          />
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-white/35" htmlFor="date_from">
              {t("filterDateFrom")}
            </label>
            <input
              id="date_from"
              name="date_from"
              type="date"
              defaultValue={dateFrom ?? ""}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[12px] text-white outline-none focus:border-lg-gold/40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-wider text-white/35" htmlFor="date_to">
              {t("filterDateTo")}
            </label>
            <input
              id="date_to"
              name="date_to"
              type="date"
              defaultValue={dateTo ?? ""}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[12px] text-white outline-none focus:border-lg-gold/40"
            />
          </div>
        </div>
      </details>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-lg-gold/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-lg-navy transition hover:bg-lg-gold"
        >
          {t("applyFilters")}
        </button>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => router.push("/recherche")}
            className="rounded-md border border-white/15 px-2.5 py-1.5 text-[11px] text-white/65 transition hover:border-lg-gold/35 hover:text-white"
          >
            {t("clearFilters")}
          </button>
        ) : null}
      </div>
    </form>
  );
}
