import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { isModifierClick } from '../isModifierClick';

describe('isModifierClick', () => {
  test('returns `true` when holding the middle button', async () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    const user = userEvent.setup();
    // @TODO this doesn't seem to be the right way to do this
    await user.pointer({ keys: '[MouseMiddle]', target: getByRole('button') });

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `true` when holding the Alt key', async () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    const user = userEvent.setup();
    await user.keyboard('[AltLeft>]');
    await user.click(getByRole('button'));

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `true` when holding the Ctrl key', async () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    const user = userEvent.setup();
    await user.keyboard('[ControlLeft>][ControlRight>]');
    await user.click(getByRole('button'));

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `true` when holding the Meta key', async () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    const user = userEvent.setup();
    await user.keyboard('[MetaLeft>][MetaRight>]');
    await user.click(getByRole('button'));

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `true` when holding the Shift key', async () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    const user = userEvent.setup();
    await user.keyboard('[ShiftLeft>][ShiftRight>]');
    await user.click(getByRole('button'));

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(true);
  });

  test('returns `false` when not holding any key', async () => {
    const onClick = jest.fn();
    const { getByRole } = render(<button onClick={onClick} />);

    await userEvent.click(getByRole('button'));

    expect(isModifierClick(onClick.mock.calls[0][0])).toBe(false);
  });
});
