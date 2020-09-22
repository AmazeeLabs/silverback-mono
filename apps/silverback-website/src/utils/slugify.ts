export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(
      /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~’]/g,
      '',
    )
    .replace(/\s/g, '-');
