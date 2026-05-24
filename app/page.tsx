"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { SiteHeader } from "./components/site-header";

const vertexShaderSource = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const gradientCubesShaderSource = `
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform float iFrame;
uniform vec4 iMouse;
uniform vec4 iDate;
uniform float iSampleRate;

const float ROTATION_SPEED = 1.0;
const float EDGE_THICKNESS = 0.045;
const float CUBE_SCALE = 1.0;
const float GRADIENT_SPEED = 1.5;

const vec3 COLOR_1 = vec3(0.749, 0.0, 1.0);
const vec3 COLOR_2 = vec3(1.0, 0.4, 0.0);
const vec3 COLOR_3 = vec3(0.0, 1.0, 0.8);

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float edgeDist(vec3 p, vec3 a, vec3 b) {
  vec3 ab = b - a;
  vec3 ap = p - a;
  float t = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);
  return length(ap - ab * t);
}

float cubeEdges(vec3 p) {
  float d = 1e9;
  vec3 v0 = vec3(-1.0, -1.0, -1.0);
  vec3 v1 = vec3( 1.0, -1.0, -1.0);
  vec3 v2 = vec3( 1.0,  1.0, -1.0);
  vec3 v3 = vec3(-1.0,  1.0, -1.0);
  vec3 v4 = vec3(-1.0, -1.0,  1.0);
  vec3 v5 = vec3( 1.0, -1.0,  1.0);
  vec3 v6 = vec3( 1.0,  1.0,  1.0);
  vec3 v7 = vec3(-1.0,  1.0,  1.0);

  d = min(d, edgeDist(p, v0, v1));
  d = min(d, edgeDist(p, v1, v2));
  d = min(d, edgeDist(p, v2, v3));
  d = min(d, edgeDist(p, v3, v0));
  d = min(d, edgeDist(p, v4, v5));
  d = min(d, edgeDist(p, v5, v6));
  d = min(d, edgeDist(p, v6, v7));
  d = min(d, edgeDist(p, v7, v4));
  d = min(d, edgeDist(p, v0, v4));
  d = min(d, edgeDist(p, v1, v5));
  d = min(d, edgeDist(p, v2, v6));
  d = min(d, edgeDist(p, v3, v7));

  return d;
}

float sdf(vec3 p, float thick) {
  return cubeEdges(p) - thick;
}

vec3 gradientColor(float t) {
  t = fract(t);

  if (t < 0.333) {
    return mix(COLOR_1, COLOR_2, t * 3.0);
  } else if (t < 0.666) {
    return mix(COLOR_2, COLOR_3, (t - 0.333) * 3.0);
  }

  return mix(COLOR_3, COLOR_1, (t - 0.666) * 3.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord - iResolution.xy * 0.5) / min(iResolution.x, iResolution.y);
  uv *= 0.58;
  uv.x -= 0.18;
  float T = iTime * ROTATION_SPEED;

  vec3 ro = vec3(0.0, 0.0, 4.05);
  vec3 rd = normalize(vec3(uv, -1.35));

  float dist = 0.0;
  vec3 p = vec3(0.0);
  bool hit = false;
  float thick = EDGE_THICKNESS;
  float sc = CUBE_SCALE;

  for (int i = 0; i < 80; i++) {
    p = ro + rd * dist;

    vec3 p1 = p;
    p1.xy = rot(T * 0.31) * p1.xy;
    p1.xz = rot(T * 0.23) * p1.xz;
    p1 /= sc;
    float d1 = sdf(p1, thick) * sc;

    vec3 p2 = p - vec3(0.9, -0.9, 0.0) * sc;
    p2.xy = rot(-T * 0.28) * p2.xy;
    p2.xz = rot( T * 0.19) * p2.xz;
    p2 /= sc;
    float d2 = sdf(p2, thick) * sc;

    float d = min(d1, d2);
    if (d < 0.001) {
      hit = true;
      break;
    }

    if (dist > 12.0) {
      break;
    }

    dist += d;
  }

  if (hit) {
    vec3 pa = p;
    pa.xy = rot(T * 0.31) * pa.xy;
    pa.xz = rot(T * 0.23) * pa.xz;
    pa /= sc;
    float da = sdf(pa, thick);

    vec3 pb = p - vec3(0.9, -0.9, 0.0) * sc;
    pb.xy = rot(-T * 0.28) * pb.xy;
    pb.xz = rot( T * 0.19) * pb.xz;
    pb /= sc;
    float db = sdf(pb, thick);

    float gPos = (da < db)
      ? (pa.x + pa.y + pa.z) * 0.5
      : (pb.x + pb.y + pb.z) * 0.5;

    float gt = gPos * 0.3 + T * GRADIENT_SPEED * 0.15;
    vec3 col = gradientColor(gt);

    float fresnel = pow(1.0 - abs(dot(normalize(p - ro), vec3(0.0, 0.0, -1.0))), 2.0);
    col += fresnel * 0.2;
    col = clamp(col, 0.0, 1.0);

    fragColor = vec4(col, 1.0);
  } else {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Не удалось создать WebGL shader.");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) ?? "Неизвестная ошибка компиляции.";
    gl.deleteShader(shader);
    throw new Error(info);
  }

  return shader;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createProgram(gl: WebGLRenderingContext) {
  const program = gl.createProgram();

  if (!program) {
    throw new Error("Не удалось создать WebGL program.");
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, gradientCubesShaderSource);

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) ?? "Неизвестная ошибка линковки.";
    gl.deleteProgram(program);
    throw new Error(info);
  }

  return program;
}

function ShadertoyCanvas() {
  return (
    <canvas
      data-prover-shader="hero-cubes"
      className="h-full w-full"
      aria-hidden="true"
      suppressHydrationWarning
    />
  );
}

function BrandWordmark({
  logoClassName,
  textClassName,
}: {
  logoClassName: string;
  textClassName: string;
}) {
  return (
    <div className={`brand-wordmark ${textClassName}`}>
      <Image
        src="/logo.png"
        alt=""
        width={176}
        height={176}
        className={`brand-background-logo ${logoClassName}`}
        priority
      />
      <span className="gradient-brand-text brand-wordmark-text">Proверь</span>
    </div>
  );
}

const miniBenefits = [
  "7 дней бесплатно",
  "Без привязки карты",
  "Доступ сразу после регистрации",
];

const feedbackTabs = ["Сильные стороны", "Что улучшить", "Ошибки"];

const subjects = [
  "Русский язык",
  "Биология",
  "Обществознание",
  "Профильная математика",
  "История",
  "Физика",
  "Химия",
  "Информатика",
  "Английский язык",
];

const benefits = [
  {
    title: "Проверка развёрнутых ответов",
    text: "Экспертная и AI-проверка по критериям ЕГЭ.",
    icon: FileCheck2,
  },
  {
    title: "Персональные рекомендации",
    text: "Понимайте, что улучшить именно в вашем ответе.",
    icon: Lightbulb,
  },
  {
    title: "Без репетитора",
    text: "Качественная обратная связь и поддержка без лишних трат.",
    icon: GraduationCap,
  },
  {
    title: "Понятные критерии оценивания",
    text: "Прозрачные критерии ЕГЭ без сложных формулировок.",
    icon: Target,
  },
  {
    title: "Экономия времени",
    text: "Быстрая проверка и чёткие советы для роста баллов.",
    icon: Clock3,
  },
];

const metrics = [
  {
    value: "10 000+",
    label: "проверок выполнено",
    detail: "За последний месяц",
  },
  {
    value: "4.9/5",
    label: "рейтинг сервиса",
    detail: "По отзывам учеников",
  },
  {
    value: "+23 балла",
    label: "в среднем прибавляют ученики",
    detail: "За 2 недели занятий",
  },
  {
    value: "95%",
    label: "рекомендуют Proверь",
    detail: "Своим друзьям",
  },
];

const trustItems = [
  "Ваши данные в безопасности",
  "Не передаём работы третьим лицам",
  "Соответствует ФЗ-152 «О персональных данных»",
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-[#5E0ED7] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-85">
        <ShadertoyCanvas />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_75%_10%,rgba(0,255,215,0.22),transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.64)_42%,rgba(0,0,0,0.28)_100%)]" />

      <SiteHeader />

      <section className="relative z-10 flex min-h-screen w-full items-center overflow-hidden px-5 pb-20 pt-32 md:px-8 lg:pt-36">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-4xl">
            <p className="animated-gradient-label mb-5 inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-black uppercase tracking-normal backdrop-blur-xl">
              Подготовка ко 2 части ЕГЭ
            </p>
            <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-normal text-white md:text-6xl xl:text-7xl">
              <span className="block">Подготовка ко 2 части</span>
              <span className="block">ЕГЭ с персональной</span>
              <span className="block">проверкой ответов</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-white/78 md:text-xl">
              Получайте подробную обратную связь на развёрнутые ответы, понимайте ошибки и улучшайте результат без репетитора.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/8 px-7 py-4 text-sm font-black uppercase tracking-normal text-white backdrop-blur-xl transition-colors hover:bg-white/15"
              >
                Узнать больше
              </a>
              <a
                href="/examples"
                className="animated-gradient-button inline-flex items-center justify-center gap-2 rounded-md px-7 py-4 text-sm font-black uppercase tracking-normal"
              >
                <span className="text-white">Смотреть пример</span>
                <ArrowRight size={19} className="text-[#BAFF72]" />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {miniBenefits.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-md border border-white/12 bg-black/22 px-3 py-2 text-sm font-bold text-white/82 backdrop-blur-xl"
                >
                  <CheckCircle2 size={16} className="text-[#7CFF8A]" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <article className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-white/60">Прогресс</p>
                  <strong className="mt-4 block text-5xl font-black text-white">+23 балла</strong>
                  <span className="mt-1 block text-sm font-bold text-[#7CFF8A]">за 2 недели</span>
                </div>
                <TrendingUp className="text-[#7CFF8A]" size={34} />
              </div>
            </article>

            <article className="glass-card p-5">
              <p className="text-sm font-bold uppercase text-white/60">Оценка за ответ</p>
              <strong className="mt-4 block text-5xl font-black text-white">24/24</strong>
              <span className="mt-1 block text-sm font-bold text-[#7CFF8A]">Максимальный балл!</span>
            </article>

            <article className="glass-card md:col-span-2 lg:col-span-1 xl:col-span-2 p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black uppercase text-white">Проверка ответа</h2>
                <span className="rounded-full bg-[#7CFF8A]/16 px-3 py-1 text-sm font-black text-[#7CFF8A]">
                  Отлично!
                </span>
              </div>
              <div className="mb-5 flex flex-wrap gap-2">
                {feedbackTabs.map((tab, index) => (
                  <span
                    key={tab}
                    className={`rounded-md border px-3 py-2 text-xs font-black uppercase ${
                      index === 0
                        ? "border-[#7CFF8A]/50 bg-[#7CFF8A]/14 text-[#7CFF8A]"
                        : index === 1
                          ? "border-[#7CFF8A]/50 bg-[#7CFF8A]/14 text-[#7CFF8A]"
                          : "border-[#FF4D5E]/55 bg-[#FF4D5E]/16 text-[#FF9AA4]"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </article>

            <article className="glass-card md:col-span-2 lg:col-span-1 xl:col-span-2 p-5">
              <div className="mb-3 flex items-center gap-3">
                <Sparkles className="text-[#00FFD7]" size={22} />
                <h3 className="text-xl font-black uppercase text-white">Рекомендация</h3>
              </div>
              <p className="text-base font-medium leading-7 text-white/76">
                Разберите слабые критерии и получите точный план, какие детали стоит потренировать дальше.
              </p>
            </article>
          </div>
        </div>

      </section>

      <section id="content" className="relative z-10 px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="animated-gradient-label mb-3 inline-flex text-sm font-black uppercase">
                Предметы
              </p>
              <h2 className="max-w-none text-4xl font-black uppercase leading-tight text-white md:text-5xl lg:text-6xl">
                <span className="block md:whitespace-nowrap">Выберите предмет</span>
                <span className="block md:whitespace-nowrap">и начните проверку</span>
              </h2>
            </div>
            <BookOpen className="hidden text-white/50 md:block" size={54} />
          </div>

          <div className="subject-carousel -mr-5 flex snap-x gap-4 overflow-x-auto pb-4 pr-5 md:-mr-8 md:pr-8">
            {subjects.map((subject, index) => (
              <a
                key={subject}
                href="/dashboard/new"
                className="glass-card group relative min-h-64 w-[82vw] shrink-0 snap-start overflow-hidden p-6 transition-transform hover:-translate-y-1 sm:w-[25rem]"
              >
                <span className="absolute -right-6 -top-8 text-9xl font-black text-white/[0.04]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="subject-title-panel absolute inset-x-6 bottom-0 rounded-t-lg border border-white/12 px-5 py-7" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <span className="w-max rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-black uppercase text-white/66">
                    ЕГЭ
                  </span>
                  <h3 className="text-2xl font-black uppercase leading-tight text-white md:text-3xl">{subject}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-14 md:px-8">
        <div className="mx-auto grid max-w-5xl items-start gap-4 md:grid-cols-2">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article key={benefit.title} className="glass-card grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-4 p-4 last:md:col-span-2 last:md:mx-auto last:md:w-[calc(50%-0.5rem)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/14 bg-white/8">
                  <Icon size={20} className="text-[#BAFF72]" strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl font-black uppercase leading-tight text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-white/70">{benefit.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-7 max-w-5xl text-4xl font-black uppercase leading-tight text-white md:text-6xl">
            <span className="block">Результаты, которые</span>
            <span className="block">говорят сами за себя</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.value} className="glass-card p-6">
                <strong className="animated-gradient-label block text-4xl font-black uppercase">
                  {metric.value}
                </strong>
                <p className="mt-4 text-xl font-black uppercase leading-tight text-white">
                  {metric.label}
                </p>
                <p className="mt-3 text-sm font-bold text-white/58">{metric.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
    </main>
  );
}
