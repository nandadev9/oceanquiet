export const OCEAN_FONT_CSS = `@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&display=swap');
.oq-font { font-family: 'Mulish', ui-sans-serif, system-ui, sans-serif; }
.oq-scroll::-webkit-scrollbar { width: 5px; }
.oq-scroll::-webkit-scrollbar-track { background: transparent; }
.oq-scroll::-webkit-scrollbar-thumb { background-color: #e4e7ec; border-radius: 9999px; }
.dark .oq-scroll::-webkit-scrollbar-thumb { background-color: #344054; }
.oq-scroll { scrollbar-width: thin; scrollbar-color: #e4e7ec transparent; }
.oq-rte table { border-collapse: collapse; margin: 6px 0; }
.oq-rte td { border: 1px solid #e4e7ec; padding: 4px 8px; min-width: 40px; }
.dark .oq-rte td { border-color: #344054; }
.oq-rte ul { list-style: disc; padding-left: 1.25rem; }
.oq-rte:empty:before { content: attr(data-placeholder); color: #98a2b3; }`;

export function OceanStyles() {
  return <style>{OCEAN_FONT_CSS}</style>;
}

export function OceanPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="oq-font">
      <OceanStyles />
      {children}
    </div>
  );
}
