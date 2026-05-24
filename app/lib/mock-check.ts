export function createMockCheck(answer: string) {
  const lengthBonus = Math.min(Math.floor(answer.length / 120), 6);
  const score = Math.min(18 + lengthBonus, 24);

  return {
    score,
    maxScore: 24,
    strengths:
      "Ответ раскрывает основную мысль и показывает понимание критериев второй части.",
    improvements:
      "Усилить аргументацию, добавить точные детали и связать вывод с тезисом.",
    mistakes:
      score >= 23
        ? "Критичных ошибок не найдено."
        : "Есть места, где пояснение звучит слишком общо.",
    recommendation:
      "Разберите слабые критерии и получите точный план, какие детали стоит потренировать дальше.",
  };
}
