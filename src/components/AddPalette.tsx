import * as ReactCmdk from "react-cmdk";
import { useEffect, useMemo, useState } from "react";
import { dependenciesByCategory } from "@/config/dependencies";
import { ExpoIcon } from "@/components/icons/ExpoIcon";
import { Package } from "lucide-react";

const CommandPalette =
  (ReactCmdk as any).default?.default ??
  (ReactCmdk as any).default ??
  (ReactCmdk as any)["module.exports"]?.default ??
  (ReactCmdk as any)["module.exports"] ??
  (ReactCmdk as any);

const filterItems: any =
  (ReactCmdk as any).filterItems ??
  (ReactCmdk as any).default?.filterItems ??
  (ReactCmdk as any)["module.exports"]?.filterItems;
const getItemIndex: any =
  (ReactCmdk as any).getItemIndex ??
  (ReactCmdk as any).default?.getItemIndex ??
  (ReactCmdk as any)["module.exports"]?.getItemIndex;

type PaletteItem =
  | { id: string; kind: "dep"; label: string; description: string; pkg: string; version: string }
  | { id: string; kind: "module"; name: string; description: string; version?: string; category?: string };

export function AddPalette({
  open,
  onOpenChange,
  onSelectItem,
  modulesByCategory,
  selectedModuleIds,
  selectedDependencyIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectItem: (item: PaletteItem) => void;
  modulesByCategory: Record<string, any[]>;
  selectedModuleIds: Set<string>;
  selectedDependencyIds: Set<string>;
}) {
  const [search, setSearch] = useState("");

  // Cmd+K / Ctrl+K convenience.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const items = useMemo(() => {
    const depCategoryColors: Record<string, { bg: string; text: string }> = {
      "State Management": { bg: "bg-blue-500/10", text: "text-blue-600" },
      Navigation: { bg: "bg-green-500/10", text: "text-green-600" },
      "APIs & Networking": { bg: "bg-orange-500/10", text: "text-orange-600" },
      "Forms & Validation": { bg: "bg-pink-500/10", text: "text-pink-600" },
      Animations: { bg: "bg-violet-500/10", text: "text-violet-600" },
      "UI Components": { bg: "bg-cyan-500/10", text: "text-cyan-600" },
      Utilities: { bg: "bg-zinc-500/10", text: "text-zinc-600" },
    };

    const depLists = Object.entries(dependenciesByCategory).map(([heading, deps]) => ({
      heading,
      id: `dep:${heading}`,
      items: deps
        .filter((d) => !selectedDependencyIds.has(d.id))
        .map((d) => ({
        id: `dep:${d.id}`,
        showType: false,
        className: "cmdk-card",
        children: (
          <div className="flex w-full items-center gap-4">
            <div
              className={[
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                depCategoryColors[heading]?.bg ?? depCategoryColors.Utilities.bg,
                depCategoryColors[heading]?.text ?? depCategoryColors.Utilities.text,
              ].join(" ")}
            >
              <Package className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{d.label}</div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{d.description}</div>
              <div className="text-xs text-muted-foreground font-mono truncate mt-1">
                {d.package}@{d.version}
              </div>
            </div>
          </div>
        ),
        keywords: [d.label, d.description, d.package].filter(Boolean),
        onClick: () =>
          onSelectItem({
            id: d.id,
            kind: "dep",
            label: d.label,
            description: d.description,
            pkg: d.package,
            version: d.version,
          }),
      })),
    }));

    const moduleCategoryLists = Object.entries(modulesByCategory)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, mods]) => {
        const sorted = [...(mods as any[])]
          .filter((m: any) => !selectedModuleIds.has(m.id))
          .sort((a, b) =>
          String(a.name ?? a.id).localeCompare(String(b.name ?? b.id))
        );

        return {
          heading: category,
          id: `modcat:${category}`,
          items: sorted.map((m: any) => ({
            id: `mod:${m.id}`,
            showType: false,
            className: "cmdk-card",
            children: (
              <div className="flex w-full items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ExpoIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{m.description}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate mt-1">{m.id}</div>
                </div>
              </div>
            ),
            keywords: [m.name, m.description, m.id, category].filter(Boolean),
            onClick: () =>
              onSelectItem({
                id: m.id,
                kind: "module",
                name: m.name,
                description: m.description,
                version: m.version,
                category,
              }),
          })),
        };
      });

    const nonEmptyModuleLists = moduleCategoryLists.filter((l) => l.items.length > 0);
    const nonEmptyDepLists = depLists.filter((l) => l.items.length > 0);

    return [...nonEmptyModuleLists, ...nonEmptyDepLists];
  }, [modulesByCategory, onSelectItem, selectedDependencyIds, selectedModuleIds]);

  const filteredItems = useMemo(() => filterItems(items as any, search), [items, search]);

  return (
    <CommandPalette
      isOpen={open}
      onChangeOpen={onOpenChange}
      search={search}
      onChangeSearch={setSearch}
      page="root"
      placeholder="Search Expo modules and dependencies..."
    >
      <CommandPalette.Page id="root">
        {filteredItems.length ? (
          filteredItems.map((list: any) => (
            <CommandPalette.List key={list.id} heading={list.heading}>
              {list.items.map(({ id, ...rest }: any) => (
                <CommandPalette.ListItem key={id} index={getItemIndex(filteredItems as any, id)} {...rest} />
              ))}
            </CommandPalette.List>
          ))
        ) : (
          <CommandPalette.FreeSearchAction />
        )}
      </CommandPalette.Page>
    </CommandPalette>
  );
}

