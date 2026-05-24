import { ShieldCheck } from "lucide-react";
import { BrandWordmark } from "./brand-wordmark";

const trustItems = [
  "Ваши данные в безопасности",
  "Не передаём работы третьим лицам",
  "Соответствует ФЗ-152 «О персональных данных»",
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 px-5 pb-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-lg border border-white/15 bg-black/32 p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <BrandWordmark
            logoClassName="h-14 w-14"
            textClassName="text-2xl font-black tracking-normal"
          />
          <span className="text-sm font-semibold text-white/62">
            Персональная проверка 2 части ЕГЭ
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {trustItems.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/7 px-3 py-2 text-sm font-bold text-white/72"
            >
              <ShieldCheck size={16} className="text-[#7CFF8A]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
