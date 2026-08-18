import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LambdaApiProvider } from '@lambda/lambda-api';
import type { LambdaApi } from '@lambda/lambda-api';

import { WindowDragRegion } from './WindowDragRegion.js';

describe('WindowDragRegion', () => {
  it('renders the filename on darwin', () => {
    const api = { platform: 'darwin' } as LambdaApi;

    render(
      <LambdaApiProvider api={api}>
        <WindowDragRegion fileName="night.fountain" />
      </LambdaApiProvider>,
    );

    const result = screen.getByText('night.fountain');

    expect(result).not.toBeNull();
  });

  it('renders nothing on non-darwin platforms', () => {
    const api = { platform: 'linux' } as LambdaApi;

    const { container } = render(
      <LambdaApiProvider api={api}>
        <WindowDragRegion fileName="night.fountain" />
      </LambdaApiProvider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
