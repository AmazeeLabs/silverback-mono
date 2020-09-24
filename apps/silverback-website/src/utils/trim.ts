export const trim = (value: string, char: string = ' ') =>
  value.replace(new RegExp(`^${char}+|${char}+$`, 'g'), '');
