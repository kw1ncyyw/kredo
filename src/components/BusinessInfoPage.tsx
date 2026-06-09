import React from 'react';
import { Language, AppTheme } from '../types';
import { Briefcase, Landmark, Shield, FileText } from 'lucide-react';

interface BusinessInfoPageProps {
  lang: Language;
  theme: AppTheme;
}

export default function BusinessInfoPage({ lang, theme }: BusinessInfoPageProps) {
  const content = {
    ua: {
      title: 'Юридична та бізнес-інформація',
      subtitle: 'Офіційні правові відомості про оператора платформи KREDO.',
      legalNote: 'Згідно з правилами платформи, ТОВ «АХАТКОНСАЛТ» виступає офіційною юридичною особою оператора.',
      brandLabel: 'Торгова марка / Бренд',
      companyLabel: 'Юридична назва компанії',
      kvedTitle: 'Коди видів економічної діяльності (КВЕД)',
      kvedDesc: 'Офіційні державні реєстраційні дані компанії:',
      codes: [
        { code: '82.99', desc: 'Основний вид діяльності ТОВ «АХАТКОНСАЛТ» для організації та супроводу комерційних процесів.' },
      ],
      legalBlockTitle: 'Compliance та стандарти',
      legalBlockDesc: 'ТОВ «АХАТКОНСАЛТ» здійснює діяльність у повній відповідності до чинного законодавства України, забезпечуючи фінансову стабільність та захист кожного контрагента.',
    },
    en: {
      title: 'Business & Legal Information',
      subtitle: 'Official legal records regarding the operator of the KREDO platform.',
      legalNote: 'In accordance with platform regulations, AKHATCONSULT LLC (ТОВ «АХАТКОНСАЛТ») acts as the official corporate entity of the operator.',
      brandLabel: 'Trademark / Brand',
      companyLabel: 'Corporate Legal Name',
      kvedTitle: 'Registered Activity Codes (KVED / NACE)',
      kvedDesc: 'Official state-registered business activities of the corporate entity:',
      codes: [
        { code: '82.99', desc: 'Main activity of AKHATCONSULT LLC for the organization and support of commercial processes.' },
      ],
      legalBlockTitle: 'Compliance & Standards',
      legalBlockDesc: 'AKHATCONSULT LLC operates in strict accordance with Ukrainian commercial law, providing complete financial stability and protection for each counterparty.',
    },
    ru: {
      title: 'Юридическая и бизнес-информация',
      subtitle: 'Официальные правовые сведения об операторе платформы KREDO.',
      legalNote: 'Согласно правилам платформы, ООО «АХАТКОНСАЛТ» (ТОВ «АХАТКОНСАЛТ») выступает официальным юридическим лицом оператора.',
      brandLabel: 'Торговая марка / Бренд',
      companyLabel: 'Юридическое название компании',
      kvedTitle: 'Классификатор видов экономической деятельности (КВЕД)',
      kvedDesc: 'Официально зарегистрированные виды деятельности юридического лица согласно государственному реестру:',
      codes: [
        { code: '82.99', desc: 'Основной вид деятельности ООО «АХАТКОНСАЛТ» для организации и сопровождения коммерческих процессов.' },
      ],
      legalBlockTitle: 'Статус и комплаенс',
      legalBlockDesc: 'ООО «АХАТКОНСАЛТ» осуществляет деятельность в полном соответствии с действующим законодательством, обеспечивая надежность.',
    }
  };

  const t = content[lang] || content.ua;

  return (
    <div className={`min-h-screen py-24 sm:py-32 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#030303] text-stone-100' : 'bg-stone-50 text-stone-850'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#7c7c7c] bg-[#1a1a1a]/10 dark:bg-white/5 border border-stone-500/10 px-3 py-1 rounded-full inline-block">
            LEGAL NOTICE
          </span>
          <h1 className={`text-3xl md:text-5xl font-extrabold mt-4 tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-stone-900'
          }`}>
            {t.title}
          </h1>
          <p className={`mt-3 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
          }`}>
            {t.subtitle}
          </p>
        </div>

        {/* Brand vs Legal Identity card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          
          <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
            theme === 'dark' ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">{t.brandLabel}</span>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                <Shield className="h-6 w-6" />
              </div>
              <span className={`text-xl sm:text-2xl font-black tracking-widest ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                KREDO
              </span>
            </div>
          </div>

          <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
            theme === 'dark' ? 'bg-stone-900/40 border-stone-850' : 'bg-white border-stone-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">{t.companyLabel}</span>
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/10">
                <Landmark className="h-6 w-6" />
              </div>
              <span className={`text-base sm:text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-stone-900'}`}>
                ТОВ «АХАТКОНСАЛТ»
              </span>
            </div>
          </div>

        </div>


        {/* KVED List section */}
        <div className={`rounded-3xl p-6 sm:p-8 border mb-12 ${
          theme === 'dark' ? 'bg-stone-900/20 border-stone-900' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <h3 className={`text-sm sm:text-base font-extrabold tracking-tight mb-3 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-stone-950'
          }`}>
            <Briefcase className="h-4 w-4 text-stone-450 mr-2" />
            <span>{t.kvedTitle}</span>
          </h3>
          <p className="text-xs text-stone-500 mb-6 font-semibold">{t.kvedDesc}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.codes.map((item) => (
              <div
                key={item.code}
                className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                  theme === 'dark' ? 'bg-stone-950/40 border-stone-900/80 hover:border-stone-800' : 'bg-stone-50 border-stone-200/50 hover:border-stone-300'
                } transition-all`}
              >
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  theme === 'dark' ? 'bg-white/10 text-stone-300' : 'bg-black/5 text-stone-700'
                }`}>
                  {item.code}
                </span>
                <span className={`text-xs leading-relaxed font-semibold ${
                  theme === 'dark' ? 'text-stone-300' : 'text-stone-600'
                }`}>
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* General Policy and Standards Info */}
        <div className={`rounded-2xl p-6 border ${
          theme === 'dark' ? 'bg-stone-950/40 border-stone-900' : 'bg-[#fff] border-stone-200'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center ${
            theme === 'dark' ? 'text-white' : 'text-stone-950'
          }`}>
            <FileText className="h-3.5 w-3.5 mr-2 text-stone-500" />
            <span>{t.legalBlockTitle}</span>
          </h3>
          <p className="text-xs leading-relaxed font-semibold text-stone-500">
            {t.legalBlockDesc}
          </p>
        </div>

      </div>
    </div>
  );
}
