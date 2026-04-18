export function getFranjas(config: any, dia: string) {
  return config?.[dia] || [];
}

export function toggleDia(config: any, dia: string) {
  const newConfig = { ...config };

  if (newConfig[dia]?.length > 0) {
    delete newConfig[dia];
  } else {
    newConfig[dia] = [[10, 18]];
  }

  return newConfig;
}

export function updateFranja(
  config: any,
  dia: string,
  index: number,
  nueva: number[],
) {
  const franjas = config[dia] || [];

  const updated = franjas.map((f: any, i: number) => (i === index ? nueva : f));

  return {
    ...config,
    [dia]: updated,
  };
}

export function removeFranja(config: any, dia: string, index: number) {
  const franjas = config[dia] || [];

  return {
    ...config,
    [dia]: franjas.filter((_: any, i: number) => i !== index),
  };
}

export function addFranja(config: any, dia: string) {
  const franjas = config[dia] || [];

  return {
    ...config,
    [dia]: [...franjas, [10, 18]],
  };
}

export function hasInvalidConfig(config: any) {
  return Object.values(config).some((franjas: any) =>
    franjas?.some((f: any) => f[0] >= f[1]),
  );
}
