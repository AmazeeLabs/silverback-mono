import { Box, render, Text } from 'ink';
import React from 'react';

type TuiProps = {
  score: number;
  properties: Record<string, number>;
};

function TUI(props: TuiProps) {
  return (
    <Box padding={1} borderStyle={'round'}>
      <Text color={'yellow'}>{props.score}</Text>
    </Box>
  );
}

export function renderTui(props: TuiProps) {
  return render(<TUI {...props} />);
}
