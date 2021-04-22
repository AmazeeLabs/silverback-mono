import { run } from '../process';

describe('run', () => {
  it('runs a command', () => {
    expect(() => run(`exit 0`)).not.toThrow();
  });

  it('fails if the command returns non-zero', () => {
    expect(() => run(`exit 1`)).toThrow(/expected exit code/i);
  });

  it('does not fail if the status code matches', () => {
    expect(() => run(`exit 1`, { code: 1 })).not.toThrow();
  });

  it('fails if the status code does not match', () => {
    expect(() => run(`exit 1`, { code: 2 })).toThrow(/expected exit code/i);
  });

  it('does not fail if output matches regex', () => {
    expect(() => run(`echo "foo"`, { stdout: /^foo$/ })).not.toThrow();
  });

  it('fails if output does not match regex', () => {
    expect(() => run(`echo "foo"`, { stdout: /^bar$/ })).toThrow(
      /expected output/i,
    );
  });

  it('does not fail if the output matches assertion function', () => {
    expect(() =>
      run(`echo "foo"`, {
        stdout: (input) => (input === 'foo' ? undefined : 'expected "foo"'),
      }),
    ).not.toThrow();
  });

  it('fails if the output does not match assertion function', () => {
    expect(() =>
      run(`echo "bar"`, {
        stdout: (input) =>
          input === 'foo' ? undefined : `expected "foo" got "${input}"`,
      }),
    ).toThrow(/expected output/i);
  });

  it('does not fail if error output matches regex', () => {
    expect(() =>
      run(`foobar`, { stderr: /foobar: command not found/i }),
    ).not.toThrow();
  });

  it('fails if error output does not match regex', () => {
    expect(() =>
      run(`foobar`, { stderr: /foobar command not found/i }),
    ).toThrow(/expected error output/i);
  });

  it('does not fail if the error output matches assertion function', () => {
    expect(() =>
      run(`foobar`, {
        stderr: (input) =>
          input.match(/foobar: command not found/i)
            ? undefined
            : `expected "foobar: command not found" got "${input}"`,
      }),
    ).not.toThrow();
  });

  it('fails if the error output does not match assertion function', () => {
    expect(() =>
      run(`echo "bar" >> /dev/stderr`, {
        stderr: (input) =>
          input.match(/foobar command not found/i)
            ? undefined
            : `expected "foobar command not found" got "${input}"`,
      }),
    ).toThrow(/expected error output/i);
  });
});
