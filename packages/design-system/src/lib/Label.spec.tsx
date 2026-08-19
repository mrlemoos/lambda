import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from './Input.js';
import { Label } from './Label.js';

describe('Label', () => {
  it('names a nested input', () => {
    render(
      <Label>
        Email
        <Input />
      </Label>,
    );

    const result = screen.getByLabelText('Email');

    expect(result).toBeInTheDocument();
    expect(document.querySelector('[data-slot="label"]')).not.toBeNull();
  });
});
