import { useScriptSession } from '@lambda/shell';
import { useEffect } from 'react';

import { browserLambdaApi } from '../lib/browserLambdaApi.js';

export function E2eWindowApi() {
  const { getSerializedFountainText } = useScriptSession();

  useEffect(() => {
    window.__lambdaE2e = {
      getFountainText: () => {
        const text = getSerializedFountainText();

        if (text === null) {
          throw new Error('No script is open.');
        }

        return text;
      },
      getLastWrittenContents: () => browserLambdaApi.getLastWrittenContents(),
      clearLastWrittenContents: () =>
        browserLambdaApi.clearLastWrittenContents(),
    };

    return () => {
      delete window.__lambdaE2e;
    };
  }, [getSerializedFountainText]);

  return null;
}
